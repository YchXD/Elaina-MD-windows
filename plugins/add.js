const { getBinaryNodeChild, getBinaryNodeChildren } = require('@whiskeysockets/baileys');

let handler = async (m, { conn, text, participants, usedPrefix, command }) => {
  if (!text) {
    return m.reply('Masukin Nomor. Contoh: 62xxx');
  }

  try {
    const number = text.replace(/[^0-9]/g, '');
    const jid = m.quoted ? m.quoted.sender : number + '@s.whatsapp.net';
    const res = await conn.groupParticipantsUpdate(m.chat, [jid], 'add');

    // Cek apakah gagal karena status 403
    if (Array.isArray(res) && res[0]?.status === '403') {
      const code = await conn.groupInviteCode(m.chat);
      const link = `https://chat.whatsapp.com/${code}`;
      await conn.sendMessage(jid, {
        text: `Bot tidak bisa menambahkan kamu langsung ke grup. Ini link undangannya: ${link}`,
      });
      m.reply('Gagal menambahkan langsung. Link grup telah dikirimkan ke nomor tersebut.');
    }

  } catch (err) {
    console.error('Error saat menambahkan peserta:', err);
    m.reply(`Terjadi kesalahan saat menambahkan peserta. Pastikan bot adalah admin dan nomor benar.`);
  }
};

handler.help = ['add', '+'].map(v => v + ' nomor');
handler.tags = ['group'];
handler.command = /^(add|menambahkan|\+)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

module.exports = handler;