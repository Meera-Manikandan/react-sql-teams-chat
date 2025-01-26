const db = require("../config/db");
const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.signup = (req, res) => {
  const { username, email, password } = req.body;

  // Check if user already exists
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });

    if (results.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password and create a new user
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) return res.status(500).json({ error: "Error hashing password" });

      userModel.createUser(username, email, hashedPassword, (err, userId) => {
        if (err) return res.status(500).json({ error: err.sqlMessage });

        res.status(201).json({
          message: "User created successfully",
          token: jwt.sign({ id: userId, email }, process.env.JWT_SECRET, {
            expiresIn: "1h",
          }),
          user: { id: userId, username, email },
        });
      });
    });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });

      if (results.length === 0) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      const user = results[0];

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    }
  );
};
