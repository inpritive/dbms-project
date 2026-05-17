# InventoryPro — Simple Inventory Management System

A full-stack **Inventory Management System** built for a **DBMS mini project**. Features JWT authentication, MongoDB database, REST APIs, analytics dashboard with charts, CRUD operations, CSV/PDF export, and a modern React + Tailwind UI with dark mode.

![Dashboard Screenshot](docs/screenshots/dashboard.png)
> Placeholder: Add screenshot after running the app

---

## Tech Stack

| Layer      | Technology                          |
|-----------|--------------------------------------|
| Frontend  | React.js, Vite, Tailwind CSS, Recharts |
| Backend   | Node.js, Express.js                  |
| Database  | MongoDB                              |
| ODM       | Mongoose                             |
| Auth      | JWT + bcrypt password hashing        |

## Production Deployment

| Layer    | Platform        |
|----------|-----------------|
| Frontend | **Vercel**      |
| Backend  | **Render**      |
| Database | **MongoDB Atlas** |

Full step-by-step guide: **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**

---

## Project Structure

```
dbms-project/
├── backend/                 # Node.js + Express REST API
│   ├── src/
│   │   ├── config/          # Database connection
│   │   ├── controllers/     # Business logic (MVC)
│   │   ├── middleware/      # Auth, upload, errors
│   │   ├── routes/          # API route definitions
│   │   ├── validators/      # Input validation
│   │   └── utils/           # Helpers, seed script
│   └── uploads/             # Product images
├── frontend/                # React + Vite SPA
│   └── src/
│       ├── api/             # Axios HTTP client
│       ├── components/      # Reusable UI components
│       ├── context/         # Auth & theme state
│       └── pages/           # Route pages
├── database/
│   └── MONGODB.md           # MongoDB collections guide
└── docs/                    # ER diagram, viva Q&A
```

---

## Features

- **Authentication:** Admin login/logout, bcrypt hashing, JWT protected routes
- **Dashboard:** Total products, stock quantity, low stock alerts, inventory value, Recharts charts
- **Products CRUD:** Search, filter, pagination, sorting, image upload, stock status auto-update
- **Categories & Suppliers:** Full CRUD with relationship constraints
- **Export:** Products to CSV and PDF
- **Activity Log:** Recent actions on dashboard
- **UI:** Sidebar navigation, dark mode, responsive design, toast notifications

---

## Prerequisites

- **Node.js** v18+ ([download](https://nodejs.org))
- **MongoDB** Atlas account or local MongoDB
- **npm** (comes with Node.js)

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd dbms-project
```

### 2. MongoDB setup

Use [MongoDB Atlas](https://www.mongodb.com/atlas) (free) or local MongoDB:

```env
MONGODB_URI=mongodb://localhost:27017/inventory_db
```

See [database/MONGODB.md](database/MONGODB.md) for details.

### 3. Backend setup

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
```

Install dependencies and seed admin user:

```bash
npm install
npm run seed
npm run dev
```

Backend runs at: **http://localhost:5000**

### 4. Frontend setup

Open a new terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

### 5. Login

| Field    | Value     |
|----------|-----------|
| Username | `admin`   |
| Password | `admin123`|

---

## Screenshots (Placeholders)

| Page       | Path                              |
|-----------|-----------------------------------|
| Login     | `docs/screenshots/login.png`      |
| Dashboard | `docs/screenshots/dashboard.png`  |
| Products  | `docs/screenshots/products.png`   |
| Categories| `docs/screenshots/categories.png` |
| Dark Mode | `docs/screenshots/dark-mode.png`  |

---

## API Documentation

Base URL: `http://localhost:5000/api`

### Authentication

| Method | Endpoint              | Auth | Description        |
|--------|----------------------|------|--------------------|
| POST   | `/auth/login`        | No   | Admin login        |
| GET    | `/auth/profile`      | Yes  | Get profile        |
| PUT    | `/auth/profile`      | Yes  | Update profile     |
| PUT    | `/auth/change-password` | Yes | Change password |

**Login Request:**
```json
{ "username": "admin", "password": "admin123" }
```

**Login Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { "id": 1, "username": "admin", "role": "admin" }
  }
}
```

### Products

| Method | Endpoint                | Description              |
|--------|------------------------|--------------------------|
| GET    | `/products`            | List (search, filter, pagination) |
| GET    | `/products/:id`        | Get single product       |
| POST   | `/products`            | Create (multipart for image) |
| PUT    | `/products/:id`        | Update                   |
| DELETE | `/products/:id`        | Delete                   |
| GET    | `/products/export/csv` | Export CSV               |
| GET    | `/products/export/pdf` | Export PDF               |

**Query params:** `page`, `limit`, `search`, `category_id`, `stock_status`, `sortBy`, `sortOrder`

### Categories

| Method | Endpoint           | Description    |
|--------|-------------------|----------------|
| GET    | `/categories`     | List all       |
| POST   | `/categories`     | Create         |
| PUT    | `/categories/:id` | Update         |
| DELETE | `/categories/:id` | Delete       |

### Suppliers

| Method | Endpoint           | Description    |
|--------|-------------------|----------------|
| GET    | `/suppliers`      | List all       |
| POST   | `/suppliers`      | Create         |
| PUT    | `/suppliers/:id`  | Update         |
| DELETE | `/suppliers/:id`  | Delete         |

### Dashboard

| Method | Endpoint              | Description           |
|--------|----------------------|-----------------------|
| GET    | `/dashboard/stats`   | Analytics & charts data |
| GET    | `/dashboard/activity`| Recent activity logs  |

> All protected routes require header: `Authorization: Bearer <token>`

---

## Database Design

See [docs/ER_DIAGRAM.md](docs/ER_DIAGRAM.md) for ER diagram explanation.

### Tables

- **users** — Admin accounts
- **categories** — Product categories
- **suppliers** — Product suppliers
- **products** — Inventory items (FK → categories, suppliers)
- **activity_logs** — Audit trail (FK → users)

### DBMS Concepts Used

- Primary Keys & Foreign Keys
- Referential Integrity (ON DELETE RESTRICT / CASCADE)
- CHECK constraints (price ≥ 0, quantity ≥ 0)
- UNIQUE constraints
- Indexes for query optimization
- **Views:** `vw_inventory_summary`, `vw_product_details`
- **Triggers:** Auto-update stock status on INSERT/UPDATE
- **Stored Procedure:** `update_stock_status`
- **JOIN queries** for relational data retrieval
- **Aggregate functions:** COUNT, SUM, GROUP BY
- **Transactions** (implicit via InnoDB)

---

## Stock Status Logic

| Quantity | Status        |
|----------|---------------|
| 0        | Out of Stock  |
| 1–10     | Low Stock     |
| > 10     | In Stock      |

---

## Viva Preparation

See [docs/VIVA_QA.md](docs/VIVA_QA.md) for presentation questions and answers.

---

## Production Build

```bash
# Frontend
cd frontend && npm run build

# Backend
cd backend && npm start
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection failed | Check `MONGODB_URI` in Render/backend `.env` |
| Login fails | Run `npm run seed` in backend folder |
| CORS error | Set `CLIENT_URL=http://localhost:5173` in backend `.env` |
| Port in use | Change `PORT` in backend `.env` or Vite port in `vite.config.js` |

---

## License

MIT — Free for educational and portfolio use.

---

**Author:** DBMS Mini Project  
**Year:** 2026
