import {ReactNode, useContext, useEffect, useState} from 'react'
import {useContractWrite, usePrepareContractWrite, useWaitForTransaction, useWalletClient, usePublicClient, useAccount} from "wagmi";
import {payhub_abi, paymentTokenList} from "@/payment_settring";
import {parseUnits} from "viem/utils";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";

let loadingRef: any = null

function Erc20TokenPaymentHandler(
    props: {
        content?: (trigger: ((participant_id: number) => void) | undefined, busy: boolean) => ReactNode
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
    const {showLoading} = useContext(DialogsContext)
    const {address} = useAccount()
    const {data: walletClient}: any = useWalletClient({chainId: props.chainId})
    const publicClient : any = usePublicClient({chainId: props.chainId})



    const handlePay = async (participant_id: number) => {
        try {
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
                    parseUnits(props.amount, props.decimals),
                    props.ticketId,
                    participant_id
                ]
            }

            console.log(opt)

            const { request } = await publicClient.simulateContract(opt)

            const hash = await walletClient.writeContract(opt)

            const transaction = await publicClient.waitForTransactionReceipt(
                { hash }
            )

            loadingRef?.()
            console.log('transaction====', transaction)
            !!props.onSuccess && props.onSuccess(hash)
        } catch (e: any) {
            console.log(e.message)
            props.onErrMsg?.(e.message)
        } finally {
            loadingRef?.()
        }
    }

    return (<>
        {props.content ? props.content(async (participant_id) => {
            loadingRef = showLoading()
            await handlePay(participant_id)
        }, false) : null}
    </>)
}

export default Erc20TokenPaymentHandler
