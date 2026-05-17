# MongoDB Database

This project uses **MongoDB** (via Mongoose ODM), not MySQL.

## Collections

| Collection | Description |
|------------|-------------|
| `users` | Admin accounts |
| `categories` | Product categories |
| `suppliers` | Suppliers |
| `products` | Inventory items |
| `activitylogs` | Audit trail |

## Auto-setup

On backend startup:
1. Connects to `MONGODB_URI`
2. Creates admin user (`admin` / `admin123`)
3. Seeds sample data if products collection is empty

## Manual seed

```bash
cd backend
npm run seed
```

## Legacy

`schema.sql` is kept for reference only (previous MySQL version). Do not import it for MongoDB.

## MongoDB Atlas (free)

1. Create cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Database Access → create user
3. Network Access → allow `0.0.0.0/0` (or Render IPs)
4. Connect → copy connection string
5. Set `MONGODB_URI` on Render
