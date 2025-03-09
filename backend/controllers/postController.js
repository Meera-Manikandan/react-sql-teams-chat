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

// Mark a post as read
exports.markAsRead = (req, res) => {
  const post_id = req.params.postid;
  const user_id = req.params.userid;

  const sql =
    "INSERT INTO read_posts (user_id, post_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE post_id = post_id";
  db.query(sql, [user_id, post_id], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });

    res.json({ message: "Post marked as read" });
  });
};

// Fetch all posts but exclude those marked as read by the user
exports.getAllPosts = (req, res) => {
  const userId = req.query.user_id; // Pass user_id in query params

  const sqlBackup = `
    SELECT posts.id, posts.user_id, posts.content, posts.image_url, posts.created_at, users.username
    FROM posts
    JOIN users ON posts.user_id = users.id
    LEFT JOIN read_posts ON posts.id = read_posts.post_id AND read_posts.user_id = ?
    WHERE read_posts.id IS NULL
    ORDER BY posts.created_at DESC
  `;

  const sql = `
  SELECT posts.id, posts.user_id, posts.content, posts.image_url, posts.created_at, users.username,
    IF(read_posts.id IS NOT NULL, 1, 0) AS read_status
  FROM posts
  JOIN users ON posts.user_id = users.id
  LEFT JOIN read_posts ON posts.id = read_posts.post_id AND read_posts.user_id = ?
  ORDER BY posts.created_at DESC
`;

  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });

    res.json(results);
  });
};

// Like a post
exports.likePost = (req, res) => {
  const { user_id, post_id } = req.body;

  const sql = `
    INSERT INTO likes (user_id, post_id) VALUES (?, ?) 
    ON DUPLICATE KEY UPDATE post_id = post_id
  `;

  db.query(sql, [user_id, post_id], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });

    res.json({ message: "Post liked successfully" });
  });
};

// Modify a post
exports.modifyPost = (req, res) => {
  const { content } = req.body;

  const postId = req.params.postid;
  const userId = req.params.userid;

  db.query(
    "SELECT user_id FROM posts WHERE id = ?",
    [postId],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });

      if (results.length === 0)
        return res.status(404).json({ message: "Post not found" });

      if (parseInt(results[0].user_id) !== parseInt(userId)) {
        return res.status(403).json({ message: "Unauthorized action" });
      }

      db.query(
        "UPDATE posts SET content = ? WHERE id = ?",
        [content, postId],
        (err, result) => {
          if (err) return res.status(500).json({ error: "Database error" });

          res.json({ message: "Post updated successfully" });
        }
      );
    }
  );
};

// Delete a post (Only the author can delete)
exports.deletePost = (req, res) => {
  const postId = req.params.postid;
  const userId = req.params.userid;

  db.query(
    "SELECT user_id FROM posts WHERE id = ?",
    [postId],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });

      if (results.length === 0)
        return res.status(404).json({ message: "Post not found" });

      //if (results[0].user_id !== userId) {
      if (parseInt(results[0].user_id) !== parseInt(userId)) {
        return res.status(403).json({ message: "Unauthorized action" });
      }

      db.query(
        "DELETE FROM read_posts WHERE post_id = ?",
        [postId],
        (err, result) => {
          if (err) return res.status(500).json({ error: "Database error" });

          db.query(
            "DELETE FROM posts WHERE id = ?",
            [postId],
            (err, result) => {
              if (err) return res.status(500).json({ error: "Database error" });

              res.json({ message: "Post deleted successfully" });
            }
          );
        }
      );
    }
  );
};
