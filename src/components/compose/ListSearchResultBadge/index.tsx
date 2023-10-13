import { useContext, useEffect } from 'react'
import CardBadge from '../../base/Cards/CardBadge/CardBadge'
import solas from '../../../service/solas'
import ListWrapper from '../../base/ListWrapper'
import Empty from '../../base/Empty'
import LangContext from '../../provider/LangProvider/LangContext'
import useScrollToLoad from '../../../hooks/scrollToLoad'

interface ListSearchResultBadgeProps {
    keyword: string
}

function ListSearchResultBadge (props: ListSearchResultBadgeProps) {
    const { lang } = useContext(LangContext)
    const getBadge = async (page: number) => {
        if (!props.keyword) return []
        return await solas.searchBadge({
            title: props.keyword,
            page
        })

    }

    const { isEmpty, list, ref, refresh } = useScrollToLoad ({ queryFunction: getBadge })

    useEffect(() => {
        refresh()
    }, [props.keyword])

    return (
        <ListWrapper>
            { isEmpty ?
                <Empty />
                : false
            }
            {
                list.map((item, index) => {
                    return <CardBadge badge={ item } key={ index.toString() }/>
                })
            }
            <div ref={ref} className='page-bottom-marker'></div>
        </ListWrapper>)
}

export default ListSearchResultBadge
