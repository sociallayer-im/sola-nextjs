import {useEffect, useState, useContext, useRef} from 'react'
import styles from './BadgeletDetail.module.scss'
import PageBack from "@/components/base/PageBack";
import {queryBadgeDetail, Badgelet, Group, Membership, getGroupMemberShips, queryBadgeletDetail} from "@/service/solas";
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
import DetailBadgeletPrivateMark from "@/components/compose/Detail/atoms/DetailBadgeletPriviateMark";
import DetailBadgeletMenu from "@/components/compose/Detail/atoms/DetalBadgeletMenu";

function BadgeDetail(props: {badgelet: Badgelet}) {
    const router = useRouter()
    const {lang} = useContext(LangContext)
    const {user} = useContext(userContext)

    const swiper = useRef<any>(null)
    const formatTime = useTime()
    const swiperIndex = useRef(0)
    const {defaultAvatar} = usePicture()


    const [badgelet, setBadgelet] = useState<Badgelet>(props.badgelet)
    const [isBadgeletOwner, setIsBadgeletOwner] = useState(false)

    useEffect(() => {
        setIsBadgeletOwner(user.id === props.badgelet.owner.id)
    }, [user.id])


    const metadata = badgelet.metadata ? JSON.parse(badgelet.metadata) : {}
    return (<div className={styles['badge-detail-page']}>
        <Head>
            <title>{badgelet.badge.title} | Social Layer</title>
        </Head>
        <div className={styles['center']}>
            <PageBack menu={() => <div className={styles['wap-menu']}>
                {
                    isBadgeletOwner && <DetailBadgeletMenu badgelet={badgelet} />
                }
            </div>} />
            <div className={styles['content']}>
                <div className={styles['left']}>
                    <DetailCover className={styles['cover']} src={badgelet.badge.image_url} />
                    <DetailName className={styles['left-name']}> {badgelet.badge.title} </DetailName>
                    <DetailRow className={styles['action']}>
                        <DetailCreator isGroup={!!badgelet.badge.group} profile={badgelet.badge.group || badgelet.creator}/>
                    </DetailRow>
                </div>
                <div className={styles['right']}>
                    <div className={styles['head']}>
                        <h1 className={styles['name']}>{badgelet.badge.title}</h1>
                        {
                            isBadgeletOwner && <DetailBadgeletMenu badgelet={badgelet} />
                        }
                    </div>
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
                                <ReasonText text={badgelet.content}></ReasonText>
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
                            content={formatTime(props.badgelet.created_at)}/>

                    </DetailScrollBox>
                </div>
            </div>
        </div>
    </div>)
}

export default BadgeDetail

export const getServerSideProps = async (context) => {
    const {params} = context
    const badgeletid = params?.badgeletid

    const badgeletDetail = await queryBadgeletDetail({id : Number(badgeletid)})
    return {props: {badgelet: badgeletDetail}}
}
