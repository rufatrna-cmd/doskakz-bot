const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

// Tokeni Render mühitindən və ya birbaşa oxuyuruq
const token = process.env.BOT_TOKEN || '8746353448:AAEaCRxb_DFtvdzC9OUAKEyQ0_3TwUKSieU';
const bot = new TelegramBot(token, { polling: true });

console.log('🤖 doskakz.my botu buludda işə düşdü və düymələri gözləyir...');

// Render Web Service üçün sadə HTTP server (port tələbini ödəmək üçün)
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Doskakz Bot is running successfully!\n');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`HTTP server is listening on port ${PORT}`);
});

// Telegram düymə klikləri (Callback Query)
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const data = query.data;

    if (data.startsWith('approve_')) {
        const adId = data.replace('approve_', '');
        
        console.log(`✅ Elan #${adId} təsdiq olundu!`);

        await bot.editMessageCaption(
            `✅ **TƏSDİQLƏNDİ VƏ VIP EDİLDİ!**\n\n📌 Elan ID: #${adId}`,
            {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'Markdown'
            }
        ).catch(err => console.log(err));

        bot.answerCallbackQuery(query.id, { text: 'Elan uğurla VIP edildi!' });

    } else if (data.startsWith('reject_')) {
        const adId = data.replace('reject_', '');

        console.log(`❌ Elan #${adId} rədd edildi!`);

        await bot.editMessageCaption(
            `❌ **ÖDƏNİŞ RƏDD EDİLDİ**\n\n📌 Elan ID: #${adId}`,
            {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'Markdown'
            }
        ).catch(err => console.log(err));

        bot.answerCallbackQuery(query.id, { text: 'Ödəniş rədd edildi.' });
    }
});
