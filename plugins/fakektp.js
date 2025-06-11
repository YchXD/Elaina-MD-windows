const axios = require('axios');
const fs = require('fs');
const { ImageUploadService } = require('node-upload-images');

const handler = async (m, { conn, text, command, usedPrefix }) => {
  const mime = (m.quoted?.mimetype || '');

  if (!/image/.test(mime)) {
    return m.reply('Kirim Gambar yang akan dijadikan KTP dengan caption perintah!');
  }

  if (!text) {
    return m.reply(`Contoh:\n${usedPrefix + command} JawaBarat/Bandung/3275024509970001/Budi Santoso/Bandung, 25-09-1997/Laki-Laki/A/JL. SUDIRMAN NO. 123/05|08/RAWA BOBO/PASAR MINGGU/ISLAM/BELUM MENIKAH/PEGAWAI SWASTA/WNI/7 Minggu/26-09-1997/25-09-2023`);
  }

  try {
    m.reply('Proses Cikk...');

    const [
      provinsi,
      kota,
      nik,
      nama,
      ttl,
      jenisKelamin,
      golonganDarah,
      alamat,
      rtrw,
      kelDesa,
      kecamatan,
      agama,
      status,
      pekerjaan,
      kewarganegaraan,
      masaBerlaku,
      terbuat
    ] = text.split('/');

    const media = await conn.downloadAndSaveMediaMessage(m.quoted);
    const service = new ImageUploadService('pixhost.to');
    const { directLink } = await service.uploadFromBinary(fs.readFileSync(media), 'ktp.jpg');

    const resUrl = `https://fastrestapis.fasturl.cloud/maker/ktp?provinsi=${provinsi}&kota=${kota}&nik=${nik}&nama=${nama}&ttl=${ttl}&jenisKelamin=${jenisKelamin}&golonganDarah=${golonganDarah}&alamat=${alamat}&rtRw=${rtrw}&kelDesa=${kelDesa}&kecamatan=${kecamatan}&agama=${agama}&status=${status}&pekerjaan=${pekerjaan}&kewarganegaraan=${kewarganegaraan}&masaBerlaku=${masaBerlaku}&terbuat=${terbuat}&pasPhoto=${encodeURIComponent(directLink)}`;

    const response = await axios.get(resUrl, { responseType: 'arraybuffer' });

    await conn.sendMessage(m.chat, {
      image: Buffer.from(response.data),
      caption: '✅ KTP jadi, jangan disalahgunakan ya!'
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply('Ada yang salah nih... pastiin formatnya udah bener ya!');
  }
};

handler.help = ['fakektp'];
handler.tags = ['maker'];
handler.command = /^fakektp$/i;
handler.limit = true;

module.exports = handler;