const venom = require('venom-bot');
const Atividade = require('./models/Atividade'); // Assuming you have a model for Atividade
const Turma = require('./models/Turma'); // Assuming you have a model for Turma
const User = require('./models/User'); // Assuming you have a model for User
const cron = require('node-cron')

async function createClient(){
    const client = await venom.create({session: '1746220891716'})

    return client
}

function seekAttribuitions(){
    Atividade.find({}).then(atividades => {
        atividades.forEach(atividade => {
            const dueDate = new Date(atividade.dataEntrega);
            const now = new Date();
            const diff = dueDate - now;
            const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
            
            if (hoursLeft <= 48 && hoursLeft > 0) {
                console.log(atividade)
            }
        })
    })
}

function start(client) {
    seekAttribuitions()

    setInverval(()=>{
        seekAttribuitions()
    }, 1000*60)

    cron.schedule('0 12 * * *', ()=>{
        seekAttribuitions()
    })
}

exports.createClient = createClient
exports.start = start;