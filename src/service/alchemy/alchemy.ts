// 'ReadMe-API-Explorer'

import {AlchemyMultichainClient} from './alchemy-multichain-client';
import {Network,} from 'alchemy-sdk';

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
} as { [key: string]: string }

export interface Erc20Asset {
    usdt: string,
    usec: string,

}

export const erc20List = {
    eth: {
        usdt: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
    },
    matic: {
        usdt: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
        usdc: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
    },
    arb: {
        usdt: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
        usdc: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'
    },
    opt: {
        usdt: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
        usdc: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85'
    }
}

class Alchemy {
    alchemy: AlchemyMultichainClient

    constructor() {
        const defaultConfig = {
            apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY,
            network: Network.ETH_MAINNET
        };

        const overrides = {
            // TODO: Replace with your API keys.
            [Network.MATIC_MAINNET]: {apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY, maxRetries: 10}, // Replace with your Matic Alchemy API key.
            [Network.ARB_MAINNET]: {apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY}, // Replace with your Arbitrum Alchemy API key.
            [Network.OPT_MAINNET]: {apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY}, // Replace with your Arbitrum Alchemy API key.
            [Network.ASTAR_MAINNET]: {apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY} // Replace with your Arbitrum Alchemy API key.
        };
        this.alchemy = new AlchemyMultichainClient(defaultConfig, overrides);
    }

    async getBalance(owner: string): Promise<CurrencyBalance> {
        let balance: CurrencyBalance = {
            eth: '',
            matic: '',
            arb: '',
            opt: '',
            astar: ''
        }

        const fetch = await Promise.all([
            this.alchemy.forNetwork(Network.ETH_MAINNET).core.getBalance(owner).then(res => {
                balance.eth = (Number(res.toString()) / 1000000000000000000).toFixed(4)
            }),
            this.alchemy.forNetwork(Network.MATIC_MAINNET).core.getBalance(owner).then(res => {
                balance.matic = (Number(res.toString()) / 1000000000000000000).toFixed(4)
            }),
            this.alchemy.forNetwork(Network.ARB_MAINNET).core.getBalance(owner).then(res => {
                balance.arb = (Number(res.toString()) / 1000000000000000000).toFixed(4)
            }),
            this.alchemy.forNetwork(Network.OPT_MAINNET).core.getBalance(owner).then(res => {
                balance.opt = (Number(res.toString()) / 1000000000000000000).toFixed(4)
            }),
            this.alchemy.forNetwork(Network.ASTAR_MAINNET).core.getBalance(owner).then(res => {
                balance.astar = (Number(res.toString()) / 1000000000000000000).toFixed(4)
            }),
        ])

        return balance
    }

    async getEnsBalance(owner: string): Promise<NftDetail[]> {
        const list = await this.alchemy.forNetwork(Network.ETH_MAINNET).nft.getNftsForOwner(owner, {contractAddresses: ['0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85']})
        return list.ownedNfts.map((item: any) => {
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
        const list = await this.alchemy.forNetwork(Network.ETH_MAINNET).nft.getNftsForOwner(owner, {contractAddresses: ['0xcdb7C1a6fE7e112210CA548C214F656763E13533']})
        return list.ownedNfts.map((item: any) => {
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

    async getAllMaodaoNft(pageKey: string) {
        const list = await this.alchemy.forNetwork(Network.ETH_MAINNET).nft.getNftsForContract('0xcdb7C1a6fE7e112210CA548C214F656763E13533', {pageKey: pageKey, pageSize: 6 })
        const nfts =  list.nfts.map((item: any) => {
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

        return {
            list: nfts,
            pageKey: list.pageKey
        }
    }

    async getSeedaoNft(owner: string): Promise<NftDetail[]> {
        // toto replace owner address
        const list = await this.alchemy.forNetwork(Network.ETH_MAINNET).nft.getNftsForOwner('0x332345477db00239f88ca2eb015b159750cf3c44', {contractAddresses: ['0x30093266e34a816a53e302be3e59a93b52792fd4']})
        return list.ownedNfts.map((item: any) => {
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

    async getMaodaoOwner(nftId: string): Promise<string | null> {
        const response = await this.alchemy
            .forNetwork(Network.ETH_MAINNET)
            .nft
            .getOwnersForNft('0xcdb7c1a6fe7e112210ca548c214f656763e13533', nftId)

        return response.owners[0] || null
    }

    async getErc20Assets (ownerAddress: string) {
        const balance : any = {
            eth:{usdt: '0.0000', usdc: '0.0000'},
            matic:{usdt: '0.0000', usdc: '0.0000'},
            arb:{usdt: '0.0000', usdc: '0.0000'},
            opt:{usdt: '0.0000', usdc: '0.0000'},
            astar:{usdt: '0.0000', usdc: '0.0000'}
        }

        console.log('ownerAddressownerAddressownerAddress', ownerAddress)

        const assets = await Promise.all([
            this.alchemy.forNetwork(Network.ETH_MAINNET).core.getTokenBalances(ownerAddress, [erc20List.eth.usdt, erc20List.eth.usdc]).then((res: any) => {
                console.log('eth', res)
                balance.eth.usdt = (Number(res.tokenBalances[0].tokenBalance) / 1000000).toFixed(4)
                balance.eth.usdc = (Number(res.tokenBalances[1].tokenBalance) / 1000000).toFixed(4)
            }),
            this.alchemy.forNetwork(Network.MATIC_MAINNET).core.getTokenBalances(ownerAddress, [erc20List.matic.usdt, erc20List.matic.usdc]).then((res: any) => {
                console.log('matic', res)
                balance.matic.usdt = (Number(res.tokenBalances[0].tokenBalance) / 1000000).toFixed(4)
                balance.matic.usdc = (Number(res.tokenBalances[1].tokenBalance) / 1000000).toFixed(4)
            }),
            this.alchemy.forNetwork(Network.ARB_MAINNET).core.getTokenBalances(ownerAddress, [erc20List.arb.usdt, erc20List.arb.usdc]).then((res: any) => {
                console.log('arb', res)
                balance.arb.usdt = (Number(res.tokenBalances[0].tokenBalance) / 1000000).toFixed(4)
                balance.arb.usdc = (Number(res.tokenBalances[1].tokenBalance) / 1000000).toFixed(4)
            }),
            this.alchemy.forNetwork(Network.OPT_MAINNET).core.getTokenBalances(ownerAddress, [erc20List.opt.usdt, erc20List.opt.usdc]).then((res: any) => {
                console.log('opt', res)
                balance.opt.usdt = (Number(res.tokenBalances[0].tokenBalance) / 1000000).toFixed(4)
                balance.opt.usdc = (Number(res.tokenBalances[1].tokenBalance) / 1000000).toFixed(4)
            }),
        ])

        return balance
    }
}

const alchemy = new Alchemy();
export default alchemy;
