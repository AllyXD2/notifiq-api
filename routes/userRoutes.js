const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/:userId', authMiddleware, userController.getUser);
router.patch('/give-perm', authMiddleware, userController.setPerm);

module.exports = router;