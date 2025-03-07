const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");

router.post(
  "/create-post",
  postController.uploadFile,
  postController.createPost
);
router.get("/get-posts", postController.getAllPosts);

module.exports = router;
