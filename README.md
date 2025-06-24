# 📲 Painel de Ordens de Serviço - Secretaria da Economia de Goiás

Este projeto é um painel em tempo real desenvolvido para a equipe de técnicos de informática da **Secretaria da Economia do Estado de Goiás**. Ele exibe na TV as ordens de serviço enviadas pela coordenação através de mensagens de WhatsApp.

---

## 🚀 Funcionalidades principais

✅ Conexão ao WhatsApp da chefia via QR Code  
✅ Leitura automática das mensagens recebidas no grupo da equipe  
✅ Exibição das **últimas 8 ordens de serviço**, com destaque visual para a mais recente  
✅ Alerta sonoro sempre que chega uma nova ordem  
✅ Cancelamento de ordens diretamente pelo WhatsApp através de comando específico  
✅ Interface otimizada para exibição em **TV de 60 polegadas**, com layout responsivo  

---

## 📋 Como enviar uma Ordem de Serviço (Instruções para administradores do grupo)

### ➡️ Formato de envio de uma nova ordem:

### Exemplos de mensagens válidas no grupo:
Yuri
SS102030
SS302010

ou

Yuri - SS102030

---

### ➡️ Como cancelar uma ordem:

Para cancelar uma ordem que já está na tela, envie no grupo o seguinte comando:
Cancelar SS102030

**Observação:** Apenas administradores do grupo têm permissão para cancelar ordens.

---

## 🛠️ Tecnologias utilizadas

- Node.js
- Electron
- WhatsApp Web.js
- HTML / CSS / JavaScript
- QRCode Generator
- Sistema de áudio para alerta sonoro

---

## ⚙️ Como rodar o projeto localmente

### Pré-requisitos:

- Node.js instalado na máquina
- Uma conta de WhatsApp com acesso ao grupo onde as ordens são enviadas

Observação: Na primeira execução, será necessário escanear o QR Code com o WhatsApp da coordenação para autenticação.

