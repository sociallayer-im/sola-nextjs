import {NextApiRequest, NextApiResponse} from "next/dist/shared/lib/utils";
import {verifySignIn} from '@solana/wallet-standard-util';
import {SolanaSignInInput} from "@solana/wallet-standard-features";
import {solanaLogin} from "@/service/solas";

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

        const publicKey = new Uint8Array(Object.values(req.body.public_key) as any);

        const input: SolanaSignInInput = {
            domain: req.headers.host,
            address: req.body.address,
            statement: 'Sign in to Social Layer',
        };

        const signature = new Uint8Array(req.body.signature.data);
        const signedMessage = new Uint8Array(req.body.signedMessage.data);

        const output: any = {
            signedMessage: signedMessage,
            signature: signature,
            account: {publicKey: publicKey}
        };

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
