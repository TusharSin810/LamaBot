import { Telegraf, Markup } from "telegraf";
import { Wallet } from "./wallet";
import { prismaClient } from "./db";

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

bot.start(async (ctx) => {
    const userId = ctx.from?.id;
    if(!userId) return;

    return ctx.reply(welcomeMessage, {
        parse_mode: 'Markdown',
        ...keyboard
    });
});

bot.action("generate_wallet", async (ctx) => {
    ctx.answerCbQuery(`Generating a New Wallet For You ...`);
    const userId = ctx.from?.id.toString();
    const userName = ctx.from?.first_name;
    const wallet = await Wallet(userId, userName);
    ctx.sendMessage(`New Wallet Created For You With Public Key : ${wallet}`);
})

bot.action("view_address", async (ctx) => {
    ctx.answerCbQuery(`Getting Your Address ...`);
    const userId = ctx.from?.id.toString();
    const user = await prismaClient.user.findFirst({
        where:{
            userId:userId
        }
    });
    const pubKey = user?.pubKey;

    if(!user){
        ctx.sendMessage(`User Does Not Have A Wallet Create One First`)
        await ctx.reply(welcomeMessage, {
            parse_mode:'Markdown',
            ...keyboard
        });
        return;
    }

    await ctx.reply(`Your Address Is : ${pubKey}`);
})

await bot.launch(() => {
    console.log(`Bot Started`)
})