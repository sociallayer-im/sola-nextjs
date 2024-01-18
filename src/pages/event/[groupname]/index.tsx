import {useContext, useEffect, useState} from 'react'
import UserContext from '@/components/provider/UserProvider/UserContext'
import {usePathname, useRouter} from 'next/navigation'
import LangContext from '@/components/provider/LangProvider/LangContext'
import HomeUserPanel from "@/components/base/HomeUserPanel/HomeUserPanel";
import AppSubTabs from "@/components/base/AppSubTabs";
import {Tab} from "baseui/tabs";
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

function Home(props: {badges: Badge[], initEvent?: Group, initList?: Event[], membership?: Membership[] }) {
    const {user} = useContext(UserContext)
    const router = useRouter()
    const pathname = usePathname()
    const {lang} = useContext(LangContext)
    const {showToast, openConnectWalletDialog} = useContext(DialogsContext)
    const {ready, joined, isManager, setEventGroup} = useContext(EventHomeContext)
    const eventGroup = useContext(EventHomeContext).eventGroup || props.initEvent || undefined
    const startIssueBadge = useIssueBadge()

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
            {!!user.id &&
                <div className={'home-page-event-top'}>
                    <div className={'center'}>
                        <div className={'mode-selector'}>
                            <div className={`mode ${mode === 'public' ? 'active' : ''}`} onClick={e => {setMode('public')}}>{'Public Events'}</div>
                            <div className={`mode ${mode === 'my' ? 'active' : ''}`} onClick={e => {setMode('my')}}>{'My Events'}</div>
                            { canPublish && <div className={`mode ${mode === 'request' ? 'active' : ''}`} onClick={e => {setMode('request')}}>
                                {'Publish Request'}
                                { pendingEvent.length > 0 &&
                                    <i className={'dot'} />
                                }
                            </div>}
                        </div>
                    </div>
                </div>
            }
            <div className={'home-page-event-wrapper'}>
                <div className={`home-page-event-main`}>
                    <HomeUserPanel group={props.initEvent} membership={props.membership || []}/>
                    {!!user.id &&
                        <div className={'mode-selector request'}>
                            <div className={`mode ${mode === 'public' ? 'active' : ''}`} onClick={e => {setMode('public')}}>{'Public Events'}</div>
                            <div className={`mode ${mode === 'my' ? 'active' : ''}`} onClick={e => {setMode('my')}}>{'My Events'}</div>
                            { canPublish &&
                                <div className={`mode ${mode === 'request' ? 'active' : ''}`} onClick={e => {setMode('request')}}>
                                    {'Publish Request'}
                                    { pendingEvent.length > 0 &&
                                        <i className={'dot'} />
                                    }
                                </div>
                            }
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
