import LangContext from '../../provider/LangProvider/LangContext'
import UserContext from '../../provider/UserProvider/UserContext'
import DialogsContext from '../../provider/DialogProvider/DialogsContext'
import {useContext, useEffect, useState} from 'react'
import DetailWrapper from './atoms/DetailWrapper/DetailWrapper'
import usePicture from '../../../hooks/pictrue'
import DetailHeader from './atoms/DetailHeader'
import DetailBadgeletMenu from './atoms/DetalBadgeletMenu'
import DetailBadgeletPrivateMark from './atoms/DetailBadgeletPriviateMark'
import DetailCover from './atoms/DetailCover'
import DetailName from './atoms/DetailName'
import DetailDes from './atoms/DetailDes/DetailDes'
import DetailArea from './atoms/DetailArea'
import AppButton, {BTN_KIND} from '../../base/AppButton/AppButton'
import BtnGroup from '../../base/BtnGroup/BtnGroup'
import solas, {Badgelet} from '../../../service/solas'
import useEvent, {EVENT} from '../../../hooks/globalEvent'
import ReasonText from '../../base/ReasonText/ReasonText'
import DetailScrollBox from './atoms/DetailScrollBox/DetailScrollBox'
import DetailCreator from './atoms/DetailCreator/DetailCreator'
import useTime from '../../../hooks/formatTime'
import DetailRow from "./atoms/DetailRow";


export interface DetailBadgeletProps {
    badgelet: Badgelet,
    handleClose: () => void
}

function DetailBadgelet(props: DetailBadgeletProps) {
    const {lang} = useContext(LangContext)
    const {user} = useContext(UserContext)
    const {openConnectWalletDialog, showLoading, showToast} = useContext(DialogsContext)
    const {defaultAvatar} = usePicture()
    const [_1, emitUpdate] = useEvent(EVENT.badgeletListUpdate)
    const [needUpdate, _2] = useEvent(EVENT.badgeletDetailUpdate)
    const [badgelet, setBadgelet] = useState(props.badgelet)
    const isBadgeletOwner = user.id === props.badgelet.receiver.id
    const formatTime = useTime()

    const [isGroupManager, setIsGroupManager] = useState(false)
    const isOwner = user.id === props.badgelet.owner.id

    const upDateBadgelet = async () => {
        const newBadgelet = await solas.queryBadgeletDetail({id: props.badgelet.id})
        setBadgelet(newBadgelet)
    }

    useEffect(() => {
        if (needUpdate) {
            upDateBadgelet()
        }
    }, [needUpdate])

    useEffect(() => {
        async function checkGroupManager() {
            if (user.id && !isOwner) {
                const ownerDetail = await solas.getProfile({
                    id: props.badgelet.owner.id
                })

                if (ownerDetail?.is_group) {
                    const isManager = await solas.checkIsManager({
                        group_id: props.badgelet.owner.id,
                        profile_id: user.id
                    })
                    setIsGroupManager(isManager)
                }
            }
        }

        checkGroupManager()
    }, [user.id])

    const handleAccept = async () => {
        const unload = showLoading()
        try {
            const accept = await solas.acceptBadgelet({
                badgelet_id: badgelet.id,
                auth_token: user.authToken || ''
            })

            unload()
            emitUpdate(badgelet)
            props.handleClose()
            showToast('Accept success')
            // navigate(`/profile/${user.userName}`)
        } catch (e: any) {
            unload()
            console.log('[handleAccept]: ', e)
            showToast(e.message || 'Accept fail')
        }
    }

    const handleReject = async () => {
        const unload = showLoading()
        try {
            const reject = await solas.rejectBadgelet({
                badgelet_id: badgelet.id,
                auth_token: user.authToken || ''
            })

            unload()
            emitUpdate(badgelet)
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

    const ActionBtns = <>
        <AppButton
            special
            kind={BTN_KIND.primary}
            onClick={() => {
                handleAccept()
            }}>
            {lang['BadgeDialog_Btn_Accept']}
        </AppButton>
        <AppButton onClick={() => {
            handleReject()
        }}>
            {lang['BadgeDialog_Btn_Reject']}
        </AppButton>
    </>

    const swiperMaxHeight = window.innerHeight - 320

    const metadata = badgelet.metadata ? JSON.parse(badgelet.metadata) : null

    return (
        <DetailWrapper>
            <DetailHeader
                title={lang['BadgeletDialog_title']}
                slotLeft={badgelet.hide && <DetailBadgeletPrivateMark/>}
                slotRight={
                    badgelet.status !== 'pending' &&
                    isBadgeletOwner &&
                    <DetailBadgeletMenu badgelet={badgelet} closeFc={props.handleClose}/>
                }
                onClose={props.handleClose}/>

            {(badgelet.badge.badge_type === 'private' && !isBadgeletOwner) ?
                <>
                    <DetailCover src={'/images/badge_private.png'} />
                    <DetailName> 🔒 </DetailName>
                    <DetailRow>
                        <DetailCreator isGroup={!!badgelet.badge.group} profile={badgelet.badge.group || badgelet.sender}/>
                    </DetailRow>
                    <DetailScrollBox style={{maxHeight: swiperMaxHeight - 60 + 'px', marginLeft: 0}}>
                        <DetailArea
                            onClose={props.handleClose}
                            title={lang['BadgeDialog_Label_Issuees']}
                            content={badgelet.receiver.domain
                                ? badgelet.receiver.domain.split('.')[0]
                                : ''
                            }
                            navigate={badgelet.receiver.domain
                                ? `/profile/${badgelet.receiver.domain?.split('.')[0]}`
                                : '#'}
                            image={badgelet.receiver.image_url || defaultAvatar(badgelet.receiver.id)}/>

                        <DetailArea
                            title={lang['BadgeDialog_Label_Creat_Time']}
                            content={formatTime(badgelet.created_at)}/>

                        {badgelet.badge.badge_type === 'private' &&
                            <DetailArea
                                title={lang['BadgeDialog_Label_Private']}
                                content={lang['BadgeDialog_Label_Private_text']}/>
                        }
                    </DetailScrollBox>
                </>
                : <>
                    <DetailCover src={metadata?.image || badgelet.badge.image_url}></DetailCover>
                    <DetailName> {metadata?.name || badgelet.badge.name} </DetailName>
                    <DetailRow>
                        <DetailCreator isGroup={!!badgelet.badge.group} profile={badgelet.badge.group || badgelet.sender}/>
                    </DetailRow>
                    <DetailScrollBox style={{maxHeight: swiperMaxHeight - 60 + 'px', marginLeft: 0}}>
                        {
                            !!badgelet.content &&
                            <DetailDes>
                                <ReasonText text={badgelet.content}></ReasonText>
                            </DetailDes>
                        }

                        <DetailArea
                            onClose={props.handleClose}
                            title={lang['BadgeDialog_Label_Issuees']}
                            content={badgelet.receiver.domain
                                ? badgelet.receiver.domain.split('.')[0]
                                : ''
                            }
                            navigate={badgelet.receiver.domain
                                ? `/profile/${badgelet.receiver.domain?.split('.')[0]}`
                                : '#'}
                            image={badgelet.receiver.image_url || defaultAvatar(badgelet.receiver.id)}/>

                        <DetailArea
                            title={lang['BadgeDialog_Label_Token']}
                            content={badgelet.domain}
                            link={badgelet.chain_data ? `https://moonscan.io/tx/${badgelet.chain_data}` : undefined}/>

                        <DetailArea
                            title={lang['BadgeDialog_Label_Creat_Time']}
                            content={formatTime(badgelet.created_at)}/>

                        {badgelet.badge.badge_type === 'private' &&
                            <DetailArea
                                title={lang['BadgeDialog_Label_Private']}
                                content={lang['BadgeDialog_Label_Private_text']}/>
                        }

                    </DetailScrollBox>
                </>
            }

            <BtnGroup>
                {!user.domain && LoginBtn}

                {!!user.domain
                    && (isGroupManager || isBadgeletOwner)
                    && badgelet.status === 'pending'
                    && ActionBtns}
            </BtnGroup>
        </DetailWrapper>
    )
}

export default DetailBadgelet
