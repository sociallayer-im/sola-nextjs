import {forwardRef, ReactNode, useContext, useEffect, useImperativeHandle, useState} from 'react'
import {useAccount, useContractRead, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient} from "wagmi";
import {erc20_abi, paymentTokenList} from "@/payment_setting";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";

function sleep(time:number){
    return new Promise((resolve) => setTimeout(resolve, time));
}


const MAX_APPROVAL_ACCOUNT = '115792089237316195423570985008687907853269984665640564039457584007913129639935'


function Erc20TokenApproveHandler(
    props: {
        content?: (trigger: (() => void) | undefined, busy: boolean) => ReactNode
        token: string
        decimals: number
        amount: string
        chainId: number
        onResult?: (needApprove: boolean, hash?: string) => any
        onErrMsg?: (message: string) => any
    }, ref: any
) {
    const publicClient: any = usePublicClient({chainId: props.chainId})
    const {data: walletClient}: any = useWalletClient({chainId: props.chainId})
    const {address} = useAccount()
    const {showToast} = useContext(DialogsContext)
    const [busy, setBusy] = useState(true)
    const {switchNetworkAsync} = useSwitchNetwork()
    const {chain} = useNetwork()

    const pollingQueryTx = async (tx: string) => {
        let leftTimes = 10;
        while (leftTimes > 0) {
            try {
                await publicClient.waitForTransactionReceipt({hash: tx});
                return; // Exit if successful
            } catch (e) {
                leftTimes--;
                if (leftTimes === 0) {
                    throw new Error('Transaction receipt retrieval failed after 10 attempts');
                }
                await sleep(1000); // Wait for 1 second before retrying
            }
        }
    }


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
                ? BigInt(MAX_APPROVAL_ACCOUNT)
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
            // const transaction = await publicClient.waitForTransactionReceipt(
            //     {hash}
            // )
            await pollingQueryTx(hash)

            await sleep(5000)


            const allowance = await publicClient.readContract({
                address: props.token as any,
                abi: erc20_abi,
                functionName: 'allowance',
                chainId: props.chainId,
                args: [
                    address,
                    payHubContract
                ]
            })

            if (allowance >= BigInt(props.amount)) {
                !!props.onResult && props.onResult(false, hash)
            }
            showToast('Approve success')

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
