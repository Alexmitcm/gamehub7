## Game Hub – Developer Guide

### Overview
The Game Hub lets admins upload and manage HTML5 games (as ZIP packages with optional icon/cover), and end‑users discover and play them in the web app. This document covers the architecture, data model, API, admin UI, and deployment.

### Architecture
- **Backend**: apps/api (Hono + Prisma + local file storage)
  - Serves static files under `/uploads/*`
  - Extracts uploaded ZIPs under `/uploads/games/{slug}`
  - Stores icon/cover under `/uploads/thumbnails/{slug}_{type}.{ext}`
- **Frontend**: apps/web (React + Vite)
  - Game Hub list, filters, detail and in‑iframe player
  - Admin pages for Games, Categories, Comments

### Data Model (Prisma)
- `Game`
  - Core: `id, title, slug, description, instructions, width, height, tags`
  - Media & play: `packageUrl/packageBase, entryFilePath/entryFile, iconUrl, coverImageUrl/coverUrl`
  - Status & stats: `status, views, upvote, downvote`
  - Relations: `categories (m:n via GameCategory)`, `comments`, `trends`
- `Category`
  - `id, name, slug, description, metaDescription`
  - Relation: `games (m:n)`
- `GameCategory` (join)
  - `gameId, categoryId`
- `Comment`
  - `id, gameId, parentId?, comment, senderId, senderUsername, approved, createdAt`

Note: Field names may vary slightly between routes (legacy compatibility); see returned JSON.

### Public API (apps/api)
- `GET /games`
  - Query: `category, search, source, sortBy=newest|popular|rating|plays, featured, page, limit`
  - Returns `games[]` with robust `thumb1Url/thumb2Url`, `gameFileUrl/packageUrl`, `entryFilePath`, categories, and pagination
- `GET /games/:slug`
  - Returns full game detail; gracefully handles sample slugs
- `GET /games/categories`
  - Returns `categories[]` with `_count.games`
- `POST /games/:slug/play`
  - Records simple play metadata (scoped for future use)

### Management API (admin)
- Games
  - `GET /games/manage` – admin list
  - `POST /games/manage` – create (multipart/form‑data)
    - Fields (text): `title, slug, description, instructions?, width?, height?, categories?` (comma separated)
    - Files: `package` (required ZIP), `icon?` (image), `cover?` (image)
  - `PUT /games/manage/:id` – update (multipart; files optional)
  - `DELETE /games/manage/:id` – delete DB and files
  - Files are extracted to `/uploads/games/{slug}`; `entryFilePath` is auto‑detected (prefers `index.html`)
- Categories
  - `GET /games/manage/categories` – list with counts
  - `POST /games/manage/categories` – `{ name, slug?, description?, metaDescription? }`
  - `PUT /games/manage/categories/:id` – update
  - `DELETE /games/manage/categories/:id` – blocked if any games exist
- Comments
  - `GET /games/manage/comments?limit=100` – recent comments for moderation
  - `PUT /games/comments/:id` – `{ approved: boolean }`
  - `DELETE /games/comments/:id`

### File Serving
- Static: `app.use("/uploads/*", serveStatic({ root: "./" }))`
- Game player URLs: `${API_BASE}${game.gameFileUrl}/${game.entryFilePath}` (iframe src)

### Frontend – Game Hub (apps/web)
- Filters: search, category, source, sort, featured (persisted via URL query)
- Cards: use `thumb1Url` with fallbacks to icon or screenshots
- Detail: `GamePlayer` renders iframe using `gameFileUrl + entryFilePath`
- Status banners: `StatusBanner` reads `?status=success|error|deleted&message=...`

### Frontend – Admin (apps/web)
- Nav: Dashboard · Games · Add Game
- Games
  - `/admin/games` – table with filters, edit (modal), delete
  - `/admin/games/new` – create (multipart)
  - `/admin/games/edit/:id` – edit (multipart)
- Categories
  - Manage list; create/edit (name, slug, description, meta), delete guarded by counts
- Comments
  - List latest; approve/unapprove, delete

### Upload Pipeline
1) Admin submits form (ZIP + optional images + metadata)
2) API writes files under `/uploads/games/{slug}` and `/uploads/thumbnails`
3) ZIP is extracted; `entryFilePath` is auto‑detected (prefers a real game HTML over docs)
4) DB saved with public URLs; Hub uses those to render

### Environment Variables
- `DATABASE_URL` – Prisma DB URL
- `VITE_API_URL` (web) or `HEY_API_URL` (shared constant) – API base. Example: `http://localhost:3010`

### Dev Commands
- Start monorepo: `pnpm dev` (runs api + web)
- Prisma (api): `pnpm prisma generate` · `pnpm prisma migrate dev`

### Troubleshooting
- **EADDRINUSE: 3010** – kill existing process: `netstat -ano | findstr :3010` → `taskkill /PID <PID> /F`
- **CORS for DELETE/PUT** – allowed globally; ensure browser cache cleared
- **unzip-stream missing** – install in workspace: `pnpm add -w unzip-stream`
- **Black covers** – ensure `coverUrl` exists; fallbacks to icon/screenshots are in place; re‑upload with “Card Cover”
- **Wrong entry file** – auto‑detector prefers actual game HTML; re‑upload if needed
- **JWT warnings** – dev mock flow prints errors but continues; real auth should provide valid tokens

### Deployment Notes
- Local file storage persists under `/uploads`; for serverless (e.g., Vercel), use S3+CDN instead and swap file helpers
- Build web: `pnpm --filter @hey/web build`; build api: `pnpm --filter @hey/api build` (or single root `pnpm -w build` if configured)
- Migrations (prod): `npx prisma migrate deploy`

### API Examples
#### Create game (multipart)
```
POST /games/manage
Content-Type: multipart/form-data

fields: title, slug, description, instructions?, width?, height?, categories?
files:  package (zip, required), icon?, cover?
```

#### Update game (multipart)
```
PUT /games/manage/:id
// same fields as create; files optional
```

#### Moderate comment
```
PUT /games/comments/:id { approved: true }
DELETE /games/comments/:id
```

### Conventions
- Early returns for errors
- URL‑driven UI state (`useSearchParams`)
- Consistent toasts + StatusBanner (`status`/`message` query)

### Roadmap (optional)
- Move uploads to object storage (S3) with signed URLs
- Add analytics for plays and completion
- Add like/rating persistence


