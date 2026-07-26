import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { BLOG_META, type BlogPost } from './blog-posts';

const BASE_URL = 'https://dongwonshin.vercel.app';
const AUTHOR = 'Dong-Won Shin';


function replaceMeta(html: string, post: BlogPost): string {
  const ogTitle = `${post.title} | ${AUTHOR}`;
  const ogUrl = `${BASE_URL}/blog/${post.slug}`;
  const ogImage = `${BASE_URL}${post.image}`;

  let out = html;
  out = out.replace(/<title>.*?<\/title>/, `<title>${ogTitle}</title>`);
  out = out.replace(/(<meta name="title" content=").*?(")/, `$1${ogTitle}$2`);
  out = out.replace(/(<meta name="description" content=").*?(")/, `$1${post.description}$2`);
  out = out.replace(/(<link rel="canonical" href=").*?(")/, `$1${ogUrl}$2`);

  // Open Graph
  out = out.replace(/(<meta property="og:type" content=").*?(")/, `$1article$2`);
  out = out.replace(/(<meta property="og:url" content=").*?(")/, `$1${ogUrl}$2`);
  out = out.replace(/(<meta property="og:title" content=").*?(")/, `$1${ogTitle}$2`);
  out = out.replace(/(<meta property="og:description" content=").*?(")/, `$1${post.description}$2`);
  out = out.replace(/(<meta property="og:image" content=").*?(")/, `$1${ogImage}$2`);
  out = out.replace(/(<meta property="og:image:width" content=").*?(")/, `$1${post.imageWidth}$2`);
  out = out.replace(/(<meta property="og:image:height" content=").*?(")/, `$1${post.imageHeight}$2`);

  // Twitter
  out = out.replace(/(<meta name="twitter:title" content=").*?(")/, `$1${ogTitle}$2`);
  out = out.replace(/(<meta name="twitter:description" content=").*?(")/, `$1${post.description}$2`);
  out = out.replace(/(<meta name="twitter:image" content=").*?(")/, `$1${ogImage}$2`);

  // Inject article meta + BlogPosting JSON-LD before </head>
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: ogImage,
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    author: { '@type': 'Person', name: AUTHOR, url: `${BASE_URL}/` },
    publisher: { '@type': 'Person', name: AUTHOR },
    mainEntityOfPage: { '@type': 'WebPage', '@id': ogUrl },
    url: ogUrl,
  };

  const extraHead =
    `    <meta property="article:published_time" content="${post.datePublished}" />\n` +
    `    <meta property="article:modified_time" content="${post.dateModified}" />\n` +
    `    <meta property="article:author" content="${AUTHOR}" />\n` +
    `    <script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n    </script>\n  </head>`;

  out = out.replace('</head>', extraHead);
  return out;
}

/**
 * api/views.ts inlines its own slug allowlist (it can't import from outside
 * api/ — Vercel's function bundler fails to resolve it). Fail the build rather
 * than let a new post silently ship without a view counter.
 */
function slugSyncPlugin(): Plugin {
  return {
    name: 'blog-slug-sync',
    buildStart() {
      const source = fs.readFileSync(path.resolve(__dirname, 'api/views.ts'), 'utf-8');
      const block = source.match(/PUBLISHED_SLUGS[^=]*=\s*new Set\(\[([\s\S]*?)\]\)/);
      if (!block) {
        this.error('Could not find PUBLISHED_SLUGS in api/views.ts');
        return;
      }
      const apiSlugs = [...block[1].matchAll(/'([^']+)'/g)].map((m) => m[1]).sort();
      const metaSlugs = BLOG_META.map((post) => post.slug).sort();
      if (apiSlugs.join(',') !== metaSlugs.join(',')) {
        this.error(
          `PUBLISHED_SLUGS in api/views.ts is out of sync with BLOG_META in blog-posts.ts.\n` +
            `  blog-posts.ts: ${metaSlugs.join(', ')}\n` +
            `  api/views.ts:  ${apiSlugs.join(', ')}`
        );
      }
    },
  };
}

function seoPlugin(): Plugin {
  return {
    name: 'seo-tags',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const indexPath = path.join(distDir, 'index.html');
      if (!fs.existsSync(indexPath)) return;

      const indexHtml = fs.readFileSync(indexPath, 'utf-8');

      // Per-post static HTML with tailored OG/Twitter/canonical/JSON-LD
      for (const post of BLOG_META) {
        const blogDir = path.join(distDir, 'blog', post.slug);
        fs.mkdirSync(blogDir, { recursive: true });
        fs.writeFileSync(path.join(blogDir, 'index.html'), replaceMeta(indexHtml, post));
        console.log(`  ✓ SEO: /blog/${post.slug}/index.html`);
      }

      // sitemap.xml
      const lastmod = BLOG_META.reduce(
        (max, p) => (p.dateModified > max ? p.dateModified : max),
        BLOG_META[0].dateModified
      );
      const urls = [
        { loc: `${BASE_URL}/`, lastmod, changefreq: 'monthly', priority: '1.0' },
        ...BLOG_META.map((p) => ({
          loc: `${BASE_URL}/blog/${p.slug}`,
          lastmod: p.dateModified,
          changefreq: 'yearly',
          priority: '0.8',
        })),
      ];
      const sitemap =
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        urls
          .map(
            (u) =>
              `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n` +
              `    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
          )
          .join('\n') +
        `\n</urlset>\n`;
      fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap);
      console.log(`  ✓ SEO: /sitemap.xml (${urls.length} urls)`);

      // robots.txt
      const robots =
        `User-agent: *\nAllow: /\n\nSitemap: ${BASE_URL}/sitemap.xml\n`;
      fs.writeFileSync(path.join(distDir, 'robots.txt'), robots);
      console.log(`  ✓ SEO: /robots.txt`);
    },
  };
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), slugSyncPlugin(), seoPlugin()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
