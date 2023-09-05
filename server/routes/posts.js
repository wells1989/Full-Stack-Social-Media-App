import express from "express";
import { getFeedPosts, getUserPosts, likePost } from "../controllers/posts.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// home route http://localhost:3001/posts/

router.get("/", verifyToken, getFeedPosts);

router.get("/:userId/posts", verifyToken, getUserPosts);

router.patch("/:id/like", verifyToken, likePost);

export default router;