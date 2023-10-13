import {useNavigate} from 'react-router-dom'
import {useStyletron} from 'baseui'
import {useState, useContext, useEffect} from 'react'
import { useParams } from 'react-router-dom'
import AppTabs from '../../components/base/AppTabs'
import { Tab } from 'baseui/tabs'
import LangContext from '../../components/provider/LangProvider/LangContext'
import Layout from '../../components/Layout/Layout'
import './Search.less'
import ListSearchResultDomain from '../../components/compose/ListSearchResultDomain'
import ListSearchResultBadgelet from '../../components/compose/ListSearchResultBadgelet'
import ListSearchResultBadge from '../../components/compose/ListSearchResultBadge'



function SearchPage() {
    const [css] = useStyletron()
    const navigate = useNavigate()
    const { keyword } = useParams()
    const { lang } = useContext(LangContext)

    return (<Layout>
            <div className='search-result-page'>
                <AppTabs initialState={ { activeKey: 'domain' } }>
                    <Tab key='domain' title={ lang['Search_Tab_Domain'] }>
                        <ListSearchResultDomain keyword={ keyword || '' }></ListSearchResultDomain>
                    </Tab>
                    <Tab key='badge' title={ lang['Search_Tab_Badge'] }>
                        <ListSearchResultBadge keyword={ keyword || '' }/>
                    </Tab>
                    <Tab key='event' title={ lang['Search_Tab_Event'] }>
                        <ListSearchResultBadgelet keyword={ keyword  || '' } />
                    </Tab>
                </AppTabs>
            </div>
        </Layout>)
}

export default SearchPage
