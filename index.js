const venom = require('venom-bot');
const { readSheetANP, listSheetLines, setSent } = require('./sheetsManager.js');

//Possiveis melhorias futuras:
// - Adicionar um comando para adicionar atividades na planilha
// - Adicionar um comando para remover atividades na planilha
// - Adicionar um comando para editar atividades na planilha
// - Adicionar um comando para adicionar amigos na lista de contatos
// - Adicionar um comando para remover amigos da lista de contatos
// - Adicionar um comando para editar amigos na lista de contatos
// - Integrar com o Google Calendar para adicionar atividades automaticamente
// - Integrar com MongoDB para armazenar as atividades e contatos
// - Transformar em API para facilitar o uso em outras aplicações


// Futura API:
// - Criar uma API RESTful para gerenciar atividades e contatos
// - Criar um frontend para gerenciar atividades e contatos
// - Criar um banco de dados para armazenar atividades e contatos
// - Criar um sistema de autenticação para gerenciar usuários
// - Criar um sistema de autorização para gerenciar permissões de usuários

// - Lideres de sala poderão cadastrar-se num site, adicionar numeros de amigos e cadastrar atividades
// - O bot irá enviar mensagens para os amigos cadastrados com as atividades cadastradas
// - Alunos poderão desativar o bot a qualquer momento
// - 

venom
  .create({
    session: 'bot' //name of session
  })
  .then((client) => start(client))
  .catch((erro) => {
    console.log(erro);
  });

const friendsNumbers = ['55 11 91696-6752', '55 11 97729-8428', '55 11 98039-0944']

function start(client) {
  //Check Time
  setInterval(()=>{
    const proxDueAttribuitions = [];

    readSheetANP().then(data=>{
      listSheetLines(data).then(lines=>{
        lines.forEach((line, i) => {
          const dueDateString = line.dueDate;
          const now = new Date();
          
          const dueDateParts = dueDateString.split(" ")[0].split("/");
          const dueDateTime = dueDateString.split(" ")[1].split(":");
          
          //Cria data de entrega
          const dueDate = new Date(
            now.getFullYear(),
            parseInt(dueDateParts[1]) - 1,
            parseInt(dueDateParts[0]),
            parseInt(dueDateTime[0]),
            parseInt(dueDateTime[1]),
            0
          );

          // Verifica se a data de entrega é válida
          if (isNaN(dueDate.getTime())) {
            console.error('Data de entrega inválida:', dueDateString);
            return;
          }
          // Verifica se a data de entrega está no passado
          if (dueDate < now) {
            console.log('Data de entrega já passou:', dueDateString);
            return;
          }
          // Verifica se a data de entrega está dentro do intervalo de 5 horas
        
          const toHours = (dueDate - now) / 1000 / 60 / 60

          console.log('Faltam', toHours, 'horas para a entrega de', line.subject, line.title);

          if(toHours > 0 && toHours <= 5){
            if(line.sent == "1"){
              console.log('Data de entrega já foi enviada:', dueDateString);
              return;
            }

            proxDueAttribuitions.push({
              subject: line.subject,
              title: line.title,
              attribuitionDate: line.attribuitionDate,
              dueDate: line.dueDate,
              description: line.description,
              sent: line.sent,
              index: i
            });
          }
        });
      })
    }).then(()=>{
      console.log(proxDueAttribuitions.length)

      if(proxDueAttribuitions.length < 1) return;

      console.log(proxDueAttribuitions)

      friendsNumbers.forEach(friendNumber=>{
        console.log(friendNumber)
        const number = friendNumber.replaceAll(" ","").replace("-", "") + "@c.us"
        let msg = "Eae mano! Essa é uma mensagem automática. Só passando pra lembrar que as seguintes atividades estão perto do prazo de entrega : \n\n"
        proxDueAttribuitions.forEach(attribuition=>{
          msg += attribuition.subject + " : " + attribuition.title + "\n"
        })
        msg += "\nSe precisar de qualquer ajuda, pode contar comigo! Abraço!"
        client.sendText(number, msg);
      })

      proxDueAttribuitions.forEach((attribuition)=>{
        const lineIndex = attribuition.index; // Supondo que você tenha o índice da linha
        setSent(lineIndex).then(() => {
          console.log(`Linha ${lineIndex + 2} atualizada para '1'`);
        }).catch((error) => {
          console.error('Erro ao atualizar a célula:', error);
        });
      })
    })
  }, 5000);

  client.onAnyMessage((message) => {
    if (message.body === '/atividades' && message.isGroupMsg === false) {
      readSheetANP().then(data=>{
        listSheetLines(data).then(lines=>{
            let response = 'Atividades:\n\n';
            lines.forEach((line, index) => {
                response += `${index + 1} : ${line.subject} > ${line.title}\n${line.attribuitionDate} - ${line.dueDate}\n${line.description}\n\n`;
            });
            client.sendText(message.from, response);
        })
      })
    }
  });
}

