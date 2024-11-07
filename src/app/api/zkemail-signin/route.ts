import { NextResponse } from 'next/server'
import {Address, verifyMessage} from 'viem'
import {signinWithZkEmail} from '@/service/solasv2'

export async function POST(req: Request) {
    try {
        const {email, epheAddress, epheSignature} = await req.json()
        console.log(epheAddress, email, epheSignature)

        const valid = await verifyMessage({
            message: 'zkemail sign in',
            signature: epheSignature,
            address: epheAddress as Address
        })

        if (!valid) {
            throw new Error('Message signature invalid')
        }

        const auth_token = await signinWithZkEmail({email, next_token: process.env.NEXT_TOKEN || ''})

        return NextResponse.json({
            result: 'ok',
            auth_token: auth_token
        })
    } catch (e: unknown) {
        console.error(`[ERROR] ${e}`)
        return NextResponse.json({
            result: 'failed',
            message: (e as Error).message
        })
    }
}
