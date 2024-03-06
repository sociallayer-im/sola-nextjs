import LangContext from '../../provider/LangProvider/LangContext'
import UserContext from '../../provider/UserProvider/UserContext'
import DialogsContext from '../../provider/DialogProvider/DialogsContext'
import {useContext, useEffect, useState} from 'react'
import DetailWrapper from './atoms/DetailWrapper/DetailWrapper'
import usePicture from '../../../hooks/pictrue'
import DetailHeader from './atoms/DetailHeader'
import DetailCover from './atoms/DetailCover'
import DetailName from './atoms/DetailName'
import DetailDes from './atoms/DetailDes/DetailDes'
import DetailArea from './atoms/DetailArea'
import AppButton, {BTN_KIND} from '../../base/AppButton/AppButton'
import BtnGroup from '../../base/BtnGroup/BtnGroup'
import solas, {Badgelet, getVoucherCode, rejectVoucher, Voucher} from '../../../service/solas'
import useEvent, {EVENT} from '../../../hooks/globalEvent'
import ReasonText from '../../base/ReasonText/ReasonText'
import DetailScrollBox from './atoms/DetailScrollBox/DetailScrollBox'
import DetailCreator from './atoms/DetailCreator/DetailCreator'
import useTime from '../../../hooks/formatTime'
import DetailRow from "./atoms/DetailRow";
import DetailReceivers from "@/components/compose/Detail/atoms/DetailReceivers";
import DetailFace2FaceQrcode from "@/components/compose/Detail/DetailFace2FaceQrcode";
import {useSearchParams, useRouter} from "next/navigation";


export interface DetailBadgeletProps {
    redirect?: boolean,
    voucher: Voucher,
    code?: string,
    handleClose: () => void
}

function DetailVoucher({redirect=true, ...props}: DetailBadgeletProps) {
    const {lang} = useContext(LangContext)
    const {user} = useContext(UserContext)
    const router = useRouter()
    const {openConnectWalletDialog, showLoading, showToast, openDialog} = useContext(DialogsContext)
    const {defaultAvatar} = usePicture()
    const searchParams = useSearchParams()
    const [_1, emitUpdate] = useEvent(EVENT.badgeletListUpdate)
    const [needUpdate, _2] = useEvent(EVENT.badgeletDetailUpdate)
    const [voucher, setVoucher] = useState(props.voucher)

    const isCreator = user.id === props.voucher.sender.id
    const isPresend = props.voucher.strategy === 'code'
    const isBadgeletOwner = (props.voucher.receiver && user.id === props.voucher.receiver.id) || props.voucher.receiver_address === user.wallet

    const formatTime = useTime()

    const [isGroupManager, setIsGroupManager] = useState(false)
    const isOwner = user.id === props.voucher.sender.id

    const upDate = async () => {
        const newVoucher = await solas.queryVoucherDetail(voucher.id)
        setVoucher(newVoucher)
    }

    useEffect(() => {
        if (needUpdate) {
            upDate()
        }
    }, [needUpdate])

    useEffect(() => {
        async function checkGroupManager() {
            if (user.id && !isOwner) {
                if (voucher?.group) {
                    const isManager = await solas.checkIsManager({
                        group_id: voucher!.group!.id,
                        profile_id: user.id
                    })
                    setIsGroupManager(isManager)
                }
            }
        }

        checkGroupManager()
    }, [user.id])

    const handleAccept = async () => {
        if (!props.voucher) {
            return
        }

        if (isPresend && !props.code && !isCreator) {
            return
        }

        let _code = props.code
        if (isPresend && isCreator && !props.code) {
            _code = await getVoucherCode({
                id: props.voucher.id,
                auth_token: user.authToken || ''
            })
        }

        const unload = showLoading()
        try {
            const accept = await solas.acceptBadgelet({
                voucher_id: props.voucher.id,
                auth_token: user.authToken || '',
                code: _code ? Number(_code) : undefined,
                index: searchParams?.get('index') ? Number(searchParams?.get('index')) : undefined
            })

            unload()
            // emitUpdate(badgelet)
            props.handleClose()
            showToast('Accept success')
            redirect && router.push(`/profile/${user.userName}`)
        } catch (e: any) {
            unload()
            console.log('[handleAccept]: ', e)
            showToast(e.message || 'Accept fail')
        }
    }

    const handleReject = async () => {
        const unload = showLoading()
        try {
            const reject = await solas.rejectVoucher({
                id: voucher.id,
                auth_token: user.authToken || ''
            })

            unload()
            // emitUpdate(badgelet)
            props.handleClose()
            showToast('rejected')
        } catch (e: any) {
            unload()
            console.log('[handleAccept]: ', e)
            showToast(e.message || 'Reject fail')
        }
    }

    const LoginBtn = <AppButton
        special
        onClick={() => {
            openConnectWalletDialog()
        }}
        kind={BTN_KIND.primary}>
        {lang['BadgeDialog_Btn_Login']}
    </AppButton>

    const openQrCode = () => {
        const dialog = openDialog({
            content: (close: any) =>  <DetailFace2FaceQrcode presendId={ props.voucher.id } handleClose={ close }/>,
            position: 'bottom',
            size: [460, 'auto']
        })
    }

    const ActionBtns = <>
            <AppButton
                special
                kind={BTN_KIND.primary}
                onClick={() => {
                    handleAccept()
                }}>
                {lang['BadgeDialog_Btn_Accept']}
            </AppButton>
        { isBadgeletOwner &&
            <AppButton onClick={() => {
                handleReject()
            }}>
                {lang['BadgeDialog_Btn_Reject']}
            </AppButton>
        }
        { (isGroupManager || isCreator) &&
            <AppButton onClick={() => {
                openQrCode()
            }}>
                {lang['BadgeDialog_Btn_Issue']}
            </AppButton>
        }
    </>

    const swiperMaxHeight = window.innerHeight - 320

    return (
        <DetailWrapper>
            <DetailHeader
                title={'Voucher Detail'}
                onClose={props.handleClose}/>

            <>
                <DetailCover src={voucher.badge.image_url}></DetailCover>
                <DetailName> {voucher.badge.name} </DetailName>
                <DetailRow>
                    <DetailCreator isGroup={!!voucher.badge.group} profile={voucher.badge.group || voucher.sender}/>
                </DetailRow>
                <DetailScrollBox style={{maxHeight: swiperMaxHeight - 60 + 'px', marginLeft: 0}}>
                    {
                        !!voucher.badge.content &&
                        <DetailDes>
                            <ReasonText text={voucher.message || voucher.badge.content}></ReasonText>
                        </DetailDes>
                    }

                    { voucher.strategy === 'account' ?
                            <DetailArea
                                onClose={props.handleClose}
                                title={lang['BadgeDialog_Label_Issuees']}
                                content={voucher.receiver?.username || ''}
                                navigate={voucher.receiver?.username
                                    ? `/profile/${voucher.receiver?.username}`
                                    : '#'}
                                image={voucher.receiver?.image_url || defaultAvatar(voucher.receiver?.id)}/>
                            : <DetailReceivers
                        length={ voucher.counter + voucher.badgelets.length}
                        placeholder={ true }
                        receivers={ voucher.badgelets.map(i => i.owner) || [] as any }
                        title={ lang['BadgeDialog_Label_Issuees']} />
                    }



                    <DetailArea
                        title={lang['BadgeDialog_Label_Creat_Time']}
                        content={formatTime(voucher.created_at)}/>
                </DetailScrollBox>
            </>

            <BtnGroup>
                {!user.userName && LoginBtn}
                {!!user.userName
                    && (isBadgeletOwner || isCreator || isPresend)
                    && props.voucher.counter !== 0
                    && ActionBtns }
            </BtnGroup>
        </DetailWrapper>
    )
}

export default DetailVoucher
