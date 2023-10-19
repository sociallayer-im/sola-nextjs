// 'ReadMe-API-Explorer'

import { AlchemyMultichainClient } from './alchemy-multichain-client';
import { Network,  } from 'alchemy-sdk';

export interface CurrencyBalance {
    eth: string,
    matic: string,
    arb: string,
    opt: string,
    astar: string
}

export interface NftDetail {
    title: string,
    image: string,
    contract: string,
    id: string,
    standard: string,
    chain: string,
    explorer: string,
}

export const ExplorerUrls = {
    eth: 'https://etherscan.io/address/',
    matic: 'https://polygonscan.com/address/',
    arb: 'https://arbiscan.io/address/',
    opt: 'https://optimistic.etherscan.io/address/',
    astar: 'https://astar.subscan.io/account/'
} as {[key : string]: string }

class Alchemy {
    alchemy: AlchemyMultichainClient

    constructor() {
        const defaultConfig = {
            apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY,
            network: Network.ETH_MAINNET
        };

        const overrides = {
            // TODO: Replace with your API keys.
            [Network.MATIC_MAINNET]: { apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY, maxRetries: 10 }, // Replace with your Matic Alchemy API key.
            [Network.ARB_MAINNET]: { apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY }, // Replace with your Arbitrum Alchemy API key.
            [Network.OPT_MAINNET]: { apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY }, // Replace with your Arbitrum Alchemy API key.
            [Network.ASTAR_MAINNET]: { apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY } // Replace with your Arbitrum Alchemy API key.
        };
        this.alchemy = new AlchemyMultichainClient(defaultConfig, overrides);
    }

    async getBalance(owner: string): Promise<CurrencyBalance> {
        let balance:CurrencyBalance = {
            eth: '',
            matic: '',
            arb: '',
            opt: '',
            astar: ''
        }

        const fetch = await Promise.all([
            this.alchemy.forNetwork(Network.ETH_MAINNET).core.getBalance(owner).then(res=> {
                balance.eth = (Number(res.toString()) / 1000000000000000000).toFixed(4)
            }),
            this.alchemy.forNetwork(Network.POLYGONZKEVM_MAINNET).core.getBalance(owner).then(res=> {
                console.log('matic', res)
                balance.matic = (Number(res.toString()) / 1000000000000000000).toFixed(4)
            }),
            this.alchemy.forNetwork(Network.ARB_MAINNET).core.getBalance(owner).then(res=> {
                console.log('arb', res)
                balance.arb = (Number(res.toString()) / 1000000000000000000).toFixed(4)
            }),
            this.alchemy.forNetwork(Network.OPT_MAINNET).core.getBalance(owner).then(res=> {
                console.log('opt', res)
                balance.opt = (Number(res.toString()) / 1000000000000000000).toFixed(4)
            }),
            this.alchemy.forNetwork(Network.ASTAR_MAINNET).core.getBalance(owner).then(res=> {
                console.log('astar', res)
                balance.astar = (Number(res.toString()) / 1000000000000000000).toFixed(4)
            }),
        ])

        console.log('balance', balance)

        return balance
    }

    async getNftBalance(owner: string, type:'ens' | 'pns'): Promise<NftDetail[]> {
        if (type=== 'ens') {
            const list = await this.alchemy.forNetwork(Network.ETH_MAINNET).nft.getNftsForOwner(owner, {contractAddresses:['0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85']})
            return  list.ownedNfts.map((item: any) => {
                return {
                    title: item.title,
                    image: item.rawMetadata?.image_url,
                    contract: item.contract.address,
                    id: item.tokenId,
                    standard: 'ERC721',
                    chain: 'Ethereuem',
                    explorer: ExplorerUrls.eth + item.contract.address
                } as NftDetail
            })
        } else {
            return []
        }
    }
}

const alchemy = new Alchemy();
export default alchemy;
