import {NextApiRequest, NextApiResponse} from "next/dist/shared/lib/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (!req.body) {
        res.status(400).send("No message specified");
        return
    }

    if (!req.body.message) {
        res.status(400).send("No message specified");
        return
    }

    // console.error(`[Catch error] : \n${req.body.message}\n${JSON.stringify(req.body.detail)}`)
    res.status(200).json({status: 'ok', message:''})
}
