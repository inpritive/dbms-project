# Railway MongoDB (optional)

You can use **Railway MongoDB** instead of MongoDB Atlas.

1. Railway → New → **MongoDB**
2. Copy `MONGO_URL` from Variables
3. On **Render**, set:

```env
MONGODB_URI=<paste MONGO_URL from Railway>
```

4. Redeploy Render backend.

Data auto-seeds on first startup. Login: `admin` / `admin123`.

See [DEPLOYMENT.md](DEPLOYMENT.md) for full Vercel + Render setup.
