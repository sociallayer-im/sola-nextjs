import {NextApiRequest, NextApiResponse} from "next/dist/shared/lib/utils"
import {
    getParticipantDetail,
    getTicketItemDetail,
    myProfile,
    Profile,
    SetTicketPaymentStatus,
    updatePaymentStatus
} from "@/service/solas"
import {createPublicClient, decodeEventLog, http} from 'viem'
import {arbitrum, avalancheFuji, base, mainnet, optimism, polygon} from 'wagmi/chains'
import {payhub_abi, paymentTokenList} from "@/payment_settring"

export interface Props {
    tx: string,
    payer: string,
    payer_address: string
    to_address: string
    token: string
    auth_token: string
    chain_id: number,
    amount: string,
    productId: string,
    itemId: string,
    eventId: number
}

const getChainByChainId = (chainId: number) => {
    const chains = [avalancheFuji, polygon, mainnet, optimism, base, arbitrum]
    const chain = chains.find((item) => item.id === chainId)
    if (!chain) {
        throw new Error('chain not found:' + chainId)
    } else {
        return chain
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const body: Props | undefined = req.body

    if (!body) {
        res.status(200).json({result: 'failed', message: 'No message specified'})
        return
    }

    if (!body.auth_token) {
        res.status(200).json({result: 'failed', message: "Permission deny"})
        return
    }

    let user: undefined | Profile = undefined
    try {
        user = await myProfile({auth_token: body.auth_token})
        if (user.username !== body.payer) {
            res.status(200).json({result: 'failed', message: "Permission deny 1"})
            return
        }
    } catch (e) {
        res.status(200).json({result: 'failed', message: "Permission deny 2"})
        return
    }

    const participant = await getParticipantDetail({
        profile_id: user!.id!,
        ticket_id: Number(body.productId)!
    })

    if (!participant) {
        res.status(200).json({result: 'failed', message: "participant not found"})
        return
    }

    if (participant.payment_status === 'success') {
        res.status(200).json({result: 'success', message: ""})
        return
    }

    const publicClient: any = createPublicClient({
        chain: getChainByChainId(body.chain_id),
        transport: http()
    })

    if (!body.tx) {
        res.status(200).json({result: 'failed', message: "tx needed"})
    }

    const txInfo = await publicClient.getTransactionReceipt({hash: body.tx})
    // console.log('txInfo', txInfo)

    if (!txInfo) {
        res.status(200).json({result: 'failed', message: "tx info not found"})
    }

    // set txhash to save unverified payment
    if (body.tx !== participant.payment_data) {
        const updatePaymentData = await updatePaymentStatus({
            next_token: process.env.NEXT_TOKEN || '',
            auth_token: body.auth_token,
            id: body.eventId,
            status: participant.status,
            payment_status: participant.payment_status,
            payment_data: body.tx,
        })
    }

    const paymentChain = paymentTokenList.find((item) => item.chainId === body.chain_id)
    if (!paymentChain) {
        res.status(200).json({result: 'failed', message: "Invalid chain"})
        return
    }

    const payhubContract = paymentChain.payHub
    const eventLog = txInfo.logs.find((log: any) => {
        return log.address === payhubContract!.toLowerCase()
    })

    if (!eventLog) {
        res.status(200).json({result: 'failed', message: "event log not found"})
        return
    }

    console.log('event', eventLog)

    const decodedLog: {
        eventName: string,
        args: any
    } = decodeEventLog({
        abi: payhub_abi,
        data: eventLog.data,
        topics: eventLog.topics
    })

    // console.log('decoded', decodedLog)

    // console.log('check',
    //     decodedLog.eventName !== 'PaymentTrasnfered',
    //     decodedLog.args.from.toLowerCase() !== body.payer_address.toLowerCase(),
    //     decodedLog.args.to.toLowerCase() !== body.to_address.toLowerCase(),
    //     decodedLog.args.token.toLowerCase() !== body.token.toLowerCase(),
    //     decodedLog.args.productId.toString() !== body.productId.toString(),
    //     decodedLog.args.itemId.toString() !== body.itemId.toString(),
    //     decodedLog.args.amount.toString() !== body.amount
    // )

    if (decodedLog.eventName !== 'PaymentTrasnfered'
        || decodedLog.args.from.toLowerCase() !== body.payer_address.toLowerCase()
        || decodedLog.args.to.toLowerCase() !== body.to_address.toLowerCase()
        || decodedLog.args.token.toLowerCase() !== body.token.toLowerCase()
        || decodedLog.args.productId.toString() !== body.productId.toString()
        || decodedLog.args.itemId.toString() !== body.itemId.toString()
        || decodedLog.args.amount.toString() !== body.amount
    ) {
        res.status(200).json({result: 'failed', message: "verify failed 1"})
    } else {
        // res.status(200).json({result: 'failed', message: "verify failed test"})
        // return

        const ticketItem = await getTicketItemDetail({
            participant_id: participant.id,
        })

        if (!ticketItem) {
            res.status(200).json({result: 'failed', message: "ticket item not found"})
            return
        }

        try {
            const updatePaymentData = await SetTicketPaymentStatus({
                next_token: process.env.NEXT_TOKEN || '',
                chain: paymentChain.chain.toLowerCase(),
                product_id: body.eventId,
                item_id: ticketItem.order_number,
                amount: Number(body.amount),
                txhash: body.tx,
                auth_token: body.auth_token
            })
            res.status(200).json({result: 'success', message: ""})
        } catch (e: any) {
            console.log('e')
            res.status(200).json({result: 'failed', message: e.message || 'verify fail 2'})
        }
    }
}
