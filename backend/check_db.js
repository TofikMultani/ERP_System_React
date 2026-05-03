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
    const res = await client.query('SELECT quotation_number, items_json FROM sales_quotations ORDER BY created_at DESC LIMIT 5;');
    console.log(JSON.stringify(res.rows, null, 2));
  } finally {
    client.release();
    pool.end();
  }
}
run();
