import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Layout from '../../components/Layout/Layout'
import './Event.less'
import ListSearchResultBadgelet from '../../components/compose/ListSearchResultBadgelet'

function ComponentName() {
    const { tag } = useParams()

    useEffect(() => {

    }, [])

    return (<Layout>
        <div className='event-page'>
            <div className='event-title'>
                <div className='event-title-center'># { tag }</div>
            </div>
            <div className='event-badgelet-list'>
                <ListSearchResultBadgelet keyword={ tag || '' } />
            </div>
        </div>
    </Layout>)
}

export default ComponentName
