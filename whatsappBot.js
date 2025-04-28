const venom = require('venom-bot');
const Atividade = require('./models/Atividade'); // Assuming you have a model for Atividade
const Turma = require('./models/Turma'); // Assuming you have a model for Turma
const User = require('./models/User'); // Assuming you have a model for User
const cron = require('node-cron')

async function createClient(){
    const client = await venom.create({session: 'bot'})

    return client
}

function start(client) {
    setInterval(()=>{
        console.log("Client is running")
    }, 1000*5) 
    cron.schedule('0 12 * * *', ()=>{
        Atividade.find({}).then(atividades => {
            atividades.forEach(atividade => {
                const dueDate = new Date(atividade.dataEntrega);
                const now = new Date();
                const diff = dueDate - now;
                const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
                
                if (hoursLeft <= 48 && hoursLeft > 0) {
                    Turma.findById(atividade.turmaId).then(turma => {
                        if (turma) {
                            turma.alunos.forEach(alunoId => {
                                User.findById(alunoId).then(aluno => {
                                    if (aluno) {
                                        client.sendText(aluno.whatsapp+"@c.us", `Olá ${aluno.nome}, lembrete: a atividade "${atividade.titulo}" tem entrega em ${hoursLeft} horas.`);
                                    }
                                });
                            });
                        }
                    });
                }
            });
        });
    })
}

exports.start = start;
exports.createClient = createClient;