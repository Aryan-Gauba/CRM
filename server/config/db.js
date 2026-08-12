// server/config/db.js
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = 
  process.env.DATABASE_URL || 
  process.env.DATABASE_POSTGRES_URL || 
  process.env.DATABASE_URL_UNPOOLED;

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.connect()
  .then(() => console.log('✅ Connected to PostgreSQL database'))
  .catch((err) => console.error('❌ Database connection error', err.stack));

module.exports = pool;