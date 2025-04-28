// models/Atividade.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const atividadeSchema = new Schema({
  titulo: { type: String, required: true },
  descricao: { type: String, required: true },
  dataEntrega: { type: Date, required: true },
  turmaId: { type: Schema.Types.ObjectId, ref: 'Turma', required: true },
  alunosPendentes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  alunosEntregues: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Atividade', atividadeSchema);