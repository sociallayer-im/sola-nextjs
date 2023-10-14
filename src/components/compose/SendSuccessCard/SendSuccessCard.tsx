import { useContext } from 'react'
import { Profile, ProfileSimple, Group } from '../../../service/solas'
import ReasonText from '../../base/ReasonText/ReasonText'
import usePicture from '../../../hooks/pictrue'
import QRcode from '../../base/QRcode'
import LangContext from '../../provider/LangProvider/LangContext'

export interface Info {
    cover: string,
    name: string,
    content: string
}

export interface SendSuccessCardProps {
    info: Info
    sender: Profile | ProfileSimple | Group
    type: 'invite' | 'presend' | 'badgelet'
    shareLink?: string
    bg: string
}

function SendSuccessCard(props: SendSuccessCardProps) {
    const { defaultAvatar } = usePicture()
    const { lang } = useContext(LangContext)

    return (<div className='send-success-card'>
        <img className='card-bg' src={ props.bg } alt=""/>
        <img className='cover' src={props.info.cover!} alt=""/>
        <div className='name'>{ props.info.name }</div>
        <div className='reason'>
            <ReasonText text={props.info.content} />
        </div>
        <div className='footer'>
            <div className='profile'>
                <img src={ props.sender.image_url || defaultAvatar(props.sender.id)} alt=""/>
                <div className='info'>
                    <div className='sender-name'>{ props.sender.domain?.split('.')[0]}</div>
                    <div className='des'>{ lang['IssueFinish_Share_Card_text_1'] }</div>
                </div>
            </div>
            <QRcode text={props.shareLink || ''} size={[60, 60]}></QRcode>
        </div>
    </div>)
}

export default SendSuccessCard
