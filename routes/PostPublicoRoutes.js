// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const publicPosts = require('../controllers/publicPostController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, publicPosts.listarPosts);
router.post('/', authMiddleware, publicPosts.criarPost);
router.patch('/:postId/action/:action', authMiddleware, publicPosts.likePost);

module.exports = router;