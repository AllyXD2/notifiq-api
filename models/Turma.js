// models/Turma.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const turmaSchema = new Schema({
  nome: { type: String, required: true },
  liderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  codigoConvite: { type: String, required: true, unique: true },
  alunos: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Turma', turmaSchema);
