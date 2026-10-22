const TelegramBot = require('node-telegram-bot-api');
const { createClient } = require('@supabase/supabase-js');
const http = require('http');

// Supabase mühit dəyişənləri
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const token = process.env.BOT_TOKEN || '8746353448:AAEaCRxb_DFtvdzC9OUAKEyQ0_3TwUKSieU';
const bot = new TelegramBot(token, { polling: true });

console.log('🤖 doskakz.my botu Supabase ilə işə düşdü...');

// Render HTTP Server
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
            // Supabase-də elanın statusunu yeniləyirik
            const { error } = await supabase
                .from('ads')
                .update({ isVip: true, status: 'approved' })
                .eq('id', adId);

            if (error) throw error;

            console.log(`✅ Elan #${adId} Supabase-də VIP edildi!`);

            await bot.editMessageCaption(
                `✅ **TƏSDİQLƏNDİ VƏ VIP EDİLDİ!**\n\n📌 Elan ID: #${adId}`,
                {
                    chat_id: chatId,
                    message_id: messageId,
                    parse_mode: 'Markdown'
                }
            );

            bot.answerCallbackQuery(query.id, { text: 'Elan Supabase-də VIP edildi!' });

        } catch (error) {
            console.error('Supabase yenilənmə xətası:', error.message);
            bot.answerCallbackQuery(query.id, { text: 'Xəta: Bazada yenilənmədi.' });
        }

    } else if (data.startsWith('reject_')) {
        const adId = data.replace('reject_', '');

        try {
            const { error } = await supabase
                .from('ads')
                .update({ status: 'rejected' })
                .eq('id', adId);

            if (error) throw error;

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
            console.error('Supabase yenilənmə xətası:', error.message);
            bot.answerCallbackQuery(query.id, { text: 'Xəta baş verdi.' });
        }
    }
});
