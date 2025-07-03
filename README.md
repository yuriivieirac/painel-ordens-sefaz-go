# 📲 Painel de Ordens de Serviço - Secretaria da Economia de Goiás

Este projeto é um painel em tempo real desenvolvido para a equipe de técnicos de informática da **Secretaria da Economia do Estado de Goiás**. Ele exibe na TV as ordens de serviço enviadas pela coordenação através de mensagens de WhatsApp.

---

## 🚀 Funcionalidades principais

✅ Conexão ao WhatsApp da administração via QR Code  
✅ Leitura automática das mensagens recebidas no grupo da equipe  
✅ Exibição das **últimas 10 ordens de serviço**, com destaque visual para a mais recente  
✅ Alerta sonoro sempre que chega uma nova ordem  
✅ Atualização automática no painel ao **editar mensagens** no WhatsApp  
✅ Exclusão automática no painel ao **excluir mensagens** no WhatsApp  
✅ Validação para que as ordens comecem somente com "SS" ou "IN", seguido do número (exemplo: SS123456 ou IN123456)  
✅ Interface otimizada para exibição em TV de 60 polegadas, com layout responsivo  

---

## 📋 Como enviar uma Ordem de Serviço (Instruções para administradores do grupo)

### ➡️ Formato válido para envio de uma nova ordem:
"Apenas mensagens que começam com SS ou IN (maiúsculo ou minúsculo), seguidas de números, serão consideradas."
  
**Exemplo em caso de várias O.S:**
```
Yuri  
SS102030  
SS302010  
IN101010
```

**Exemplo em caso de uma O.S:**  
1° Modelo: `Yuri - SS102030`  
2° Modelo: `Yuri SS102030`  
3° Modelo: `Yuri ss102030`  
4° Modelo: `Yuri - ss102030`

---

### ➡️ Edição e exclusão de mensagens:

- Se um administrador **editar** uma mensagem que contém uma ordem, a ordem será atualizada automaticamente no painel.
- Se uma mensagem com ordem for **excluída para todos** no WhatsApp, a ordem será removida automaticamente do painel.

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

Observação: Na primeira execução, será necessário escanear o QR Code com o WhatsApp da administração para autenticação.

