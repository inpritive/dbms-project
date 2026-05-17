# Deployment Guide

## Architecture

| Layer    | Platform        | Purpose              |
|----------|-----------------|----------------------|
| Frontend | **Vercel**      | React + Vite UI      |
| Backend  | **Render**      | Node.js + Express API|
| Database | **Railway MySQL** | MySQL data store   |

```
[Vercel Frontend]  --HTTPS-->  [Render API]  --MySQL-->  [Railway MySQL]
```

---

## Step 1: Railway MySQL Database

1. Go to [railway.app](https://railway.app) → **New Project** → **Provision MySQL**
2. Open the MySQL service → **Connect** tab
3. Enable **Public Networking** (required for Render to connect externally)
4. Copy connection details:
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`
   - `MYSQLDATABASE` (often `railway`)

### Import schema

Connect with MySQL Workbench, TablePlus, or CLI:

```bash
mysql -h YOUR_RAILWAY_HOST -P YOUR_PORT -u root -p YOUR_DATABASE < database/schema.sql
```

Or paste contents of `database/schema.sql` into Railway's **Query** tab.

> Admin user (`admin` / `admin123`) is auto-created when the Render backend starts.

---

## Step 2: Render Backend

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repo `dbms-project`
3. Configure:

| Setting          | Value                    |
|------------------|--------------------------|
| **Name**         | `dbms-inventory-api`     |
| **Root Directory** | `backend`              |
| **Runtime**      | Node                     |
| **Build Command**| `npm install`            |
| **Start Command**| `npm start`              |
| **Plan**         | Free                     |

4. Add **Environment Variables**:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DB_HOST` | Railway `MYSQLHOST` (public host) |
| `DB_PORT` | Railway `MYSQLPORT` |
| `DB_USER` | Railway `MYSQLUSER` |
| `DB_PASSWORD` | Railway `MYSQLPASSWORD` |
| `DB_NAME` | Railway `MYSQLDATABASE` |
| `JWT_SECRET` | Long random string (e.g. 64 chars) |
| `JWT_EXPIRES_IN` | `24h` |
| `CLIENT_URL` | Your Vercel URL (set after Step 3) |

5. Click **Create Web Service**
6. Wait for deploy → copy your API URL:  
   `https://dbms-inventory-api.onrender.com`

### Test API

Open: `https://YOUR-RENDER-URL.onrender.com/api/health`

Expected:
```json
{ "success": true, "message": "Inventory API is running" }
```

---

## Step 3: Vercel Frontend

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import GitHub repo `dbms-project`
3. Configure:

| Setting            | Value                                      |
|--------------------|--------------------------------------------|
| **Framework**      | Vite                                       |
| **Root Directory** | Leave empty (uses root `vercel.json`)      |
| **Build Command**  | (auto from `vercel.json`)                  |
| **Output Directory** | `frontend/dist` (auto)                   |

4. Add **Environment Variable**:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://YOUR-RENDER-URL.onrender.com/api` |

5. Deploy → copy Vercel URL:  
   `https://your-app.vercel.app`

6. Go back to **Render** → update `CLIENT_URL` to your Vercel URL → **Redeploy**

---

## Step 4: Login

| Field    | Value      |
|----------|------------|
| Username | `admin`    |
| Password | `admin123` |

---

## Environment Variables Summary

### Render (Backend)

```env
NODE_ENV=production
PORT=10000
DB_HOST=containers-us-west-xxx.railway.app
DB_PORT=12345
DB_USER=root
DB_PASSWORD=xxxxxxxx
DB_NAME=railway
JWT_SECRET=your_64_char_secret
JWT_EXPIRES_IN=24h
CLIENT_URL=https://your-app.vercel.app
```

### Vercel (Frontend)

```env
VITE_API_URL=https://dbms-inventory-api.onrender.com/api
```

### Railway (MySQL)

Provided automatically by Railway plugin — copy to Render.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Login fails on Vercel | Check `VITE_API_URL` ends with `/api` and Render is running |
| `Cannot reach API server` | Render free tier sleeps — first request takes ~30s |
| MySQL connection error on Render | Enable Railway MySQL **Public Networking** |
| CORS error | Set `CLIENT_URL` on Render to exact Vercel URL (no trailing slash) |
| 401 Invalid credentials | Redeploy Render — admin auto-created on startup |
| Build fails on Vercel | Framework = Vite, not Angular |

---

## Local Development

```powershell
# Terminal 1 - Backend
cd backend
copy .env.example .env
# Edit .env with Railway MySQL credentials or localhost
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
copy .env.example .env
# VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```

Open http://localhost:5173
