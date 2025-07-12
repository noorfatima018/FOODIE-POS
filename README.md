# 🍽️ Foodie POS

**Foodie POS** is a simple yet powerful restaurant Point of Sale system built with Node.js, MySQL, and a modern frontend. It allows restaurants to manage menus, take orders, and track customer data efficiently.

---

## 🚀 Features

- 🧾 Dynamic menu display with carousel
- 🧑‍🍳 Place orders with quantity selection
- 📜 View recent orders with status indicators
- 🔄 Frontend and backend connected with API integration
- 🌐 Clean and responsive UI

---

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MySQL

---

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL Server (v8 or higher)
- npm (Node Package Manager)

---

## 🚀 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd foodie-pos
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following content:
```
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
PORT=3000
```

4. Make sure your MySQL database is set up with the following tables:
   - `Customers` - For storing customer information
   - `Menu` - For storing menu items
   - `Orders` - For storing order information
   - `Order_Items` - For storing order items

---

## 🏃‍♂️ Running the Application

1. Start the server:
```bash
npm start
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

---

## 📁 Project Structure

```
foodie-pos/
├── public/
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   └── foodbanner.avif
├── server.js
├── package.json
└── .env
```

---

## 🔌 API Endpoints

- `GET /api/menu` - Fetch all menu items
- `GET /api/menu/popular` - Fetch all menu items (since there's no popular flag in the schema)
- `GET /api/customers/:id` - Get customer details by ID
- `GET /api/orders` - Get recent orders
- `POST /api/orders` - Submit a new order

---

## 📝 License

This project is licensed under the MIT License.