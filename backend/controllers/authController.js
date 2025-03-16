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

exports.deleteUser = (req, res) => {
  const userId = req.body.id;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ error: "Transaction error" });

    //  Delete related data first
    db.query(
      "DELETE FROM read_posts WHERE post_id IN (SELECT id FROM posts WHERE user_id = ?)",
      [userId],
      (err) => {
        if (err)
          return db.rollback(() =>
            res.status(500).json({ error: "Failed to delete user read posts" })
          );

        db.query("DELETE FROM posts WHERE user_id = ?", [userId], (err) => {
          if (err)
            return db.rollback(() =>
              res.status(500).json({ error: "Failed to delete user posts" })
            );

          // Delete the user
          db.query(
            "DELETE FROM users WHERE id = ?",
            [userId],
            (err, result) => {
              if (err)
                return db.rollback(() =>
                  res.status(500).json({ error: "Database error" })
                );
              if (result.affectedRows === 0)
                return db.rollback(() =>
                  res.status(404).json({ message: "User not found" })
                );

              db.commit((err) => {
                if (err) return res.status(500).json({ error: "Commit error" });
                res.status(200).json({ message: "User deleted successfully" });
              });
            }
          );
        });
      }
    );
  });
};
