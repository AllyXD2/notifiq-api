// server.js

require('dotenv').config(); // Variáveis de ambiente
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const {createClient, start} = require('./whatsappBot'); 

// Rotas
const authRoutes = require('./routes/authRoutes');
const turmaRoutes = require('./routes/turmaRoutes');
const atividadeRoutes = require('./routes/atividadeRoutes');

// Inicializando o app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conectando ao MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sistemaEstudantil';

// Usando as rotas
app.use('/api/auth', authRoutes);
app.use('/api/turmas', turmaRoutes);
app.use('/api/atividades', atividadeRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.send('Sistema de Lembretes Estudantis Online 📚');
});

// Configuração futura do WhatsApp Bot
// require('./whatsappBot')(app); // Deixa pronto para integrar depois

// Mongoose Connection
async function connectDB(){
  try{
    await mongoose.connect(process.env.MONGO_URI, {
      serverApi: {version: '1', strict: true, deprecationErrors: true},
      dbName: "estudant-whatsapp-reminder"
    })
    await mongoose.connection.db?.admin().command({ ping: 1 });

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  }catch(err){
    console.log("Error connecting with Mongo : " + err)
  }
}

// Inicializar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  connectDB();
  console.log("Conectado ao MongoDB com sucesso!")

  createClient().then(client => {
    console.log("WhatsApp Bot conectado com sucesso!")
    start(client)
  })
});