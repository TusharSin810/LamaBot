import { Telegraf, Markup, Input } from "telegraf";
import { Wallet } from "./wallet";
import { prismaClient } from "./db";
import { balance } from "./balance";
import { format } from "./format";
import { transaction } from "./transaction";
import { message } from "telegraf/filters";
import { PublicKey } from "@solana/web3.js";
import { send_sol } from "./send_sol";

if(!process.env.BOT_TOKEN) throw new Error(`Bot Token Does Not Exist`);
const bot = new Telegraf(process.env.BOT_TOKEN);

interface PendingReqType {
    type: "SEND_SOL" | "SEND_TOKEN",
    amount?: number,
    to?: string
}

const PENDING_REQ: Record<string, PendingReqType> = {};

const keyboard = Markup.inlineKeyboard([
    [
        Markup.button.callback('🔑 Generate Wallet', 'generate_wallet'),
    ],
    [
        Markup.button.callback('👁️ View Address', 'view_address'),
    ],
    [
        Markup.button.callback('💰 Check Balance', 'check_balance'),
        Markup.button.callback('📊 Transaction History', 'tx_history')
    ],
    [
        Markup.button.callback('💸 Send SOL', 'send_sol'),
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

bot.action("check_balance", async (ctx) => {
    ctx.answerCbQuery(`Getting Your Address ...`);
    const userId = ctx.from?.id.toString();
    const user = await prismaClient.user.findFirst({
        where:{
            userId:userId
        }
    });
    const pubKey = user?.pubKey;    

    const acc_balance = await balance(pubKey!);

    ctx.reply(`Your Current Solana Balance Is : ${acc_balance}`);
})

bot.action("tx_history", async (ctx) => {
    ctx.answerCbQuery(`Getting All Your Transaction History ...`);
    const userId = ctx.from?.id.toString();
    const user = await prismaClient.user.findFirst({
        where:{
            userId:userId
        }
    });
    const pubKey = user?.pubKey;
    const txn = await transaction(pubKey!);
    const maxToShow = 5
    const chunks = txn.slice(0, maxToShow).map((tx, idx) => {
    return `#${idx + 1}\n${format(tx)}`;
  });

  const message = `📜 Recent Transactions (${chunks.length}):\n\n${chunks.join(
    "\n\n──────────────\n\n"
  )}`;

  await ctx.reply(message, { parse_mode: "Markdown" });
})

bot.action("send_sol", (ctx) => {
    const userId = ctx.from?.id;
    ctx.answerCbQuery(`Transaction Initiated`);
    ctx.sendMessage(`Can You Please Share The Address : `)
    PENDING_REQ[userId] = {
        type: "SEND_SOL"
    }
});

bot.on(message("text"), (ctx) => {
    const userId = ctx.from?.id.toString();
    if (PENDING_REQ[userId]?.type === "SEND_SOL") {

        if (PENDING_REQ[userId] && !PENDING_REQ[userId].to) {
            const input = ctx.message.text;
            try {
                new PublicKey(input);
                PENDING_REQ[userId].to = input;
                ctx.sendMessage(`Please provide the amount you want to send:`);
            } catch (err) {
                ctx.sendMessage(`❌ Invalid Solana address.\nPlease re-enter a valid address:`);  
            }
        } else {
            const amount = Number(ctx.message.text);
            if (isNaN(amount) || amount <= 0) {
                return ctx.sendMessage(`❌ Invalid amount. Please enter a valid number:`);
            }
            PENDING_REQ[userId].amount = amount;
            ctx.sendMessage(`Initiated A Transaction For ${amount} SOL To ${PENDING_REQ[userId].to}`);
        }
        const send_txn = send_sol(PENDING_REQ[userId].amount!, PENDING_REQ[userId].to!, userId);
    }
});


await bot.launch(() => {
    console.log(`Bot Started`)
})