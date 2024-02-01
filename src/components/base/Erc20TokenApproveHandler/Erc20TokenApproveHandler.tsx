import {ReactNode, useContext, useEffect} from 'react'
import {useContractWrite, useAccount, usePrepareContractWrite, useSwitchNetwork, useWaitForTransaction, usePublicClient} from "wagmi";
import {erc20_abi, paymentTokenList} from "@/payment_settring";
import {parseUnits} from "viem/utils";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";

let loadingRef: any = null

function Erc20TokenApproveHandler(
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
    const publicClient: any = usePublicClient({chainId: props.chainId})
    const {address} = useAccount()
    const {showLoading} = useContext(DialogsContext)

    const payHubContract = paymentTokenList.find((item) => item.chainId === props.chainId)?.payHub

    const {config: approveConfig, error: prepareError} = usePrepareContractWrite(
        {
            address: props.token as any,
            abi: erc20_abi,
            functionName: 'approve',
            chainId: props.chainId,
            args: [
                payHubContract,
                BigInt(props.amount)
            ]
        })

    const {data: approveData, isLoading:  approving, isSuccess, write: approve, error: approveError} = useContractWrite(approveConfig)

    const {data, isSuccess: approveSuccess, isError: approveWaitingError, isLoading: approveWaiting} = useWaitForTransaction({
        hash: approveData?.hash as `0x${string}`,
        chainId: props.chainId
    })

    useEffect(() => {
        if (address) {
            publicClient.readContract({
                address: props.token as any,
                abi: erc20_abi,
                functionName: 'allowance',
                chainId: props.chainId,
                args: [
                    address,
                    payHubContract
                ]
            }).then((res: any) => {
                if (res !== undefined && res >= BigInt(props.amount)) {
                    props.onSuccess?.('')
                }
            })
        }
    }, [address])

    useEffect(() => {
        if (isSuccess) {
            loadingRef && loadingRef()
            props.onSuccess?.(approveData?.hash as any)
        }
    }, [approveSuccess])

    useEffect(() => {
        if (prepareError) {
            if (prepareError.message?.includes('Insufficient')) {
                props.onErrMsg?.('Insufficient balance')
            } else {
                props.onErrMsg?.(prepareError.message || prepareError.toString())
            }

            loadingRef && loadingRef()
        } else if (approveWaitingError) {
            props.onErrMsg?.('transaction failed')
            loadingRef && loadingRef()
        } else if (approveError) {
            if (!approveError.message?.includes('rejected')) {
                props.onErrMsg?.(approveError.message)
            } else {
                props.onErrMsg?.('')
            }

            loadingRef && loadingRef()
        } else {
            props.onErrMsg?.('')
        }
    }, [prepareError, approveError, approveWaitingError])

    return (<>
        {props.content ? props.content(() => {
            if (!!approve) {
                loadingRef = showLoading()
                approve?.()
            }
        }, approving || approveWaiting || !approve) : null
        }
    </>)
}

export default Erc20TokenApproveHandler
