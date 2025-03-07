const db = require("../config/db");
const multer = require("multer");
const path = require("path");

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Rename file with timestamp
  },
});
const upload = multer({ storage });

// Middleware to handle file upload
exports.uploadFile = upload.single("image");

// Save post to database
exports.createPost = (req, res) => {
  const { user_id, content } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  if (!user_id || (!content && !image_url)) {
    return res.status(400).json({ error: "Content or image is required" });
  }

  const sql =
    "INSERT INTO posts (user_id, content, image_url) VALUES (?, ?, ?)";
  db.query(sql, [user_id, content, image_url], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });

    res.status(201).json({ message: "Post created successfully" });
  });
};

exports.getAllPosts = (req, res) => {
  const sql = `
      SELECT posts.id, posts.content, posts.image_url, posts.created_at, users.username
      FROM posts
      JOIN users ON posts.user_id = users.id
      ORDER BY posts.created_at DESC
    `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });

    res.json(results);
  });
};
