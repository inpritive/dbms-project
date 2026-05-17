# Viva Questions & Answers

## General Project Questions

### Q1. What is your project about?
**A:** InventoryPro is a web-based Inventory Management System that helps businesses track products, monitor stock levels, manage categories and suppliers, and view analytics through a dashboard. It uses React for the frontend, Node.js/Express for the backend, and **MongoDB** with Mongoose ODM.

### Q2. Why did you choose MongoDB?
**A:** MongoDB stores data as flexible JSON-like documents, integrates easily with Node.js via Mongoose, scales well on cloud (Atlas), and fits our document structure (products with category/supplier references). We use `ObjectId` references between collections, similar to foreign keys in SQL.

### Q3. What architecture does your project follow?
**A:** Three-tier architecture:
1. **Presentation Layer** — React frontend
2. **Application Layer** — Express REST API (MVC pattern)
3. **Data Layer** — MongoDB database

---

## Database Questions

### Q4. Explain your database schema.
**A:** We have 5 tables:
- `users` — admin authentication
- `categories` — product classification
- `suppliers` — vendor information
- `products` — core inventory (FK to categories & suppliers)
- `activity_logs` — audit trail

### Q5. What are Primary Keys and Foreign Keys in your project?
**A:**
- **Primary Key:** `product_id` in products table — uniquely identifies each product
- **Foreign Key:** `category_id` in products references `categories(category_id)` — ensures every product has a valid category

### Q6. What is normalization? Which normal form did you apply?
**A:** Normalization reduces data redundancy. We applied **3NF**:
- Category name is stored only in `categories` table, not repeated in every product row
- Supplier details are in a separate `suppliers` table
- No transitive dependencies exist

### Q7. What is a VIEW? Give an example from your project.
**A:** A VIEW is a virtual table based on a SQL query. Example:

```sql
CREATE VIEW vw_inventory_summary AS
SELECT COUNT(*) AS total_products,
       SUM(quantity) AS total_stock_quantity,
       SUM(price * quantity) AS total_inventory_value
FROM products;
```

This simplifies dashboard queries.

### Q8. What is a TRIGGER? How did you use it?
**A:** A trigger automatically executes SQL when an event occurs. Our `trg_products_stock_status` trigger runs BEFORE INSERT/UPDATE on products to automatically set stock status (In Stock / Low Stock / Out of Stock) based on quantity.

### Q9. What is a Stored Procedure?
**A:** A stored procedure is precompiled SQL stored in the database. We created `update_stock_status(product_id)` to recalculate and update a product's stock status when needed.

### Q10. Explain JOIN types used in your project.
**A:**
- **INNER JOIN:** Product listing with category and supplier names
- **LEFT JOIN:** Category distribution chart (includes categories with zero products)

### Q11. What constraints did you implement?
**A:**
- `PRIMARY KEY` — unique row identifier
- `FOREIGN KEY` — referential integrity
- `UNIQUE` — username, email, category name
- `CHECK` — price ≥ 0, quantity ≥ 0
- `NOT NULL` — required fields
- `ON DELETE RESTRICT` — prevent orphan records

---

## Backend Questions

### Q12. What is REST API?
**A:** REST (Representational State Transfer) uses HTTP methods to perform CRUD:
- GET — Read
- POST — Create
- PUT — Update
- DELETE — Delete

Example: `GET /api/products` returns all products.

### Q13. How does JWT authentication work?
**A:**
1. User sends username/password to `/api/auth/login`
2. Server verifies credentials with bcrypt
3. Server generates a JWT token signed with a secret key
4. Client stores token and sends it in `Authorization: Bearer <token>` header
5. Middleware verifies token on protected routes

### Q14. Why use bcrypt for passwords?
**A:** Bcrypt is a one-way hashing algorithm with salt. Passwords are never stored in plain text. Even if the database is compromised, original passwords cannot be recovered.

### Q15. What is the MVC pattern?
**A:**
- **Model** — Mongoose schemas and models
- **View** — React frontend UI
- **Controller** — `controllers/` folder handles business logic
- **Routes** — Map URLs to controllers

---

## Frontend Questions

### Q16. What is React and why use it?
**A:** React is a JavaScript library for building component-based UIs. We use it for reusable components (Sidebar, Modal, StatCard), state management (AuthContext), and efficient DOM updates via Virtual DOM.

### Q17. How does dark mode work?
**A:** Tailwind's `darkMode: 'class'` strategy toggles the `dark` class on `<html>`. Theme state is stored in localStorage via React Context.

### Q18. How is inventory value calculated?
**A:** `Inventory Value = SUM(price × quantity)` for all products. Computed in the `vw_inventory_summary` database view and displayed on the dashboard.

---

## Security Questions

### Q19. How do you prevent SQL Injection?
**A:** Mongoose validates and sanitizes queries. We use `findById`, `findOne` with filters instead of raw string concatenation, which prevents injection attacks.

### Q20. How are routes protected?
**A:** The `authenticate` middleware checks the JWT token on every protected API route. Invalid/missing tokens return HTTP 401.

---

## Practical Demo Flow

1. Login as admin
2. Show dashboard statistics and charts
3. Add a new product → show stock status auto-update
4. Reduce quantity below 10 → show Low Stock alert
5. Export products to CSV
6. Show categories and suppliers CRUD
7. Explain ER diagram and foreign key relationships
