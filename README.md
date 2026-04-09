# LinkVault 🔗

> Open-source web link sharing library with a full blog — built with Next.js 14, Supabase, and NextAuth.

![LinkVault Screenshot](public/og-image.png)

## ✨ Features

### Links Library
- Browse & search curated web links in grid cards
- Logo, title, description, bookmark icon + counter, views counter
- Category filtering (AI Tools, Dev Tools, Design, Productivity…)
- Community link submissions (admin review queue)
- Bookmark links (authenticated users)
- Full single-link detail page

### Blog
- Full blog with categories, tags, featured posts
- Thumbnail images per post
- Rich embedded editor (Tiptap) with formatting toolbar
- Social share buttons (Twitter, LinkedIn, Facebook, Copy)
- Comment system with threaded replies + likes
- Full SEO: meta title/description, OG image, canonical, JSON-LD
- Live Google preview in editor
- Related posts

### Auth
- GitHub OAuth
- Google OAuth
- Azure AD / Microsoft (for org self-hosting)
- Role system: `user`, `editor`, `admin`

### Admin Dashboard
- Approve / reject pending link submissions
- Manage blog posts (publish, edit, delete)
- Stats overview (links, posts, comments)

### SEO & Performance
- `next/image` for all images
- Font optimization (DM Sans, DM Serif)
- `sitemap.xml` auto-generated
- `robots.txt` configured
- Open Graph + Twitter cards
- JSON-LD structured data for blog posts
- `generateStaticParams` for SSG on blog posts
- ISR with 60s revalidation on lists

### Self-hosting
- Docker + docker-compose support
- Nginx reverse proxy config
- Full environment variable template

---

## 🚀 Quick Start

### 1. Clone & install

```bash
git clone https://github.com/your-org/linkvault.git
cd linkvault
npm install
cp .env.example .env.local
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Go to **Storage** → create a bucket named `linkvault-uploads` (public)
4. Copy your Project URL, anon key, and service role key into `.env.local`

### 3. Set up OAuth providers

**GitHub:**
- Go to [github.com/settings/developers](https://github.com/settings/developers)
- New OAuth App → `Homepage URL: http://localhost:3000`, `Callback: http://localhost:3000/api/auth/callback/github`
- Copy Client ID and Secret

**Google:**
- Go to [console.cloud.google.com](https://console.cloud.google.com)
- Create OAuth 2.0 Client → Authorized redirect: `http://localhost:3000/api/auth/callback/google`
- Copy Client ID and Secret

**Azure AD (optional, for orgs):**
- Go to [portal.azure.com](https://portal.azure.com) → App registrations → New registration
- Redirect URI: `http://localhost:3000/api/auth/callback/azure-ad`
- Copy Application ID, create a client secret, note your Tenant ID

### 4. Configure `.env.local`

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-here   # openssl rand -base64 32

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

AZURE_AD_CLIENT_ID=
AZURE_AD_CLIENT_SECRET=
AZURE_AD_TENANT_ID=

NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=LinkVault
NEXT_PUBLIC_APP_DESCRIPTION=Open-source web link sharing library
```

### 5. Run

```bash
npm run dev
```

---

## 🎨 Custom Branding

Change the app name and appearance for your organization:

1. Set `NEXT_PUBLIC_APP_NAME=YourBrand` in your `.env`
2. Replace `public/favicon.ico` and `public/logo.png`
3. Update CSS variables in `app/globals.css`:
   ```css
   :root {
     --accent: #your-brand-color;
   }
   ```

---

## 🐳 Self-hosting with Docker

```bash
# Build and run
docker-compose up -d

# With Nginx (production)
docker-compose --profile production up -d
```

---

## ☁️ Deploy to Vercel

```bash
npm i -g vercel
vercel --prod
```

Set all environment variables in your Vercel dashboard (Settings → Environment Variables) or use the Vercel CLI to link secrets:

```bash
vercel env add NEXTAUTH_SECRET
# ... repeat for each variable
```

---

## 📁 Project Structure

```
linkvault/
├── app/
│   ├── (auth)/login/          # Login page
│   ├── api/
│   │   ├── auth/[...nextauth] # NextAuth handler
│   │   ├── links/             # Links CRUD
│   │   ├── blog/              # Blog CRUD
│   │   ├── comments/          # Comments
│   │   └── bookmarks/         # Bookmarks
│   ├── blog/
│   │   ├── [slug]/            # Post detail
│   │   ├── new/               # Create post
│   │   └── edit/[slug]/       # Edit post
│   ├── dashboard/             # Admin dashboard
│   ├── links/[id]/            # Link detail
│   ├── sitemap.ts             # Auto sitemap
│   └── robots.ts              # Robots.txt
├── components/
│   ├── blog/                  # BlogCard, Editor, Comments, Share
│   ├── links/                 # LinkCard, LinksGrid, Filters
│   ├── layout/                # Navbar, Footer, Providers
│   └── ui/                    # Pagination
├── lib/
│   ├── supabase.ts            # Supabase clients
│   ├── auth.ts                # NextAuth config
│   └── utils.ts               # Helpers
├── supabase/
│   └── schema.sql             # Full DB schema
├── types/index.ts             # TypeScript types
├── middleware.ts              # Route protection
├── Dockerfile                 # Docker build
└── docker-compose.yml         # Self-host config
```

---

## 🔐 Roles

| Role    | Can submit links | Can write posts | Can approve links | Can delete anything |
|---------|-----------------|-----------------|-------------------|---------------------|
| user    | ✅              | ❌              | ❌                | ❌                  |
| editor  | ✅              | ✅              | ✅                | ❌                  |
| admin   | ✅              | ✅              | ✅                | ✅                  |

To make a user an admin, run in Supabase SQL Editor:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'you@example.com';
```

---

## 📄 License

MIT
