import { createHash } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

/**
 * Slugs allowed to have a counter. Deliberately inlined rather than imported
 * from blog-posts.ts: Vercel's function bundler failed to resolve an import
 * from outside api/, and the function crashed at module load. The build
 * asserts this stays in sync with BLOG_META (see vite.config.ts), so adding a
 * post to blog-posts.ts without listing it here fails the build.
 */
export const PUBLISHED_SLUGS: ReadonlySet<string> = new Set([
  'imu-preintegration-part1',
  'imu-preintegration-part2',
  'imu-preintegration-part3',
  'orb-slam3-imu-part1',
  'orb-slam3-imu-part2',
]);

const MAX_SLUGS_PER_READ = 50;
const DEDUP_TTL_SECONDS = 60 * 60 * 24; // one counted view per visitor per post per day

const viewKey = (slug: string) => `views:${slug}`;

// Vercel's Upstash Marketplace integration injects KV_REST_API_*; a database
// created directly on Upstash exposes UPSTASH_REDIS_REST_*. Accept either.
const restUrl = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const restToken = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = restUrl && restToken ? new Redis({ url: restUrl, token: restToken }) : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  // No store bound (local dev, or the integration isn't linked yet) — degrade
  // quietly so the UI hides the counter instead of surfacing an error.
  if (!redis) {
    return res.status(200).json({ views: null, configured: false });
  }

  try {
    if (req.method === 'GET') return await read(redis, req, res);
    if (req.method === 'POST') return await increment(redis, req, res);
  } catch (err) {
    console.error('[views]', err);
    return res.status(500).json({ error: 'Counter unavailable' });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
}

async function read(redis: Redis, req: VercelRequest, res: VercelResponse) {
  const slugs = parseSlugs(req.query.slugs ?? req.query.slug);
  if (slugs.length === 0) {
    return res.status(400).json({ error: 'Provide ?slug=<slug> or ?slugs=<a,b,c> naming published posts' });
  }

  const counts = await redis.mget<(number | null)[]>(...slugs.map(viewKey));

  if (slugs.length === 1) {
    return res.status(200).json({ slug: slugs[0], views: counts[0] ?? 0 });
  }
  return res.status(200).json({
    views: Object.fromEntries(slugs.map((slug, i) => [slug, counts[i] ?? 0])),
  });
}

async function increment(redis: Redis, req: VercelRequest, res: VercelResponse) {
  // parseSlugs drops anything not in PUBLISHED_SLUGS, so a crafted slug can never
  // create a counter key.
  const [slug] = parseSlugs(readBody(req).slug ?? req.query.slug);
  if (!slug) {
    return res.status(404).json({ error: 'Unknown post' });
  }

  const isFirstVisitToday = await redis.set(dedupKey(req, slug), 1, {
    nx: true,
    ex: DEDUP_TTL_SECONDS,
  });

  const views = isFirstVisitToday
    ? await redis.incr(viewKey(slug))
    : (await redis.get<number>(viewKey(slug))) ?? 0;

  return res.status(200).json({ slug, views, counted: Boolean(isFirstVisitToday) });
}

function parseSlugs(raw: unknown): string[] {
  const value = Array.isArray(raw) ? raw.join(',') : raw;
  if (typeof value !== 'string') return [];
  return [...new Set(value.split(','))]
    .map((slug) => slug.trim())
    .filter((slug) => PUBLISHED_SLUGS.has(slug))
    .slice(0, MAX_SLUGS_PER_READ);
}

function readBody(req: VercelRequest): { slug?: unknown } {
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return (req.body as { slug?: unknown } | undefined) ?? {};
}

function dedupKey(req: VercelRequest, slug: string): string {
  const ip = header(req, 'x-forwarded-for').split(',')[0].trim() || req.socket.remoteAddress || '';
  const fingerprint = createHash('sha256')
    .update(`${ip}|${header(req, 'user-agent')}|${slug}`)
    .digest('hex')
    .slice(0, 32);
  return `views:dedup:${fingerprint}`;
}

function header(req: VercelRequest, name: string): string {
  const value = req.headers[name];
  return (Array.isArray(value) ? value[0] : value) ?? '';
}
