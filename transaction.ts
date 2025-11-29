import { PublicKey } from "@solana/web3.js"
import { connection } from "./balance";

export const transaction = async (pubKey: string) => {
    let alltxn = [];
    let oldestsign = null;
    const limit = 10;
    const publicKey: PublicKey = new PublicKey(pubKey);
    
    while(true) {
        const signs = await connection.getSignaturesForAddress(publicKey, {
            limit: limit,
            before: oldestsign!,
        });

        if(signs.length === 0){
            break;
        }

        const signList = signs.map(sig => sig.signature);

        const txndetail = await connection.getParsedTransactions(signList);
        alltxn.push(...txndetail);

        oldestsign = signs[signs.length - 1]?.signature;
    }
    return alltxn;
}