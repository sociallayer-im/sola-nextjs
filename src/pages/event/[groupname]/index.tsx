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
import ListMyAttentedEvent from "@/components/compose/ListMyAttentedEvent/ListMyAttentedEvent";
import ListMyCreatedEvent from "@/components/compose/ListMyCreatedEvent/ListMyCreatedEvent";
import ListEventVertical from "@/components/compose/ListEventVertical/ListEventVertical";
import ListRecommendedEvent from "@/components/compose/ListRecommendedEvent/ListRecommendedEvent";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import EventHomeContext from "@/components/provider/EventHomeProvider/EventHomeContext";
import MaodaoListEventVertical from "@/components/maodao/MaodaoListEventVertical/ListEventVertical";
import useIssueBadge from "@/hooks/useIssueBadge";

function Home(props: {badges: Badge[], initEvent?: Group, initList?: Event[], membership?: Membership[] }) {
    const {user} = useContext(UserContext)
    const router = useRouter()
    const pathname = usePathname()
    const {lang} = useContext(LangContext)
    const {showToast, openConnectWalletDialog} = useContext(DialogsContext)
    const {ready, joined, isManager, setEventGroup} = useContext(EventHomeContext)
    const eventGroup = useContext(EventHomeContext).eventGroup || props.initEvent || undefined
    const startIssueBadge = useIssueBadge()

    const [tabIndex, setTabIndex] = useState('0')
    const [showMyCreate, setShowMyCreate] = useState(true)
    const [showMyAttend, setShowMyAttend] = useState(true)
    const [myRegistered, setMyRegistered] = useState<Participants[]>([])

    useEffect(() => {
        const myEvent = async () => {
            if (user.authToken) {
                const res = await queryMyEvent({profile_id: user.id!})
                const myRegistered = res.map((item: Participants) => item.event)
                const res2 = await queryEvent({owner_id: user.id!, page: 1})
                setMyRegistered(res)
                setShowMyAttend(myRegistered.length > 0)
                setShowMyCreate(res2.length > 0)
                if (myRegistered.length > 0) {
                    setTabIndex('0')
                } else {
                    setTabIndex('1')
                }
            } else {
                setShowMyAttend(false)
                setShowMyCreate(false)
            }
        }
        myEvent()
    }, [user.authToken])

    useEffect(() => {
        if (!showMyCreate) {
            setTabIndex('0')
        }
    }, [showMyCreate])

    useEffect(() => {
        if (!showMyAttend) {
            setTabIndex('1')
        }
    }, [showMyAttend])

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
                <div className={'home-page-event-main'}>
                    <HomeUserPanel membership={props.membership || []}/>
                    {!!user.id &&
                        <>
                            {(showMyAttend || showMyCreate) &&
                                <>
                                    <div className={'center'}>
                                        <div className={'module-title'} style={{marginBottom: '20px'}}>
                                            {lang['Activity_My_Event']}
                                        </div>
                                    </div>
                                    <div className={'center'}>
                                        <AppSubTabs activeKey={tabIndex} renderAll onChange={({activeKey}) => {
                                            setTabIndex(activeKey + '')
                                        }}>
                                            {showMyAttend ? <Tab title={lang['Activity_State_Registered']}>
                                                <ListMyAttentedEvent/>
                                            </Tab> : <></>}

                                            {showMyCreate && !isMaodao ?
                                                <Tab title={lang['Activity_State_Created']}>
                                                    <ListMyCreatedEvent participants={myRegistered}/>
                                                </Tab> : <></>
                                            }
                                        </AppSubTabs>
                                    </div>
                                </>
                            }
                        </>
                    }
                    {!!user.id &&
                        <div className={'center'}>
                            <ListRecommendedEvent/>
                        </div>
                    }

                    <div className={'center'}>
                        {!isMaodao || pathname?.includes('event-home') ?
                            <ListEventVertical participants={myRegistered} initData={props.initList || []}/>
                            : <MaodaoListEventVertical participants={myRegistered}/>
                        }
                    </div>

                    {
                        !!user.id
                        && eventGroup
                        && ready
                        && ((joined && (eventGroup as Group).can_publish_event === 'member') || (eventGroup as Group).can_publish_event === 'everyone' || isManager)
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
                                               && ready
                                               && ((joined && (eventGroup as Group).can_publish_event === 'member') || ((eventGroup as Group).can_publish_event === 'everyone' && user.userName) || isManager) &&
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
            start_time_to: new Date().toISOString(),
            event_order: 'desc',
            group_id: targetGroup[0]?.id
        })
    } else {
        res = await queryEvent({
            page: 1,
            start_time_from: new Date().toISOString(),
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
