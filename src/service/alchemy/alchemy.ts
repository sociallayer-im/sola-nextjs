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
                balance.matic = (Number(res.toString()) / 1000000000000000000).toFixed(4)
            }),
            this.alchemy.forNetwork(Network.ARB_MAINNET).core.getBalance(owner).then(res=> {
                balance.arb = (Number(res.toString()) / 1000000000000000000).toFixed(4)
            }),
            this.alchemy.forNetwork(Network.OPT_MAINNET).core.getBalance(owner).then(res=> {
                balance.opt = (Number(res.toString()) / 1000000000000000000).toFixed(4)
            }),
            this.alchemy.forNetwork(Network.ASTAR_MAINNET).core.getBalance(owner).then(res=> {
                balance.astar = (Number(res.toString()) / 1000000000000000000).toFixed(4)
            }),
        ])

        return balance
    }

    async getEnsBalance(owner: string): Promise<NftDetail[]> {
        const list = await this.alchemy.forNetwork(Network.ETH_MAINNET).nft.getNftsForOwner(owner, {contractAddresses:['0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85']})
        return  list.ownedNfts.map((item: any) => {
            return {
                title: item.title,
                image: item.rawMetadata?.image_url,
                contract: item.contract.address,
                id: item.tokenId,
                standard: 'ERC721',
                chain: 'Ethereuem',
                explorer: 'https://app.ens.domains/' + item.title
            } as NftDetail
        })
    }

    async getMaodaoNft(owner: string): Promise<NftDetail[]> {
        const list = await this.alchemy.forNetwork(Network.ETH_MAINNET).nft.getNftsForOwner(owner, {contractAddresses:['0xcdb7C1a6fE7e112210CA548C214F656763E13533']})
        return  list.ownedNfts.map((item: any) => {
            return {
                title: item.title,
                image: item.rawMetadata?.image,
                contract: item.contract.address,
                id: Number(item.tokenId) + '',
                standard: 'ERC721',
                chain: 'Ethereuem',
                explorer: `https://opensea.io/assets/ethereum/0xcdb7c1a6fe7e112210ca548c214f656763e13533/${item.tokenId}`
            } as NftDetail
        })
    }

    async getSeedaoNft(owner: string): Promise<NftDetail[]> {
        // toto replace owner address
        const list = await this.alchemy.forNetwork(Network.ETH_MAINNET).nft.getNftsForOwner('0x332345477db00239f88ca2eb015b159750cf3c44', {contractAddresses:['0x30093266e34a816a53e302be3e59a93b52792fd4']})
        return  list.ownedNfts.map((item: any) => {
            return {
                title: `SeeDAO Seed NFT #${item.tokenId}`,
                image: item.rawMetadata?.image,
                contract: item.contract.address,
                id: Number(item.tokenId) + '',
                standard: 'ERC721',
                chain: 'Ethereuem',
                explorer: `https://eth.nftscan.com/0x30093266e34a816a53e302be3e59a93b52792fd4/${item.tokenId}`
            } as NftDetail
        })
    }
}

const alchemy = new Alchemy();
export default alchemy;
