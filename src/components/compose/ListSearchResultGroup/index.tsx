import {useContext, useEffect, useState} from 'react'
import solas, {Profile, Invite, searchGroup} from '../../../service/solas'
import ListWrapper from '../../base/ListWrapper'
import Empty from '../../base/Empty'
import LangContext from '../../provider/LangProvider/LangContext'
import useScrollToLoad from '../../../hooks/scrollToLoad'
import UserContext from '../../provider/UserProvider/UserContext'
import CardSearchDomain from '../../base/Cards/CardSearchDomain/CardSearchDomain'

interface ListSearchResultDomainProps {
    keyword: string
}

function ListSearchResultGroup (props: ListSearchResultDomainProps) {
    const { lang } = useContext(LangContext)
    const getGroup = async (page: number) => {
        if (!props.keyword) return []
        // 搜索只有一页
        if (page > 1) return []
        return await searchGroup({ keyword: props.keyword.toLowerCase(), page })
    }

    const { isEmpty, list, ref, refresh } = useScrollToLoad ({ queryFunction: getGroup })

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
                    return <CardSearchDomain profile={ item } keyword={ props.keyword } key={index} />
                })
                : false
            }
            <div ref={ref} className='page-bottom-marker'></div>
        </ListWrapper>)
}

export default ListSearchResultGroup
