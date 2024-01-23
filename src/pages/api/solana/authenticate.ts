import {NextApiRequest, NextApiResponse} from "next/dist/shared/lib/utils";
import {
    verifySignIn,
    parseSignInMessage,
    deriveSignInMessageText,
    createSignInMessage
} from '@solana/wallet-standard-util';
import {SolanaSignInInput} from "@solana/wallet-standard-features";
import {solanaLogin} from "@/service/solas";
import bs58 from 'bs58'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (!req.body.public_key) {
            console.error(`[ERROR] No public key specified`);
            res.status(400).send("No public key specified");
            return;
        }

        if (!req.body.signature) {
            console.error(`[ERROR] No signature specified`);
            res.status(400).send("No signature specified");
            return;
        }

        if (!req.body.signedMessage) {
            console.error(`[ERROR] No signedMessage specified`);
            res.status(400).send("No signedMessage specified");
            return;
        }

        if (!req.body.address) {
            console.error(`[ERROR] No address specified`);
            res.status(400).send("No address specified");
            return;
        }

        const publicKey = bs58.decode(req.body.public_key)

        const input = {
            address: req.body.address!,
            domain: req.headers.origin!,
            version: '1',
            issuedAt: req.body.timestamps,
            uri: req.headers.origin!
        }

        const signature = new Uint8Array(Object.values(req.body.signature) as any);
        const signedMessage = new Uint8Array(Object.values(req.body.signedMessage) as any);

        const output: any = {
            signedMessage: signedMessage,
            signature: signature,
            account: {publicKey: publicKey}
        };

        const info = parseSignInMessage(signature)

        if (!verifySignIn(input, output)) {
            res.status(403).send("Signature is not valid");
        } else {
            const authToken = await solanaLogin({
                sol_address: req.body.address,
                next_token: process.env.NEXT_TOKEN || ''
            })

            res.status(200).send({
                auth_token: authToken,
                address: req.body.address,
            });
        }
    } catch (error: any) {
        console.trace(`[ERROR] ${error.message}`);
        res.status(500).send(`Unknown error: ${error.message}`);
    }
}
