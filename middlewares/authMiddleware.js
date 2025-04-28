// middlewares/authMiddleware.js

const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'meusegredoseguro';

module.exports = (req, res, next) => {
  const token = req.headers['authorization'];
  
  if (!token) return res.status(401).json({ message: 'Token não fornecido.' });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido.' });
  }
};