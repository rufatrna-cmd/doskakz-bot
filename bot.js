const TelegramBot = require('node-telegram-bot-api');
const PocketBase = require('pocketbase/cjs');
const http = require('http');

// PocketBase ünvanınızı buraya yazırıq
const POCKETBASE_URL = process.env.POCKETBASE_URL || 'https://sizin-pocketbase-unvaniniz.com';
const pb = new PocketBase(POCKETBASE_URL);

const token = process.env.BOT_TOKEN || '8746353448:AAEaCRxb_DFtvdzC9OUAKEyQ0_3TwUKSieU';
const bot = new TelegramBot(token, { polling: true });

console.log('🤖 doskakz.my botu buludda işə düşdü və düymələri gözləyir...');

// Render üçün HTTP server
const PORT = process.env.PORT || 10000;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Doskakz Bot is Live!\n');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server ${PORT} portunda dinləyir`);
});

// Telegram düymə klikləri
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const data = query.data;

    if (data.startsWith('approve_')) {
        const adId = data.replace('approve_', '');
        
        try {
            // 1. PocketBase bazasında elanı VIP edirik
            await pb.collection('ads').update(adId, {
                isVip: true,
                status: 'approved'
            });

            console.log(`✅ Elan #${adId} bazada VIP edildi!`);

            // 2. Telegram-da mesajı yeniləyirik
            await bot.editMessageCaption(
                `✅ **TƏSDİQLƏNDİ VƏ VIP EDİLDİ!**\n\n📌 Elan ID: #${adId}`,
                {
                    chat_id: chatId,
                    message_id: messageId,
                    parse_mode: 'Markdown'
                }
            );

            bot.answerCallbackQuery(query.id, { text: 'Elan bazada VIP edildi!' });

        } catch (error) {
            console.error('Baza yenilənmə xətası:', error);
            bot.answerCallbackQuery(query.id, { text: 'Xəta: Bazada yenilənmədi.' });
        }

    } else if (data.startsWith('reject_')) {
        const adId = data.replace('reject_', '');

        try {
            // İmtina olunarsa bazada statusu dəyişirik
            await pb.collection('ads').update(adId, {
                status: 'rejected'
            });

            await bot.editMessageCaption(
                `❌ **ÖDƏNİŞ RƏDD EDİLDİ**\n\n📌 Elan ID: #${adId}`,
                {
                    chat_id: chatId,
                    message_id: messageId,
                    parse_mode: 'Markdown'
                }
            );

            bot.answerCallbackQuery(query.id, { text: 'Ödəniş rədd edildi.' });

        } catch (error) {
            console.error('Baza yenilənmə xətası:', error);
            bot.answerCallbackQuery(query.id, { text: 'Xəta baş verdi.' });
        }
    }
});
