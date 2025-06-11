const axios = require('axios');
const cheerio = require('cheerio');

const handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        return m.reply(`Masukkan URL X (Twitter)\n\n*Contoh:* ${usedPrefix}${command} https://x.com/elonmusk/status/1901663707190419744`);
    }

    const regex = /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/\d+/;
    if (!regex.test(args[0])) {
        return m.reply('Berikan URL dari X (Twitter) yang valid.');
    }

    m.reply('*Tunggu sebentar, sedang memproses...*');

    try {
        const res = await axios.post('https://twmate.com/', new URLSearchParams({
            page: args[0],
            ftype: 'all',
            ajax: '1'
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Accept': '*/*',
                'X-Requested-With': 'XMLHttpRequest',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36',
                'Referer': 'https://twmate.com/',
            }
        });

        const $ = cheerio.load(res.data);
        const videoLinks = [];
        $('.btn-dl').each((index, element) => {
            const quality = $(element).parent().prev().text().trim();
            const downloadUrl = $(element).attr('href');
            if (downloadUrl.includes('.mp4')) {
                videoLinks.push({ quality, downloadUrl });
            }
        });

        if (videoLinks.length === 0) {
            return m.reply('Gagal mengambil video. Pastikan URL benar dan video bersifat publik.');
        }

        const best = videoLinks[0];
        let caption = `*Download Twitter/X*\n\n`;
        caption += `*Quality:* ${best.quality}\n`;
        caption += `*Source:* ${args[0]}\n\n`;
        caption += `*Link Alternatif:*\n`;
        videoLinks.forEach((v, i) => {
            caption += `${i + 1}. ${v.quality}: ${v.downloadUrl}\n`;
        });

        await conn.sendMessage(m.chat, {
            video: { url: best.downloadUrl },
            caption: caption.trim()
        }, { quoted: m });

    } catch (error) {
        console.error(error);
        m.reply('Terjadi kesalahan saat memproses video.');
    }
};

handler.help = ['twitter'].map(v => v + ' <url>');
handler.tags = ['downloader'];
handler.alias = ['x', 'twitter', 'twdown'];
handler.command = /^(x|twitter|twdown)$/i;

module.exports = handler;