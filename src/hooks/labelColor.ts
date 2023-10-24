export const labelColors = [

    '#1685a9',
    '#5567ff',
    '#cca4e3',
    '#FFC400',
    '#FF7A45',
    '#9eb636',
    '#439b82',
    '#FAC699',
    '#75D4F0',
    '#e73f9e',
    '#15CB82',
    '#FE6CAB',
    '#d06833',
    '#FD8CE2',
    '#a98175',
    '#8080FF',
    '#057748',
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

export const getLabelColor = (label: string) => {
    if (defaultLabels.indexOf(label) !== -1) {
        return labelColors[defaultLabels.indexOf(label)]
    } else {
        return labelColors[label[0].charCodeAt(0) % labelColors.length]
    }
}
