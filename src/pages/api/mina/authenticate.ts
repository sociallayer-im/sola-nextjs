import {NextApiRequest, NextApiResponse} from "next/dist/shared/lib/utils";
import Client from 'mina-signer'
import {minaLogin} from "@/service/solasv2"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (!req.body.data || !req.body.publicKey || !req.body.signature) {
            res.status(200).send({error: 'Invalid data'});
            return;
        }

        const signerClient = new Client({ network: "mainnet" });

        const verifyResult = signerClient.verifyMessage({
            data: req.body.data,
            publicKey: req.body.publicKey,
            signature: req.body.signature
        })

        if (!verifyResult) {
            res.status(200).send({error: 'Signature is not valid'});
        }

        const authToken = await minaLogin({
            mina_address: req.body.publicKey,
            next_token: process.env.NEXT_TOKEN || ''
        })

        res.status(200).send({
            auth_token: authToken,
            address: req.body.publicKey,
        });
    } catch (error: any) {
        console.trace(`[ERROR] ${error.message}`);
        res.status(500).send(`Unknown error: ${error.message}`);
    }
}
