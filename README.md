# Poetic Storytelling Platform

A production-ready MERN starter for a public poetry, shayari, and story website with a private admin dashboard.

## Structure

```text
root/
  client/   React + JSX + pure CSS frontend
  server/   Node.js + Express + MongoDB backend
```

## Quick Start

```bash
npm install
npm run install:all
cp client/.env.example client/.env
cp server/.env.example server/.env
npm run seed:content --prefix server
npm run dev
```

Client runs on `http://localhost:5173`.
Server runs on `http://localhost:5000`.
Admin dashboard route: `http://localhost:5173/v1/adminShreyaTiwari`.

## MongoDB Setup

1. Install MongoDB locally or create a free cluster at MongoDB Atlas.
2. Create a database named `poetic_storytelling`.
3. Put your connection string in `server/.env` as `MONGO_URI`.
4. Start the server with `npm run server`.
5. Seed the single admin with `npm run seed:admin --prefix server`.
6. Seed starter public writings with `npm run seed:content --prefix server`.
7. Check `http://localhost:5000/api/health`.

## Environment Variables

Client:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Server:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/poetic_storytelling
CLIENT_URL=http://localhost:5173
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
COOKIE_SECRET=replace-with-cookie-secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace-with-at-least-12-characters
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=120
LOGIN_RATE_LIMIT_WINDOW_MS=900000
LOGIN_RATE_LIMIT_MAX=8
MAX_IMAGE_SIZE_MB=5
MAX_VIDEO_SIZE_MB=50
```

## Admin API

```text
POST   /api/admin/login
POST   /api/admin/logout
GET    /api/admin/me
GET    /api/admin/analytics
GET    /api/admin/posts
POST   /api/admin/posts
PATCH  /api/admin/posts/:id
DELETE /api/admin/posts/:id
POST   /api/admin/uploads
GET    /api/admin/comments
PATCH  /api/admin/comments/:id
PATCH  /api/admin/comments/:id/approve
GET    /api/admin/moderation
POST   /api/admin/moderation/identities
DELETE /api/admin/moderation/identities/:id
GET    /api/posts
GET    /api/posts/home
GET    /api/posts/suggestions
GET    /api/posts/trending
GET    /api/posts/latest
GET    /api/posts/:slug
POST   /api/posts/:id/like
POST   /api/posts/:id/react
POST   /api/posts/:id/view
POST   /api/posts/:id/share
POST   /api/comments/create
GET    /api/comments/:postId
```

See [client/README.md](client/README.md) and [server/README.md](server/README.md) for more detail.

## Final Architecture

```text
Browser / PWA
  React JSX + pure CSS + Framer Motion
  Theme, SEO, service worker, local bookmarks/history
        |
        | HTTPS + credentials
        v
Express API
  Helmet, CORS, compression, sanitize, rate limits
  Public APIs, admin JWT cookie auth, moderation, analytics
        |
        v
MongoDB Atlas
  Admin, Post, Comment, PublicInteraction,
  AnalyticsEvent, ModerationIdentity, ModerationLog
```

## Deployment

Frontend on Vercel:

```bash
npm install
npm run build --prefix client
```

Use `vercel.json`. Set:

```env
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_SITE_URL=https://your-frontend-domain.com
```

Backend on Render or Railway:

```bash
cd server
npm install
npm start
```

Use `render.yaml` or `railway.json`. Set production env vars:

```env
NODE_ENV=production
MONGO_URI=mongodb+srv://...
CLIENT_URL=https://your-frontend-domain.com
JWT_SECRET=long-random-secret
COOKIE_SECRET=long-random-cookie-secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=long-secure-password
```

After deployment:

```bash
npm run seed:admin --prefix server
npm run seed:content --prefix server
```

## Production Checklist

- Replace `JWT_SECRET` and `COOKIE_SECRET` with long random values.
- Use MongoDB Atlas with network access restricted where possible.
- Set `NODE_ENV=production`.
- Set exact production `CLIENT_URL`.
- Verify HTTPS cookies work on the deployed frontend/backend domains.
- Run `npm run lint` and `npm run build` before release.
- Update `client/public/sitemap.xml` and `robots.txt` with the real domain.
- Configure custom domain and HTTPS in Vercel/Render/Railway.

## Optimization Summary

- Lazy-loaded React routes and suspense loading states.
- PWA manifest and service worker for install/offline shell support.
- Dynamic SEO meta tags, OpenGraph, Twitter cards, canonical URL, JSON-LD.
- API response caching for public reads.
- Compression middleware on the backend.
- WebP image optimization for uploads.
- Long-lived static asset caching for deployment.
- Reduced-motion media query for accessibility.

## Security Checklist

- Helmet secure headers.
- Production CORS origin restriction.
- HTTP-only JWT admin cookies.
- Mongo sanitize and XSS sanitization.
- Login and API rate limiting.
- Upload type and size validation.
- Hidden sensitive server errors in production.
- Anonymous abuse prevention with fingerprint, IP metadata, local token, and cooldowns.
