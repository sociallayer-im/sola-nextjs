import { createInstance } from 'dotbit'
const dotbit = createInstance()

export interface DotBitAccount {
    account: string,
    isSubAccount: boolean,
    mainAccount: string,
    indexerId: number,
    indexerUrl: string,
    image:string,
}

export async function getDotBitAccount (owner: string): Promise<DotBitAccount[]> {
    const list = await dotbit.accountsOfOwner({
        key: owner,
        coin_type: "60" as any// The coin type of ETH
    })

    return list.map((item:any) => {
        return {
            image:'/images/dotbit.png',
            account: item.account,
            isSubAccount: item.isSubAccount || false,
            mainAccount: item.mainAccount || '--',
            indexerId: item.bitIndexer.rpc.id,
            indexerUrl: item.bitIndexer.rpc.url,
        } as DotBitAccount
    })


}

