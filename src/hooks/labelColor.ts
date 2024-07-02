export const labelColors = [
    // '#1685a9',
    // '#5567ff',
    // '#cca4e3',
    // '#FFC400',
    // '#FF7A45',
    // '#9eb636',
    // '#439b82',
    // '#FAC699',
    // '#75D4F0',
    // '#e73f9e',
    // '#15CB82',
    // '#FE6CAB',
    // '#d06833',
    // '#FD8CE2',
    // '#a98175',
    // '#8080FF',
    // '#057748',

    '#e6934c',
    '#b856f6',
    '#70aee0',
    '#a0e58f',
    '#b359ee',
    '#5fa0fc',
    '#df8d98',
    '#6faddf',
    '#b6cf8c',
    '#a0e58f',
    '#8d5bf0',
    '#a1ebd5',
]

const defaultLabels = [
    "公益课",
    "工作坊",
    "讲座沙龙",
    "人工智能",
    "区块链",
    "创作者经济",
    "社群与协作",
    "身心可持续",
    "坞民日常",
    "山海讲堂"
]

export const colorMap = {
    "Week 4": '#e6934c',
    "Week 3": '#b856f6',
    "Week 2": '#70aee0',
    "Week 1": '#a0e58f',
    "Weekend 4": '#e6934c',
    "Weekend 3": '#b359ee',
    "Weekend 2": '#5fa0fc',
    "Weekend 1": '#a0e68f',
    "All Weekends": '#5fa0fc',
    "Week 3 & 4": '#df8d98',
    "Week 2 & 3": '#6faddf',
    "Week 1 & 2": '#b6cf8c',
    "Month Standard & Builder": '#000000',
    "Team - Green": '#a0e58f',
    "Kid - Month Long Purple": '#8d5bf0',
    "Kids by week": '#a1ebd5',
}

const hexToRgb = (str: string) => {
    let hexs = null;
    let reg = /^\#?[0-9A-Fa-f]{6}$/;
    if (!reg.test(str)) return ['255','255','255'] as string[]
    str = str.replace('#', '') // 去掉#
    hexs = str.match(/../g) // 切割成数组 409EFF => ['40','9E','FF']
    // 将切割的色值转换为16进制
    for (let i = 0; i < hexs!.length; i++) hexs![i] = parseInt(hexs![i], 16) + ''
    return hexs as string[] // 返回rgb色值[64, 158, 255]
}

export const getLightColor = (color: string, level: number) => {
    let reg = /^\#?[0-9A-Fa-f]{6}$/;
    if (!reg.test(color)) return '#fff'
    let rgb = hexToRgb(color);
    // 循环对色值进行调整
    for (let i = 0; i < 3; i++) {
        rgb![i] = Math.floor((255 - Number(rgb![i])) * level + Number(rgb![i])) + '' // 始终保持在0-255之间
    }
    return `rgb(${rgb![0]},${rgb![1]},${rgb![2]})`  // [159, 206, 255]
}
export const getLabelColor = (label?: string, light?: number) => {
    let res = ''
    if (label) {
        if (defaultLabels.indexOf(label) !== -1) {
            res = labelColors[defaultLabels.indexOf(label)]
        } else {
            res = labelColors[(label[0].charCodeAt(0) + label[label.length - 1].charCodeAt(0)) % labelColors.length]
        }
    } else {
        res = labelColors[0]
    }


    if (light) {
        // hex to rgb
        res = getLightColor(res, light)
        console.log(res)
        return res
    } else {
        return res
    }
}
