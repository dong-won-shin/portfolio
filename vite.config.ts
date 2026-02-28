import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const BASE_URL = 'https://dongwonshin.vercel.app';

const BLOG_META = [
  {
    slug: 'imu-preintegration-part1',
    title: 'A Deep Dive into IMU Preintegration (Part 1)',
    description: 'Why Preintegration & the Math Behind It — SO(3) Lie group, Exp/Log maps, IMU kinematics, and the change of coordinates trick',
    image: '/blog/images/imu-preintegration-part1-og.png',
  },
  {
    slug: 'imu-preintegration-part2',
    title: 'A Deep Dive into IMU Preintegration (Part 2)',
    description: 'Noise Isolation, Covariance Propagation & Bias Correction — from entangled measurements to a proper probabilistic model',
    image: '/blog/images/imu-preintegration-part2-og.png',
  },
  {
    slug: 'imu-preintegration-part3',
    title: 'A Deep Dive into IMU Preintegration (Part 3)',
    description: 'Residuals, Jacobians & the Gauss-Newton System — from manifold residuals to the normal equation for Visual-Inertial SLAM',
    image: '/blog/images/imu-preintegration-part3-og.png',
  },
];

function blogOgPlugin(): Plugin {
  return {
    name: 'blog-og-tags',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const indexPath = path.join(distDir, 'index.html');

      if (!fs.existsSync(indexPath)) return;

      const indexHtml = fs.readFileSync(indexPath, 'utf-8');

      for (const post of BLOG_META) {
        const blogDir = path.join(distDir, 'blog', post.slug);
        fs.mkdirSync(blogDir, { recursive: true });

        const ogTitle = `${post.title} | Dong-Won Shin`;
        const ogUrl = `${BASE_URL}/blog/${post.slug}`;
        const ogImage = `${BASE_URL}${post.image}`;

        let html = indexHtml;

        // Update <title>
        html = html.replace(/<title>.*?<\/title>/, `<title>${ogTitle}</title>`);

        // Update meta name tags
        html = html.replace(
          /(<meta name="title" content=").*?(")/,
          `$1${ogTitle}$2`
        );
        html = html.replace(
          /(<meta name="description" content=").*?(")/,
          `$1${post.description}$2`
        );

        // Update Open Graph tags
        html = html.replace(
          /(<meta property="og:type" content=").*?(")/,
          `$1article$2`
        );
        html = html.replace(
          /(<meta property="og:url" content=").*?(")/,
          `$1${ogUrl}$2`
        );
        html = html.replace(
          /(<meta property="og:title" content=").*?(")/,
          `$1${ogTitle}$2`
        );
        html = html.replace(
          /(<meta property="og:description" content=").*?(")/,
          `$1${post.description}$2`
        );
        html = html.replace(
          /(<meta property="og:image" content=").*?(")/,
          `$1${ogImage}$2`
        );
        html = html.replace(
          /(<meta property="og:image:width" content=").*?(")/,
          `$11200$2`
        );
        html = html.replace(
          /(<meta property="og:image:height" content=").*?(")/,
          `$1630$2`
        );

        fs.writeFileSync(path.join(blogDir, 'index.html'), html);
        console.log(`  ✓ Generated OG tags: /blog/${post.slug}/index.html`);
      }
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
      plugins: [react(), blogOgPlugin()],
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
