# Deployment Guide

## Architecture

| Layer    | Platform           |
|----------|--------------------|
| Frontend | **Vercel**         |
| Backend  | **Render**         |
| Database | **MongoDB Atlas** (or Railway MongoDB) |

---

## Step 1: MongoDB Database

### Option A — MongoDB Atlas (recommended, free)

1. [mongodb.com/atlas](https://www.mongodb.com/atlas) → Create cluster (M0 free)
2. **Database Access** → Add user + password
3. **Network Access** → Add IP `0.0.0.0/0` (allow from anywhere for Render)
4. **Connect** → Drivers → copy connection string:

```
mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/inventory_db?retryWrites=true&w=majority
```

### Option B — Railway MongoDB

1. Railway → New → **MongoDB**
2. Copy `MONGO_URL` or `MONGODB_URI` from Variables tab

> No SQL import needed. Data is auto-seeded when the backend starts.

---

## Step 2: Render Backend

| Setting | Value |
|---------|--------|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `npm start` |

**Environment variables:**

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/inventory_db
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=24h
CLIENT_URL=https://your-app.vercel.app
```

Test: `https://YOUR-RENDER-URL.onrender.com/api/health`

---

## Step 3: Vercel Frontend

**Important:** In Vercel → Project Settings → General → **Root Directory** set to:

```
frontend
```

| Setting | Value |
|---------|--------|
| Root Directory | `frontend` |
| Framework Preset | Vite |
| Build Command | (leave empty — uses `frontend/vercel.json`) |
| Output Directory | `dist` |

**Environment variable:**

```env
VITE_API_URL=https://YOUR-RENDER-URL.onrender.com/api
```

---

## Login

| Username | Password |
|----------|----------|
| `admin`  | `admin123` |

---

## Local development

```powershell
cd backend
copy .env.example .env
# Set MONGODB_URI=mongodb://localhost:27017/inventory_db  (local MongoDB)
# Or use Atlas connection string
npm install
npm run dev
```

```powershell
cd frontend
copy .env.example .env
npm install
npm run dev
```
