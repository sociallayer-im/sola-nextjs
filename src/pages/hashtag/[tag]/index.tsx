import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import ListSearchResultBadgelet from '@/components/compose/ListSearchResultBadgelet'

function ComponentName() {
    const params = useParams()

    useEffect(() => {

    }, [])

    return (<div className='event-page'>
        <div className='event-title'>
            <div className='event-title-center'># { params?.tag as string || '--'}</div>
        </div>
        <div className='event-badgelet-list'>
            <ListSearchResultBadgelet keyword={  params?.tag as string || '' } />
        </div>
    </div>)
}

export default ComponentName
