// models/Atividade.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PublicPost = new Schema({
  titulo: { type: String, required: true },
  conteudo: { type: String, required: true },
  likes: [{ type: Schema.Types.ObjectId, ref: "User",  required: true }],
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

module.exports = mongoose.model('PostsPublicos', PublicPost);