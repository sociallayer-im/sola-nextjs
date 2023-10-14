import LangContext from '../../../provider/LangProvider/LangContext'
import UserContext from '../../../provider/UserProvider/UserContext'
import DialogsContext from "../../../provider/DialogProvider/DialogsContext";
import {useContext, useEffect, useRef, useState} from 'react'
import DetailWrapper from '../atoms/DetailWrapper/DetailWrapper'
import usePicture from '../../../../hooks/pictrue'
import DetailHeader from '../atoms/DetailHeader'
import solas, {Badge, Badgelet} from '../../../../service/solas'
import DetailCover from '../atoms/DetailCover'
import DetailName from '../atoms/DetailName'
import DetailArea from '../atoms/DetailArea'
import AppButton, {BTN_KIND, BTN_SIZE} from '../../../base/AppButton/AppButton'
import BtnGroup from '../../../base/BtnGroup/BtnGroup'
import DetailScrollBox from '../atoms/DetailScrollBox/DetailScrollBox'
import useTime from '../../../../hooks/formatTime'
import DetailCreator from '../atoms/DetailCreator/DetailCreator'
import ReasonText from '../../../base/ReasonText/ReasonText'
import DetailDes from '../atoms/DetailDes/DetailDes'
import SwiperPagination from '../../../base/SwiperPagination/SwiperPagination'
import DetailRow from "../atoms/DetailRow";
import DetailBadgeMenu from "../atoms/DetalBadgeMenu";
import useEvent, {EVENT} from "../../../../hooks/globalEvent";
import {useRouter} from "next/navigation";

//HorizontalList deps
import {Swiper, SwiperSlide} from 'swiper/react'
import {Pagination} from 'swiper'
import 'swiper/css'
import 'swiper/css/pagination'

export interface DetailBadgeProps {
    badge: Badge,
    handleClose: () => void
}

function DetailGift(props: DetailBadgeProps) {
    const {lang} = useContext(LangContext)
    const {user} = useContext(UserContext)
    const {showGiftCheckIn} = useContext(DialogsContext)
    const {defaultAvatar} = usePicture()
    const router = useRouter()
    const [badgelets, setBadgelets] = useState<Badgelet[]>([])
    const swiper = useRef<any>(null)
    const formatTime = useTime()
    const swiperIndex = useRef(0)
    const [needUpdate, _] = useEvent(EVENT.badgeDetailUpdate)
    const [isGroupManager, setIsGroupManager] = useState(false)
    const loginUserIsSender = user.id === props.badge.sender.id || user.id === props.badge.group?.id

    useEffect(() => {
        async function getBadgelet() {
            const badgeWithBadgelets = await solas.queryBadgeDetail({id: props.badge.id})
            let badgelets = badgeWithBadgelets.badgelets.filter(item => {
                return item.status === 'accepted'
            })
            badgelets = badgelets.map(item => {
                item.badge = props.badge
                return item
            })
            setBadgelets(badgelets)
        }

        getBadgelet()
    }, [needUpdate])

    useEffect(() => {
        async function checkManager() {
            if (props.badge.group && user.id) {
                const isManager = await solas.checkIsManager({
                    group_id: props.badge.group.id,
                    profile_id: user.id
                })
                setIsGroupManager(isManager)
            }
        }

        checkManager()
    }, [user.id])

    const handleIssue = async () => {
        router.push(`/create-gift?gift=${props.badge.id}`)
        props.handleClose()
    }

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

    const swiperMaxHeight = window.innerHeight - 320
    return (
        <DetailWrapper>
            <DetailHeader
                slotRight={<DetailBadgeMenu isGroupManager={isGroupManager} badge={props.badge}/>}
                title={lang['BadgeletDialog_gift_title']}
                onClose={props.handleClose}/>
            <DetailCover src={props.badge.image_url}></DetailCover>
            <DetailName> {props.badge.name} </DetailName>
            <DetailRow>
                <DetailCreator isGroup={!!props.badge.group}
                               profile={props.badge.group || props.badge.sender}/>
            </DetailRow>

            {
                badgelets.length > 0 ?
                    <div style={{width: '100%', overflow: 'hidden', maxHeight: swiperMaxHeight + 'px'}}>
                        <Swiper
                            ref={swiper}
                            modules={[Pagination]}
                            spaceBetween={12}
                            className='badge-detail-swiper'
                            onSlideChange={(swiper) => swiperIndex.current = swiper.activeIndex}
                            slidesPerView={'auto'}>
                            <SwiperPagination total={badgelets.length} showNumber={3}/>
                            {
                                badgelets.map((badgelet, index) =>
                                    <SwiperSlide className='badge-detail-swiper-slide' key={badgelet.id}>
                                        <DetailScrollBox style={{maxHeight: swiperMaxHeight - 40 + 'px'}}>
                                            {!!badgelet.content &&
                                                <DetailDes>
                                                    <ReasonText text={badgelet.content}/>
                                                </DetailDes>
                                            }
                                            <DetailArea
                                                onClose={props.handleClose}
                                                title={lang['BadgeDialog_Label_Owner']}
                                                content={badgelet.owner.domain
                                                    ? badgelet.owner.domain.split('.')[0]
                                                    : ''
                                                }
                                                navigate={badgelet.owner.domain
                                                    ? `/profile/${badgelet.owner.domain?.split('.')[0]}`
                                                    : '#'}
                                                image={badgelet.owner.image_url || defaultAvatar(badgelet.owner.id)}/>

                                            <DetailArea
                                                title={lang['BadgeDialog_Label_Token']}
                                                content={props.badge.domain}/>


                                            <DetailArea
                                                title={lang['NFT_Detail_Expiration']}
                                                content={formatExpiration(badgelet.created_at, badgelet.starts_at || null, badgelet.expires_at || null)}/>

                                            <DetailArea
                                                title={lang['BadgeDialog_Label_Creat_Time']}
                                                content={formatTime(badgelet.created_at)}/>

                                            <DetailArea
                                                title={lang['BadgeDialog_Label_Private']}
                                                content={lang['BadgeDialog_Label_gift_text']}/>
                                        </DetailScrollBox>
                                    </SwiperSlide>
                                )
                            }
                        </Swiper>
                    </div>

                    : <DetailScrollBox style={{maxHeight: swiperMaxHeight - 60 + 'px', marginLeft: 0}}>
                        {!!props.badge.content &&
                            <DetailDes>
                                <ReasonText text={props.badge.content}/>
                            </DetailDes>
                        }

                        <DetailArea
                            title={lang['BadgeDialog_Label_Token']}
                            content={props.badge.domain}/>

                        <DetailArea
                            title={lang['BadgeDialog_Label_Creat_Time']}
                            content={formatTime(props.badge.created_at)}/>

                        <DetailArea
                            title={lang['BadgeDialog_Label_Private']}
                            content={lang['BadgeDialog_Label_gift_text']}/>

                    </DetailScrollBox>
            }

            <BtnGroup>
                {(loginUserIsSender || isGroupManager) &&
                    <>
                        <AppButton size={BTN_SIZE.compact} onClick={() => {
                            showGiftCheckIn(props.badge.id)
                        }} kind={BTN_KIND.primary} special>
                            {lang['Gift_detail_check_btn']}
                        </AppButton>
                        <AppButton size={BTN_SIZE.compact} onClick={() => {
                            handleIssue()
                        }} kind={'secondary'}>
                            {lang['BadgeDialog_Btn_Issue']}
                        </AppButton>
                    </>
                }
            </BtnGroup>
        </DetailWrapper>
    )
}

export default DetailGift
