# Server

Express and MongoDB API for the poetic storytelling platform.

## Tech

- Node.js
- Express
- MongoDB + Mongoose
- Helmet, CORS, rate limiting, cookies, logging
- JWT-ready auth utilities
- Multer upload middleware

## Run

```bash
cd server
npm install
cp .env.example .env
npm run seed:admin
npm run seed:content
npm run dev
```

## Health Check

```bash
curl http://localhost:5000/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "Server running"
}
```

## MongoDB

Use local MongoDB:

```env
MONGO_URI=mongodb://127.0.0.1:27017/poetic_storytelling
```

Or MongoDB Atlas:

```env
MONGO_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/poetic_storytelling
```

## Single Admin Setup

There is no signup route. Configure the only admin in `.env`, then run:

```bash
npm run seed:admin
```

```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace-with-at-least-12-characters
```

## Admin Auth API

```text
POST /api/admin/login
POST /api/admin/logout
GET  /api/admin/me
```

Auth uses a JWT stored in an HTTP-only `adminToken` cookie. In production, set `NODE_ENV=production`, use HTTPS, and configure `CLIENT_URL` to the deployed frontend origin.

## Protected Admin API

```text
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
```

Supported uploads: `jpg`, `png`, `webp`, and `mp4`.

## Public API

```text
GET  /api/posts
GET  /api/posts/home
GET  /api/posts/suggestions
GET  /api/posts/trending
GET  /api/posts/latest
GET  /api/posts/:slug
POST /api/posts/:id/like
POST /api/posts/:id/react
POST /api/posts/:id/view
POST /api/posts/:id/share
POST /api/comments/create
GET  /api/comments/:postId
```

Anonymous anti-spam uses IP, browser metadata, a client fingerprint header, cooldown windows, and local duplicate prevention on the frontend.
