const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'erp_system',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'your_password'
});

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('Altering inventory_products...');
    await client.query(`
      ALTER TABLE inventory_products
      ADD COLUMN IF NOT EXISTS warehouse_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS reserved_qty INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS reorder_qty INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS last_counted_at TIMESTAMP
    `);

    console.log('Altering inventory_stock...');
    await client.query(`
      ALTER TABLE inventory_stock
      ADD COLUMN IF NOT EXISTS transaction_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 0
    `);

    await client.query('COMMIT');
    console.log('Success');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error', err);
  } finally {
    client.release();
    pool.end();
  }
}

run();
