import Beast01 from "./svg/Beast01";
import Beast02 from "./svg/Beast02";
import Beast03 from "./svg/Beast03";
import Beast04 from "./svg/Beast04";

export interface BeastInfo {
    id: number
    complete: string
    category: string
    description: string
    post: any,
    cost: Array<number>  // 合成消耗 [<poap数量>， <host数量>]
    items: Array<BeastItemInfo>
}

export interface BeastItemInfo {
    name: string
    icon: string,
    position: number,
    cost?: Array<number> // 合成消耗 [<poap数量>， <host数量>]
}

function useBeastConfig() {
    const list: BeastInfo[] = [
        {
            id: 1,
            category: '基础大狫',
            complete: '大狫',
            description: '体大如斗，秉节持重',
            post: Beast01,
            cost: [3, 1],
            items: [
                {
                    name: '帽子1',
                    icon: '/images/merge/items/beast_1_item_1.svg',
                    position: 1,
                    cost: [1, 0],
                },
                {
                    name: '帽子2',
                    icon: '/images/merge/items/beast_1_item_5.svg',
                    position: 1,
                    cost: [1, 0],
                },
                {
                    name: '眼镜',
                    icon: '/images/merge/items/beast_1_item_2.svg',
                    position: 2,
                    cost: [1, 0],
                },
                {
                    name: '项链',
                    icon: '/images/merge/items/beast_1_item_3.svg',
                    position: 3,
                    cost: [1, 0],
                },
                {
                    name: '鞋子1',
                    icon: '/images/merge/items/beast_1_item_4.svg',
                    position: 4,
                    cost: [1, 0],
                },
                {
                    name: '鞋子2',
                    icon: '/images/merge/items/beast_1_item_6.svg',
                    position: 4,
                    cost: [1, 0],
                },
                {
                    name: '鱼竿',
                    icon: '/images/merge/items/beast_1_item_7.svg',
                    position: 5,
                    cost: [1, 0],
                }
            ]
        },
        {
            id: 2,
            complete: '小狫',
            category: '基础小狫',
            description: '沉厚寡言，游于山林',
            post: Beast02,
            cost: [3, 1],
            items: [
                {
                    name: '帽子',
                    icon: '/images/merge/items/beast_2_item_1.svg',
                    position: 1,
                },
                {
                    name: '口罩',
                    icon: '/images/merge/items/beast_2_item_2.svg',
                    position: 2,
                },
                {
                    name: '鞋子',
                    icon: '/images/merge/items/beast_2_item_3.svg',
                    position: 3,
                }
            ]
        },
        {
            id: 3,
            complete: '程序猿',
            category: '基础猿',
            description: '善变换，好奇善异\n常有窥探之心',
            post: Beast03,
            cost: [3, 1],
            items: [
                {
                    name: '帽子1',
                    icon: '/images/merge/items/beast_3_item_1.svg',
                    position: 1,
                },
                {
                    name: '背包1',
                    icon: '/images/merge/items/beast_3_item_2.svg',
                    position: 2,
                },
                {
                    name: '帽子2',
                    icon: '/images/merge/items/beast_3_item_3.svg',
                    position: 1,
                },
                {
                    name: '背包2',
                    icon: '/images/merge/items/beast_3_item_4.svg',
                    position: 2,
                },
                {
                    name: '衣服1',
                    icon: '/images/merge/items/beast_3_item_5.svg',
                    position: 3,
                },
                {
                    name: '鞋子1',
                    icon: '/images/merge/items/beast_3_item_6.svg',
                    position: 4,
                },
                {
                    name: '帽子3',
                    icon: '/images/merge/items/beast_3_item_7.svg',
                    position: 1,
                },
                {
                    name: '背包3',
                    icon: '/images/merge/items/beast_3_item_8.svg',
                    position: 2,
                },
                {
                    name: '鞋子2',
                    icon: '/images/merge/items/beast_3_item_9.svg',
                    position: 4,
                },
                {
                    name: '衣服2',
                    icon: '/images/merge/items/beast_3_item_10.svg',
                    position: 3,
                }
            ]
        },
        {
            id: 4,
            complete: '设计鲺',
            category: '基础鲺',
            description: '游于山川水溪\n常不可寻',
            post: Beast04,
            cost: [3, 1],
            items: [
                {
                    name: '纸',
                    icon: '/images/merge/items/beast_4_item_1.svg',
                    position: 1,
                },
                {
                    name: '笔',
                    icon: '/images/merge/items/beast_4_item_2.svg',
                    position: 2,
                },
                {
                    name: '马克笔',
                    icon: '/images/merge/items/beast_4_item_3.svg',
                    position: 3,
                }
            ]
        }
    ]


    return {beastInfo: list}
}

export default useBeastConfig
