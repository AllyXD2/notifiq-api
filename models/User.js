// models/User.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  nome: { type: String, required: true },
  tipo: { type: String, enum: ['aluno-lider', 'aluno'], required: true },
  whatsapp: { type: String, required: true },
  email: { type: String }, // opcional
  senhaHash: { type: String, required: true },
  turmaId: { type: Schema.Types.ObjectId, ref: 'Turma' }, // só para alunos
  atividadesEntregues: [{ type: Schema.Types.ObjectId, ref: 'Atividade' }] // atividades já entregues
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);