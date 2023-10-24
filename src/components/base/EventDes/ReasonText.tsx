import React, {forwardRef} from 'react'


export interface ReasonTextProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    text: string,
    className?: string,
}

const ReasonText = forwardRef(function (props: ReasonTextProps, ref: any) {
    let newShowText = props.text
    if (newShowText.endsWith('\n')) {
        newShowText = newShowText + '<br/>'
    }

    if (newShowText) {
        const tags = newShowText.match(/#[^\s\p{P}]+/gu)

        if (tags) {
            // 去重
            const _tags = [...new Set(tags)]
            // 按长度排序,防止长的tag被短的tag替换，比如#test和#test1，不处理的话，#test1会被#test替换
            const _tagsSorted = _tags.sort((a, b) => {
                return b.length - a.length
            })
            console.log('tags', _tags)
            // 生成正则表达式
            const r = new RegExp(`${_tagsSorted.join('|')}`, 'g')
            // 全局顺序匹配
            newShowText = newShowText.replace(r, (tagtext) => {
                return `<a class="event" href="/event/${tagtext.replace('#', '')}" target="_blank">${tagtext}</a>`
            })
        }

        // const links = newShowText.match(/@[^\s]+/g)
        // if (links) {
        //     // 去重
        //     const _links = [...new Set(links)]
        //     // 按长度排序,防止长的link被短的link替换，比如@test和@test1，不处理的话，@test1会被@test替换
        //     const _linksSorted = _links.sort((a, b) => {
        //         return b.length - a.length
        //     })
        //
        //     console.log('links', _linksSorted)
        //     // 生成正则表达式
        //     const r = new RegExp(`${_linksSorted.join('|')}`, 'g')
        //     newShowText = newShowText.replace(r, (linktext) => {
        //         return `<a class="link" target="_blank" href="${linktext.replace('@', '')}"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        //    <path d="M5.66672 10.7L4.48672 11.8467C4.1773 12.1561 3.75764 12.3299 3.32005 12.3299C2.88247 12.3299 2.46281 12.1561 2.15339 11.8467C1.84397 11.5373 1.67014 11.1176 1.67014 10.68C1.67014 10.2424 1.84397 9.82277 2.15339 9.51336L5.18005 6.48002C5.47713 6.18198 5.8774 6.00954 6.29806 5.99837C6.71872 5.9872 7.12758 6.13816 7.44005 6.42002L7.52005 6.48669C7.64647 6.61046 7.81688 6.67893 7.99379 6.67706C8.1707 6.67518 8.33962 6.60311 8.46339 6.47669C8.58715 6.35027 8.65563 6.17986 8.65376 6.00295C8.65188 5.82604 8.57981 5.65712 8.45339 5.53336C8.41576 5.48471 8.37571 5.43798 8.33339 5.39336C7.76429 4.89823 7.02827 4.63792 6.27443 4.66515C5.52059 4.69239 4.80528 5.00512 4.27339 5.54002L1.20672 8.57335C0.685625 9.14055 0.403801 9.88713 0.420103 10.6572C0.436406 11.4272 0.749575 12.1612 1.29421 12.7059C1.83884 13.2505 2.57283 13.5637 3.34289 13.58C4.11294 13.5963 4.85952 13.3145 5.42672 12.7934L6.58005 11.6667C6.69393 11.5425 6.75653 11.3797 6.75526 11.2112C6.75399 11.0427 6.68894 10.8809 6.57319 10.7584C6.45745 10.6359 6.29961 10.5617 6.13143 10.5509C5.96325 10.5401 5.79721 10.5934 5.66672 10.7ZM12.7934 1.20669C12.2326 0.64936 11.474 0.336548 10.6834 0.336548C9.89274 0.336548 9.1342 0.64936 8.57339 1.20669L7.42005 2.33336C7.30618 2.45759 7.24358 2.62034 7.24485 2.78887C7.24612 2.95739 7.31117 3.11918 7.42691 3.24168C7.54265 3.36418 7.70049 3.4383 7.86868 3.44912C8.03686 3.45995 8.2029 3.40667 8.33339 3.30002L9.48672 2.15336C9.79614 1.84394 10.2158 1.67011 10.6534 1.67011C11.091 1.67011 11.5106 1.84394 11.8201 2.15336C12.1295 2.46277 12.3033 2.88244 12.3033 3.32002C12.3033 3.75761 12.1295 4.17727 11.8201 4.48669L8.79339 7.52002C8.49631 7.81806 8.09604 7.9905 7.67538 8.00167C7.25472 8.01284 6.84586 7.86188 6.53339 7.58002L6.45339 7.51336C6.32697 7.38959 6.15656 7.32111 5.97965 7.32298C5.80274 7.32486 5.63382 7.39693 5.51005 7.52336C5.38629 7.64978 5.31781 7.82018 5.31968 7.99709C5.32156 8.174 5.39363 8.34292 5.52005 8.46669C5.56848 8.51621 5.61967 8.56296 5.67339 8.60669C6.24317 9.10032 6.97887 9.35965 7.73225 9.33244C8.48564 9.30522 9.20071 8.99348 9.73339 8.46002L12.7667 5.42669C13.3276 4.86941 13.6452 4.11284 13.6502 3.32219C13.6552 2.53153 13.3472 1.77102 12.7934 1.20669Z" fill="#7492EF"/>
        //  </svg>${linktext.replace('@', '')}</a>`
        //     })
        // }
    }

    return (<div className={(props.className || '') + ' showText'} dangerouslySetInnerHTML={{__html: newShowText }} ref={ref}/>)
}
)

export default forwardRef((props: ReasonTextProps, ref) => {
    const p = {...props, ref: ref}
    return <ReasonText {...p} />
})
