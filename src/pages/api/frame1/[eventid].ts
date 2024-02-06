import { NextApiRequest, NextApiResponse } from "next";
import { FrameRequest, getFrameMessage, getFrameHtmlResponse } from '@coinbase/onchainkit';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let accountAddress: string | undefined = '';
    const { eventid } = req.query

   try {
       const body: FrameRequest = await req.body;
       const { isValid, message } = await getFrameMessage(body, { neynarApiKey: 'NEYNAR_ONCHAIN_KIT' })


       // view event detail
       if (message?.button === 1) {
           return res.status(302).redirect(`${process.env.NEXT_PUBLIC_HOST || 'https://app.sola.day'}/event/detail/${eventid}`);
       }

       // join event
       if (message?.button === 2) {
           if (isValid) {
               accountAddress = message!.interactor.verified_accounts[0];
           }

           console.log('[Farcast account address]:', accountAddress)

           return res.status(302).redirect(`${process.env.NEXT_PUBLIC_HOST || 'https://app.sola.day'}/event/detail/${eventid}`);
       }
   } catch (e: any) {
         console.error(e);
         return res.status(500).send({error: e.message});
   }
}
