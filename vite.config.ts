import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const BASE_URL = 'https://dongwonshin.vercel.app';
const AUTHOR = 'Dong-Won Shin';

type BlogPost = {
  slug: string;
  title: string;
  description: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  datePublished: string;
  dateModified: string;
};

const BLOG_META: BlogPost[] = [
  {
    slug: 'imu-preintegration-part1',
    title: 'A Deep Dive into IMU Preintegration (Part 1)',
    description: 'Why Preintegration & the Math Behind It — SO(3) Lie group, Exp/Log maps, IMU kinematics, and the change of coordinates trick',
    image: '/blog/images/imu-preintegration-part1-og.png',
    imageWidth: 1200,
    imageHeight: 630,
    datePublished: '2026-02-21',
    dateModified: '2026-02-28',
  },
  {
    slug: 'imu-preintegration-part2',
    title: 'A Deep Dive into IMU Preintegration (Part 2)',
    description: 'Noise Isolation, Covariance Propagation & Bias Correction — from entangled measurements to a proper probabilistic model',
    image: '/blog/images/imu-preintegration-part2-og.png',
    imageWidth: 1200,
    imageHeight: 630,
    datePublished: '2026-02-23',
    dateModified: '2026-02-28',
  },
  {
    slug: 'imu-preintegration-part3',
    title: 'A Deep Dive into IMU Preintegration (Part 3)',
    description: 'Residuals, Jacobians & the Gauss-Newton System — from manifold residuals to the normal equation for Visual-Inertial SLAM',
    image: '/blog/images/imu-preintegration-part3-og.png',
    imageWidth: 1200,
    imageHeight: 630,
    datePublished: '2026-02-28',
    dateModified: '2026-02-28',
  },
  {
    slug: 'orb-slam3-imu-part1',
    title: 'ORB-SLAM3 IMU Preintegration Code Review (1)',
    description: 'In-depth technical analysis of ORB-SLAM3 IMU preintegration — comparing the Forster et al. paper against the actual C++ implementation.',
    image: '/blog/images/orb-slam3-code-review1-intro.png',
    imageWidth: 1762,
    imageHeight: 530,
    datePublished: '2026-02-28',
    dateModified: '2026-02-28',
  },
  {
    slug: 'orb-slam3-imu-part2',
    title: 'ORB-SLAM3 IMU Preintegration Code Review (2)',
    description: 'Residual functions and Jacobian matrices for IMU factors in ORB-SLAM3 — how nonlinear optimization is implemented in code.',
    image: '/blog/images/orb-slam3-code-review2-outro.png',
    imageWidth: 2048,
    imageHeight: 1372,
    datePublished: '2026-02-28',
    dateModified: '2026-02-28',
  },
];

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
      plugins: [react(), seoPlugin()],
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
