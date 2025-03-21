const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
router.use(express.json());

router.post(
  "/create-post",
  postController.uploadFile,
  postController.createPost
);
router.get("/:userid", postController.getAllPosts);
router.post("/mark-read/:postid/:userid", postController.markAsRead);
router.post("/toggle-like/:postid", postController.toggleLike);
router.put("/modify-post/:postid/:userid", postController.modifyPost);
router.delete("/delete-post/:postid/:userid", postController.deletePost);

module.exports = router;
