import {NextApiRequest, NextApiResponse} from "next/dist/shared/lib/utils";
// @ts-ignore
import {authenticate} from "@pcd/zuauth/server";
import {zupassLoginMulti} from "@/service/solas";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const pcdStrs = JSON.parse(req.body.pcdStr);
        let ticketInfo: any = []
        let email = ''
        pcdStrs.forEach((pcdStr: any) => {
            const pcd = JSON.parse(pcdStr.pcd);
            // const user = pcd.claim.partialTicket
            ticketInfo.push({
                zupass_product_id: pcd.claim.partialTicket.productId || '',
                zupass_event_id: pcd.claim.partialTicket.eventId || ''
            })

            email = pcd.claim.partialTicket.attendeeEmail
        })

        const authToken = await zupassLoginMulti({
            email: email,
            zupass_list: ticketInfo,
            next_token: process.env.NEXT_TOKEN || '',
            host: req.headers.host || ''
        })

        res.status(200).send({
            email: email,
            auth_token: authToken
        });
    } catch (e) {
        // The submitted pcdStr does not meet our requirements
        // Return a HTTP error response
        console.error(`[ERROR] ${e}`);
        res.status(400).send("Authentication failed");
    }
}
