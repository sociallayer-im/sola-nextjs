import {useContext, useEffect, useState} from 'react'
import { useParams } from 'next/navigation'
import AppTabs from '@/components/base/AppTabs'
import { Tab } from 'baseui/tabs'
import LangContext from '@/components/provider/LangProvider/LangContext'
import ListSearchResultDomain from '@/components/compose/ListSearchResultDomain'
import ListSearchResultBadgelet from '@/components/compose/ListSearchResultBadgelet'
import ListSearchResultBadge from '@/components/compose/ListSearchResultBadge'
import ListSearchResultEvent from "@/components/compose/ListSearchResultEvent/ListSearchResultEvent";
import ListSearchResultGroup from "@/components/compose/ListSearchResultGroup";

function SearchPage() {
    const params = useParams()
    const [keyword, setKeyword] = useState(params?.keyword || '')
    const { lang } = useContext(LangContext)

    useEffect(()=> {
        setKeyword(params?.keyword || '')
    },[params])

    return ( <div className='search-result-page'>
        <AppTabs initialState={ { activeKey: 'event' } }>
            <Tab key='event' title={ lang['Search_Tab_Event'] }>
                <ListSearchResultEvent keyword={ params?.keyword as string } />
            </Tab>
            <Tab key='domain' title={ 'User' }>
                <ListSearchResultDomain keyword={ keyword as string }></ListSearchResultDomain>
            </Tab>
            <Tab key='group' title={'Group'}>
                <ListSearchResultGroup keyword={ keyword as string } />
            </Tab>
            <Tab key='badge' title={ lang['Search_Tab_Badge'] }>
                <ListSearchResultBadge keyword={ keyword as string}/>
            </Tab>
        </AppTabs>
    </div>)
}

export default SearchPage
