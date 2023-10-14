import {useContext} from 'react'
import {Group, Profile, ProfileSimple} from '../../../service/solas'
import langContext from '../../provider/LangProvider/LangContext'
import QRcode from '../../base/QRcode'
import useTime from '../../../hooks/formatTime'

export interface ShareQrcodeProp {
    sender: ProfileSimple
    name: string
    cover: string
    link: string,
    limit?: number,
    expires?: string
    start?: string
    points?: number
    title?: string
    isGroup?: Group
}

function ShareQrcode(props: ShareQrcodeProp) {
    const {lang} = useContext(langContext)
    const formatTime = useTime()

    return (
        <div className='share-qrcode-card'>
            <div className='inner'>
                <div className='card-header'>
                    <div className={'cover'}>
                        <div className={'point'}>{props.points}</div>
                        <img src={props.cover} alt=""/>
                    </div>
                    <div className='sender-info'>
                        <div className='badge-name'>{props.title || lang['Presend_Qrcode_Badge']} : {props.name}</div>
                        <div className='des'>
                            {props.isGroup ? lang['Presend_Qrcode_isGroup'] : ''}
                            {lang['Presend_Qrcode_Des']([props.isGroup?.username || props.sender.domain?.split('.')[0], props.title || lang['Presend_Qrcode_Badge']])}</div>
                    </div>
                </div>
                <div className='card-title'> {lang['Presend_Qrcode_Scan']} </div>
                <div className='card-recommended'>
                    <span>{lang['Presend_Qrcode_Recommended']}</span>
                    <img src="/images/wallet_icon/metamask.png" alt=""/>
                    <img src="/images/wallet_icon/imtoken.png" alt=""/>
                </div>
                <div className='code'>
                    { props.link &&
                        <QRcode size={[160, 160]} text={props.link}></QRcode>
                    }
                </div>
                {!!props.limit &&
                    <div className='limit'>
                        <i className='icon-profile'></i>
                        <span>{lang['Presend_Qrcode_Limit']([props.limit])}</span>
                    </div>
                }
                {!!props.start &&
                    <div className='time'>
                        <i className='icon-clock'></i>
                        <span>{lang['Presend_Qrcode_Time_2']([formatTime(props.start)])}</span>
                    </div>
                }
                {!!props.expires &&
                    <div className='time'>
                        <i className='icon-clock'></i>
                        <span>{lang['Presend_Qrcode_Time']([formatTime(props.expires)])}</span>
                    </div>
                }
            </div>
        </div>
    )
}

export default ShareQrcode
