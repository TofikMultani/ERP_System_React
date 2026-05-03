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
    
    // Drop NOT NULL constraints from unused fields in inventory_stock
    await client.query('ALTER TABLE inventory_stock ALTER COLUMN warehouse_name DROP NOT NULL');
    console.log('Dropped NOT NULL constraint on warehouse_name');
    
    try {
        await client.query('ALTER TABLE inventory_stock ALTER COLUMN on_hand DROP NOT NULL');
    } catch(e) {}
    
    try {
        await client.query('ALTER TABLE inventory_stock ALTER COLUMN reorder_level DROP NOT NULL');
    } catch(e) {}

    await client.query('COMMIT');
    console.log('Success altering inventory_stock constraints');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error', err);
  } finally {
    client.release();
    pool.end();
  }
}

run();
