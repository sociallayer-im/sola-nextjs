import LangContext from '../../provider/LangProvider/LangContext'
import UserContext from '../../provider/UserProvider/UserContext'
import DialogsContext from '../../provider/DialogProvider/DialogsContext'
import {useContext, useEffect, useRef, useState} from 'react'
import DetailWrapper from './atoms/DetailWrapper/DetailWrapper'
import usePicture from '../../../hooks/pictrue'
import DetailHeader from './atoms/DetailHeader'
import DetailName from './atoms/DetailName'
import DetailDes from './atoms/DetailDes/DetailDes'
import DetailArea from './atoms/DetailArea'
import AppButton, {BTN_KIND} from '../../base/AppButton/AppButton'
import BtnGroup from '../../base/BtnGroup/BtnGroup'
import solas, {PointTransfer} from '../../../service/solas'
import useEvent, {EVENT} from '../../../hooks/globalEvent'
import ReasonText from '../../base/ReasonText/ReasonText'
import DetailScrollBox from './atoms/DetailScrollBox/DetailScrollBox'
import DetailCreator from './atoms/DetailCreator/DetailCreator'
import useTime from '../../../hooks/formatTime'
import PointCover from "./atoms/PointCover";
import DetailRow from "./atoms/DetailRow";

//HorizontalList deps
import { Swiper, SwiperSlide, useSwiper } from 'swiper/react'
import { Pagination } from 'swiper'
import 'swiper/css'
import 'swiper/css/pagination'
import SwiperPagination from "../../base/SwiperPagination/SwiperPagination";


export interface DetailBadgeletProps {
    pointTransfer: PointTransfer,
    handleClose: () => void
}

function DetailPointItem(props: DetailBadgeletProps) {
    const {lang} = useContext(LangContext)
    const {user} = useContext(UserContext)
    const {openConnectWalletDialog, showLoading, showToast} = useContext(DialogsContext)
    const {defaultAvatar} = usePicture()
    const [_1, emitUpdate] = useEvent(EVENT.pointItemUpdate)
    const [needUpdate, _2] = useEvent(EVENT.pointItemListUpdate)
    const [pointTransfer, setPointTransfer] = useState(props.pointTransfer)
    const [pointTransferList, setPointTransferList] = useState<PointTransfer[]>([])
    const formatTime = useTime()
    const swiper = useRef<any>(null)
    const swiperIndex = useRef(0)

    const [isGroupManager, setIsGroupManager] = useState(false)
    const isOwner = user.id === props.pointTransfer.owner.id


    const upDateBadgelet = async () => {
        const newPointTransfer = await solas.queryPointTransferDetail({id: props.pointTransfer.id})
        setPointTransfer(newPointTransfer!)
    }

    const getItemsOfSamePoint = async () => {
        const items = await solas.queryPointTransfers({point_balance_id: props.pointTransfer.point.id, owner_id: props.pointTransfer.owner.id})
        setPointTransferList(items)
    }

    useEffect(() => {
        if (needUpdate) {
            upDateBadgelet()
        }
    }, [needUpdate])

    useEffect(() => {
        getItemsOfSamePoint()
    },[])

    useEffect(() => {
        async function checkGroupManager() {
            if (user.id && !isOwner) {
                const ownerDetail = await solas.getProfile({
                    id: props.pointTransfer.owner.id
                })

                if (!!(ownerDetail as any)?.creator) { //group
                    const isManager = await solas.checkIsManager({
                        group_id: props.pointTransfer.owner.id,
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
            const accept = await solas.acceptPoint({
                point_transfer_id: props.pointTransfer.id,
                auth_token: user.authToken || ''
            })

            unload()
            emitUpdate(accept)
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
            const reject = await solas.rejectPoint({
                point_transfer_id: props.pointTransfer.id,
                auth_token: user.authToken || ''
            })

            unload()
            emitUpdate(reject)
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
    console.log('props.pointTransfer', pointTransfer)
    return (
        <DetailWrapper>
            <DetailHeader
                title={lang['Point_Detail_Title']}
                onClose={props.handleClose}/>

            <PointCover value={pointTransfer.value} src={pointTransfer.point.image_url}/>
            <DetailName> {pointTransfer.point.title} </DetailName>
            <DetailRow>
                <DetailCreator isGroup={!!pointTransfer.point.group}
                               profile={pointTransfer.point.group || pointTransfer.sender}/>
            </DetailRow>

            <div style={{width: '100%', overflow: 'hidden', maxHeight: swiperMaxHeight + 'px'}}>
                <Swiper
                    ref={ swiper }
                    modules={ [Pagination] }
                    spaceBetween={ 12 }
                    className='badge-detail-swiper'
                    onSlideChange={ (swiper) => swiperIndex.current = swiper.activeIndex }
                    slidesPerView={'auto'}>
                    <SwiperPagination total={ pointTransferList.length } showNumber={3} />
                    {
                        pointTransferList.map((item, index) =>
                            <SwiperSlide className='badge-detail-swiper-slide' key={ item.id }>
                                <DetailScrollBox style={{maxHeight: swiperMaxHeight - 60 + 'px', marginLeft: 0}}>
                                    {
                                        !!item.point.content &&
                                        <DetailDes>
                                            <ReasonText text={item.point.content}></ReasonText>
                                        </DetailDes>
                                    }

                                    <DetailArea
                                        title={lang['Profile_Tab_Point']}
                                        content={item.value + ''}/>

                                    <DetailArea
                                        title={lang['Create_Point_Symbol']}
                                        content={pointTransfer.point.sym ? pointTransfer.point.sym.toUpperCase() : '--'}/>

                                    <DetailArea
                                        onClose={props.handleClose}
                                        title={lang['BadgeDialog_Label_Issuees']}
                                        content={item.owner.domain
                                            ? item.owner.domain.split('.')[0]
                                            : ''
                                        }
                                        navigate={item.owner.domain
                                            ? `/profile/${item.owner.domain?.split('.')[0]}`
                                            : '#'}
                                        image={item.owner.image_url || defaultAvatar(item.owner.id)}/>

                                    <DetailArea
                                        title={lang['BadgeDialog_Label_Creat_Time']}
                                        content={formatTime(item.created_at)}/>

                                </DetailScrollBox>
                            </SwiperSlide>
                        )
                    }
                </Swiper>
            </div>


            <BtnGroup>
                {!user.domain && LoginBtn}

                {!!user.domain
                    && (isOwner || isGroupManager)
                    && props.pointTransfer.status === 'sending'
                    && ActionBtns}
            </BtnGroup>
        </DetailWrapper>
    )
}

export default DetailPointItem
