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
    
    // Add items_json column to sales_quotations
    await client.query('ALTER TABLE sales_quotations ADD COLUMN IF NOT EXISTS items_json JSONB DEFAULT \'[]\'::jsonb');
    console.log('Added items_json to sales_quotations');

    await client.query('COMMIT');
    console.log('Success altering database schema');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error', err);
  } finally {
    client.release();
    pool.end();
  }
}

run();
