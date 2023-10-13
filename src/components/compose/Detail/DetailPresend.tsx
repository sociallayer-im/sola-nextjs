import LangContext from '../../provider/LangProvider/LangContext'
import UserContext from '../../provider/UserProvider/UserContext'
import DialogsContext from '../../provider/DialogProvider/DialogsContext'
import { useContext, useEffect, useState } from 'react'
import { Presend, ProfileSimple } from '../../../service/solas'
import DetailWrapper from './atoms/DetailWrapper/DetailWrapper'
import usePicture from '../../../hooks/pictrue'
import DetailHeader from './atoms/DetailHeader'
import DetailCover from './atoms/DetailCover'
import DetailName from './atoms/DetailName'
import DetailDes from './atoms/DetailDes/DetailDes'
import DetailArea from './atoms/DetailArea'
import AppButton, { BTN_KIND } from '../../base/AppButton/AppButton'
import BtnGroup from '../../base/BtnGroup/BtnGroup'
import solas, { Profile } from '../../../service/solas'
import useEvent, { EVENT } from '../../../hooks/globalEvent'
import DetailReceivers from './atoms/DetailReceivers'
import DetailScrollBox from './atoms/DetailScrollBox/DetailScrollBox'
import ReasonText from '../../base/ReasonText/ReasonText'
import DetailCreator from './atoms/DetailCreator/DetailCreator'
import useTime from '../../../hooks/formatTime'
import DetailFace2FaceQrcode from './DetailFace2FaceQrcode'
import DetailRow from './atoms/DetailRow'
import {useRouter} from 'next/navigation'

export interface DetailPresendProps {
    presend: Presend,
    code?: string
    handleClose: () => void
}

function DetailPresend (props: DetailPresendProps ) {
    const { lang } = useContext(LangContext)
    const { user } = useContext(UserContext)
    const { openConnectWalletDialog, showLoading, showToast, openDialog } = useContext(DialogsContext)
    const { defaultAvatar } = usePicture()
    const [_1, emitBadgeletListUpdate] = useEvent(EVENT.badgeletListUpdate)
    const [_2, emitPresendListUpdate] = useEvent(EVENT.presendListUpdate)
    const [sender, setSender] = useState<Profile | null>(null)
    const [receivers, setReceivers] = useState<ProfileSimple[]>([])
    const [claimed, setClaimed] = useState(true)
    const [acceptableAmount, setAcceptableAmount] = useState<number>(0)
    const formatTime = useTime()
    const [detail, setDetail] = useState(props.presend)

    useEffect(() => {
        async function getOwnerProfile () {
            const profile = await solas.getProfile({ id: props.presend.sender_id })
            setSender(profile)
        }

        async function getReceiver () {
            const presendWithBadgelets = await solas.queryPresendDetail({
                id: props.presend.id,
                auth_token: user.authToken || ''
            })

            setDetail(presendWithBadgelets)

            const receiver = presendWithBadgelets.badgelets.map(item => {
                return item.receiver
            })

            const claimed = receiver.some(item => item.id === user.id)

            console.log('hasClaim', claimed)

            setClaimed(claimed)
            setReceivers(receiver)
            setAcceptableAmount(Math.min(20, receiver.length + (props.presend.counter || 0)))
        }

        getOwnerProfile()
        getReceiver()
    },[])

    const loginUserIsSender = user.id === sender?.id
    const canClaim = props.presend.counter > 0 || props.presend.counter === null

    const handleAccept= async () => {
        const unload = showLoading()
        try {
            const accept = await solas.acceptPresend({
                id: props.presend.id,
                code: props.code || '',
                auth_token: user.authToken || ''
            })
            unload()
            emitBadgeletListUpdate(props.presend)
            emitPresendListUpdate(props.presend)
            showToast('Accept success')
            props.handleClose()
            // navigate(`/profile/${user.userName}`)
        } catch (e: any) {
            unload()
            console.log('[handleAccept]: ', e)
            showToast(e.message || 'Accept fail')
        }
    }

    const ActionBtns =  <>
        { canClaim && !claimed &&
            <AppButton
                special
                onClick={ () => { handleAccept() } }>
                { lang['BadgeDialog_Btn_Accept'] }</AppButton>
        }

        { loginUserIsSender && canClaim
            && <AppButton onClick={ () => { openQrCode() } }>
                { lang['BadgeDialog_Btn_Issue'] }</AppButton>
        }
    </>

    const LoginBtn = <AppButton
        special
        onClick={ () => { openConnectWalletDialog() } }
        kind={ BTN_KIND.primary }>
        { lang['BadgeDialog_Btn_Login'] }
    </AppButton>

    const openQrCode = () => {
        const dialog = openDialog({
            content: (close: any) =>  <DetailFace2FaceQrcode presendId={ props.presend.id } handleClose={ close }/>,
            position: 'bottom',
            size: [460, 'auto']
        })
    }

    const swiperMaxHeight = window.innerHeight - 320
    return <DetailWrapper>
        <DetailHeader title={ lang['BadgeletDialog_presend_title'] } onClose={ props.handleClose }/>
        <DetailCover src={ props.presend.badge.image_url }></DetailCover>
        <DetailName> { props.presend.badge.name } </DetailName>
        { sender &&
            <DetailRow>
                <DetailCreator isGroup={!!detail.badge.group } profile={ detail.badge.group || sender } />
            </DetailRow>

        }
        <DetailScrollBox style={{maxHeight: swiperMaxHeight - 60 + 'px', marginLeft: 0}}>
            { !!props.presend.message &&
                <DetailDes>
                    <ReasonText text={ props.presend.message } />
                </DetailDes>
            }


            {
                !!acceptableAmount &&
                <DetailReceivers
                    length={ acceptableAmount }
                    placeholder={ true }
                    receivers={ receivers }
                    title={ lang['BadgeDialog_Label_Issuees']} />
            }


            <DetailArea
                title={ lang['BadgeDialog_Label_Token'] }
                content={ props.presend.badge.domain } />

            <DetailArea
                title={ lang['BadgeDialog_Label_Creat_Time'] }
                content={ formatTime(props.presend.created_at ) } />
        </DetailScrollBox>
        <BtnGroup>
            { user.domain ? ActionBtns : LoginBtn }
        </BtnGroup>
    </DetailWrapper>
}

export default DetailPresend
