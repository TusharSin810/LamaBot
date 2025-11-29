import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"

export const balance = async (pubKey: string) => {
    const connection = new Connection(clusterApiUrl("devnet"));
    const publicKey: PublicKey = new PublicKey(pubKey);

    const balInLamports = await connection.getBalance(publicKey);

    const balInSol = balInLamports/LAMPORTS_PER_SOL;
    return balInSol;
}