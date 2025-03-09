const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'chat_app',
});

db.connect((err) => {
  if (err) {
    console.error('SQL Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to SQL database !!');
});

module.exports = db;
