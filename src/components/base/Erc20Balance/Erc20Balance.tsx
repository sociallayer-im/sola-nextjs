import {useReadContract} from "wagmi";
import {erc20_abi} from "@/payment_setting";
import {formatUnits} from "viem/utils";
import {useEffect} from "react";

function Erc20Balance(props: {
    token: string
    chanId: number
    account: string
    decimals: number
    onChange?: (balance: string) => any
}) {
    const {data: balance} = useReadContract({
        abi: erc20_abi,
        address: props.token as any,
        chainId: props.chanId,
        functionName: 'balanceOf',
        args: [
            props.account
        ]
    })


    useEffect(() => {
        if (balance !== undefined && balance !== null) {
            console.log('balance =>', balance)
            props.onChange?.(formatUnits(balance as any, 0))
        }
    }, [balance])


    return (
        <span>{(balance !== undefined && balance !== null) ? formatUnits(balance as any, props.decimals) : '--'}</span>)
}

export default Erc20Balance
