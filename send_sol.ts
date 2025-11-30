import { LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction, Keypair } from "@solana/web3.js"
import { prismaClient } from "./db";
import { connection } from "./balance";
import crypto from "crypto";
import { MASTER_KEY } from "./wallet";

export const send_sol = async (amount : number, to: string, userId: string) =>{
    try {
        const toPubkey: PublicKey = new PublicKey(to);
        const lamports = amount * LAMPORTS_PER_SOL;
        const user = await prismaClient.user.findFirst({
            where:{
                userId
            }
        })
        const key = user?.privateKey!;

        const raw = Buffer.from(key, "base64");
        const iv = raw.subarray(0,12);
        const tag = raw.subarray(12,28);
        const encrypted = raw.subarray(28);

        const decipher = crypto.createDecipheriv("aes-256-gcm", MASTER_KEY,iv);
        decipher.setAuthTag(tag);

        const decrypted = Buffer.concat([
            decipher.update(encrypted),
            decipher.final()
        ]);
        const decStr = decrypted.toString("utf8")
        const prKey = Keypair.fromSecretKey(Uint8Array.from((JSON.parse(decStr))));

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
            trans,
            [prKey]
        );
        return{
            success: true,
            signature
        }
    }catch(err){
        const e = err as Error
        return{
            success: false,
            error: e.message
        };
    }

}