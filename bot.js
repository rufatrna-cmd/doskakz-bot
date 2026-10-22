const TelegramBot = require('node-telegram-bot-api');

// Tokeni birbaşa və ya Render-in təhlükəsiz mühit dəyişənindən oxuyuruq
const token = process.env.BOT_TOKEN || '8746353448:AAEaCRxb_DFtvdzC9OUAKEyQ0_3TwUKSieU';

const bot = new TelegramBot(token, { polling: true });

console.log('🤖 doskakz.my botu buludda işə düşdü və düymələri gözləyir...');

bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const data = query.data;

    if (data.startsWith('approve_')) {
        const adId = data.replace('approve_', '');
        
        console.log(`✅ Elan #${adId} təsdiq olundu!`);

        // Telegram-dakı mesajı yeniləyirik
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