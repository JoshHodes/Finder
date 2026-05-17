# Finder

A web app that helps you find things around the house. Photograph your drawers, shelves, and boxes — AI identifies every item inside. Then search for anything and instantly see where it is.

Built with React, Gemini 2.5 Flash, and Supabase.

## How it works

1. **Add a location** — take a photo of a drawer or shelf and give it a name
2. **AI analysis** — Gemini Vision identifies every item in the photo and generates vector embeddings for each item
3. **Semantic search** — search for categories, synonyms, or exact items, and see which location has it using vector similarity

## Setup

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier)
- A [Google AI Studio](https://aistudio.google.com) API key (Gemini)

### 1. Clone and install

```bash
git clone <repo-url>
cd Finder
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to the **SQL Editor** and run the contents of `supabase-setup.sql` first, followed by `supabase-semantic-search.sql` to enable pgvector
3. Go to **Storage** → create a new **public** bucket called `location-photos`

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

```
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_SERVICE_KEY=your_service_role_key

VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

You can find the Supabase keys under **Settings → API** in the Supabase dashboard.

### 4. Run locally

```bash
npm run dev
```

This starts both the Vite frontend and the local API server. Open [http://localhost:5173](http://localhost:5173).

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) |
| API | Express (local) / Vercel Serverless (production) |
| AI | Gemini 2.5 Flash & Gemini Embedding 2 |
| Database | Supabase (PostgreSQL with pgvector) |
| Storage | Supabase Storage |

## Project structure

```
├── api/                    Serverless API functions
│   ├── analyze.js          Photo analysis + save
│   ├── locations.js        List all locations
│   ├── location/[id].js    Get/delete a location
│   └── search.js           Semantic vector search
├── src/
│   ├── components/         Reusable UI components
│   ├── pages/              Route pages
│   ├── lib/supabase.js     Supabase client
│   ├── App.jsx             Router
│   └── App.css             Styles
├── server.js               Local dev API server
├── supabase-setup.sql      Base database schema
├── supabase-semantic-search.sql AI vector embeddings & search RPC
└── vercel.json             Production deploy config
```

## Deploying to Vercel

1. Push to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Add environment variables in the Vercel dashboard
4. Deploy
