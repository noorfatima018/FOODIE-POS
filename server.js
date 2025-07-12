const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root', 
  password: process.env.DB_PASSWORD || 'yourpassword',
  database: process.env.DB_NAME || 'youdbname',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });

};

// Routes
app.get('/api/menu', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Menu');
    // Transform the data to match the frontend expectations
    const menuItems = rows.map(item => ({
      id: item.item_id,
      name: item.item_name,
      description: item.description,
      price: item.price
    }));
    console.log(menuItems);
    res.json(menuItems);
  } catch (err) {
    next(err);
  }
});

app.post('/api/orders', async (req, res, next) => {
  const { customerName, tableNumber, items } = req.body;
  
  if (!customerName || !tableNumber || !items || !items.length) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // First, create or find customer
    // Since customer_id doesn't have a default value, we need to generate it
    const [existingCustomer] = await connection.query(
      'SELECT customer_id FROM Customers WHERE name = ?',
      [customerName]
    );
    
    let customerId;
    
    if (existingCustomer.length > 0) {
      // Customer exists, use their ID
      customerId = existingCustomer[0].customer_id;
    } else {
      // Create new customer with a generated ID
      // Find the maximum customer_id and increment by 1
      const [maxIdResult] = await connection.query('SELECT MAX(customer_id) as maxId FROM Customers');
      const maxId = maxIdResult[0].maxId || 0;
      customerId = maxId + 1;
      
      await connection.query(
        'INSERT INTO Customers (customer_id, name) VALUES (?, ?)',
        [customerId, customerName]
      );
    }

    // Create order
    const [orderResult] = await connection.query(
      'INSERT INTO Orders (customer_id, total_price, status) VALUES (?, ?, ?)',
      [customerId, 0, 'Pending']
    );
    
    const orderId = orderResult.insertId;
    let total = 0;

    // Add order items
    for (const item of items) {
      const [menuItem] = await connection.query(
        'SELECT price FROM Menu WHERE item_id = ?',
        [item.itemId]
      );

      if (!menuItem.length) {
        throw new Error(`Menu item ${item.itemId} not found`);
      }

      const price = parseFloat(menuItem[0].price);
      total += price * item.quantity;

      await connection.query(
        'INSERT INTO Order_Items (order_id, item_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.itemId, item.quantity, price]
      );
    }

    // Update order total
    await connection.query(
      'UPDATE Orders SET total_price = ? WHERE order_id = ?',
      [total, orderId]
    );

    await connection.commit();

    // Get the complete order details for the response
    const [orderDetails] = await connection.query(`
      SELECT o.order_id as id, o.order_date as created_at, o.total_price as total, o.status,
             c.name as customerName,
             GROUP_CONCAT(
               JSON_OBJECT(
                 'itemId', oi.item_id,
                 'name', m.item_name,
                 'quantity', oi.quantity,
                 'price', oi.price
               )
             ) as items
      FROM Orders o
      JOIN Customers c ON o.customer_id = c.customer_id
      LEFT JOIN Order_Items oi ON o.order_id = oi.order_id
      LEFT JOIN Menu m ON oi.item_id = m.item_id
      WHERE o.order_id = ?
      GROUP BY o.order_id
    `, [orderId]);

    // Format the response
    const formattedOrder = {
      ...orderDetails[0],
      items: orderDetails[0].items ? JSON.parse(`[${orderDetails[0].items}]`) : [],
      tableNumber: tableNumber // Include the table number in the response
    };

    res.json(formattedOrder);
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
});

app.get('/api/orders', async (req, res, next) => {
  try {
    const [orders] = await pool.query(`
      SELECT o.order_id as id, o.order_date as created_at, o.total_price as total, o.status,
             c.name as customerName,
             GROUP_CONCAT(
               JSON_OBJECT(
                 'itemId', oi.item_id,
                 'name', m.item_name,
                 'quantity', oi.quantity,
                 'price', oi.price
               )
             ) as items
      FROM Orders o
      JOIN Customers c ON o.customer_id = c.customer_id
      LEFT JOIN Order_Items oi ON o.order_id = oi.order_id
      LEFT JOIN Menu m ON oi.item_id = m.item_id
      GROUP BY o.order_id
      ORDER BY o.order_date DESC
      LIMIT 10
    `);

    // Parse the items JSON string for each order
    const formattedOrders = orders.map(order => ({
      ...order,
      items: order.items ? JSON.parse(`[${order.items}]`) : []
    }));

    res.json(formattedOrders);
  } catch (err) {
    next(err);
  }
});

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
