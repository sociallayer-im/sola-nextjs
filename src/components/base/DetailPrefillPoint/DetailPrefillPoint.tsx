import {useContext} from 'react'
import {Point} from '../../../service/solas'
import langContext from '../../provider/LangProvider/LangContext'
import useTime from '../../../hooks/formatTime'

interface DetailPrefillBadgeProps {
    point: Point
}

function DetailPrefillPoint(props: DetailPrefillBadgeProps) {
    const {lang} = useContext(langContext)
    const formatTime = useTime()

    return (
        <div className='prefill-preview'>
            <img src={props.point.image_url} className='avatar' alt=""/>
            <div className={'value'}>Value</div>
            <div className='name'>{props.point.title}</div>
            <div className='create-time'>
                <span className='icon-clock'></span>
                <span>{lang['IssueBadge_Create_time']} {formatTime(props.point.created_at)}</span>
            </div>
        </div>
    )
}

export default DetailPrefillPoint
