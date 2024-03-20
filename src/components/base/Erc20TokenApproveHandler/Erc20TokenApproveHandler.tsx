import {ReactNode, useContext, useEffect, useState} from 'react'
import {
    useContractWrite,
    useAccount,
    usePrepareContractWrite,
    useSwitchNetwork,
    useWaitForTransaction,
    usePublicClient,
    useNetwork, useWalletClient
} from "wagmi";
import {erc20_abi, payhub_abi, paymentTokenList} from "@/payment_settring";
import {parseUnits} from "viem/utils";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";


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
    const {data: walletClient}: any = useWalletClient({chainId: props.chainId})
    const {address} = useAccount()
    const {showLoading} = useContext(DialogsContext)
    const [busy, setBusy] = useState(false)
    const { switchNetworkAsync } = useSwitchNetwork()
    const { chain } = useNetwork()

    const payHubContract = paymentTokenList.find((item) => item.chainId === props.chainId)?.payHub

    const handleApprove = async () => {
        try {
            setBusy(true)
            if (chain?.id !== props.chainId) {
                await switchNetworkAsync?.(props.chainId)
            }

            const opt = {
                address: props.token as any,
                abi: erc20_abi,
                functionName: 'approve',
                chainId: props.chainId,
                account: address,
                args: [
                    payHubContract,
                    BigInt(props.amount)
                ]
            }

            console.log(opt)

            const {request} = await publicClient.simulateContract(opt)
            const hash = await walletClient.writeContract(request)
            const transaction = await publicClient.waitForTransactionReceipt(
                {hash}
            )

            !!props.onSuccess && props.onSuccess(hash)
        } catch (e: any) {
            console.error(e)
            if (!e.message.includes('rejected')) {
                props.onErrMsg?.(e.message)
            }
        } finally {
            setBusy(false)
        }
    }

    useEffect(() => {
        if (address) {
            setBusy(true)
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
            }).finally(() => {
                setBusy(false)
            })
        }
    }, [address])

    return (<>
        {props.content ? props.content(() => {
            handleApprove()
        }, busy) : null
        }
    </>)
}

export default Erc20TokenApproveHandler
