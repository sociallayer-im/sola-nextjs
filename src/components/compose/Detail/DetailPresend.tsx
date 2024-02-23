import LangContext from '../../provider/LangProvider/LangContext'
import UserContext from '../../provider/UserProvider/UserContext'
import DialogsContext from '../../provider/DialogProvider/DialogsContext'
import { useContext, useEffect, useState } from 'react'
import {getVoucherCode, Presend, ProfileSimple, Voucher} from '../../../service/solas'
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
import {useSearchParams, useRouter} from 'next/navigation'

export interface DetailPresendProps {
    presend: Voucher,
    code?: string
    handleClose: () => void
}

function DetailPresend (props: DetailPresendProps ) {
    const { lang } = useContext(LangContext)
    const { user } = useContext(UserContext)
    const searchParams = useSearchParams()
    const router = useRouter()
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
    const [code, setCode] = useState(props.code)

    useEffect(() => {
        setSender(props.presend.sender as Profile)

        async function getReceiver () {
            const presendWithBadgelets = await solas.queryPresendDetail({
                id: props.presend.id
            })

            setDetail(presendWithBadgelets)

            const receiver = presendWithBadgelets.badgelets.map(item => {
                return item.owner
            })

            const claimed = receiver.some(item => item.id === user.id)

            console.log('hasClaim', claimed)

            setClaimed(claimed)
            setReceivers(receiver)
            setAcceptableAmount(Math.min(20, receiver.length + (props.presend.counter || 0)))

            if (props.presend.sender.id === user.id) {
                const code = await getVoucherCode({id: props.presend.id, auth_token: user.authToken || ''})
                setCode(code)
            }
        }

        getReceiver()
    },[])

    const loginUserIsSender = user.id === sender?.id
    const canClaim = (!props.presend.receiver && (props.presend.counter > 0 || props.presend.counter === null))
        || (!!props.presend.receiver && props.presend.receiver.id === user.id)

    const handleAccept= async () => {
        const unload = showLoading()
        try {

            const accept = await solas.acceptPresend({
                voucher_id: props.presend.id,
                code: Number(code),
                auth_token: user.authToken || '',
                index: searchParams?.get('index') ? Number(searchParams.get('index')) : undefined
            })
            unload()
            emitBadgeletListUpdate(props.presend)
            emitPresendListUpdate(props.presend)
            showToast('Accept success')
            props.handleClose()
            router.push(`/profile/${user.userName}`)
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
                !!acceptableAmount && !props.presend.receiver &&
                <DetailReceivers
                    length={ acceptableAmount }
                    placeholder={ true }
                    receivers={ receivers }
                    title={ lang['BadgeDialog_Label_Issuees']} />
            }

            { props.presend.receiver &&
                <DetailArea
                    onClose={props.handleClose}
                    title={lang['BadgeDialog_Label_Issuees']}
                    content={props.presend.receiver.username
                        ? props.presend.receiver.username
                        : ''
                    }
                    navigate={props.presend.receiver.username
                        ? `/profile/${props.presend.receiver.username}`
                        : '#'}
                    image={props.presend.receiver.image_url || defaultAvatar(props.presend.receiver.id)}/>
            }


            <DetailArea
                title={ lang['BadgeDialog_Label_Creat_Time'] }
                content={ formatTime(props.presend.created_at ) } />
        </DetailScrollBox>
        <BtnGroup>
            { user.userName ?
                code ? ActionBtns
                    : <></>
                : LoginBtn }
        </BtnGroup>
    </DetailWrapper>
}

export default DetailPresend
