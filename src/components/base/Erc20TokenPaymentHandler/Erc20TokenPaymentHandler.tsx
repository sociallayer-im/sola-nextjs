import {ReactNode, useContext, useState} from 'react'
import {useAccount, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient} from "wagmi";
import {payhub_abi, paymentTokenList} from "@/payment_settring";
import {getParticipantDetail, joinEvent} from "@/service/solas";
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
        eventId: number
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

    const _verifyPayment = async (participant_id: number, tx: string) => {
        return new Promise((resolve, reject) => {
            let remainTimes = 5
            const checkParticipant = async () => {
                try {
                    const verify = await fetch.post({
                        url: '/api/payment/verify',
                        data: {
                            tx,
                            payer: user.userName,
                            payer_address: address,
                            token: props.token,
                            auth_token: user.authToken || '',
                            chain_id: props.chainId,
                            amount: props.amount,
                            productId: props.ticketId,
                            itemId: participant_id,
                            eventId: props.eventId
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
            if (!!participant && !!participant.payment_data) {
                if (participant.payment_status === 'success') {
                    setBusy(false)
                    setSending(false)
                    setVerifying(false)
                    !!props.onSuccess && props.onSuccess('')
                    return
                } else {
                    setBusy(true)
                    setSending(false)
                    setVerifying(true)
                    const verify = await _verifyPayment(participant.id, participant.payment_data!)
                    if (!!verify) {
                        setBusy(false)
                        setSending(false)
                        setVerifying(false)
                        !!props.onSuccess && props.onSuccess('')
                        return
                    } else {
                        setBusy(false)
                        setSending(false)
                        setVerifying(false)
                        throw new Error('Verify failed')
                    }
                }
            }

            // create an order
            const join = await joinEvent(
                {
                    id: props.eventId,
                    auth_token: user.authToken || '',
                    ticket_id: props.ticketId,
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
                    props.ticketId,
                    join.id
                ]
            }

            console.log(opt)

            const {request} = await publicClient.simulateContract(opt)

            const hash = await walletClient.writeContract(request)

            const transaction = await publicClient.waitForTransactionReceipt(
                {hash}
            )

            setSending(false)
            setVerifying(true)

            const verify = await _verifyPayment(join.id, hash)
            setVerifying(false)

            if (!!verify) {
                loadingRef?.()
                console.log('transaction====', transaction)
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
