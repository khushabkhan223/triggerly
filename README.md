# Triggerly

Turn anything on the internet into a trigger. Get notified when crypto prices drop, stocks move, or domains become available.

## Architecture

```
client/    → React + Vite frontend (port 5173)
server/    → Express API (port 3001)
worker/    → Background monitoring worker (30s polling)
supabase/  → Database schema (Postgres)
```

## Setup

### 1. Install dependencies

```bash
npm run install:all
npm install
```

### 2. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a project, and run `supabase/schema.sql` in the SQL editor.

### 3. Configure environment variables

Copy `.env.example` files in `client/`, `server/`, and `worker/` to `.env` and fill in your keys.

**Client** (`client/.env`):
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Server** (`server/.env`):
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=your-resend-key
FROM_EMAIL=alerts@yourdomain.com
```

**Worker** (`worker/.env`):
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=your-resend-key
FROM_EMAIL=alerts@yourdomain.com
TWELVEDATA_API_KEY=your-twelvedata-key
APP_URL=http://localhost:5173
```

### 4. Run the application

```bash
npm run dev
```

This starts all three processes concurrently:
- **Client**: http://localhost:5173
- **Server API**: http://localhost:3001
- **Worker**: Polls every 30 seconds

## API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/triggers` | ✅ | Create trigger (max 50/user) |
| `GET` | `/api/triggers` | ✅ | List triggers |
| `PATCH` | `/api/triggers/:id` | ✅ | Pause/resume |
| `DELETE` | `/api/triggers/:id` | ✅ | Delete |
| `GET` | `/api/alerts` | ✅ | List alerts |
| `GET` | `/api/alerts/stats` | ✅ | Dashboard stats |

## Data Sources

- **Crypto**: CoinGecko API (free, no key)
- **Stocks**: TwelveData API (free key required)
- **Domains**: DNS lookup (no external API)

## License

MIT
