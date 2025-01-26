const db = require("../config/db");

const createUserOld = (username, email, hashedPassword, callback) => {
  const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
  db.query(sql, [username, email, hashedPassword], callback);
};

const createUser = (username, email, hashedPassword, callback) => {
  const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
  db.query(sql, [username, email, hashedPassword], (err, result) => {
    if (err) {
      return callback(err, null);
    }
    // Return the inserted user's ID
    callback(null, result.insertId);
  });
};

const findUserByEmail = (email, callback) => {
  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], callback);
};

module.exports = { createUser, findUserByEmail };
