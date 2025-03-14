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

  const sql = `
    INSERT IGNORE INTO read_posts (user_id, post_id) VALUES (?, ?)
  `;
  db.query(sql, [user_id, post_id], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });

    res.json({ message: "Post marked as read" });
  });
};

// Fetch all posts but exclude those marked as read by the user
exports.getAllPosts = (req, res) => {
  const userId = req.params.userid; // Pass user_id in query param

  const sql = `
  SELECT posts.id, posts.user_id, posts.content, posts.image_url, posts.created_at, users.username,
    IF(read_posts.id IS NOT NULL, 1, 0) AS read_status,
    IF(likes.user_id IS NOT NULL, 1, 0) AS liked
  FROM posts
  JOIN users ON posts.user_id = users.id
  LEFT JOIN read_posts ON posts.id = read_posts.post_id AND read_posts.user_id = ?
  LEFT JOIN likes ON posts.id = likes.post_id AND likes.user_id = ?
  ORDER BY posts.created_at DESC
`;

  db.query(sql, [userId, userId], (err, results) => {
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

// Toggle Like API
exports.toggleLike = (req, res) => {
  const post_id = req.params.postid;
  const user_id = req.body.user_id;

  if (!post_id || !user_id) {
    return res.status(400).json({ error: "Post ID and User ID are required" });
  }

  // Check if the user has already liked the post
  const checkLikeSQL = "SELECT * FROM likes WHERE user_id = ? AND post_id = ?";
  db.query(checkLikeSQL, [user_id, post_id], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });

    if (results.length > 0) {
      // If already liked, remove the like (unlike)
      const deleteLikeSQL =
        "DELETE FROM likes WHERE user_id = ? AND post_id = ?";
      db.query(deleteLikeSQL, [user_id, post_id], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json({ message: "Like removed", liked: false });
      });
    } else {
      // If not liked, add the like
      const insertLikeSQL =
        "INSERT INTO likes (user_id, post_id) VALUES (?, ?)";
      db.query(insertLikeSQL, [user_id, post_id], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json({ message: "Post liked", liked: true });
      });
    }
  });
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
