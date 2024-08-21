import {ReactNode, useContext, useState} from 'react'
import {useAccount, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient} from "wagmi";
import {payhub_abi, paymentTokenList} from "@/payment_settring";
import {getParticipantDetail, getTicketItemDetail, rsvp} from "@/service/solas";
import UserContext from "@/components/provider/UserProvider/UserContext";
import fetch from "@/utils/fetch"

let loadingRef: any = null

function Erc20TokenPaymentHandler(
    props: {
        content?: (
            trigger: (() => void) | undefined,
            busy: boolean,
            sending: boolean,
            verifying: boolean) => ReactNode
        token: string
        decimals: number
        amount: string
        to: string
        chainId: number
        ticketId: number
        methodId: number
        eventId: number
        promo_code?: string,
        onSuccess?: (hash: string) => any
        onErrMsg?: (message: string) => any
    }
) {
    const {address} = useAccount()
    const {data: walletClient}: any = useWalletClient({chainId: props.chainId})
    const publicClient: any = usePublicClient({chainId: props.chainId})
    const {switchNetworkAsync} = useSwitchNetwork()
    const {chain} = useNetwork()
    const {user} = useContext(UserContext)

    const [busy, setBusy] = useState(false)
    const [sending, setSending] = useState(false)
    const [verifying, setVerifying] = useState(false)

    const _verifyPayment = async (order_number: string, tx: string) => {
        return new Promise((resolve, reject) => {
            let remainTimes = 10
            const checkParticipant = async () => {
                try {
                    const verify = await fetch.post({
                        url: '/api/verify_payment',
                        data: {
                            tx,
                            order_number
                        }
                    })

                    if (verify.data.result !== 'success') {
                        remainTimes--
                        if (remainTimes > 0) {
                            setTimeout(checkParticipant, 1000)
                        } else {
                            console.warn('Error: Verify timeout')
                            resolve(false)
                        }
                    } else {
                        resolve(true)
                    }
                } catch (e: any) {
                    console.warn('Error: Verify timeout')
                    resolve(false)
                }
            }

            checkParticipant()
        })
    }

    const handlePay = async () => {
        try {
            setBusy(true)
            setSending(true)

            const payhubContract = paymentTokenList.find((item) => item.chainId === props.chainId)?.payHub
            const participant = await getParticipantDetail({event_id: props.eventId, profile_id: user.id!})

            // check already paid
            if (!!participant) {
                if (participant.payment_status === 'succeeded') {
                    setBusy(false)
                    setSending(false)
                    setVerifying(false)
                    !!props.onSuccess && props.onSuccess('')
                    return
                } else {
                    const ticketItem = await getTicketItemDetail({participant_id: participant.id})
                    if (!!ticketItem) {
                        const order = getOrder(ticketItem.order_number)
                        if (!!order) {
                            setBusy(true)
                            setSending(false)
                            setVerifying(true)
                            const verify = await _verifyPayment(ticketItem.order_number, order.tx)
                            if (!!verify) {
                                setBusy(false)
                                setSending(false)
                                setVerifying(false)
                                !!props.onSuccess && props.onSuccess('')
                                deleteOrder(ticketItem.order_number)
                                return
                            } else {
                                setBusy(false)
                                setSending(false)
                                setVerifying(false)
                                throw new Error('Verify failed')
                            }
                        }
                    }
                }
            }

            if (chain?.id !== props.chainId) {
                await switchNetworkAsync?.(props.chainId)
                setBusy(false)
                setSending(false)
                setVerifying(false)
                return
            }

            // create an order
            const join = await rsvp(
                {
                    auth_token: user.authToken || '',
                    id: props.eventId,
                    ticket_id: props.ticketId,
                    payment_method_id: props.methodId,
                    promo_code: props.promo_code
                }
            )

            // pay
            const opt = {
                address: payhubContract as any,
                abi: payhub_abi,
                functionName: 'transfer',
                chainId: props.chainId,
                account: address,
                args: [
                    props.to,
                    props.token,
                    BigInt(props.amount),
                    join.ticket_item.event_id, // productId
                    join.ticket_item.order_number // itemId
                ]
            }

            console.log(opt)

            const {request} = await publicClient.simulateContract(opt)

            const hash = await walletClient.writeContract(request)

            const transaction = await publicClient.waitForTransactionReceipt({hash})

            setSending(false)
            setVerifying(true)
            addOrder(join.ticket_item.order_number, hash)


            const verify = await _verifyPayment(join.ticket_item.order_number, hash)
            setVerifying(false)

            if (!!verify) {
                loadingRef?.()
                console.log('transaction: ', transaction)
                deleteOrder(join.ticket_item.order_number)
                !!props.onSuccess && props.onSuccess(hash)
            } else {
                throw new Error('Verify fail')
            }

        } catch (e: any) {
            console.error(e)
            if (!e.message.includes('rejected')) {
                props.onErrMsg?.(e.message)
            }

        } finally {
            setTimeout(() => {
                setBusy(false)
                setSending(false)
                setVerifying(false)
            }, 300)
        }
    }


    return (<>
        {props.content ? props.content(async () => {
            await handlePay()
        }, busy, sending, verifying) : null}
    </>)
}

export default Erc20TokenPaymentHandler

// 实现一组方法：要求在localstorage中存储一个子元素为{ticket_order: string, tx: string} 的数组， 实现增删改查。
interface PendingOrder {
    order_number: string
    tx: string
}

function getOrders() {
    const orders = localStorage.getItem('pending_orders')
    return orders ? JSON.parse(orders) as PendingOrder[] : []
}

function saveOrders(orders: PendingOrder[]) {
    localStorage.setItem('pending_orders', JSON.stringify(orders))
}

function addOrder(order_number: string, tx: string) {
    const orders = getOrders()
    orders.push({order_number, tx})
    saveOrders(orders)
}

function deleteOrder(order_number: string) {
    let orders = getOrders();
    orders = orders.filter(order => order.order_number !== order_number);
    saveOrders(orders);
}

function updateOrderTx(ticket_order: PendingOrder) {
    const orders = getOrders();
    const orderIndex = orders.findIndex(order => order.order_number === ticket_order.order_number);
    if (orderIndex !== -1) {
        orders[orderIndex].tx = ticket_order.tx;
        saveOrders(orders);
    }
}

function getOrder(order_number: string) {
    const orders = getOrders();
    return orders.find(order => order.order_number === order_number);
}



