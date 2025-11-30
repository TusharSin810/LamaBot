import { LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from "@solana/web3.js"
import { prismaClient } from "./db";
import { connection } from "./balance";
import { transaction } from "./transaction";

export const send_sol = async (amount : number, to: string, userId: string) =>{
    const toPubkey: PublicKey = new PublicKey(to);
    const lamports = amount * LAMPORTS_PER_SOL;
    const user = await prismaClient.user.findFirst({
        where:{
            userId
        }
    })
    
    const userPubkey: PublicKey = new PublicKey(user?.pubKey!);

    const trans = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: userPubkey,
            toPubkey: toPubkey,
            lamports: lamports
        })
    );

    const signature = await sendAndConfirmTransaction(
        connection,
        transaction,

    )

}