import { useContext } from 'react'
import { Badge } from '../../../service/solas'
import langContext from '../../provider/LangProvider/LangContext'
import useTime from '../../../hooks/formatTime'

interface DetailPrefillBadgeProps {
    badge: Badge
}
function DetailPrefillBadge(props: DetailPrefillBadgeProps) {
    const { lang } = useContext(langContext)
    const formatTime = useTime()

    return (
        <div data-testid='DetailPrefillBadge' className='prefill-preview'>
        <img src={ props.badge.image_url } className='avatar' alt=""/>
        <div className='name'>{ props.badge.title }</div>
        <div className='create-time'>
            <span className='icon-clock'></span>
            <span>{ lang['IssueBadge_Create_time']} { formatTime(props.badge.created_at) }</span>
        </div>
    </div>
    )
}

export default DetailPrefillBadge
