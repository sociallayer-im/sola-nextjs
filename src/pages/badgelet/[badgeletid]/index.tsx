import {useContext, useEffect, useState} from 'react'
import styles from './BadgeletDetail.module.scss'
import PageBack from "@/components/base/PageBack";
import {Badgelet, getSwapCode, queryBadgeletDetail} from "@/service/solas";
import DetailCover from "@/components/compose/Detail/atoms/DetailCover";
import DetailRow from "@/components/compose/Detail/atoms/DetailRow";
import DetailCreator from "@/components/compose/Detail/atoms/DetailCreator/DetailCreator";
import {useRouter} from "next/navigation";
import LangContext from "@/components/provider/LangProvider/LangContext";
import userContext from "@/components/provider/UserProvider/UserContext";
import DetailScrollBox from "@/components/compose/Detail/atoms/DetailScrollBox/DetailScrollBox";
import DetailArea from "@/components/compose/Detail/atoms/DetailArea";
import DetailDes from "@/components/compose/Detail/atoms/DetailDes/DetailDes";
import ReasonText from "@/components/base/ReasonText/ReasonText";
import useTime from "@/hooks/formatTime";
import usePicture from "@/hooks/pictrue";
import Head from 'next/head'
import AppButton from "@/components/base/AppButton/AppButton";
import DetailName from "@/components/compose/Detail/atoms/DetailName";
import DetailBadgeletMenu from "@/components/compose/Detail/atoms/DetalBadgeletMenu";
import BtnGroup from "@/components/base/BtnGroup/BtnGroup";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import DialogBadgeSwap from "@/components/base/Dialog/DialogBadgeSwap/DialogBadgeSwap";

function BadgeDetail(props: { badgelet: Badgelet }) {
    const router = useRouter()
    const {lang} = useContext(LangContext)
    const {user} = useContext(userContext)
    const {openDialog, showLoading} = useContext(DialogsContext)

    const formatTime = useTime()
    const {defaultAvatar} = usePicture()


    const [badgelet, setBadgelet] = useState<Badgelet>(props.badgelet)
    const [isBadgeletOwner, setIsBadgeletOwner] = useState(false)
    const [isBadgeletCreator, setIsBadgeletCreator] = useState(false)

    useEffect(() => {
        setIsBadgeletOwner(user.id === props.badgelet.owner.id)
        setIsBadgeletCreator(user.id === props.badgelet.creator.id)
    }, [user.id])

    const handleSwap = async () => {
        const unload = showLoading()
        const code = await getSwapCode({badgelet_id: badgelet.id, auth_token: user.authToken || ''})
        unload()
        openDialog({
            content: (close: any) => <DialogBadgeSwap
                close={close}
                badgelet={badgelet}
                code={code}
            />,
            size: [316, 486],
        })
    }

    const title = badgelet.badge.badge_type !== 'private'
        ? badgelet.badge.title
        : isBadgeletOwner ? badgelet.badge.title
            : ' 🔒 '

    const metadata = badgelet.metadata ? JSON.parse(badgelet.metadata) : {}
    return (<div className={styles['badge-detail-page']}>
        <Head>
            <title>{`${title} | Social Layer`}</title>
        </Head>
        <div className={styles['center']}>
            <PageBack menu={() => <div className={styles['wap-menu']}>
                {
                    isBadgeletOwner && <DetailBadgeletMenu badgelet={badgelet}/>
                }
            </div>}/>

            {badgelet.badge.badge_type !== 'private' || isBadgeletOwner || isBadgeletCreator?
                <div className={styles['content']}>
                    <div className={styles['left']}>
                        <DetailCover className={styles['cover']} src={badgelet.badge.image_url}/>
                        <DetailName className={styles['left-name']}> {badgelet.badge.title} </DetailName>
                        <DetailRow className={styles['action']}>
                            <DetailCreator isGroup={!!badgelet.badge.group}
                                           profile={badgelet.badge.group || badgelet.creator}/>
                        </DetailRow>
                        {isBadgeletOwner &&
                            <BtnGroup>
                                <AppButton size={'compact'} onClick={handleSwap}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24"
                                         fill="none">
                                        <path
                                            d="M15 2.96875H18C19.1046 2.96875 20 3.86418 20 4.96875V7.96875M20 7.96875L18 6.4375M20 7.96875L22 6.4375"
                                            stroke="#333333" strokeWidth="2" strokeLinecap="round"
                                            strokeLinejoin="round"/>
                                        <path
                                            d="M10 20.9688H7C5.89543 20.9688 5 20.0733 5 18.9688V15.9688M5 15.9688L7 17.4375M5 15.9688L3 17.4375"
                                            stroke="#333333" strokeWidth="2" strokeLinecap="round"
                                            strokeLinejoin="round"/>
                                        <rect x="4" y="1.96875" width="6" height="9" rx="2" stroke="#333333"
                                              strokeWidth="2"
                                              strokeLinecap="round" strokeLinejoin="round"/>
                                        <rect x="14" y="12.9688" width="6" height="9" rx="2" stroke="#333333"
                                              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    Swap
                                </AppButton>
                            </BtnGroup>
                        }
                    </div>
                    <div className={styles['right']}>
                        <div className={styles['head']}>
                            <h1 className={styles['name']}>{badgelet.badge.title}</h1>
                            {
                                isBadgeletOwner && <DetailBadgeletMenu badgelet={badgelet}/>
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
                                                            item.trait_type === 'issuer' ?
                                                                lang['Issuer'] :
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
                : <div className={styles['content']}>
                    <div className={styles['left']}>
                        <DetailCover className={styles['cover']} src={'/images/badge_private.png'}/>
                        <DetailName className={styles['left-name']}> {'🔒'} </DetailName>
                        <DetailRow className={styles['action']}>
                            <DetailCreator isGroup={!!badgelet.badge.group}
                                           profile={badgelet.badge.group || badgelet.creator}/>
                        </DetailRow>
                    </div>
                    <div className={styles['right']}>
                        <div className={styles['head']}>
                            <h1 className={styles['name']}>{'🔒'}</h1>
                        </div>
                        <DetailScrollBox>

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
            }
            {isBadgeletOwner &&
                <BtnGroup>
                    <AppButton size={'compact'} onClick={handleSwap}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
                            <path
                                d="M15 2.96875H18C19.1046 2.96875 20 3.86418 20 4.96875V7.96875M20 7.96875L18 6.4375M20 7.96875L22 6.4375"
                                stroke="#333333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path
                                d="M10 20.9688H7C5.89543 20.9688 5 20.0733 5 18.9688V15.9688M5 15.9688L7 17.4375M5 15.9688L3 17.4375"
                                stroke="#333333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <rect x="4" y="1.96875" width="6" height="9" rx="2" stroke="#333333" strokeWidth="2"
                                  strokeLinecap="round" strokeLinejoin="round"/>
                            <rect x="14" y="12.9688" width="6" height="9" rx="2" stroke="#333333" strokeWidth="2"
                                  strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Swap
                    </AppButton>
                </BtnGroup>
            }
        </div>
    </div>)
}

export default BadgeDetail

export const getServerSideProps = async (context: any) => {
    const {params} = context
    const badgeletid = params?.badgeletid

    const badgeletDetail = await queryBadgeletDetail({id: Number(badgeletid)})
    return {props: {badgelet: badgeletDetail}}
}
