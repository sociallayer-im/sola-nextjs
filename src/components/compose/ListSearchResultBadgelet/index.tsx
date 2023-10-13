import {useContext, useEffect, useState} from 'react'
import CardSearchBadgelet from '../../base/Cards/CardSearchBadgelet/CardSearchBadgelet'
import solas from '../../../service/solas'
import ListWrapper from '../../base/ListWrapper'
import Empty from '../../base/Empty'
import LangContext from '../../provider/LangProvider/LangContext'
import useScrollToLoad from '../../../hooks/scrollToLoad'

interface ListSearchResultBadgeletProps {
    keyword: string
}

function ListSearchResultBadgelet (props: ListSearchResultBadgeletProps) {
    const { lang } = useContext(LangContext)
    const getBadgelet = async (page: number) => {
        if (!props.keyword) return []
        return await solas.queryBadgeByHashTag({
            hashtag: '#' + props.keyword, page })
    }
    const { isEmpty, list, ref, refresh } = useScrollToLoad ({ queryFunction: getBadgelet })

    useEffect(() => {
        refresh()
    }, [props.keyword])

    return (
        <ListWrapper>
            {   isEmpty ?
                <Empty />
                : false
            }
            {   list.length ?
                list.map((item, index) => {
                    return <CardSearchBadgelet keyword={ props.keyword } badgelet={ item } key={ index.toString() }/>
                })
                : false
            }
            <div ref={ref} className='page-bottom-marker'></div>
        </ListWrapper>)
}

export default ListSearchResultBadgelet
