// routes/atividadeRoutes.js

const express = require('express');
const router = express.Router();
const atividadeController = require('../controllers/atividadeController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, atividadeController.criarAtividade);
router.patch('/entregar/:alunoId/:atividadeId', atividadeController.entregarAtividade);

module.exports = router;