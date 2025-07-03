const { app, BrowserWindow, ipcMain } = require('electron');
const { Client, LocalAuth } = require('whatsapp-web.js');
const QRCode = require('qrcode');
const path = require('path');

let mainWindow;
let ordens = [];

function log(...args) {
  console.log(`[${new Date().toLocaleTimeString()}]`, ...args);
}

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
  log('🚀 Aplicativo iniciado. Criando janela principal...');

  const client = new Client({
    authStrategy: new LocalAuth(),
  });

  client.on('qr', (qr) => {
    log('📱 QR Code recebido. Escaneie com o WhatsApp administrador.');
    QRCode.toDataURL(qr).then(url => {
      mainWindow.webContents.send('qr-code', url);
    });
  });

  client.on('ready', () => {
    log('✅ WhatsApp conectado com sucesso!');
    mainWindow.webContents.send('ready');
  });

  client.on('message', async (message) => {
    if (!message.from.includes('@g.us')) return;

    const texto = message.body.trim();

    try {
      const chat = await message.getChat();
      const remetenteId = message.author || message.from;
      const participante = chat.participants.find(p => p.id._serialized === remetenteId);

      if (!participante || !participante.isAdmin) {
        return;
      }

      const linhas = texto.split('\n').map(l => l.trim()).filter(l => l.length > 0);

      if (linhas.length >= 2) {
        const nome = linhas[0];
        const codigos = linhas.slice(1);

        codigos.forEach(codigoRaw => {
          const codigo = codigoRaw.toUpperCase();
          const codigoRegex = /^(SS|IN)\d{6,7}$/;

          if (codigoRegex.test(codigo)) {
            const dataHora = new Date().toLocaleString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            });

            const ordem = { nome, codigo, dataHora, messageId: message.id._serialized };
            ordens.unshift(ordem);
            if (ordens.length > 10) ordens.pop();

            log(`📥 Nova ordem adicionada: ${nome} - ${codigo}`);
          }
        });

        mainWindow.webContents.send('nova-ordem', ordens);

      } else {
        const regex = /^([\p{L}\s]+)[ -]+((SS|IN)\d{6,7})$/iu;
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

          const ordem = { nome, codigo, dataHora, messageId: message.id._serialized };
          ordens.unshift(ordem);
          if (ordens.length > 10) ordens.pop();

          log(`📥 Nova ordem de serviço: ${nome} - ${codigo}`);
          mainWindow.webContents.send('nova-ordem', ordens);
        }
      }

    } catch (error) {
      log('❗ Erro ao processar mensagem:', error);
    }
  });

  // ✅ EDIÇÃO DE MENSAGEM
  client.on('message_edit', async (msg) => {
    const texto = msg.body.trim();
    const regex = /^([\p{L}\s]+)[ -]+((SS|IN)\d{6,7})$/iu;
    const match = texto.match(regex);

    if (!match) {
      log('✏️ Edição ignorada - mensagem não tem formato válido.');
      return;
    }

    try {
      const chat = await msg.getChat();
      const remetenteId = msg.author || msg.from;
      const participante = chat.participants.find(p => p.id._serialized === remetenteId);

      if (!participante || !participante.isAdmin) {
        log('❌ Edição ignorada - remetente não é administrador.');
        return;
      }

      const nome = match[1].trim();
      const codigoNovo = match[2].toUpperCase();

      const index = ordens.findIndex(o => o.messageId === msg.id._serialized);
      if (index !== -1) {
        ordens[index] = {
          nome,
          codigo: codigoNovo,
          dataHora: new Date().toLocaleString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }),
          messageId: msg.id._serialized
        };

        log(`✏️ Ordem de serviço atualizada por edição: ${nome} - ${codigoNovo}`);
        mainWindow.webContents.send('nova-ordem', ordens);
      } else {
        log('⚠️ Ordem não encontrada para edição.');
      }
    } catch (error) {
      log('❗ Erro ao processar edição:', error);
    }
  });

  client.on('message_revoke_everyone', (message, revokedMsg) => {
    const textoApagado = revokedMsg?.body?.trim();
    log('🗑️ Mensagem apagada para todos detectada. Conteúdo:', textoApagado);

    if (!textoApagado) {
      log('⚠️ Texto da mensagem apagada está vazio ou indisponível.');
      return;
    }

    const regexCodigo = /[A-Z]{2}\d{6,7}/g;
    const codigosEncontrados = textoApagado.match(regexCodigo);

    if (!codigosEncontrados || codigosEncontrados.length === 0) {
      log('⚠️ Nenhum código reconhecido no conteúdo da mensagem apagada.');
      return;
    }

    const tamanhoAntes = ordens.length;
    ordens = ordens.filter(ordem => !codigosEncontrados.includes(ordem.codigo));

    if (ordens.length < tamanhoAntes) {
      mainWindow.webContents.send('nova-ordem', ordens);
    } else {
      log('⚠️ Nenhuma ordem removida - códigos apagados não estavam no painel.');
    }
  });

  client.initialize();
});

ipcMain.on('ping', (event) => {
  log('🔄 Ping recebido do frontend.');
  event.reply('pong');
});

app.on('window-all-closed', () => {
  log('📴 Fechando aplicação...');
  app.quit();
});
