import { Keypair } from "@solana/web3.js";
import { prismaClient } from "./db";
import bcrypt from "bcrypt";
import "dotenv/config";

export const Wallet = async (userId: string, userName: string) => {
    const keypair = new Keypair();
    const pubKey = keypair.publicKey.toBase58();
    const salt = Number(process.env.SALT_ROUNDS);
    if(!salt) throw new Error(`Salt Rounds Missing`)
    
    const hash = await bcrypt.hash(keypair.secretKey.toBase64(),salt);

    await prismaClient.user.create({
        data:{
            userId: userId,
            userName: userName,
            pubKey: pubKey,
            privateKey: hash
            }
    })
    return pubKey;
}