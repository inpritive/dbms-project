-- ============================================================
-- Simple Inventory Management System - MySQL Schema
-- DBMS Mini Project
-- ============================================================

DROP DATABASE IF EXISTS inventory_db;
CREATE DATABASE inventory_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE inventory_db;

-- ------------------------------------------------------------
-- USERS TABLE (Admin authentication)
-- ------------------------------------------------------------
CREATE TABLE users (
    user_id       INT AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    email         VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(100) NOT NULL,
    role          ENUM('admin', 'manager') NOT NULL DEFAULT 'admin',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_email CHECK (email LIKE '%@%.%')
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- CATEGORIES TABLE
-- ------------------------------------------------------------
CREATE TABLE categories (
    category_id   INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description   TEXT,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- SUPPLIERS TABLE
-- ------------------------------------------------------------
CREATE TABLE suppliers (
    supplier_id   INT AUTO_INCREMENT PRIMARY KEY,
    supplier_name VARCHAR(150) NOT NULL,
    contact_email VARCHAR(100),
    contact_phone VARCHAR(20),
    address       TEXT,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_supplier_email UNIQUE (contact_email)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- PRODUCTS TABLE
-- ------------------------------------------------------------
CREATE TABLE products (
    product_id    INT AUTO_INCREMENT PRIMARY KEY,
    product_name  VARCHAR(200) NOT NULL,
    category_id   INT NOT NULL,
    supplier_id   INT NOT NULL,
    price         DECIMAL(12, 2) NOT NULL,
    quantity      INT NOT NULL DEFAULT 0,
    image_url     VARCHAR(500),
    stock_status  ENUM('In Stock', 'Low Stock', 'Out of Stock') NOT NULL DEFAULT 'In Stock',
    date_added    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_category
        FOREIGN KEY (category_id) REFERENCES categories(category_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_product_supplier
        FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_price_positive CHECK (price >= 0),
    CONSTRAINT chk_quantity_non_negative CHECK (quantity >= 0),
    INDEX idx_product_name (product_name),
    INDEX idx_stock_status (stock_status),
    INDEX idx_category (category_id),
    INDEX idx_supplier (supplier_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- ACTIVITY LOG TABLE (Recent activity feature)
-- ------------------------------------------------------------
CREATE TABLE activity_logs (
    log_id      INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT,
    action_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id   INT,
    description TEXT NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_activity_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- STORED PROCEDURE: Auto-update stock status
-- ------------------------------------------------------------
DELIMITER //
CREATE PROCEDURE update_stock_status(IN p_product_id INT)
BEGIN
    DECLARE qty INT;
    SELECT quantity INTO qty FROM products WHERE product_id = p_product_id;

    IF qty = 0 THEN
        UPDATE products SET stock_status = 'Out of Stock' WHERE product_id = p_product_id;
    ELSEIF qty <= 10 THEN
        UPDATE products SET stock_status = 'Low Stock' WHERE product_id = p_product_id;
    ELSE
        UPDATE products SET stock_status = 'In Stock' WHERE product_id = p_product_id;
    END IF;
END //
DELIMITER ;

-- ------------------------------------------------------------
-- TRIGGER: Auto-update stock status on quantity change
-- ------------------------------------------------------------
DELIMITER //
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
END //

CREATE TRIGGER trg_products_stock_status_insert
BEFORE INSERT ON products
FOR EACH ROW
BEGIN
    IF NEW.quantity = 0 THEN
        SET NEW.stock_status = 'Out of Stock';
    ELSEIF NEW.quantity <= 10 THEN
        SET NEW.stock_status = 'Low Stock';
    ELSE
        SET NEW.stock_status = 'In Stock';
    END IF;
END //
DELIMITER ;

-- ------------------------------------------------------------
-- VIEW: Inventory summary for dashboard
-- ------------------------------------------------------------
CREATE VIEW vw_inventory_summary AS
SELECT
    COUNT(*) AS total_products,
    COALESCE(SUM(quantity), 0) AS total_stock_quantity,
    COALESCE(SUM(price * quantity), 0) AS total_inventory_value,
    SUM(CASE WHEN stock_status = 'Low Stock' THEN 1 ELSE 0 END) AS low_stock_count,
    SUM(CASE WHEN stock_status = 'Out of Stock' THEN 1 ELSE 0 END) AS out_of_stock_count
FROM products;

-- ------------------------------------------------------------
-- VIEW: Product details with joins
-- ------------------------------------------------------------
CREATE VIEW vw_product_details AS
SELECT
    p.product_id,
    p.product_name,
    c.category_name,
    c.category_id,
    s.supplier_name,
    s.supplier_id,
    p.price,
    p.quantity,
    p.stock_status,
    p.image_url,
    p.date_added,
    (p.price * p.quantity) AS inventory_value
FROM products p
INNER JOIN categories c ON p.category_id = c.category_id
INNER JOIN suppliers s ON p.supplier_id = s.supplier_id;

-- ------------------------------------------------------------
-- SAMPLE DATA
-- ------------------------------------------------------------
-- Admin user is created by: cd backend && npm run seed
-- Default credentials: admin / admin123

INSERT INTO categories (category_name, description) VALUES
('Electronics', 'Electronic devices and accessories'),
('Office Supplies', 'Stationery and office equipment'),
('Furniture', 'Office and warehouse furniture'),
('Hardware', 'Tools and hardware items'),
('Software', 'Software licenses and subscriptions');

INSERT INTO suppliers (supplier_name, contact_email, contact_phone, address) VALUES
('TechSupply Co.', 'contact@techsupply.com', '+1-555-0101', '123 Tech Park, Silicon Valley, CA'),
('OfficeMart Ltd.', 'sales@officemart.com', '+1-555-0102', '456 Business Ave, New York, NY'),
('FurniWorld Inc.', 'info@furniworld.com', '+1-555-0103', '789 Furniture Blvd, Chicago, IL'),
('HardWare Plus', 'orders@hardwareplus.com', '+1-555-0104', '321 Industrial Rd, Houston, TX'),
('SoftLicense Hub', 'support@softlicense.com', '+1-555-0105', '654 Cloud Street, Seattle, WA');

INSERT INTO products (product_name, category_id, supplier_id, price, quantity, image_url) VALUES
('Wireless Mouse', 1, 1, 29.99, 150, NULL),
('Mechanical Keyboard', 1, 1, 89.99, 75, NULL),
('USB-C Hub', 1, 1, 45.00, 8, NULL),
('A4 Paper Ream', 2, 2, 5.99, 500, NULL),
('Ballpoint Pen Pack', 2, 2, 3.49, 0, NULL),
('Ergonomic Office Chair', 3, 3, 299.99, 25, NULL),
('Standing Desk', 3, 3, 449.99, 5, NULL),
('LED Monitor 27"', 1, 1, 349.99, 40, NULL),
('Screwdriver Set', 4, 4, 24.99, 120, NULL),
('Microsoft Office License', 5, 5, 149.99, 200, NULL),
('HDMI Cable 2m', 1, 1, 12.99, 3, NULL),
('Stapler Heavy Duty', 2, 2, 15.99, 60, NULL);

INSERT INTO activity_logs (action_type, entity_type, entity_id, description) VALUES
('CREATE', 'product', 1, 'Added product: Wireless Mouse'),
('CREATE', 'product', 2, 'Added product: Mechanical Keyboard'),
('UPDATE', 'product', 3, 'Updated stock for USB-C Hub - Low Stock alert'),
('CREATE', 'category', 1, 'Created category: Electronics'),
('LOGIN', 'system', NULL, 'System initialized with sample data');
