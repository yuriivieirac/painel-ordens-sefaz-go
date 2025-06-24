const { app, BrowserWindow, ipcMain } = require('electron');
const { Client, LocalAuth } = require('whatsapp-web.js');
const QRCode = require('qrcode');
const path = require('path');

let mainWindow;
let ordens = [];

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 480,
    fullscreen: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('painel.html');
  mainWindow.removeMenu();
}

app.whenReady().then(() => {
  createWindow();

  const client = new Client({
    authStrategy: new LocalAuth(),
  });

  client.on('qr', (qr) => {
    console.log('QR RECEIVED - escaneie com o WhatsApp administrador:');
    QRCode.toDataURL(qr).then(url => {
      mainWindow.webContents.send('qr-code', url);
    });
  });

  client.on('ready', () => {
    console.log('✅ WhatsApp conectado!');
    mainWindow.webContents.send('ready');
  });

  client.on('message', async (message) => {
    if (message.from.includes('@g.us')) {
      const texto = message.body.trim();
      const msgId = message.id._serialized;

      try {
        const chat = await message.getChat();
        const remetenteId = message.author || message.from; // Quem enviou a mensagem
        const participante = chat.participants.find(p => p.id._serialized === remetenteId);

        if (!participante || !participante.isAdmin) {
          console.log('❌ Mensagem ignorada: Remetente não é admin.');
          return;  // Ignora todas as mensagens de não administradores
        }

        // ===== COMANDO DE CANCELAMENTO =====
        const cancelarRegex = /^Cancelar\s+([A-Z]{2}\d{6,7})$/i;
        const cancelarMatch = texto.match(cancelarRegex);

        if (cancelarMatch) {
          const codigoCancelar = cancelarMatch[1].toUpperCase();

          const tamanhoAntes = ordens.length;
          ordens = ordens.filter(ordem => ordem.codigo !== codigoCancelar);

          if (ordens.length < tamanhoAntes) {
            console.log(`✅ Ordem ${codigoCancelar} cancelada pelo admin.`);
            mainWindow.webContents.send('nova-ordem', ordens);
          } else {
            console.log(`⚠️ Código ${codigoCancelar} não encontrado no painel.`);
          }

          return; // Depois de cancelar, não processa mais nada
        }

        // ===== PROCESSAMENTO NORMAL DAS ORDENS =====
        const linhas = texto.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        if (linhas.length >= 2) {
          const nome = linhas[0];
          const codigos = linhas.slice(1);

          codigos.forEach(codigoRaw => {
            const codigo = codigoRaw.toUpperCase();
            const codigoRegex = /^[A-Z]{2}\d{6,7}$/;

            if (codigoRegex.test(codigo)) {
              const dataHora = new Date().toLocaleString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              });

              const ordem = { nome, codigo, dataHora, messageId: msgId };
              ordens.unshift(ordem);
              if (ordens.length > 8) ordens.pop();
            }
          });

          mainWindow.webContents.send('nova-ordem', ordens);

        } else {
          const regex = /^([\p{L}\s]+)[ -]+([A-Z]{2}\d{6,7})$/iu;
          const match = texto.match(regex);

          if (match) {
            const nome = match[1].trim();
            const codigo = match[2].toUpperCase();

            const dataHora = new Date().toLocaleString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            });

            const ordem = { nome, codigo, dataHora, messageId: msgId };

            ordens.unshift(ordem);
            if (ordens.length > 8) ordens.pop();

            mainWindow.webContents.send('nova-ordem', ordens);
          }
        }

      } catch (error) {
        console.error('Erro ao verificar administrador:', error);
      }
    }
  });

  // Evento para remover ordens quando mensagem for apagada para todos
  client.on('message_revoke_everyone', (message) => {
    const apagadaId = message.id._serialized;
    ordens = ordens.filter(ordem => ordem.messageId !== apagadaId);
    mainWindow.webContents.send('nova-ordem', ordens);
  });

  client.initialize();
});

ipcMain.on('ping', (event) => {
  event.reply('pong');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
