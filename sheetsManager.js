const { google } = require('googleapis');
const sheets = google.sheets('v4');

// Configuração da autenticação
const auth = new google.auth.GoogleAuth({
  keyFile: './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const spreadsheetIdANP = '1yF70c3v_XuaUE94YbG6KgCjT51VK18c2sFuBD8N1ZLA';

async function readSheetANP() {
  const authClient = await auth.getClient();
    const res = await sheets.spreadsheets.values.get({
      auth: authClient,
      spreadsheetId: spreadsheetIdANP,
      range: 'A2:F100', // Altere conforme a estrutura da sua planilha
    });
    return res.data.values; // Retorna os valores lidos da planilha
}

async function listSheetLines(data){
    const lines = data.map((row) => {
        return {
            attribuitionDate: row[0],
            dueDate: row[1],
            subject: row[2],
            title: row[3],
            description: row[4],
            sent: row[5] == "0" ? false : row[5] == "1" ? true : false
        };
    });
    return lines;
}

// Troca valor da célula F de uma linha para 1
async function setSent(lineIndex) {
    const authClient = await auth.getClient();
    const request = {
        spreadsheetId: spreadsheetIdANP,
        range: `F${lineIndex + 2}`, // Adiciona 2 para ignorar o cabeçalho
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [['1']], // Define o valor a ser atualizado
        },
        auth: authClient,
    };
    await sheets.spreadsheets.values.update(request);
}

exports.setSent = setSent;
exports.readSheetANP = readSheetANP;
exports.listSheetLines = listSheetLines;
