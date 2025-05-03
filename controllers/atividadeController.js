// controllers/atividadeController.js

const Atividade = require('../models/Atividade');
const Turma = require('../models/Turma');

// Criar atividade
exports.criarAtividade = async (req, res) => {
  try {
    const { titulo, descricao, dataEntrega, turmaId } = req.body;

    console.log(dataEntrega)

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
      alunosPendentes: [turma.liderId, ...turma.alunos.map(a => a._id)]
    });

    res.status(201).json( atividade );
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar atividade.', error: error.message });
  }
};

// Aluno entregar atividade
exports.entregarAtividade = async (req, res) => {
  try {
    const alunoId = req.user.id
    const { atividadeId } = req.params;

    const atividade = await Atividade.findById(atividadeId);
    if (!atividade) return res.status(404).json({ message: 'Atividade não encontrada.' });

    atividade.alunosPendentes = atividade.alunosPendentes.filter(id => id.toString() !== alunoId);
    atividade.alunosEntregues.push(alunoId);

    await atividade.save();

    res.json({ message: 'Atividade marcada como entregue.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao entregar atividade.' + error.message });
  }
};

exports.pegarAtividades = async (req, res) => {
  try {
    const userId = req.user.id
    const turmaId = req.params.turmaId

    if(!turmaId) return res.status(404).json({ message: 'Id da turma necessário.' });

    const turma = await Turma.findById(turmaId)
    const temUsuario = turma.liderId == userId || turma.alunos.includes(userId)

    if(!temUsuario) return res.status(400).json({ message: 'Você não participa dessa turma. Entre com o código de convite.' }); 

    const atividades = await Atividade.find({turmaId}).populate("alunosEntregues", "nome permissions tipo profilePicUrl").populate("alunosPendentes", "nome permissions tipo profilePicUrl");
    if (!atividades) return res.status(404).json({ message: 'Atividade não encontrada.' });

    res.json(atividades);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao pegar atividades.', error: error.message });
  }
};

exports.pegarAtividade = async (req, res) => {
  try {
    const userId = req.user.id
    const turmaId = req.params.turmaId
    const atividadeId = req.params.atividadeId

    if(!turmaId) return res.status(404).json({ message: 'Id da turma necessário.' });
    if(!atividadeId) return res.status(404).json({ message: 'Id da atividade necessário.' });

    const turma = await Turma.findById(turmaId)
    const temUsuario = turma.liderId == userId || turma.alunos.includes(userId)

    if(!temUsuario) return res.status(400).json({ message: 'Você não participa dessa turma. Entre com o código de convite.' }); 

    const atividade = await Atividade.findOne({turmaId, _id: atividadeId}).populate("alunosEntregues", "nome permissions tipo profilePicUrl").populate("alunosPendentes", "nome permissions tipo profilePicUrl");
    if (!atividade) return res.status(404).json({ message: 'Atividade não encontrada.' });

    res.json(atividade);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao pegar atividade.', error: error.message });
  }
};

exports.atualizarAtividade = async (req, res) => {
  try {
    const userId = req.user.id
    const turmaId = req.params.turmaId
    const atividadeId = req.params.atividadeId

    const { titulo, descricao, dataEntrega } = req.body

    if(!turmaId) return res.status(404).json({ message: 'Id da turma necessário.' });
    if(!atividadeId) return res.status(404).json({ message: 'Id da atividade necessário.' });
    if(!titulo || !descricao ) return res.status(400).json({ message: 'Detalhes da atualização não podem estar vazias.' });

    const turma = await Turma.findById(turmaId)
    const lider = turma.liderId == userId

    if(!lider) return res.status(400).json({ message: 'Apenas o lider da turma pode fazer alterações em atividades.' }); 

    const atividade = await Atividade.findOne({turmaId, _id: atividadeId});
    if (!atividade) return res.status(404).json({ message: 'Atividade não encontrada.' });

    atividade.titulo = titulo
    atividade.descricao = descricao
    if(dataEntrega) atividade.dataEntrega = dataEntrega

    atividade.save()

    res.json(atividade);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar atividade.', error: error.message });
  }
};

exports.deletarAtividade = async (req, res) => {
  try {
    const userId = req.user.id
    const turmaId = req.params.turmaId
    const atividadeId = req.params.atividadeId

    if(!turmaId) return res.status(404).json({ message: 'Id da turma necessário.' });
    if(!atividadeId) return res.status(404).json({ message: 'Id da atividade necessário.' });

    const turma = await Turma.findById(turmaId)
    const lider = turma.liderId == userId

    if(!lider) return res.status(400).json({ message: 'Apenas o lider da turma pode deletar atividades.' }); 

    const atividade = await Atividade.findOne({turmaId, _id: atividadeId});
    if (!atividade) return res.status(404).json({ message: 'Atividade não encontrada.' });

    await Atividade.deleteOne({_id: atividadeId})

    res.json({message: "Atividade deletada."});
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar atividade.', error: error.message });
  }
};