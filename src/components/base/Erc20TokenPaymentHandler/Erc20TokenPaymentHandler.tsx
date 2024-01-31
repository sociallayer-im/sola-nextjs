import {ReactNode, useContext, useEffect} from 'react'
import {useContractWrite, usePrepareContractWrite, useSwitchNetwork, useWaitForTransaction} from "wagmi";
import {erc20_abi} from "@/payment_settring";
import {parseUnits} from "viem/utils";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";

let loadingRef: any = null

function Erc20TokenPaymentHandler(
    props: {
        content?: (trigger: (() => void) | undefined, busy: boolean) => ReactNode
        token: string
        decimals: number
        amount: string
        to: string
        chainId: number
        onSuccess?: (hash: string) => any
        onErrMsg?: (message: string) => any
    }
) {
    const {switchNetwork} = useSwitchNetwork()
    const {showLoading} = useContext(DialogsContext)

    const {config, error: prepareError} = usePrepareContractWrite(
        {
            address: props.token as any,
            abi: erc20_abi,
            functionName: 'transfer',
            chainId: props.chainId,
            args: [
                props.to,
                parseUnits(props.amount, props.decimals)
            ]
        })

    const {data: sendingData, isLoading: sending, isSuccess, write, error: writeError} = useContractWrite(config)

    const {data, isSuccess: success, isError: waitingError, isLoading: waiting} = useWaitForTransaction({
        hash: sendingData?.hash as `0x${string}`,
        timeout: 60_000,
    })

    useEffect(() => {
        if (isSuccess) {
            loadingRef && loadingRef()
            props.onSuccess?.(sendingData?.hash as any)
        }
    }, [success])

    useEffect(() => {
        if (prepareError) {
            if (prepareError.message.includes('Insufficient')) {
                props.onErrMsg?.('Insufficient balance')
            } else {
                props.onErrMsg?.(prepareError.message)
            }

            loadingRef && loadingRef()
        } else if (waitingError) {
            props.onErrMsg?.('transaction failed')
            loadingRef && loadingRef()
        } else if (writeError) {
            if (!writeError.message.includes('rejected')) {
                props.onErrMsg?.(writeError.message)
            } else {
                props.onErrMsg?.('')
            }

            loadingRef && loadingRef()
        } else {
            props.onErrMsg?.('')
        }
    }, [prepareError, waitingError, writeError])

    return (<>
        {props.content ? props.content(() => {
            loadingRef = showLoading()
            switchNetwork?.(43113)
            write?.()
        }, sending || waiting) : null}
    </>)
}

export default Erc20TokenPaymentHandler
