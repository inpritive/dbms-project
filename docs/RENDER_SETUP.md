# Render Backend Setup (fix build errors)

## Problem

If you see `vite: not found` or `yarn build` on Render — the service is building the **frontend** instead of the **backend**.

## Correct Render settings

Go to **Render Dashboard** → your web service → **Settings**:

| Setting | Value |
|---------|--------|
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

**Delete** any custom command like `yarn install; yarn build`.

## Environment variables

```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=long_random_secret
JWT_EXPIRES_IN=24h
CLIENT_URL=https://your-app.vercel.app
NODE_ENV=production
```

## After deploy

Open: `https://YOUR-SERVICE.onrender.com/api/health`

Expected: `"mongoConnected": true`, `"adminExists": true`

## Vercel (frontend only)

Do **not** deploy frontend on Render. Use Vercel with:

```
VITE_API_URL=https://YOUR-SERVICE.onrender.com/api
```
