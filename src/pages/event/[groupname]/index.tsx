import React, {useContext, useEffect, useState} from 'react'
import UserContext from '@/components/provider/UserProvider/UserContext'
import {usePathname, useRouter} from 'next/navigation'
import LangContext from '@/components/provider/LangProvider/LangContext'
import HomeUserPanel from "@/components/base/HomeUserPanel/HomeUserPanel";
import {Badge, Event, getGroupMembership, getGroups, Group, Membership, queryBadge, queryEvent} from "@/service/solas";
import ListEventVertical from "@/components/compose/ListEventVertical/ListEventVertical";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import EventHomeContext from "@/components/provider/EventHomeProvider/EventHomeContext";
import MaodaoListEventVertical from "@/components/maodao/MaodaoListEventVertical/ListEventVertical";
import useIssueBadge from "@/hooks/useIssueBadge";
import ListMyEvent from "@/components/compose/ListMyEvent/ListMyEvent";
import ListPendingEvent from "@/components/compose/ListPendingEvent/ListPendingEvent";
import Link from "next/link";
import MapContext from "@/components/provider/MapProvider/MapContext";
import usePicture from "@/hooks/pictrue";
import {useTime5} from "@/hooks/formatTime";

import * as dayjsLib from "dayjs";
const dayjs: any = dayjsLib

function Home(props: { badges: Badge[], initEvent: Group, initList?: Event[], membership?: Membership[] }) {
    const {user} = useContext(UserContext)
    const router = useRouter()
    const pathname = usePathname()
    const {lang} = useContext(LangContext)
    const {showToast, openConnectWalletDialog} = useContext(DialogsContext)
    const {ready, joined, isManager, setEventGroup} = useContext(EventHomeContext)
    const eventGroup = props.initEvent
    const startIssueBadge = useIssueBadge()
    const {MapReady} = useContext(MapContext)
    const {defaultAvatar} = usePicture()

    const [mode, setMode] = useState<'public' | 'my' | 'request'>('public')
    const [canPublish, setCanPublish] = useState(false)
    const [pendingEvent, setPendingEvent] = useState<Event[]>([])

    useEffect(() => {
        if (!user.userName) {
            setCanPublish(false)
            return
        }

        if (props.initEvent) {
            setCanPublish(isManager)
        } else {
            setCanPublish(false)
        }
    }, [joined, isManager, user.userName, props.initEvent])

    useEffect(() => {
        if (!user.userName) {
            setMode('public')
        }
    }, [user.userName])

    useEffect(() => {
        if (props.initEvent) {
            setEventGroup(props.initEvent)
        }
    }, [props.initEvent])

    const gotoCreateEvent = () => {
        if (!user.authToken) {
            showToast('Please Login to continue')
            return
        }

        if (!eventGroup) {
            return
        }

        router.push(`/event/${eventGroup.username}/create`)
    }

    const issueBadge = async () => {
        if (!user.userName) {
            openConnectWalletDialog()
            return
        }

        const badges = await queryBadge({sender_id: user.id!, page: 1})
        startIssueBadge({badges: badges.data, group_id: eventGroup!.id})
    }

    const isMaodao = process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'maodao'

    return <>
        <div className='home-page-event'>
            <div className={'home-page-event-wrapper'}>
                <div className={`home-page-event-main`}>
                    <HomeUserPanel group={props.initEvent} membership={props.membership || []}/>

                    {props.initEvent?.map_enabled && MapReady &&
                        <div className="home-map">
                            <iframe src={`/iframe/map?group=${props.initEvent?.username}`} frameBorder={0} width="100%"
                                    height="300"/>
                            <Link className={'map-link'} href={`/event/${props.initEvent?.username}/map`}>
                                {'Browse in map'}
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15"
                                     fill="none">
                                    <path d="M13.3637 8.4541V13.3632H8.45459" stroke="#333333" strokeWidth="1.63636"
                                          strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M1.00009 5.90918L1.00009 1.00009L5.90918 1.00009" stroke="#333333"
                                          strokeWidth="1.63636" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M13.3637 13.3632L8.45459 8.4541" stroke="#333333" strokeWidth="1.63636"
                                          strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M1.00009 1.00009L5.90918 5.90918" stroke="#333333" strokeWidth="1.63636"
                                          strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </Link>
                        </div>
                    }

                    { !!eventGroup &&
                        <div className={`center ${mode === 'public' ? '' : 'hide'}`}>
                            {!isMaodao || pathname?.includes('event-home') ?
                                <ListEventVertical initData={props.initList || []} eventGroup={eventGroup as Group}/>
                                : <MaodaoListEventVertical/>
                            }
                        </div>
                    }

                    <div className={`center ${mode === 'my' ? '' : 'hide'}`}>
                        <ListMyEvent/>
                    </div>

                    {canPublish &&
                        <div className={`center ${mode === 'request' ? '' : 'hide'}`}>
                            <ListPendingEvent onload={(pendingEvent) => {
                                setPendingEvent(pendingEvent)
                            }}/>
                        </div>
                    }

                    {
                        !!user.id
                        && eventGroup
                        && ready
                        && <div className={'home-action-bar'}>
                            <div className={'create-event-btn'} onClick={e => {
                                gotoCreateEvent()
                            }}>+ {lang['Activity_Create_Btn']}</div>

                            {(user.id === (eventGroup as Group).creator.id || isManager) &&
                                <div className={'setting-btn'} onClick={e => {
                                    router.push(`/event/setting/${eventGroup!.username}`)
                                }}>{lang['Activity_Setting_Btn']}</div>
                            }
                        </div>
                    }
                </div>

                <div className={'home-page-event-side'}>
                    <HomeUserPanel membership={props.membership || []}
                                   badges={props.badges || []}
                                   isSide
                                   slot={() => {
                                       return <>
                                           {!!user.id
                                               && eventGroup
                                               && ready &&
                                               <div className={'home-action-bar'}>
                                                   <div className={'create-event-btn'} onClick={e => {
                                                       gotoCreateEvent()
                                                   }}>+ {lang['Activity_Create_Btn']}</div>
                                               </div>
                                           }
                                           <div className={'home-action-bar'}>
                                               <div className={'send-btn'} style={{minWidth: '200px'}} onClick={e => {
                                                   issueBadge()
                                               }}>{lang['Profile_User_MindBadge']}</div>

                                               {eventGroup && (user.id === (eventGroup as Group).creator?.id || isManager) &&
                                                   <div className={'setting-btn'} onClick={e => {
                                                       router.push(`/event/setting/${eventGroup!.username}`)
                                                   }}>{lang['Activity_Setting_Btn']}</div>
                                               }
                                           </div>

                                           {eventGroup?.id === 3409 &&
                                               <div className={'home-action-bar'}>
                                                   <a href={'https://directory.plnetwork.io/irl/ee-lwfb'}
                                                      target={"_blank"} className={'send-btn'}
                                                      style={{minWidth: '200px'}} onClick={e => {
                                                       issueBadge()
                                                   }}>{'View attendees'}
                                                       <svg xmlns="http://www.w3.org/2000/svg" width="21" height="20"
                                                            viewBox="0 0 21 20" fill="none">
                                                           <path
                                                               d="M19.6347 1.04966L19.6347 1.04967L19.6377 1.05681C19.6548 1.09677 19.664 1.13962 19.665 1.18303V8.23529C19.665 8.32586 19.629 8.41271 19.565 8.47675C19.5009 8.54079 19.4141 8.57677 19.3235 8.57677C19.233 8.57677 19.1461 8.54079 19.0821 8.47675C19.018 8.41271 18.9821 8.32586 18.9821 8.23529V4.01176V1.99394L17.5562 3.42174L8.97975 12.01L8.97774 12.012C8.94599 12.044 8.90823 12.0694 8.86662 12.0867C8.825 12.1041 8.78037 12.113 8.73529 12.113C8.69022 12.113 8.64559 12.1041 8.60397 12.0867C8.56236 12.0694 8.5246 12.044 8.49285 12.012L8.49287 12.012L8.48801 12.0072C8.456 11.9754 8.4306 11.9376 8.41326 11.896C8.39593 11.8544 8.387 11.8098 8.387 11.7647C8.387 11.7196 8.39593 11.675 8.41326 11.6334C8.4306 11.5918 8.456 11.554 8.48801 11.5223L8.49003 11.5203L17.0783 2.94378L18.5061 1.51794H16.4882H12.2647C12.1741 1.51794 12.0873 1.48196 12.0232 1.41793C11.9592 1.35389 11.9232 1.26704 11.9232 1.17647C11.9232 1.08591 11.9592 0.999051 12.0232 0.935014C12.0873 0.870977 12.1741 0.835 12.2647 0.835H19.317C19.3604 0.835974 19.4032 0.845221 19.4432 0.862257L19.4432 0.86229L19.4503 0.865264C19.5338 0.899915 19.6001 0.966222 19.6347 1.04966ZM19.0821 12.488C19.1461 12.4239 19.233 12.3879 19.3235 12.3879C19.4141 12.3879 19.5009 12.4239 19.565 12.488C19.629 12.552 19.665 12.6388 19.665 12.7294V16.4706C19.665 17.1852 19.3811 17.8705 18.8758 18.3758C18.3705 18.8811 17.6852 19.165 16.9706 19.165H4.02941C3.31481 19.165 2.62947 18.8811 2.12417 18.3758C1.61887 17.8705 1.335 17.1852 1.335 16.4706V3.52941C1.335 2.81481 1.61887 2.12948 2.12417 1.62418C2.62947 1.11887 3.31481 0.835 4.02941 0.835H7.77059C7.86115 0.835 7.94801 0.870976 8.01204 0.935015C8.07608 0.999053 8.11206 1.08591 8.11206 1.17647C8.11206 1.26703 8.07608 1.35389 8.01204 1.41793C7.94801 1.48197 7.86115 1.51794 7.77059 1.51794H4.02941C3.49594 1.51794 2.98431 1.72986 2.60709 2.10709C2.22986 2.48431 2.01794 2.99594 2.01794 3.52941V16.4706C2.01794 17.0041 2.22986 17.5157 2.60709 17.8929C2.98431 18.2701 3.49594 18.4821 4.02941 18.4821H16.9706C17.5041 18.4821 18.0157 18.2701 18.3929 17.8929C18.7701 17.5157 18.9821 17.0041 18.9821 16.4706V12.7294C18.9821 12.6388 19.018 12.552 19.0821 12.488Z"
                                                               fill="#7492EF" stroke="#18181B" strokeWidth="1.67"/>
                                                       </svg>
                                                   </a>
                                               </div>
                                           }
                                       </>
                                   }}/>
                </div>
            </div>

            <Link href="https://tally.so/r/w8ePXO" className={"help-btn"} target="_blank">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="21" viewBox="0 0 12 21" fill="none">
                    <path d="M4.2298 17.0985C4.30364 16.9937 4.38379 16.8936 4.4698 16.7985C4.65572 16.6111 4.87692 16.4623 5.12064 16.3607C5.36435 16.2592 5.62576 16.2069 5.88978 16.2069C6.1538 16.2069 6.41521 16.2592 6.65892 16.3607C6.90264 16.4623 7.12384 16.6111 7.30976 16.7985C7.49512 16.9854 7.64177 17.207 7.74129 17.4507C7.84082 17.6944 7.89127 17.9553 7.88975 18.2185C7.89932 18.4772 7.85856 18.7353 7.76975 18.9785C7.67993 19.2267 7.53662 19.4521 7.34999 19.6387C7.16335 19.8254 6.93796 19.9687 6.68977 20.0585C6.45037 20.1643 6.19152 20.2189 5.92978 20.2189C5.66804 20.2189 5.40919 20.1643 5.16979 20.0585C4.9216 19.9687 4.6962 19.8254 4.50957 19.6387C4.32293 19.4521 4.17963 19.2267 4.0898 18.9785C3.97784 18.7411 3.92305 18.4809 3.92981 18.2185C3.91999 18.0854 3.91999 17.9517 3.92981 17.8185C3.9517 17.6932 3.99214 17.5719 4.0498 17.4585C4.09358 17.3311 4.15411 17.21 4.2298 17.0985Z" fill="#272928"/>
                    <path d="M2.88764 1.02163C3.80047 0.494989 4.83592 0.218076 5.88978 0.21875C7.29684 0.229668 8.65531 0.73477 9.72771 1.64576C10.8001 2.55675 11.5182 3.81568 11.7565 5.20246C11.9948 6.58925 11.7381 8.01566 11.0313 9.23236C10.3244 10.4491 9.21247 11.3786 7.88975 11.8586V12.2186C7.88975 12.749 7.67904 13.2577 7.30397 13.6328C6.92891 14.0078 6.4202 14.2186 5.88978 14.2186C5.35935 14.2186 4.85065 14.0078 4.47558 13.6328C4.10052 13.2577 3.88981 12.749 3.88981 12.2186V10.2186C3.88981 9.68819 4.10052 9.17949 4.47558 8.80442C4.85065 8.42935 5.35935 8.21864 5.88978 8.21864C6.4202 8.21864 6.92891 8.00793 7.30397 7.63286C7.67904 7.2578 7.88975 6.74909 7.88975 6.21867C7.88975 5.68824 7.67904 5.17954 7.30397 4.80448C6.92891 4.42941 6.4202 4.2187 5.88978 4.2187C5.53736 4.2173 5.19084 4.30905 4.88529 4.48465C4.57973 4.66025 4.32601 4.91348 4.1498 5.21868C4.02477 5.45769 3.85269 5.66894 3.6439 5.83971C3.43512 6.01049 3.19395 6.13727 2.93489 6.21242C2.67584 6.28758 2.40426 6.30955 2.1365 6.27703C1.86873 6.2445 1.61031 6.15815 1.37678 6.02316C1.14326 5.88817 0.939447 5.70734 0.777618 5.49155C0.615789 5.27575 0.499283 5.02945 0.43511 4.76746C0.370938 4.50547 0.360425 4.23321 0.404202 3.96705C0.44798 3.70089 0.545143 3.44634 0.689849 3.21871C1.21678 2.30604 1.9748 1.54826 2.88764 1.02163Z" fill="#272928"/>
                </svg>
            </Link>
        </div>
    </>
}

export default Home

export const getServerSideProps: any = (async (context: any) => {
    const groupname = context.params?.groupname
    const targetGroup = await getGroups({username: groupname})


    const membership = await getGroupMembership({
        group_id: targetGroup[0]?.id!,
        role: 'all',
    })

    const badges = await queryBadge({group_id: targetGroup[0]?.id!, page: 1})

    return {
        props: {
            badges: badges.data,
            initEvent: {
                ...targetGroup[0],

                creator: targetGroup[0]?.memberships[0].profile,
            }, initList: [], membership
        }
    }
})
