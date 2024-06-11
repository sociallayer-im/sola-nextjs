import {NextApiRequest, NextApiResponse} from "next/dist/shared/lib/utils";
// @ts-ignore
import {authenticate} from "@pcd/zuauth/server";
import {tickets} from "@/service/zupass/tickets";
import {zupassLoginMulti} from "@/service/solas";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const pcdStr = req.body.pcdStr; // Use your server's request object here
        const pcd = await authenticate(pcdStr, '12345', tickets);
        const user = pcd.claim.partialTicket

        const authToken = await zupassLoginMulti({
            email: user.attendeeEmail as string,
            zupass_list: [
                {
                    zupass_product_id: user.productId || '',
                    zupass_event_id: user.eventId || ''
                }
            ],
            next_token: process.env.NEXT_TOKEN || '',
            host: req.headers.host || ''
        })

        res.status(200).send({
            email: user.attendeeEmail,
            auth_token: authToken
        });
        // Save the user's email address, create a session, etc.
    } catch (e) {
        // The submitted pcdStr does not meet our requirements
        // Return a HTTP error response
        console.error(`[ERROR] ${e}`);
        res.status(400).send("Authentication failed");
    }
}
