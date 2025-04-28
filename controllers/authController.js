// controllers/authController.js

const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'meusegredoseguro'; // Melhor usar env

// Cadastro
exports.register = async (req, res) => {
  try {
    const { nome, email, senha, whatsapp, tipo } = req.body;

    if (!nome || !email || !senha || !whatsapp || !tipo) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    if(senha.length < 6) {
      return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres.' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const newUser = await User.create({ nome, email, senhaHash, whatsapp, tipo });

    const token = jwt.sign({ id: newUser._id, tipo: newUser.tipo }, SECRET, { expiresIn: '7d' });

    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao cadastrar.', error: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

    const valid = await bcrypt.compare(senha, user.senhaHash);
    if (!valid) return res.status(401).json({ message: 'Senha incorreta.' });

    const token = jwt.sign({ id: user._id, tipo: user.tipo }, SECRET, { expiresIn: '7d' });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao logar.', error: error.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-senhaHash');
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuário.', error: error.message });
  }
}