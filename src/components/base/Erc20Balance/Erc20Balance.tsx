import {useState} from 'react'
import {useContractRead} from "wagmi";
import {erc20_abi} from "@/payment_settring";
import {formatUnits} from "viem/utils";

function Erc20Balance(props: {
    token: string
    chanId: number
    account: string
    decimals: number
}) {
    const {data: balance, isSuccess: success} = useContractRead({
        address: props.token as any,
        abi: erc20_abi,
        chainId: props.chanId,
        functionName: 'balanceOf',
        args: [
            props.account
        ]
    })

    return (<span>{balance !== undefined ? formatUnits(balance as any, props.decimals) : ''}</span>)
}

export default Erc20Balance
