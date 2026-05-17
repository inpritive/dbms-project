# Deploy Backend on Railway

## Quick setup

1. Create a new **Railway** project from your GitHub repo.
2. Add **MySQL** plugin (or use external MySQL).
3. Set **Root Directory** to empty (repo root) — root `package.json` links the backend via `file:backend`.
4. Add these **Environment Variables**:

| Variable | Example |
|----------|---------|
| `DB_HOST` | `${{MySQL.MYSQLHOST}}` or your host |
| `DB_PORT` | `${{MySQL.MYSQLPORT}}` |
| `DB_USER` | `${{MySQL.MYSQLUSER}}` |
| `DB_PASSWORD` | `${{MySQL.MYSQLPASSWORD}}` |
| `DB_NAME` | `inventory_db` |
| `JWT_SECRET` | long random string |
| `JWT_EXPIRES_IN` | `24h` |
| `CLIENT_URL` | `https://your-frontend.vercel.app` |
| `NODE_ENV` | `production` |
| `PORT` | Railway sets this automatically |

5. Import database schema once (Railway MySQL → Connect → run `database/schema.sql`).
6. Redeploy — backend starts with `npm start --prefix backend`.
7. Test: `https://your-railway-url.up.railway.app/api/health`

## Frontend (Vercel)

Set environment variable:

```
VITE_API_URL=https://your-railway-url.up.railway.app/api
```

## Default login

- Username: `admin`
- Password: `admin123`

Admin user is auto-created when the backend starts.
