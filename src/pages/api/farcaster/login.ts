import {NextApiRequest, NextApiResponse} from "next/dist/shared/lib/utils";
import {createAppClient, viemConnector} from '@farcaster/auth-client';
import {farcasterLogin} from "@/service/solas";

export interface LoginProp {
    message?: string,
    signature?: string,
    custody?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const appClient = createAppClient({
        relay: 'https://relay.farcaster.xyz',
        ethereum: viemConnector({
            rpcUrl: 'https://op-pokt.nodies.app'
        }),
    });

    try {
        if (!req.body) {
            res.status(400).send("No message specified");
            return
        }

        if (!req.body.message) {
            res.status(400).send("No message specified");
            return
        }

        if (!req.body.custody) {
            res.status(400).send("No custody specified");
            return
        }

        const nonce = req.body.message.match(/Nonce: (\w+)/)[1]
        const domain = req.body.message.match(/URI: (\S+)/)[1]

        if (!nonce || !domain) {
            res.status(403).send("Invalid message");
            return
        }

        const {data, success, fid, error} = await appClient.verifySignInMessage({
            nonce: nonce,
            domain: domain.replace(/^https?:\/\//, ''),
            message: req.body.message,
            signature: req.body.signature
        });

        if (error) {
            console.error(`[ERROR] ${error.message}`);
            console.log(`[ERROR] ${error.message}`);
            res.status(500).send(error.message);
            return
        }

        if (success) {
            const authToken = await farcasterLogin({
                far_fid: fid,
                far_address: req.body.custody,
                host: domain,
                next_token: process.env.NEXT_TOKEN || ''
            })

            res.status(200).send({fid, auth_token: authToken})
        } else {
            res.status(403).send("Verification failed");
        }
    } catch (e: any) {
        console.error(`[ERROR] ${e.message}`);
        res.status(500).send(e.message);
    }
}
