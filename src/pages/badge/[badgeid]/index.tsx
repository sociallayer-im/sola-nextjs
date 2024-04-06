import {useContext, useEffect, useRef, useState} from 'react'
import styles from './BadgeDetail.module.scss'
import PageBack from "@/components/base/PageBack";
import {Badge, getGroupMemberShips, Membership, queryBadgeDetail} from "@/service/solas";
import DetailCover from "@/components/compose/Detail/atoms/DetailCover";
import DetailRow from "@/components/compose/Detail/atoms/DetailRow";
import DetailCreator from "@/components/compose/Detail/atoms/DetailCreator/DetailCreator";
import ReceiverCount from "@/components/compose/Detail/atoms/ReceiverCount/ReceiverCount";
import AppButton, {BTN_KIND, BTN_SIZE} from "@/components/base/AppButton/AppButton";
import BtnGroup from "@/components/base/BtnGroup/BtnGroup";
import {useRouter} from "next/navigation";
import LangContext from "@/components/provider/LangProvider/LangContext";
import userContext from "@/components/provider/UserProvider/UserContext";
import SwiperPagination from "@/components/base/SwiperPagination/SwiperPagination";
import DetailScrollBox from "@/components/compose/Detail/atoms/DetailScrollBox/DetailScrollBox";
import DetailArea from "@/components/compose/Detail/atoms/DetailArea";
import DetailDes from "@/components/compose/Detail/atoms/DetailDes/DetailDes";
import ReasonText from "@/components/base/ReasonText/ReasonText";
import useTime from "@/hooks/formatTime";
import usePicture from "@/hooks/pictrue";
import Head from 'next/head'

//HorizontalList deps
import {Swiper, SwiperSlide} from 'swiper/react'
import {Pagination} from 'swiper'
import 'swiper/css'
import 'swiper/css/pagination'
import DetailBadgeMenu from "@/components/compose/Detail/atoms/DetalBadgeMenu";
import DetailName from "@/components/compose/Detail/atoms/DetailName";

function BadgeDetail(props: { badge: Badge, memberships: Membership[] }) {
    const router = useRouter()
    const {lang} = useContext(LangContext)
    const {user} = useContext(userContext)

    const swiper = useRef<any>(null)
    const formatTime = useTime()
    const swiperIndex = useRef(0)
    const {defaultAvatar} = usePicture()


    const [badge, setBadge] = useState<Badge>(props.badge)
    const [isGroupManager, setIsGroupManager] = useState(false)
    const [isIssuer, setIssuer] = useState(false)
    const [isGroupOwner, setIsGroupOwner] = useState(false)
    const [loginUserIsSender, setLoginUserIsSender] = useState(false)

    const isSolana = props.badge.metadata ? JSON.parse(props.badge.metadata).solanabadge : false

    useEffect(() => {
        setLoginUserIsSender(badge.creator.id === user.id)

        if (props.memberships.length > 0) {
            const target = props.memberships.find((item) => item.profile.id === user.id)
            setIsGroupManager(!!target && target.role === 'manager')
            setIsGroupOwner(!!target && target.role === 'owner')
            setIssuer(!!target && target.role === 'issuer')
        }
    }, [user.id, props.memberships])

    const handleIssue = async () => {
        isSolana ?
            router.push(`/issue-solanabadge/${badge.id}`) :
            router.push(`/issue-badge/${badge.id}`)
    }

    const metadata = props.badge.metadata ? JSON.parse(props.badge.metadata) : {}

    const title = badge.badge_type !== 'private'
        ? badge.title
        : loginUserIsSender ? badge.title
            : ' 🔒 '


    return (<div className={styles['badge-detail-page']}>
        <Head>
            <title>{`${title} | Social Layer`}</title>
        </Head>
        <div className={styles['center']}>
            <PageBack menu={() => <div className={styles['wap-menu']}><DetailBadgeMenu isGroupManager={isGroupManager}
                                                                                       badge={props.badge}/></div>}/>
            {badge.badge_type !== 'private' || loginUserIsSender ?
                <div className={styles['content']}>
                    <div className={styles['left']}>
                        <DetailCover className={styles['cover']} src={badge.image_url}/>
                        <DetailName className={styles['left-name']}> {props.badge.name} </DetailName>
                        <DetailRow className={styles['action']}>
                            <DetailCreator isGroup={!!badge.group}
                                           profile={badge.group || badge.creator}/>
                            <ReceiverCount count={badge.badgelets?.length || 0}/>
                        </DetailRow>
                        <BtnGroup>
                            {(loginUserIsSender || isGroupManager || isIssuer || isGroupOwner) &&
                                <AppButton size={BTN_SIZE.compact} onClick={() => {
                                    handleIssue()
                                }} kind={BTN_KIND.primary}>
                                    {lang['BadgeDialog_Btn_Issue']}
                                </AppButton>
                            }
                        </BtnGroup>
                    </div>
                    <div className={styles['right']}>
                        <div className={styles['head']}>
                            <h1 className={styles['name']}>
                                { isSolana &&
                                    <img className={styles['solana-logo']} src="/images/solana.png" alt=""/>
                                }
                                {badge.title}
                            </h1>
                            <DetailBadgeMenu isGroupManager={isGroupManager} badge={props.badge}/>
                        </div>
                        {
                            badge.badgelets!.length > 0 ?
                                <div style={{maxWidth: '590px', width: '100%', overflow: 'hidden'}}>
                                    <Swiper
                                        ref={swiper}
                                        modules={[Pagination]}
                                        spaceBetween={12}
                                        className='badge-detail-swiper'
                                        onSlideChange={(swiper) => swiperIndex.current = swiper.activeIndex}
                                        slidesPerView={'auto'}>

                                        <div className={styles['pagination']}>
                                            <SwiperPagination total={badge.badgelets!.length} showNumber={3}/>
                                        </div>

                                        {
                                            badge.badgelets!.map((badgelet, index) =>
                                                <SwiperSlide className='badge-detail-swiper-slide' key={badgelet.id}>
                                                    <DetailScrollBox>

                                                        {!!metadata && !!metadata.attributes && !!metadata.attributes.length &&
                                                            <>
                                                                {
                                                                    metadata.attributes.map((item: any) => {
                                                                        const title = item.trait_type === 'section' ?
                                                                            lang['Seedao_Issue_Badge_Section'] :
                                                                            item.trait_type === 'role' ?
                                                                                lang['Seedao_Issue_Badge_Role'] :
                                                                                item.trait_type === 'institution' ?
                                                                                    lang['Seedao_Issue_Badge_Institution'] :
                                                                                    item.trait_type === 'type' ?
                                                                                        lang['BadgeDialog_Label_Private'] :
                                                                                        item.trait_type
                                                                        item.trait_type


                                                                        return (
                                                                            <DetailArea key={item.trait_type}
                                                                                        title={title}
                                                                                        content={item.value}/>
                                                                        )
                                                                    })
                                                                }
                                                            </>
                                                        }

                                                        {!!badgelet.content &&
                                                            <DetailDes>
                                                                <ReasonText text={badgelet.content}/>
                                                            </DetailDes>
                                                        }

                                                        <DetailArea
                                                            title={lang['BadgeDialog_Label_Issuees']}
                                                            content={badgelet.owner.username
                                                                ? badgelet.owner.username
                                                                : ''
                                                            }
                                                            navigate={badgelet.owner.username
                                                                ? `/profile/${badgelet.owner.username}`
                                                                : '#'}
                                                            image={badgelet.owner.image_url || defaultAvatar(badgelet.owner.id)}/>

                                                        <DetailArea
                                                            title={lang['BadgeDialog_Label_Creat_Time']}
                                                            content={formatTime(badgelet.created_at)}/>

                                                        {badgelet.badge.badge_type === 'private' &&
                                                            <DetailArea
                                                                title={lang['BadgeDialog_Label_Private']}
                                                                content={lang['BadgeDialog_Label_Private_text']}/>
                                                        }
                                                    </DetailScrollBox>
                                                </SwiperSlide>
                                            )
                                        }
                                    </Swiper>
                                </div>

                                : <DetailScrollBox>
                                    {!!metadata && !!metadata.attributes && !!metadata.attributes.length &&
                                        <>
                                            {
                                                metadata.attributes.map((item: any) => {
                                                    const title = item.trait_type === 'section' ?
                                                        lang['Seedao_Issue_Badge_Section'] :
                                                        item.trait_type === 'role' ?
                                                            lang['Seedao_Issue_Badge_Role'] :
                                                            item.trait_type === 'institution' ?
                                                                lang['Seedao_Issue_Badge_Institution'] :
                                                                item.trait_type === 'type' ?
                                                                    lang['BadgeDialog_Label_Private'] :
                                                                    item.trait_type
                                                    item.trait_type


                                                    return (
                                                        <DetailArea key={item.trait_type}
                                                                    title={title}
                                                                    content={item.value}/>
                                                    )
                                                })
                                            }
                                        </>
                                    }

                                    {!!props.badge.content &&
                                        <DetailDes>
                                            <ReasonText text={props.badge.content}/>
                                        </DetailDes>
                                    }

                                    <DetailArea
                                        title={lang['BadgeDialog_Label_Creat_Time']}
                                        content={formatTime(props.badge.created_at)}/>

                                </DetailScrollBox>
                        }
                    </div>
                </div>
                : <div className={styles['content']}>
                    <div className={styles['left']}>
                        <DetailCover className={styles['cover']} src={'/images/badge_private.png'}/>
                        <DetailName className={styles['left-name']}> {'🔒'} </DetailName>
                        <DetailRow className={styles['action']}>
                            <DetailCreator isGroup={!!badge.group}
                                           profile={badge.group || badge.creator}/>
                            <ReceiverCount count={badge.badgelets?.length || 0}/>
                        </DetailRow>
                    </div>
                    <div className={styles['right']}>
                        <div className={styles['head']}>
                            <h1 className={styles['name']}>{'🔒'}</h1>
                            <DetailBadgeMenu isGroupManager={isGroupManager} badge={props.badge}/>
                        </div>
                        {
                            badge.badgelets!.length > 0 ?
                                <div style={{maxWidth: '590px', width: '100%', overflow: 'hidden'}}>
                                    <Swiper
                                        ref={swiper}
                                        modules={[Pagination]}
                                        spaceBetween={12}
                                        className='badge-detail-swiper'
                                        onSlideChange={(swiper) => swiperIndex.current = swiper.activeIndex}
                                        slidesPerView={'auto'}>

                                        <div className={styles['pagination']}>
                                            <SwiperPagination total={badge.badgelets!.length} showNumber={3}/>
                                        </div>

                                        {
                                            badge.badgelets!.map((badgelet, index) =>
                                                <SwiperSlide className='badge-detail-swiper-slide' key={badgelet.id}>
                                                    <DetailScrollBox>

                                                        {!!metadata && !!metadata.attributes && !!metadata.attributes.length &&
                                                            <>
                                                                {
                                                                    metadata.attributes.map((item: any) => {
                                                                        const title = item.trait_type === 'section' ?
                                                                            lang['Seedao_Issue_Badge_Section'] :
                                                                            item.trait_type === 'role' ?
                                                                                lang['Seedao_Issue_Badge_Role'] :
                                                                                item.trait_type === 'institution' ?
                                                                                    lang['Seedao_Issue_Badge_Institution'] :
                                                                                    item.trait_type === 'type' ?
                                                                                        lang['BadgeDialog_Label_Private'] :
                                                                                        item.trait_type
                                                                        item.trait_type


                                                                        return (
                                                                            <DetailArea key={item.trait_type}
                                                                                        title={title}
                                                                                        content={item.value}/>
                                                                        )
                                                                    })
                                                                }
                                                            </>
                                                        }

                                                        {!!badgelet.content &&
                                                            <DetailDes>
                                                                <ReasonText text={badgelet.content}/>
                                                            </DetailDes>
                                                        }

                                                        <DetailArea
                                                            title={lang['BadgeDialog_Label_Issuees']}
                                                            content={badgelet.owner.username
                                                                ? badgelet.owner.username
                                                                : ''
                                                            }
                                                            navigate={badgelet.owner.username
                                                                ? `/profile/${badgelet.owner.username}`
                                                                : '#'}
                                                            image={badgelet.owner.image_url || defaultAvatar(badgelet.owner.id)}/>

                                                        <DetailArea
                                                            title={lang['BadgeDialog_Label_Creat_Time']}
                                                            content={formatTime(badgelet.created_at)}/>

                                                        {badgelet.badge.badge_type === 'private' &&
                                                            <DetailArea
                                                                title={lang['BadgeDialog_Label_Private']}
                                                                content={lang['BadgeDialog_Label_Private_text']}/>
                                                        }
                                                    </DetailScrollBox>
                                                </SwiperSlide>
                                            )
                                        }
                                    </Swiper>
                                </div>

                                : <DetailScrollBox>
                                    {!!metadata && !!metadata.attributes && !!metadata.attributes.length &&
                                        <>
                                            {
                                                metadata.attributes.map((item: any) => {
                                                    const title = item.trait_type === 'section' ?
                                                        lang['Seedao_Issue_Badge_Section'] :
                                                        item.trait_type === 'role' ?
                                                            lang['Seedao_Issue_Badge_Role'] :
                                                            item.trait_type === 'institution' ?
                                                                lang['Seedao_Issue_Badge_Institution'] :
                                                                item.trait_type === 'type' ?
                                                                    lang['BadgeDialog_Label_Private'] :
                                                                    item.trait_type
                                                    item.trait_type


                                                    return (
                                                        <DetailArea key={item.trait_type}
                                                                    title={title}
                                                                    content={item.value}/>
                                                    )
                                                })
                                            }
                                        </>
                                    }

                                    {!!props.badge.content &&
                                        <DetailDes>
                                            <ReasonText text={props.badge.content}/>
                                        </DetailDes>
                                    }

                                    <DetailArea
                                        title={lang['BadgeDialog_Label_Creat_Time']}
                                        content={formatTime(props.badge.created_at)}/>

                                </DetailScrollBox>
                        }
                    </div>
                </div>
            }


            <BtnGroup>
                {(loginUserIsSender || isGroupManager || isIssuer || isGroupOwner) &&
                    <AppButton size={BTN_SIZE.compact} onClick={() => {
                        handleIssue()
                    }} kind={BTN_KIND.primary}>
                        {lang['BadgeDialog_Btn_Issue']}
                    </AppButton>
                }
            </BtnGroup>
        </div>
    </div>)
}

export default BadgeDetail

export const getServerSideProps = async (context: any) => {
    const {params} = context
    const badgeId = params?.badgeid

    const badgeDetail = await queryBadgeDetail({id: Number(badgeId)})

    let memberships: Membership[] = []
    if (badgeDetail?.group) {
        memberships = await getGroupMemberShips({group_id: badgeDetail!.group!.id, role: "all"})
    }
    return {props: {badge: badgeDetail, memberships}}
}
