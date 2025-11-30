import { Keypair } from "@solana/web3.js";
import { prismaClient } from "./db";
import "dotenv/config";
import crypto from "crypto";
if(!process.env.MASTER_ENC_KEY) throw new Error (`ENC Key Missing`);

export const MASTER_KEY = crypto
    .createHash("sha256")
    .update(process.env.MASTER_ENC_KEY)
    .digest()
;

export const Wallet = async (userId: string, userName: string) => {
    const keypair = new Keypair();
    const pubKey = keypair.publicKey.toBase58();
    const privateKey = JSON.stringify(Array.from(keypair.secretKey));
    
    const iv = crypto
        .createHmac("sha256",MASTER_KEY)
        .update(userId)
        .digest()
        .subarray(0,12)
    ;

    const cipher = crypto.createCipheriv("aes-256-gcm", MASTER_KEY, iv);
    const encrypted = Buffer.concat([
        cipher.update(privateKey, "utf-8"),
        cipher.final()
    ]);
    const tag = cipher.getAuthTag();

    const encKey = Buffer.concat([iv, tag, encrypted]).toString("base64");

    await prismaClient.user.create({
        data:{
            userId: userId,
            userName: userName,
            pubKey: pubKey,
            privateKey: encKey
            }
    })

    return pubKey;
}
