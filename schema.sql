CREATE DATABASE IF NOT EXISTS foodie_pos;
USE foodie_pos;

CREATE TABLE IF NOT EXISTS menu_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50),
    image_url VARCHAR(255),
    is_popular BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_name VARCHAR(100) NOT NULL,
    table_number INT NOT NULL,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    status ENUM('pending', 'preparing', 'ready', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (item_id) REFERENCES menu_items(id)
);

-- Insert some sample menu items
INSERT INTO menu_items (name, description, price, category, is_popular) VALUES
('Pizza Margherita', 'Classic Margherita pizza with fresh basil', 8.99, 'Pizza', true),
('Spaghetti Carbonara', 'Traditional Italian pasta with egg and bacon', 12.99, 'Pasta', true),
('Caesar Salad', 'Crisp romaine lettuce with Caesar dressing', 6.49, 'Salad', false),
('Penne Arrabbiata', 'Spicy penne pasta with a tomato-based sauce', 10.99, 'Pasta', false),
('Cappuccino', 'The perfect balance of coffee and cream', 5.49, 'Beverages', true);

INSERT INTO menu_items (name, description, price) VALUES
('Margherita Pizza', 'Classic tomato sauce, mozzarella, and basil', 12.99),
('Chicken Caesar Salad', 'Romaine lettuce, grilled chicken, parmesan, croutons', 9.99),
('Spaghetti Carbonara', 'Pasta with eggs, cheese, pancetta, and black pepper', 11.99),
('Chocolate Brownie', 'Warm chocolate brownie with vanilla ice cream', 6.99),
('Iced Tea', 'Fresh brewed black tea with lemon', 2.99); 