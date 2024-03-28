import React, {useContext, useEffect, useState} from 'react'
import UserContext from '@/components/provider/UserProvider/UserContext'
import {usePathname, useRouter} from 'next/navigation'
import LangContext from '@/components/provider/LangProvider/LangContext'
import HomeUserPanel from "@/components/base/HomeUserPanel/HomeUserPanel";
import {
    Event,
    getGroupMembership,
    getGroups,
    Group,
    Membership,
    Participants,
    queryBadge,
    queryEvent,
    queryMyEvent,
    Badge
} from "@/service/solas";
import ListEventVertical from "@/components/compose/ListEventVertical/ListEventVertical";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import EventHomeContext from "@/components/provider/EventHomeProvider/EventHomeContext";
import MaodaoListEventVertical from "@/components/maodao/MaodaoListEventVertical/ListEventVertical";
import useIssueBadge from "@/hooks/useIssueBadge";
import ListMyEvent from "@/components/compose/ListMyEvent/ListMyEvent";
import ListPendingEvent from "@/components/compose/ListPendingEvent/ListPendingEvent";
import Link from "next/link";
import MapContext from "@/components/provider/MapProvider/MapContext";

function Home(props: {badges: Badge[], initEvent?: Group, initList?: Event[], membership?: Membership[] }) {
    const {user} = useContext(UserContext)
    const router = useRouter()
    const pathname = usePathname()
    const {lang} = useContext(LangContext)
    const {showToast, openConnectWalletDialog} = useContext(DialogsContext)
    const {ready, joined, isManager, setEventGroup} = useContext(EventHomeContext)
    const eventGroup = useContext(EventHomeContext).eventGroup || props.initEvent || undefined
    const startIssueBadge = useIssueBadge()
    const {MapReady} = useContext(MapContext)

    const [mode, setMode] = useState<'public' | 'my' | 'request'>('public')
    const [canPublish, setCanPublish] = useState(false)
    const [pendingEvent, setPendingEvent] = useState<Event[]>([])

    useEffect(() => {
        if (!user.userName) {
            setCanPublish(false)
            return
        }

        if (props.initEvent){
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


                    { props.initEvent?.map_enabled && MapReady &&
                        <div className="home-map">
                            <iframe src={`/iframe/map?group=${props.initEvent?.username}`} frameBorder={0} width="100%" height="300" />
                            <Link className={'map-link'} href={`/event/${props.initEvent?.username}/map`}>
                                {'Browse in map'}
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
                                    <path d="M13.3637 8.4541V13.3632H8.45459" stroke="#333333" strokeWidth="1.63636" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M1.00009 5.90918L1.00009 1.00009L5.90918 1.00009" stroke="#333333" strokeWidth="1.63636" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M13.3637 13.3632L8.45459 8.4541" stroke="#333333" strokeWidth="1.63636" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M1.00009 1.00009L5.90918 5.90918" stroke="#333333" strokeWidth="1.63636" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </Link>
                        </div>
                    }

                    <div className={`center ${mode === 'public' ? '' : 'hide'}`}>
                        {!isMaodao || pathname?.includes('event-home') ?
                            <ListEventVertical initData={props.initList || []}/>
                            : <MaodaoListEventVertical />
                        }
                    </div>

                    <div className={`center ${mode === 'my' ? '' : 'hide'}`}>
                        <ListMyEvent />
                    </div>

                    { canPublish &&
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
                                       </>
                                   }}/>
                </div>
            </div>
        </div>
    </>
}

export default Home

export const getServerSideProps: any = (async (context: any) => {
    const groupname = context.params?.groupname
    const targetGroup = await getGroups({username: groupname})
    const tab = context.query?.tab

    let res: any = []
    if (tab === 'past') {
        res = await queryEvent({
            page: 1,
            end_time_lte: new Date().toISOString(),
            event_order: 'desc',
            group_id: targetGroup[0]?.id
        })
    } else {
        res = await queryEvent({
            page: 1,
            end_time_gte: new Date().toISOString(),
            event_order: 'asc',
            group_id: targetGroup[0]?.id
        })
    }

    const membership = await getGroupMembership({
        group_id: targetGroup[0]?.id!,
        role: 'all',
    })

    const badges =  await queryBadge({group_id: targetGroup[0]?.id!, page: 1})


    return {
        props: {
            badges: badges.data,
            initEvent: {
                ...targetGroup[0],
                creator: targetGroup[0]?.memberships[0],
            }, initList: res, membership
        }
    }
})
