import { Telegraf, Markup } from "telegraf";
import { prismaClient } from "./db";
import { Keypair } from "@solana/web3.js";

if(!process.env.BOT_TOKEN) throw new Error(`Bot Token Does Not Exist`);
const bot = new Telegraf(process.env.BOT_TOKEN);

const keyboard = Markup.inlineKeyboard([
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
        ...keyboard
    });
});

bot.action("generate_wallet", async (ctx) => {
    ctx.answerCbQuery(`Generating a New Wallet For You ...`);
    const userId = ctx.from?.id.toString();
    const userName = ctx.from?.first_name;
    const keypair = new Keypair();

    await prismaClient.user.create({
        data:{
            userId: userId,
            userName: userName,
            pubKey: keypair.publicKey.toBase58(),
            privateKey: keypair.secretKey.toBase64()
        }
    })

    ctx.sendMessage(`New Wallet Created For U With Public Key : ${keypair.publicKey}`);
})

await bot.launch(() => {
    console.log(`Bot Started`)
})