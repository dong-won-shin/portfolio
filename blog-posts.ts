/**
 * Single source of truth for published blog posts.
 *
 * Consumed at build time by vite.config.ts (prerendered OG tags, sitemap) and
 * at runtime by api/views.ts (which slugs may have a view counter). Adding a
 * post here plus the matching public/blog/<slug>.md is all that's required.
 */

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  datePublished: string;
  dateModified: string;
};

export const BLOG_META: BlogPost[] = [
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

export const BLOG_SLUGS: ReadonlySet<string> = new Set(BLOG_META.map((post) => post.slug));
