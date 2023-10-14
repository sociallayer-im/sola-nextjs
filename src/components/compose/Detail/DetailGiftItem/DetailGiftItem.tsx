import LangContext from '../../../provider/LangProvider/LangContext'
import UserContext from '../../../provider/UserProvider/UserContext'
import DialogsContext from '../../../provider/DialogProvider/DialogsContext'
import {useContext, useEffect, useRef, useState} from 'react'
import DetailWrapper from '../atoms/DetailWrapper/DetailWrapper'
import usePicture from '../../../../hooks/pictrue'
import DetailHeader from '../atoms/DetailHeader'
import DetailBadgeletPrivateMark from '../atoms/DetailBadgeletPriviateMark'
import DetailCover from '../atoms/DetailCover'
import DetailName from '../atoms/DetailName'
import DetailDes from '../atoms/DetailDes/DetailDes'
import DetailArea from '../atoms/DetailArea'
import AppButton, {BTN_KIND} from '../../../base/AppButton/AppButton'
import BtnGroup from '../../../base/BtnGroup/BtnGroup'
import solas, {Badgelet, NftPasslet, queryBadgeletDetail} from '../../../../service/solas'
import useEvent, {EVENT} from '../../../../hooks/globalEvent'
import ReasonText from '../../../base/ReasonText/ReasonText'
import DetailScrollBox from '../atoms/DetailScrollBox/DetailScrollBox'
import DetailCreator from '../atoms/DetailCreator/DetailCreator'
import useTime from '../../../../hooks/formatTime'
import QRcode from "../../../base/QRcode";
import {useStyletron} from "baseui";
import DetailRow from "../atoms/DetailRow";
import DetailTransferable from "../atoms/DetailTransferable/DetailTransferable";
import useTransferOrRevoke from "../../../../hooks/transferOrRevoke";
import DetailBadgeletMenu from "../atoms/DetalBadgeletMenu";

export interface DetailNftpassletProps {
    giftItem: Badgelet,
    handleClose: () => void
}

const wrapper = {
    width: '220px',
    height: '238px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '62px auto 62px auto',
}
const title = {
    fontWeight: 600,
    fontSize: '20px',
    lineHeight: '28px',
    textAlign: 'center',
    color: '#272928',
    marginBottom: '8px',
}

const qrcodeWrapper = {
    width: '192px',
    height: '192px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#fff'
}

const NftpassQrcode = (props: { nftpasslet: NftPasslet }) => {
    const [css] = useStyletron()
    const {user} = useContext(UserContext)

    const text = user.authToken + '##' + props.nftpasslet.id + ''

    return <div className={css(wrapper as any)}>
        <div className={css(title as any)}>Scan the QR Code</div>
        <div className={css(qrcodeWrapper as any)}>
            <QRcode size={[160, 160]} text={text}/>
        </div>
    </div>
}

function DetailGiftItem(props: DetailNftpassletProps) {
    const {lang} = useContext(LangContext)
    const {user} = useContext(UserContext)
    const {openConnectWalletDialog, showLoading, showToast} = useContext(DialogsContext)
    const {defaultAvatar} = usePicture()
    const [_, emitUpdate] = useEvent(EVENT.giftItemUpdate)
    const [nftpasslet, setNftpasslet] = useState(props.giftItem)
    const formatTime = useTime()
    const [showQrcode, setShowQrcode] = useState(false)
    const [showChecked, setShowChecked] = useState(false)
    const interval = useRef<any>(null)
    const {transfer} = useTransferOrRevoke()

    const [isGroupManager, setIsGroupManager] = useState(false)
    const isOwner = user.id === props.giftItem.owner.id

    useEffect(() => {
        if (interval.current) {
            clearInterval(interval.current)
        }

        if (showQrcode && nftpasslet) {
            interval.current = setInterval(async () => {
                const badgelet = await queryBadgeletDetail({
                    id: nftpasslet.id,
                })
                if (badgelet.value !== nftpasslet.value) {
                    setNftpasslet(badgelet)
                    emitUpdate(badgelet)
                    setShowChecked(true)
                    setShowQrcode(false)
                }
            }, 1000)
        }

        return () => {
            if (interval.current) {
                clearInterval(interval.current)
            }
        }
    }, [showQrcode, nftpasslet])

    useEffect(() => {
        async function checkGroupManager() {
            if (user.id && !isOwner) {
                const ownerDetail = await solas.getProfile({
                    id: props.giftItem.owner.id
                })

                if (ownerDetail?.is_group) {
                    const isManager = await solas.checkIsManager({
                        group_id: props.giftItem.owner.id,
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
                badgelet_id: nftpasslet.id,
                auth_token: user.authToken || ''
            })

            unload()
            emitUpdate(nftpasslet)
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
                badgelet_id: nftpasslet.id,
                auth_token: user.authToken || ''
            })

            unload()
            emitUpdate(nftpasslet)
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

    const formatExpiration = (crateTime: string, start: null | string, end: null | string) => {
        let res = 'Unlimited'
        if (start && end) {
            res = `${formatTime(start)} - ${formatTime(end)}`
        }

        if (!start && end) {
            res = `${formatTime(crateTime)} -- ${formatTime(end)}`
        }

        if (start && !end) {
            res = `Available after ${formatTime(start)}`
        }

        return res
    }

    const checkAvailable = () => {
        const now = new Date().getTime()
        const start = nftpasslet.starts_at ? new Date(nftpasslet.starts_at).getTime() : null
        const end = nftpasslet.expires_at ? new Date(nftpasslet.expires_at).getTime() : null
        return !start || now >= start && (!end || now <= end)
    }

    const swiperMaxHeight = window.innerHeight - 320
    return (
        <DetailWrapper>
            <DetailHeader
                title={lang['BadgeletDialog_gift_title']}
                slotLeft={nftpasslet.hide && <DetailBadgeletPrivateMark/>}
                slotRight={
                    nftpasslet.status !== 'pending' &&
                    isOwner &&
                    <DetailBadgeletMenu badgelet={nftpasslet} closeFc={props.handleClose}/>
                }
                onClose={() => {
                    if (showQrcode) {
                        setShowQrcode(false)
                    } else {
                        props.handleClose()
                    }
                }}/>

            {!showChecked && <>
                <DetailCover src={nftpasslet.badge.image_url}></DetailCover>
                <DetailName> {nftpasslet.badge.name} </DetailName>
            </>
            }

            <DetailRow>
                {!showQrcode && !showChecked
                    && <DetailCreator isGroup={!!nftpasslet.badge.group}
                                      profile={nftpasslet.badge.group || nftpasslet.sender}/>
                }
                <DetailTransferable onClick={() => {
                    transfer({badgelet: nftpasslet})
                }}/>
            </DetailRow>

            {showQrcode && !showChecked && <div className={'use-gift'}>
                <NftpassQrcode nftpasslet={props.giftItem}/>
                <div
                    className={'owner'}>{lang['Gift_Checked_show_receiver']}: {props.giftItem.receiver.domain?.split('.')[0]}</div>
                <div className={'profit'}>{props.giftItem.content}</div>
                <div className='time'>
                    <i className='icon-clock'></i>
                    <span>{lang['Gift_Checked_show_remain']([props.giftItem.value])}</span>
                </div>
                {!!props.giftItem.last_consumed_at &&
                    <div className='time'>
                        <span>{lang['Gift_Checked_show_last_consume']}{formatTime(props.giftItem.last_consumed_at)}</span>
                    </div>
                }
            </div>}

            {!showQrcode && !showChecked && <>
                <DetailScrollBox style={{maxHeight: swiperMaxHeight - 60 + 'px', marginLeft: 0}}>
                    {
                        !!nftpasslet.content &&
                        <DetailDes title={lang['Create_Gift_Benefits']}>
                            <ReasonText text={nftpasslet.content}></ReasonText>
                        </DetailDes>
                    }

                    <DetailArea
                        onClose={props.handleClose}
                        title={lang['BadgeDialog_Label_Owner']}
                        content={nftpasslet.owner.domain
                            ? nftpasslet.owner.domain.split('.')[0]
                            : ''
                        }
                        navigate={nftpasslet.owner.domain
                            ? `/profile/${nftpasslet.owner.domain?.split('.')[0]}`
                            : '#'}
                        image={nftpasslet.owner.image_url || defaultAvatar(nftpasslet.owner.id)}/>

                    <DetailArea
                        onClose={props.handleClose}
                        title={lang['BadgeDialog_Label_Sender']}
                        content={nftpasslet.sender.domain
                            ? nftpasslet.sender.domain.split('.')[0]
                            : ''
                        }
                        navigate={nftpasslet.sender.domain
                            ? `/profile/${nftpasslet.sender.domain?.split('.')[0]}`
                            : '#'}
                        image={nftpasslet.sender.image_url || defaultAvatar(nftpasslet.sender.id)}/>

                    <DetailArea
                        title={lang['BadgeDialog_Label_Token']}
                        content={nftpasslet.domain}
                        link={nftpasslet.chain_data ? `https://moonscan.io/tx/${nftpasslet.chain_data}` : undefined}/>

                    <DetailArea
                        title={lang['Gift_Detail_amount']}
                        content={(nftpasslet.value || '0').toString()}/>

                    <DetailArea
                        title={lang['BadgeDialog_Label_Creat_Time']}
                        content={formatTime(nftpasslet.created_at)}/>

                    <DetailArea
                        title={lang['NFT_Detail_Expiration']}
                        content={formatExpiration(nftpasslet.created_at, nftpasslet.starts_at || null, nftpasslet.expires_at || null)}/>

                </DetailScrollBox>
                <BtnGroup>
                    {!user.domain && LoginBtn}

                    {!!user.domain
                        && (isOwner || isGroupManager)
                        && nftpasslet.status === 'pending'
                        && ActionBtns}

                    {!!user.domain
                        && (isOwner || isGroupManager)
                        && nftpasslet.status === 'accepted'
                        && (
                            <>
                                {
                                    checkAvailable() ?
                                        nftpasslet.value ?
                                            <AppButton
                                                special
                                                kind={BTN_KIND.primary}
                                                onClick={() => {
                                                    setShowQrcode(true)
                                                }}>
                                                {lang['Gift_Detail_use']}
                                            </AppButton>
                                            : <></>
                                        : <AppButton kind={BTN_KIND.secondary} disabled={true}>
                                            {lang['NFT_Detail_Unavailable']}
                                        </AppButton>
                                }
                            </>
                        )
                    }
                </BtnGroup>
            </>}

            {showChecked && <div className={'checked-panel'}>
                <div className={'title'}>{lang['Gift_Checked_Title']}</div>
                <div className={'des'}>{lang['Gift_Checked_Des']}</div>
                <div className={'info'}>
                    <DetailCover src={nftpasslet.badge.image_url}></DetailCover>
                    <DetailName> {nftpasslet.badge.name} </DetailName>
                </div>
                {nftpasslet.value !== 0 &&
                    <AppButton special onClick={() => {
                        setShowQrcode(true)
                        setShowChecked(false)
                    }}>{lang['Gift_Checked_Btn']([nftpasslet.value || 'Unlimited'])}</AppButton>
                }
            </div>}
        </DetailWrapper>
    )
}

export default DetailGiftItem
