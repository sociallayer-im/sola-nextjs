export const paymentTokenList = [{
    chain: 'Polygon',
    id: 'polygon',
    chainId: 137,
    icon: '/images/polygon.svg',
    payHub: '0xea6D3bEE13F1e5080FA4cF768db91682602c65D3',
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
        {
            name: 'DAI',
            id: 'dai',
            contract: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
            icon: '/images/mcdDai_32.png',
            decimals: 18
        },
        {
            name: 'TEST',
            id: 'TEST',
            contract: '0x3e4d99a6Ad210b1806dC8e6790669863D0A490B8',
            icon: '/images/tether_32.webp',
            decimals: 18
        },
    ]
},
    {
        chain: 'Fuji Testnet',
        id: 'fuji',
        chainId: 43113,
        icon: '/images/fuji.png',
        payHub: '0x388F827Be557Bd500B4C4961BdCc10c25d782bCA',
        tokenList: [
            {
                name: 'TUSDT',
                id: 'tusdt',
                contract: '0x70c34957154355a0bF048073eb1d4b7895359743',
                icon: '/images/tether_32.webp',
                decimals: 6
            }
        ]
    }
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

export const payhub_abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"from","type":"address"},{"indexed":false,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"address","name":"token","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"productId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"itemId","type":"uint256"}],"name":"PaymentTrasnfered","type":"event"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"productId","type":"uint256"},{"internalType":"uint256","name":"itemId","type":"uint256"}],"name":"transfer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}]


