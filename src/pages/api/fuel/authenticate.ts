import {NextApiRequest, NextApiResponse} from "next/dist/shared/lib/utils";
import {fuelLogin} from "@/service/solasv2";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (!req.body.signature || !req.body.message || !req.body.publicKey) {
            res.status(200).send({error: 'Invalid data'});
            return;
        }

        const authToken = await fuelLogin({
            fuel_address: req.body.publicKey,
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
