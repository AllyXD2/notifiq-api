// controllers/atividadeController.js

const Atividade = require('../models/Atividade');
const Turma = require('../models/Turma');

// Criar atividade
exports.criarAtividade = async (req, res) => {
  try {
    const { titulo, descricao, dataEntrega, turmaId } = req.body;

    const turma = await Turma.findById(turmaId).populate('alunos');
    if (!turma) return res.status(404).json({ message: 'Turma não encontrada.' });

    // Verifica se o usuário é o líder da turma
    if (turma.liderId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Apenas o líder da turma pode criar atividades.' });
    }

    const dataSeparada = dataEntrega.split(" ")[0].split('/')
    const horarioSeparado = dataEntrega.split(" ")[1].split(":")
    const date = new Date(+dataSeparada[2], dataSeparada[1] - 1, +dataSeparada[0], +horarioSeparado[0], +horarioSeparado[1], 0, 0)

    const atividade = await Atividade.create({
      titulo,
      descricao,
      dataEntrega: date,
      turmaId,
      alunosPendentes: turma.alunos.map(a => a._id)
    });

    res.status(201).json({ atividade });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar atividade.', error: error.message });
  }
};

// Aluno entregar atividade
exports.entregarAtividade = async (req, res) => {
  try {
    const { alunoId, atividadeId } = req.params;

    const atividade = await Atividade.findById(atividadeId);
    if (!atividade) return res.status(404).json({ message: 'Atividade não encontrada.' });

    atividade.alunosPendentes = atividade.alunosPendentes.filter(id => id.toString() !== alunoId);
    atividade.alunosEntregues.push(alunoId);

    await atividade.save();

    res.json({ message: 'Atividade marcada como entregue.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao entregar atividade.', error: error.message });
  }
};
