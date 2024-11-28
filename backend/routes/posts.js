const express = require('express');
const multer = require('multer');
const Post = require('../models/Post');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, './uploads'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// Create Post
router.post('/', authMiddleware, upload.single('media'), async (req, res) => {
    const { content } = req.body;
    try {
        const post = new Post({
            user: req.user.id,
            content,
            media: req.file ? `/uploads/${req.file.filename}` : null,
        });
        await post.save();
        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get All Posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().populate('user', 'username').sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
