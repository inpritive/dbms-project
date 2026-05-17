# ER Diagram Explanation

## Entity-Relationship Overview

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│   USERS     │       │ ACTIVITY_LOGS│       │  CATEGORIES │
│─────────────│       │──────────────│       │─────────────│
│ PK user_id  │◄──────│ FK user_id   │       │ PK category │
│ username    │       │ action_type  │       │ name        │
│ email       │       │ description  │       │ description │
│ password    │       │ created_at   │       └──────┬──────┘
└─────────────┘       └──────────────┘              │
                                                    │ 1
                                                    │
                                                    │ N
┌─────────────┐                              ┌──────▼──────┐
│  SUPPLIERS  │                              │  PRODUCTS   │
│─────────────│                              │─────────────│
│ PK supplier │◄─────────────────────────────│ FK category │
│ name        │         N                  1 │ FK supplier │
│ email       │                              │ price       │
│ phone       │                              │ quantity    │
│ address     │                              │ stock_status│
└─────────────┘                              └─────────────┘
```

## Relationships

| Relationship | Type | Description |
|-------------|------|-------------|
| categories → products | **1:N** | One category has many products |
| suppliers → products | **1:N** | One supplier supplies many products |
| users → activity_logs | **1:N** | One user generates many log entries |

## Cardinality Rules

- A **product** must belong to exactly **one category** and **one supplier**
- A **category** cannot be deleted if products reference it (`ON DELETE RESTRICT`)
- A **supplier** cannot be deleted if products reference it (`ON DELETE RESTRICT`)
- Deleting a **user** sets `activity_logs.user_id` to NULL (`ON DELETE SET NULL`)

## Key SQL Queries Used

### 1. Dashboard Summary (View)

```sql
CREATE VIEW vw_inventory_summary AS
SELECT
    COUNT(*) AS total_products,
    COALESCE(SUM(quantity), 0) AS total_stock_quantity,
    COALESCE(SUM(price * quantity), 0) AS total_inventory_value,
    SUM(CASE WHEN stock_status = 'Low Stock' THEN 1 ELSE 0 END) AS low_stock_count
FROM products;
```

### 2. Product Details with JOINs

```sql
SELECT p.*, c.category_name, s.supplier_name,
       (p.price * p.quantity) AS inventory_value
FROM products p
INNER JOIN categories c ON p.category_id = c.category_id
INNER JOIN suppliers s ON p.supplier_id = s.supplier_id;
```

### 3. Category Distribution (GROUP BY)

```sql
SELECT c.category_name, COUNT(p.product_id) AS value
FROM categories c
LEFT JOIN products p ON c.category_id = p.category_id
GROUP BY c.category_id;
```

### 4. Low Stock Alert Query

```sql
SELECT product_id, product_name, quantity, stock_status
FROM products
WHERE stock_status IN ('Low Stock', 'Out of Stock')
ORDER BY quantity ASC;
```

### 5. Trigger — Auto Stock Status

```sql
CREATE TRIGGER trg_products_stock_status
BEFORE UPDATE ON products
FOR EACH ROW
BEGIN
    IF NEW.quantity = 0 THEN
        SET NEW.stock_status = 'Out of Stock';
    ELSEIF NEW.quantity <= 10 THEN
        SET NEW.stock_status = 'Low Stock';
    ELSE
        SET NEW.stock_status = 'In Stock';
    END IF;
END;
```

## Normalization

| Form | Applied |
|------|---------|
| **1NF** | All columns contain atomic values |
| **2NF** | No partial dependencies (all non-key attrs depend on full PK) |
| **3NF** | No transitive dependencies; category/supplier data in separate tables |

## Indexes

- `idx_product_name` — Fast product search
- `idx_stock_status` — Filter low stock items
- `idx_category`, `idx_supplier` — JOIN optimization
