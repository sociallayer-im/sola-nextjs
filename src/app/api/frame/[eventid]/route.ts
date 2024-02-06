import { NextRequest, NextResponse } from 'next/server';
import { FrameRequest, getFrameMessage, getFrameHtmlResponse } from '@coinbase/onchainkit';

async function handler(req: NextRequest,  eventid: string) : Promise<NextResponse>
{
    let accountAddress: string | undefined = '';

   try {
       const body: FrameRequest = await req.json();
       const { isValid, message } = await getFrameMessage(body, { neynarApiKey: 'NEYNAR_ONCHAIN_KIT' })

        const redirectUrl = `${process.env.NEXT_PUBLIC_HOST || 'https://app.sola.day'}/event/detail/${eventid}`
       // view event detail

       if (message?.button === 1) {
           return NextResponse.redirect(
               redirectUrl,
               { status: 302 },
           );
       }

       // join event
       if (message?.button === 2) {
           if (isValid) {
               accountAddress = message!.interactor.verified_accounts[0];
           }

           console.log('[Farcast account address]:', accountAddress)

           return NextResponse.redirect(
               redirectUrl,
               { status: 302 }
           )
       }

       return NextResponse.json({error: 'invalid'}, { status: 500 })
   } catch (e: any) {
         console.error(e);
         return NextResponse.json({error: e.message}, { status: 500 })
   }

}

export async function POST(req: NextRequest, { params }: { params: { eventid: string } }): Promise<Response> {
    return handler(req, params.eventid);
}

export const dynamic = 'force-dynamic';
