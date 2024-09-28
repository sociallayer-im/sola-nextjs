export interface PaymentSettingChain {
    chain: string,
    id: string,
    chainId: number,
    icon: string,
    payHub: string,
    tokenList: PaymentSettingToken[]
}

export interface PaymentSettingToken {
    name: string,
    id: string,
    contract: string,
    icon: string,
    decimals: number
}

export const paymentTokenList: PaymentSettingChain[] = process.env.NEXT_PUBLIC_PAYMENT_SETTING === 'production' ?
    [
        {
            chain: 'Polygon',
            id: 'polygon',
            chainId: 137,
            icon: '/images/polygon.svg',
            payHub: '0xA73405D59e136f574a2FD690079B240f6fbff0a8',
            tokenList: [
                {
                    name: 'USDT',
                    id: 'usdt',
                    contract: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
                    icon: '/images/tether_32.webp',
                    decimals: 6
                },
                {
                    name: 'USDC',
                    id: 'usdc',
                    contract: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
                    icon: '/images/usdc_32.webp',
                    decimals: 6
                }
            ]
        },
        {
            chain: 'Optimism',
            id: 'optimism',
            chainId: 10,
            icon: '/images/op.png',
            payHub: '0xA73405D59e136f574a2FD690079B240f6fbff0a8',
            tokenList: [
                {
                    name: 'USDT',
                    id: 'usdt',
                    contract: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
                    icon: '/images/tether_32.webp',
                    decimals: 6
                }
            ]
        },
        {
            chain: 'Arbitrum',
            id: 'arbitrum',
            chainId: 42161,
            icon: '/images/arbitrum.png',
            payHub: '0xA73405D59e136f574a2FD690079B240f6fbff0a8',
            tokenList: [
                {
                    name: 'USDT',
                    id: 'usdt',
                    contract: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
                    icon: '/images/tether_32.webp',
                    decimals: 6
                }
            ]

        },
        {
            chain: 'Base',
            id: 'base',
            chainId: 8453,
            icon: '/images/base_chain.png',
            payHub: '0xA73405D59e136f574a2FD690079B240f6fbff0a8',
            tokenList: [
                {
                    name: 'USDC',
                    id: 'usdc',
                    contract: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
                    icon: '/images/usdc_32.webp',
                    decimals: 6
                }
            ]

        },
        {
            chain: "Ethereum",
            id: 'ethereum',
            chainId: 1,
            icon: '/images/ethereum-icon.webp',
            payHub: '0xd0059CFcc8c1E5678a20dc4b008A7dDf4dB3A9f2',
            tokenList: [
                {
                    name: 'USDT',
                    id: 'usdt',
                    contract: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
                    icon: '/images/tether_32.webp',
                    decimals: 6
                }
            ]
        },
        {
            chain: 'Stripe',
            id: 'stripe',
            chainId: 0,
            icon: '/images/stripe.png',
            payHub: '',
            tokenList: [
                {
                    name: 'USD',
                    id: 'usd',
                    contract: '',
                    icon: '/images/usd.png',
                    decimals: 2
                }
            ]
        }
    ] : // development
    [
        {
            chain: 'Polygon',
            id: 'polygon',
            chainId: 137,
            icon: '/images/polygon.svg',
            payHub: '0xac8272de12ec2af2ad4f8dad0a0dc41e48638111',
            tokenList: [
                {
                    name: 'USDT',
                    id: 'usdt',
                    contract: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
                    icon: '/images/tether_32.webp',
                    decimals: 6
                },
                {
                    name: 'USDC',
                    id: 'usdc',
                    contract: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
                    icon: '/images/usdc_32.webp',
                    decimals: 6
                },
                // {
                //     name: 'DAI',
                //     id: 'dai',
                //     contract: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
                //     icon: '/images/mcdDai_32.png',
                //     decimals: 18
                // },
                // {
                //     name: 'TEST',
                //     id: 'TEST',
                //     contract: '0x3e4d99a6Ad210b1806dC8e6790669863D0A490B8',
                //     icon: '/images/tether_32.webp',
                //     decimals: 18
                // },
            ]
        },
        {
            chain: 'Optimism',
            id: 'optimism',
            chainId: 10,
            icon: '/images/op.png',
            payHub: '0x35fca106dcfec9dfc16dc6da46fae951703e18a0',
            tokenList: [
                {
                    name: 'USDT',
                    id: 'usdt',
                    contract: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
                    icon: '/images/tether_32.webp',
                    decimals: 6
                }
            ]
        },
        {
            chain: 'Arbitrum',
            id: 'arbitrum',
            chainId: 42161,
            icon: '/images/arbitrum.png',
            payHub: '0x35fca106dcfec9dfc16dc6da46fae951703e18a0',
            tokenList: [
                {
                    name: 'USDT',
                    id: 'usdt',
                    contract: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
                    icon: '/images/tether_32.webp',
                    decimals: 6
                }
            ]

        },
        {
            chain: 'Base',
            id: 'base',
            chainId: 8453,
            icon: '/images/base_chain.png',
            payHub: '0x35fca106dcfec9dfc16dc6da46fae951703e18a0',
            tokenList: [
                {
                    name: 'USDC',
                    id: 'usdc',
                    contract: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
                    icon: '/images/usdc_32.webp',
                    decimals: 6
                }
            ]

        },
        {
            chain: 'Stripe',
            id: 'stripe',
            chainId: 0,
            icon: '/images/stripe.png',
            payHub: '',
            tokenList: [
                {
                    name: 'USD',
                    id: 'usd',
                    contract: '',
                    icon: '/images/usd.png',
                    decimals: 2
                }
            ]
        },
        // {
        //     chain: 'Fuji Testnet',
        //     id: 'fuji',
        //     chainId: 43113,
        //     icon: '/images/fuji.png',
        //     payHub: '0x408e8ef7b90F1356c13aAD15A877162AC259404c',
        //     tokenList: [
        //         {
        //             name: 'TUSDT',
        //             id: 'tusdt',
        //             contract: '0x70c34957154355a0bF048073eb1d4b7895359743',
        //             icon: '/images/tether_32.webp',
        //             decimals: 6
        //         }
        //     ]
        // },
    ]

export const erc20_abi = [{
    type: 'event',
    name: 'Approval',
    inputs: [
        {
            indexed: true,
            name: 'owner',
            type: 'address',
        },
        {
            indexed: true,
            name: 'spender',
            type: 'address',
        },
        {
            indexed: false,
            name: 'value',
            type: 'uint256',
        },
    ],
},
    {
        type: 'event',
        name: 'Transfer',
        inputs: [
            {
                indexed: true,
                name: 'from',
                type: 'address',
            },
            {
                indexed: true,
                name: 'to',
                type: 'address',
            },
            {
                indexed: false,
                name: 'value',
                type: 'uint256',
            },
        ],
    },
    {
        type: 'function',
        name: 'allowance',
        stateMutability: 'view',
        inputs: [
            {
                name: 'owner',
                type: 'address',
            },
            {
                name: 'spender',
                type: 'address',
            },
        ],
        outputs: [
            {
                name: '',
                type: 'uint256',
            },
        ],
    },
    {
        type: 'function',
        name: 'approve',
        stateMutability: 'nonpayable',
        inputs: [
            {
                name: 'spender',
                type: 'address',
            },
            {
                name: 'amount',
                type: 'uint256',
            },
        ],
        outputs: [],
    },
    {
        type: 'function',
        name: 'balanceOf',
        stateMutability: 'view',
        inputs: [
            {
                name: 'account',
                type: 'address',
            },
        ],
        outputs: [
            {
                name: '',
                type: 'uint256',
            },
        ],
    },
    {
        type: 'function',
        name: 'decimals',
        stateMutability: 'view',
        inputs: [],
        outputs: [
            {
                name: '',
                type: 'uint8',
            },
        ],
    },
    {
        type: 'function',
        name: 'name',
        stateMutability: 'view',
        inputs: [],
        outputs: [
            {
                name: '',
                type: 'string',
            },
        ],
    },
    {
        type: 'function',
        name: 'symbol',
        stateMutability: 'view',
        inputs: [],
        outputs: [
            {
                name: '',
                type: 'string',
            },
        ],
    },
    {
        type: 'function',
        name: 'totalSupply',
        stateMutability: 'view',
        inputs: [],
        outputs: [
            {
                name: '',
                type: 'uint256',
            },
        ],
    },
    {
        type: 'function',
        name: 'transfer',
        stateMutability: 'nonpayable',
        inputs: [
            {
                name: 'recipient',
                type: 'address',
            },
            {
                name: 'amount',
                type: 'uint256',
            },
        ],
        outputs: [],
    },
    {
        type: 'function',
        name: 'transferFrom',
        stateMutability: 'nonpayable',
        inputs: [
            {
                name: 'sender',
                type: 'address',
            },
            {
                name: 'recipient',
                type: 'address',
            },
            {
                name: 'amount',
                type: 'uint256',
            },
        ],
        outputs: [
            {
                name: '',
                type: 'bool',
            },
        ],
    },
]

export const payhub_abi = [{"inputs": [], "stateMutability": "nonpayable", "type": "constructor"}, {
    "anonymous": false,
    "inputs": [{
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
    }, {"indexed": true, "internalType": "address", "name": "newOwner", "type": "address"}],
    "name": "OwnershipTransferred",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": false, "internalType": "address", "name": "from", "type": "address"}, {
        "indexed": false,
        "internalType": "address",
        "name": "to",
        "type": "address"
    }, {"indexed": false, "internalType": "address", "name": "token", "type": "address"}, {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
    }, {"indexed": false, "internalType": "uint256", "name": "productId", "type": "uint256"}, {
        "indexed": false,
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
    }],
    "name": "PaymentTrasnfered",
    "type": "event"
}, {
    "inputs": [],
    "name": "owner",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "inputs": [{"internalType": "address", "name": "to", "type": "address"}, {
        "internalType": "address",
        "name": "token",
        "type": "address"
    }, {"internalType": "uint256", "name": "amount", "type": "uint256"}, {
        "internalType": "uint256",
        "name": "productId",
        "type": "uint256"
    }, {"internalType": "uint256", "name": "itemId", "type": "uint256"}],
    "name": "transfer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "inputs": [{"internalType": "address", "name": "newOwner", "type": "address"}],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}]


