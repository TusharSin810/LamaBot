import { Telegraf, Markup } from "telegraf";

if(!process.env.BOT_TOKEN) throw new Error(`Bot Token Does Not Exist`);
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(async (ctx) => {
    const userId = ctx.from?.id;
    if(!userId) return;

    let welcomeMessage = `
    🤖 **Welcome to Solana Wallet Bot!**

    Your secure, easy-to-use Solana wallet manager.

    **Features:**
    • 🔑 Generate new wallets
    • 📋 Import existing wallets
    • 💰 Check balances
    • 💸 Send SOL and SPL tokens
    • 📊 View transaction history
    • 🔒 Secure private key storage

    **Security:**
    • All private keys are encrypted
    • Never share your private keys
    • Use at your own risk (testnet recommended)

    Choose an option below to get started:`;
    return ctx.reply(welcomeMessage, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
            [
                Markup.button.callback('🔑 Generate Wallet', 'generate_wallet'),
            ],
            [
                Markup.button.callback('👁️ View Address', 'view_address'),
                Markup.button.callback('🔐 Export Private Key', 'export_private_key')
            ],
            [
                Markup.button.callback('💰 Check Balance', 'check_balance'),
                Markup.button.callback('📊 Transaction History', 'tx_history')
            ],
            [
                Markup.button.callback('💸 Send SOL', 'send_sol_menu'),
                Markup.button.callback('🪙 Send Token', 'send_token_menu')
            ]
        ])
    });
});

await bot.launch(() => {
    console.log(`Bot Started`)
})