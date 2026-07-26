<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1wgt3VhEC_Fnn0-0mOvwNMR6olmvgJHzD

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Blog view counter

Blog posts show a public view count, served by [api/views.ts](api/views.ts) backed by
Upstash Redis. A view is counted at most once per visitor per post per day.

Only slugs listed in [blog-posts.ts](blog-posts.ts) get a counter — that file is the
single source of truth shared by the build (OG tags, sitemap) and the API, so a new post
needs an entry there alongside its `public/blog/<slug>.md`.

To enable it on Vercel:

1. Vercel dashboard → **Storage** → **Create Database** → **Upstash for Redis** (free tier).
2. Connect the store to this project. Vercel injects `KV_REST_API_URL` and
   `KV_REST_API_TOKEN` automatically — no code change needed.
3. Redeploy.

Without those env vars the endpoint returns `{ "views": null }` and the UI simply hides
the counter, so `npm run dev` works unchanged. To exercise the API locally, run
`vercel dev` with the two variables in `.env.local`.

Endpoints:

- `GET /api/views?slug=<slug>` → `{ slug, views }` (read only)
- `GET /api/views?slugs=<a,b,c>` → `{ views: { a, b, c } }`
- `POST /api/views` with `{ "slug": "<slug>" }` → increments, returns `{ slug, views, counted }`
