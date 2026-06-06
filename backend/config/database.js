const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Helper to get SSL config
const getSslConfig = () => {
  // Option 1: Base64 encoded cert (best for Render/Railway env vars)
  if (process.env.DB_CA_CERT_B64) {
    return {
      ca: Buffer.from(process.env.DB_CA_CERT_B64, 'base64').toString('utf-8'),
      rejectUnauthorized: true
    };
  }
  // Option 2: File path to cert
  if (process.env.DB_CA_CERT) {
    return {
      ca: fs.readFileSync(path.resolve(process.env.DB_CA_CERT)),
      rejectUnauthorized: true
    };
  }
  // Option 3: Production without cert (less secure, but works)
  if (process.env.NODE_ENV === 'production') {
    return { rejectUnauthorized: false };
  }
  // Development: no SSL
  return false;
};

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '5546',
  database: process.env.DB_NAME || 'sales_production',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  ssl: getSslConfig()
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    return false;
  }
};

// Query helper function
const query = async (sql, params) => {
  try {
    // Debug: Count placeholders and params
    const placeholderCount = (sql.match(/\?/g) || []).length;
    const paramCount = params ? params.length : 0;
    
    if (placeholderCount !== paramCount) {
      console.error(`SQL MISMATCH: ${placeholderCount} placeholders but ${paramCount} params`);
      console.error('SQL:', sql.substring(0, 200));
      console.error('Params:', params);
    }
    
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Query error:', error.message);
    console.error('SQL:', sql.substring(0, 200));
    console.error('Params:', params);
    throw error;
  }
};

// Transaction helper
const transaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  pool,
  query,
  transaction,
  testConnection
};
