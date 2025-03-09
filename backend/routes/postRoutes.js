const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
// const authenticateUser = require("../middleware/authenticateUser");

router.post(
  "/create-post",
  postController.uploadFile,
  postController.createPost
);
router.get("/", postController.getAllPosts);
router.post("/mark-read/:postid/:userid", postController.markAsRead);
router.post("/toggle-like/:postid", postController.likePost);
router.put("/modify-post/:id", postController.modifyPost);
router.delete("/delete-post/:id", postController.deletePost);

module.exports = router;
