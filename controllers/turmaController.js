// controllers/turmaController.js

const Turma = require('../models/Turma');
const User = require('../models/User');
const { customAlphabet } = require('nanoid');

const generateCodigo = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

// Criar turma
exports.criarTurma = async (req, res) => {
  try {
    const { nome } = req.body;
    const liderId = req.user.id; // Pegamos do token (middleware)

    const codigoConvite = generateCodigo();

    //Verificar se turma com mesmo código já existe
    while (await Turma.findOne({ codigoConvite })) {
      codigoConvite = generateCodigo();
    }

    const novaTurma = await Turma.create({ nome, liderId, codigoConvite });

    res.status(201).json({ turma: novaTurma });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar turma.', error: error.message });
  }
};

// Aluno se cadastrar na turma
exports.entrarTurma = async (req, res) => {
  try {
    const { codigoConvite } = req.body;
    const alunoId = req.user.id; // Pegamos do token (middleware)
    const aluno = await User.findById(alunoId);
    if (!aluno) return res.status(404).json({ message: 'Aluno não encontrado.' });

    const turma = await Turma.findOne({ codigoConvite });
    if (!turma) return res.status(404).json({ message: 'Turma não encontrada.' });

    const isAlreadyInTurma = turma.alunos.includes(alunoId);
    if (isAlreadyInTurma) return res.status(400).json({ message: 'Você já está nessa turma.' });

    turma.alunos.push(aluno._id);
    await turma.save();

    res.status(201).json({ aluno });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao entrar na turma.', error: error.message });
  }
};

// Listar turmas do aluno
exports.listarTurmas = async (req, res) => {
  try {
    const alunoId = req.user.id; // Pegamos do token (middleware)

    const aluno = await User.findOne({_id: alunoId});
    if(!aluno) return res.status(404).json({ message: 'Erro ao listar turmas : Aluno não encontrado'})

    let turma 
    
    if(aluno.tipo == "aluno"){
      turma = await Turma.find({ alunos: alunoId }).populate('alunos', 'nome whatsapp').populate('liderId', 'nome whatsapp');
    } else if(aluno.tipo == "aluno-lider"){
      turma = await Turma.find({ liderId: alunoId }).populate('alunos', 'nome whatsapp').populate('liderId', 'nome whatsapp');
    }

    if (!turma) return res.status(404).json({ message: 'Nenhuma turma encontrada.' });

    res.status(200).json({ turmas: turma });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar turmas.', error: error.message });
  }
};