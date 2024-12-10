import {NextApiRequest, NextApiResponse} from "next/dist/shared/lib/utils"
import {
    getParticipantDetail,
    getPaymentMethod,
    getTicketItemDetail,
    myProfile,
    Profile,
    SetTicketPaymentStatus
} from "@/service/solas"
import {createPublicClient, decodeEventLog, http} from 'viem'
import {arbitrum, avalancheFuji, base, mainnet, optimism, polygon} from 'wagmi/chains'
import {payhub_abi, paymentTokenList} from "@/payment_setting"

const ethChain = {
    ...mainnet,
    rpcUrls: {
        alchemy: {
            http: ['https://eth-mainnet.g.alchemy.com/v2'],
            webSocket: ['wss://eth-mainnet.g.alchemy.com/v2'],
        },
        infura: {
            http: ['https://mainnet.infura.io/v3'],
            webSocket: ['wss://mainnet.infura.io/ws/v3'],
        },
        default: {
            http: ['https://mainnet.infura.io/v3/df69a66a46e94a1bb0e0f2914af8b403'],
        },
        public: {
            http: ['https://mainnet.infura.io/v3/df69a66a46e94a1bb0e0f2914af8b403'],
        },
    },
}

export interface Props {
    tx: string, // 交易hash
    order_number: string, // event log 的 itemId
}

const getChainByChainId = (chainName: string) => {
    const chains = [avalancheFuji, polygon, ethChain, optimism, base, arbitrum]
    return chains.find((item) => item.name.includes(chainName) || item.name.toLowerCase().includes(chainName))
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const body: Props | undefined = req.body

        if (!body) {
            res.status(200).json({result: 'failed', message: 'No message specified'})
            return
        }

        if (!body.order_number) {
            res.status(200).json({result: 'failed', message: "order number needed"})
            return
        }

        const ticketItem = await getTicketItemDetail({
            order_number: body.order_number
        })

        if (!ticketItem) {
            res.status(200).json({result: 'failed', message: "Ticket item not exist"})
            return
        }

        if (ticketItem.status === 'succeeded') {
            res.status(200).json({result: 'success', message: ""})
            return
        }

        const paymentMethod = await getPaymentMethod({id: ticketItem.payment_method_id})

        if (!paymentMethod) {
            res.status(200).json({result: 'failed', message: "Payment method not found"})
            return
        }

        const paymentChain = getChainByChainId(ticketItem.chain!)
        if (!paymentChain) {
            res.status(200).json({result: 'failed', message: "Invalid chain"})
            return
        }

        const publicClient: any = createPublicClient({
            chain: paymentChain,
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
        // if (body.tx !== participant.payment_data) {
        //     const updatePaymentData = await updatePaymentStatus({
        //         next_token: process.env.NEXT_TOKEN || '',
        //         auth_token: body.auth_token,
        //         id: body.eventId,
        //         status: participant.status,
        //         payment_status: participant.payment_status,
        //         payment_data: body.tx,
        //     })
        // }

        const paymentInfo = paymentTokenList.find((item) => item.id === ticketItem.chain)
        if (!paymentInfo) {
            res.status(200).json({result: 'failed', message: "payment info not found"})
            return
        }

        const paymentTokenAddress = paymentInfo.tokenList.find((item) => item.id === paymentMethod.token_name)
        if (!paymentTokenAddress) {
            res.status(200).json({result: 'failed', message: "payment token not found"})
            return
        }

        const payhubContract = paymentInfo.payHub
        const eventLog = txInfo.logs.find((log: any) => {
            return log.address === payhubContract!.toLowerCase()
        })

        if (!eventLog) {
            res.status(200).json({result: 'failed', message: "event log not found"})
            return
        }

        // console.log('event', eventLog)

        const decodedLog: {
            eventName: string,
            args: any
        } = decodeEventLog({
            abi: payhub_abi,
            data: eventLog.data,
            topics: eventLog.topics
        })

        // console.log('decoded', decodedLog)

        // console.log('to', decodedLog.args.to.toLowerCase(), paymentMethod.receiver_address?.toLowerCase())
        // console.log('token', decodedLog.args.token.toLowerCase(), paymentTokenAddress.contract.toLowerCase())
        // console.log('productId', decodedLog.args.productId.toString(), ticketItem.event_id.toString())
        // console.log('itemId', decodedLog.args.itemId.toString(), ticketItem.order_number.toString())
        // console.log('amount', decodedLog.args.amount.toString(), ticketItem.amount?.toString())

        if (decodedLog.eventName !== 'PaymentTrasnfered'
            || decodedLog.args.to.toLowerCase() !== paymentMethod.receiver_address?.toLowerCase()
            || decodedLog.args.token.toLowerCase() !== paymentTokenAddress.contract.toLowerCase()
            || decodedLog.args.productId.toString() !== ticketItem.event_id.toString()
            || decodedLog.args.itemId.toString() !== ticketItem.order_number.toString()
            || decodedLog.args.amount.toString() !== ticketItem.amount?.toString()
        ) {
            res.status(200).json({result: 'failed', message: "verify failed 1"})
        } else {
            // res.status(200).json({result: 'failed', message: "verify failed test"})
            // return

            const updatePaymentData = await SetTicketPaymentStatus({
                next_token: process.env.NEXT_TOKEN || '',
                chain: ticketItem.chain!,
                product_id: ticketItem.event_id,
                item_id: ticketItem.order_number!,
                amount: Number(ticketItem.amount!),
                txhash: body.tx,
                sender_address: decodedLog.args.from
            })
            res.status(200).json({result: 'success', message: ""})
        }
    } catch (e: any) {
        console.error(`payment verify fail: `, e)
        res.status(200).json({result: 'failed', message: e.message || 'verify fail 2'})
    }
}
