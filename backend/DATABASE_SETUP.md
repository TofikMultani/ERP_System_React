# PostgreSQL Database Setup Guide

## Prerequisites
- PostgreSQL installed and running
- PostgreSQL client tools available

## Step 1: Create Database

Open psql (PostgreSQL Command Line) and run:

```sql
-- Create the main database
CREATE DATABASE erp_system;

-- Connect to the database
\c erp_system

-- Create schema tables (add below as needed)
```

## Step 2: Create Tables

Run the following SQL to create the basic tables:

```sql
-- Users/Authentication Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL DEFAULT '',
  last_name VARCHAR(100) NOT NULL DEFAULT '',
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Employees Table
CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  department VARCHAR(100),
  position VARCHAR(100),
  hire_date DATE,
  salary DECIMAL(12,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  sku VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  unit_price DECIMAL(12,2),
  quantity_in_stock INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers Table
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id INTEGER REFERENCES customers(id),
  total_amount DECIMAL(12,2),
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoices Table
CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  order_id INTEGER REFERENCES orders(id),
  amount DECIMAL(12,2),
  invoice_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  due_date TIMESTAMP,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory/Stock Table
CREATE TABLE inventory (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  warehouse_location VARCHAR(255),
  quantity INTEGER,
  last_counted TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Support Tickets Table
CREATE TABLE support_tickets (
  id SERIAL PRIMARY KEY,
  ticket_number VARCHAR(50) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id),
  subject VARCHAR(255),
  description TEXT,
  priority VARCHAR(50) DEFAULT 'medium',
  status VARCHAR(50) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_invoices_order_id ON invoices(order_id);
CREATE INDEX idx_inventory_product_id ON inventory(product_id);
CREATE INDEX idx_tickets_user_id ON support_tickets(user_id);
```

## Step 3: Verify Connection

Test the connection from your backend:

```bash
npm run dev
```

Visit: `http://localhost:5000/api/db-test`

You should see a JSON response indicating successful database connection.

## Step 4: Environment Variables

Update your `.env` file with your PostgreSQL credentials:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=erp_system
DB_USER=postgres
DB_PASSWORD=your_password
```

### Role-based Seed Credentials

The backend now seeds accounts for all modules on startup (and refreshes them so credentials stay valid):

- Root Admin (`root-admin`): `rootadmin@erp.local` / `RootAdmin@123`
- Admin (`admin`): `admin@erp.local` / `Admin@123`
- HR (`hr`): `hr@erp.local` / `Hr@12345`
- Sales (`sales`): `sales@erp.local` / `Sales@123`
- Inventory (`inventory`): `inventory@erp.local` / `Inventory@123`
- Finance (`finance`): `finance@erp.local` / `Finance@123`
- Support (`support`): `support@erp.local` / `Support@123`
- IT (`it`): `it@erp.local` / `It@123456`

You can override these values with environment variables:

```
ROOT_ADMIN_EMAIL=rootadmin@erp.local
ROOT_ADMIN_PASSWORD=RootAdmin@123
ADMIN_EMAIL=admin@erp.local
ADMIN_PASSWORD=Admin@123
HR_EMAIL=hr@erp.local
HR_PASSWORD=Hr@12345
SALES_EMAIL=sales@erp.local
SALES_PASSWORD=Sales@123
INVENTORY_EMAIL=inventory@erp.local
INVENTORY_PASSWORD=Inventory@123
FINANCE_EMAIL=finance@erp.local
FINANCE_PASSWORD=Finance@123
SUPPORT_EMAIL=support@erp.local
SUPPORT_PASSWORD=Support@123
IT_EMAIL=it@erp.local
IT_PASSWORD=It@123456
```

## Backup & Restore

### Backup Database
```bash
pg_dump -U postgres -h localhost erp_system > erp_system_backup.sql
```

### Restore Database
```bash
psql -U postgres -h localhost erp_system < erp_system_backup.sql
```

## Common PostgreSQL Commands

```sql
-- List all databases
\l

-- Connect to a database
\c database_name

-- List all tables
\dt

-- Describe a table
\d table_name

-- List all users
\du

-- Drop a database
DROP DATABASE erp_system;
```

## Troubleshooting

### Connection Refused
- Ensure PostgreSQL service is running
- Check DB_HOST, DB_PORT in .env
- Verify credentials are correct

### Database Does Not Exist
- Run the database creation SQL from Step 1
- Verify the database name in .env

### Permission Denied
- Check user privileges: `GRANT ALL PRIVILEGES ON DATABASE erp_system TO postgres;`

## Next Steps

1. Implement CRUD operations for each module
2. Add migration system for version control
3. Set up data relationships and constraints
4. Implement caching strategies
5. Add monitoring and logging
