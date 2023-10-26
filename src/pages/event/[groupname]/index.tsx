import {useContext, useEffect, useState} from 'react'
import UserContext from '@/components/provider/UserProvider/UserContext'
import {useRouter, usePathname} from 'next/navigation'
import LangContext from '@/components/provider/LangProvider/LangContext'
import HomeUserPanel from "@/components/base/HomeUserPanel/HomeUserPanel";
import AppSubTabs from "@/components/base/AppSubTabs";
import {Tab} from "baseui/tabs";
import {Participants, queryEvent, queryMyEvent} from "@/service/solas";
import ListMyAttentedEvent from "@/components/compose/ListMyAttentedEvent/ListMyAttentedEvent";
import ListMyCreatedEvent from "@/components/compose/ListMyCreatedEvent/ListMyCreatedEvent";
import ListEventVertical from "@/components/compose/ListEventVertical/ListEventVertical";
import ListRecommendedEvent from "@/components/compose/ListRecommendedEvent/ListRecommendedEvent";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import EventHomeContext from "@/components/provider/EventHomeProvider/EventHomeContext";
import MaodaoListEventVertical from "@/components/maodao/MaodaoListEventVertical/ListEventVertical";

function Home() {
    const {user} = useContext(UserContext)
    const router = useRouter()
    const pathname = usePathname()
    const {lang} = useContext(LangContext)
    const {showToast} = useContext(DialogsContext)
    const {eventGroup, ready, joined, isManager} = useContext(EventHomeContext)

    const [tabIndex, setTabIndex] = useState('0')
    const [showMyCreate, setShowMyCreate] = useState(true)
    const [showMyAttend, setShowMyAttend] = useState(true)
    const [myRegistered, setMyRegistered] = useState<Participants[]>([])

    useEffect(() => {
        const myEvent = async () => {
            if (user.authToken) {
                const res = await queryMyEvent({auth_token: user.authToken || ''})
                const myRegistered = res.map((item: Participants) => item.event)
                const res2 = await queryEvent({owner_id: user.id!, page: 1})
                setMyRegistered(res)
                setShowMyAttend(myRegistered.length > 0)
                setShowMyCreate(res2.length > 0)
                if (myRegistered.length > 0) {
                    setTabIndex('0')
                }  else {
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

    const isMaodao = process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'maodao'

    return <>
        <div className='home-page-event'>
            <HomeUserPanel/>
            {!!user.id &&
                <>
                    { (showMyAttend || showMyCreate) &&
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
                                        <ListMyAttentedEvent />
                                    </Tab>: <></>}

                                    { showMyCreate  && !isMaodao ?
                                        <Tab title={lang['Activity_State_Created']}>
                                            <ListMyCreatedEvent participants={myRegistered} />
                                        </Tab>: <></>
                                    }
                                </AppSubTabs>
                            </div>
                        </>
                    }
                </>
            }
            {!!user.id &&
                <div className={'center'}>
                    <ListRecommendedEvent />
                </div>
            }

            <div className={'center'}>
                { !isMaodao || pathname?.includes('event-home') ?
                    <ListEventVertical participants={myRegistered} />
                    : <MaodaoListEventVertical participants={myRegistered}/>
                }
            </div>

            {
                !!user.id && eventGroup && ready && (joined || eventGroup.group_event_visibility === 'public' || isManager) &&
                <div className={'home-action-bar'}>
                    <div className={'create-event-btn'} onClick={e => {
                        gotoCreateEvent()
                    }}>+ {lang['Activity_Create_Btn']}</div>

                    { (user.id === eventGroup.group_owner_id || isManager) &&
                        <div className={'setting-btn'} onClick={e => {
                            router.push(`/event/setting/${eventGroup!.username}`)
                        }}>{lang['Activity_Setting_Btn']}</div>
                    }
                </div>
            }
        </div>
    </>
}

export default Home
