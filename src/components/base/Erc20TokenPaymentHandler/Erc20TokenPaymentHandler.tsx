import {ReactNode, useContext, useState} from 'react'
import {useAccount, usePublicClient, useWalletClient, useSwitchNetwork, useNetwork} from "wagmi";
import {payhub_abi, paymentTokenList} from "@/payment_settring";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import {getParticipantDetail} from "@/service/solas";

let loadingRef: any = null

function Erc20TokenPaymentHandler(
    props: {
        content?: (
            trigger: ((participant_id: number) => void) | undefined,
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
    const { switchNetworkAsync } = useSwitchNetwork()
    const { chain } = useNetwork()

    const [busy, setBusy] = useState(false)
    const [sending, setSending] = useState(false)
    const [verifying, setVerifying] = useState(false)

    const verifyPayment = async (participant_id: number) => {
        return new Promise((resolve, reject) => {
            let remainTimes = 60
            const checkParticipant = async () => {
                try {
                    const participant = await getParticipantDetail({id: participant_id})
                    if (!participant) {
                        reject(new Error('Participant not found'))
                    }

                    if (participant?.payment_status === 'fail') {
                        reject(new Error('Fail for verify'))
                    }


                    if (participant?.payment_status !== 'success') {
                        remainTimes--
                        if (remainTimes > 0) {
                            setTimeout(checkParticipant, 1000)
                        } else {
                            reject(new Error('Error: Verify timeout'))
                        }
                    } else {
                        resolve(true)
                    }
                } catch (e: any) {
                    reject(e)
                }
            }

            checkParticipant()
        })
    }


    const handlePay = async (participant_id: number) => {
        try {
            setBusy(true)
            setSending(true)
            const participant = await getParticipantDetail({id: participant_id})

            if (participant) {
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
                    const verify = await verifyPayment(participant_id)
                    if (verify) {
                        setBusy(false)
                        setSending(false)
                        setVerifying(false)
                        !!props.onSuccess && props.onSuccess('')
                        return
                    }
                }
            }


            if (chain?.id !== props.chainId) {
                await switchNetworkAsync?.(props.chainId)
            }

            const payhubContract = paymentTokenList.find((item) => item.chainId === props.chainId)?.payHub
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
                    participant_id
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
            const verify = await verifyPayment(participant_id)
            setVerifying(false)

            loadingRef?.()
            console.log('transaction====', transaction)
            !!props.onSuccess && props.onSuccess(hash)
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
        {props.content ? props.content(async (participant_id) => {
            await handlePay(participant_id)
        }, busy, sending, verifying) : null}
    </>)
}

export default Erc20TokenPaymentHandler
