import {forwardRef, ReactNode, useContext, useEffect, useImperativeHandle, useState} from 'react'
import {useAccount, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient} from "wagmi";
import {erc20_abi, paymentTokenList} from "@/payment_settring";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";


function Erc20TokenApproveHandler(
    props: {
        content?: (trigger: (() => void) | undefined, busy: boolean) => ReactNode
        token: string
        decimals: number
        amount: string
        to: string
        chainId: number
        methodId: number
        onResult?: (needApprove: boolean, hash?: string) => any
        onErrMsg?: (message: string) => any
    }, ref: any
) {
    const publicClient: any = usePublicClient({chainId: props.chainId})
    const {data: walletClient}: any = useWalletClient({chainId: props.chainId})
    const {address} = useAccount()
    const {showToast} = useContext(DialogsContext)
    const [busy, setBusy] = useState(false)
    const {switchNetworkAsync} = useSwitchNetwork()
    const {chain} = useNetwork()


    const reFleshAllowance = () => {
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
                    console.log('BigInt(props.amount)BigInt(props.amount)', BigInt(props.amount))
                    props.onResult?.(false)
                } else {
                    props.onResult?.(true)
                }
            }).finally(() => {
                setBusy(false)
            })
        }
    }

    useImperativeHandle(ref, () => {
        return {
            reFleshAllowance
        }
    })

    const payHubContract = paymentTokenList.find((item) => item.chainId === props.chainId)?.payHub

    const handleApprove = async () => {
        try {
            setBusy(true)
            if (chain?.id !== props.chainId) {
                await switchNetworkAsync?.(props.chainId)
                setBusy(false)
                return
            }

            const approveAmount = process.env.NEXT_PUBLIC_PAYMENT_SETTING === 'production'
                ? (BigInt(props.amount) > BigInt(500 * 10 ** props.decimals) ? BigInt(props.amount) : BigInt(500 * 10 ** props.decimals))
                : BigInt(props.amount)

            const opt = {
                address: props.token as any,
                abi: erc20_abi,
                functionName: 'approve',
                chainId: props.chainId,
                account: address,
                args: [
                    payHubContract,
                    approveAmount
                ]
            }

            console.log(opt)
            const {request} = await publicClient.simulateContract(opt)
            const hash = await walletClient.writeContract(request)
            const transaction = await publicClient.waitForTransactionReceipt(
                {hash}
            )


            function sleep(time:number){
                return new Promise((resolve) => setTimeout(resolve, time));
            }

            await sleep(5000)

            showToast('Approve success')

            !!props.onResult && props.onResult(false, hash)
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
        reFleshAllowance()
    }, [address, props.token, props.chainId, props.amount])

    return (<>
        {props.content ? props.content(() => {
            handleApprove()
        }, busy) : null
        }
    </>)
}

export default forwardRef(Erc20TokenApproveHandler)
