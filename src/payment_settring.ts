export const paymentTokenList = [{
    chain: 'Ethereum',
    id: 'ethereum',
    chainId: 1,
    icon: '/images/ethereum-icon.webp',
    tokenList: [
        {
            name: 'USDT',
            id: 'usdt',
            contract: '0xdac17f958d2ee523a2206206994597c13d831ec7',
            icon: '/images/tether_32.webp',
            decimals: 6
        }
    ]
}, {
    chain: 'Polygon',
    id: 'polygon',
    chainId: 137,
    icon: '/images/polygon.svg',
    tokenList: [
        {
            name: 'USDT',
            id: 'usdt',
            contract: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
            icon: '/images/tether_32.webp',
            decimals: 6
        }
    ]
},
    {
        chain: 'Binance Smart Chain',
        id: 'bsc',
        chainId: 56,
        icon: '/images/bsc.svg',
        tokenList: [
            {
                name: 'BSC-USD',
                id: 'bsc-usd',
                contract: '0x55d398326f99059ff775485246999027b3197955',
                icon: '/images/busdt_32.webp',
            }
        ]
    },
    {
        chain: 'Fuji testnet',
        id: 'fuji',
        chainId: 43113,
        icon: '/images/fuji.png',
        tokenList: [
            {
                name: 'TUSDT',
                id: 'tusdt',
                contract: '0x70c34957154355a0bF048073eb1d4b7895359743',
                icon: '/images/tether_32.webp',
            }
        ]
    }
]
