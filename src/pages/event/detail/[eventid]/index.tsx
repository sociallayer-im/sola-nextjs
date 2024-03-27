import {useParams, useRouter} from 'next/navigation'
import {useContext, useEffect, useState} from 'react'
import {
    Badge,
    Event,
    Group,
    joinEvent,
    Participants,
    Profile,
    ProfileSimple,
    punchIn,
    queryBadgeDetail,
    queryEventDetail,
    queryGroupDetail,
    queryUserGroup
} from "@/service/solas";
import LangContext from "@/components/provider/LangProvider/LangContext";
import {useTime2, useTime3} from "@/hooks/formatTime";
import EventLabels from "@/components/base/EventLabels/EventLabels";
import usePicture from "@/hooks/pictrue";
import ReasonText from "@/components/base/EventDes/ReasonText";
import AppButton from "@/components/base/AppButton/AppButton";
import userContext from "@/components/provider/UserProvider/UserContext";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import PageBack from "@/components/base/PageBack";
import ListCheckLog from "@/components/compose/ListCheckLog/ListCheckLog";
import useCalender from "@/hooks/addToCalender";
import ListCheckinUser from "@/components/compose/ListCheckinUser/ListCheckinUser";
import useShowImage from "@/hooks/showImage/showImage";
import useCopy from "@/hooks/copy";
import EventHomeContext from "@/components/provider/EventHomeProvider/EventHomeContext";
import useGetMeetingName from "@/hooks/getMeetingName";
import Head from "next/head";
import Link from "next/link";
import MapContext from "@/components/provider/MapProvider/MapContext";
import ImgLazy from "@/components/base/ImgLazy/ImgLazy";
import EventDefaultCover from "@/components/base/EventDefaultCover";
import {Swiper, SwiperSlide} from 'swiper/react'
import {FreeMode, Mousewheel} from "swiper";
import EventNotes from "@/components/base/EventNotes/EventNotes";

import * as dayjsLib from "dayjs";
import Empty from "@/components/base/Empty";

const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const dayjs: any = dayjsLib
dayjs.extend(utc)
dayjs.extend(timezone)


function EventDetail(props: { event: Event | null, appName: string, host: string }) {
    const router = useRouter()
    const [event, setEvent] = useState<Event | null>(props.event || null)
    const [hoster, setHoster] = useState<Profile | null>(null)
    const params = useParams()
    const {lang} = useContext(LangContext)
    const formatTime = useTime3()
    const formatTime2 = useTime2()
    const {defaultAvatar} = usePicture()
    const {user} = useContext(userContext)
    const {showLoading, showToast, showEventCheckIn, openConnectWalletDialog} = useContext(DialogsContext)
    const {addToCalender} = useCalender()
    const {showImage} = useShowImage()
    const {copy} = useCopy()
    const {setEventGroup, eventGroup, ready, isManager} = useContext(EventHomeContext)
    const {getMeetingName, getUrl} = useGetMeetingName()
    const {MapReady} = useContext(MapContext)


    const [tab, setTab] = useState(1)
    const [isHoster, setIsHoster] = useState(false)
    const [isOperator, setIsOperator] = useState(false)
    const [isJoined, setIsJoined] = useState(false)
    const [canceled, setCanceled] = useState(false)
    const [outOfDate, setOutOfDate] = useState(false)
    const [inProgress, setInProgress] = useState(false)
    const [inCheckinTime, setIsCheckTime] = useState(false)
    const [notStart, setNotStart] = useState(false)
    const [participants, setParticipants] = useState<Participants[]>([])
    const [badge, setBadge] = useState<Badge | null>(null)
    const [isChecklog, setIsChecklog] = useState(false)
    const [canAccess, setCanAccess] = useState(false)
    const [eventSite, setEventSite] = useState<any | null>(null)
    const [showMap, setShowMap] = useState(false)

    const [cohost, setCohost] = useState<ProfileSimple[]>([])
    const [speaker, setSpeaker] = useState<ProfileSimple[]>([])

    async function fetchData() {
        if (params?.eventid) {
            let res: Event | null = null
            try {
                res = await queryEventDetail({id: Number(params?.eventid)})
            } catch (e) {
                router.push('/error')
                return
            }

            if (!res) {
                router.push('/error')
                return
            }

            setEvent(res)
            setEventSite(res.event_site)
            setParticipants(res.participants || [])

            setCanceled(res.status === 'cancel')
            // setCanceled(false)

            const isCheckLogEvent = res.event_type === 'checklog'
            setIsChecklog(isCheckLogEvent)

            const now = new Date().getTime()
            if (res.start_time && res.end_time) {
                const start = new Date(res.start_time).getTime()
                const end = new Date(res.end_time).getTime()
                if (now < start) {
                    setNotStart(true)
                }

                if (now >= start && now <= end) {
                    setInProgress(true)
                }
                if (now > end) {
                    setOutOfDate(true)
                }

                // 活动当天及之后都可以报名和签到
                const startDate = new Date(res.start_time).setHours(0, 0, 0, 0)
                if (now >= new Date(startDate).getTime()) {
                    setIsCheckTime(true)
                }
            }

            if (res.start_time && !res.end_time) {
                const start = new Date(res.start_time).getTime()
                if (now < start) {
                    setNotStart(true)
                }
                if (now > start) {
                    setInProgress(true)
                }
            }

            let profile: Profile | Group | null = null
            if (res.host_info) {
                if (!res.host_info.startsWith('{')) {
                    profile = await queryGroupDetail(Number(res.host_info))
                    if (profile) {
                        setHoster(profile)
                    }
                } else {
                    const info = JSON.parse(res.host_info)
                    if (info.speaker) {
                        setSpeaker(info.speaker)
                    }
                    if (info.co_host) {
                        setCohost(info.co_host)
                    }
                    if (info.group_host) {
                        setHoster(info.group_host)
                    } else {
                        setHoster(res.owner as Profile)
                    }
                }
            } else {
                setHoster(res.owner as Profile)
            }

            if (res?.badge_id) {
                const badge = await queryBadgeDetail({id: res.badge_id})
                setBadge(badge)
            }
        } else {
            router.push('/error')
        }
    }

    async function checkJoined() {
        if (hoster && user.id) {
            const eventParticipants = event?.participants || []
            const joined = eventParticipants.find((item: Participants) => item.profile.id === user.id && item.status !== 'cancel')
            setIsJoined(!!joined)
        }
    }

    useEffect(() => {
        if (params?.eventid) {
            fetchData()
        }
    }, [params])

    useEffect(() => {
        if (event && event.group_id && ready) {
            queryGroupDetail(event.group_id).then((group) => {
                if (!group) {
                    console.warn('no group found')
                    router.push('/')
                    return
                }

                setEventGroup(group as Group)

                const selectedGroup = group as Group
                if (user.id && event.operators?.includes(user.id)) {
                    setIsOperator(true)
                    setCanAccess(true)
                } else if ((selectedGroup as Group).can_join_event === 'everyone') {
                    setCanAccess(true)
                    return
                } else if (user.id && (selectedGroup as Group).can_join_event === 'member') {
                    const myGroup = queryUserGroup({profile_id: user.id}).then(res => {
                        const joined = res.find(item => item.id === selectedGroup.id)
                        setCanAccess(!!joined)
                    })
                } else {
                    setCanAccess(false)
                }
            })

        }

    }, [event, ready, user.id])

    useEffect(() => {
        setIsHoster(hoster?.id === user.id ||
            (!!(hoster as Group)?.creator && (hoster as Group)?.creator.id === user.id))
        checkJoined()
    }, [hoster, user.id])

    const gotoModify = () => {
        router.push(`/event/edit/${event?.id}`)
    }

    const goToProfile = (username: string, isGroup?: boolean) => {
        if (process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'maodao' && username === 'readyplayerclub') {
            router.push(`/rpc/`)
        } else {
            router.push(`/${isGroup ? 'group' : 'profile'}/${username}`)
        }
    }

    const handleJoin = async () => {
        const participantsAll = event?.participants || []
        const participants = participantsAll.filter(item => item.status !== 'cancel')

        if (event?.max_participant !== null && event?.max_participant !== undefined && event?.max_participant <= participants.length) {
            showToast('The event at full strength')
            return
        }

        const unload = showLoading()
        try {
            const join = await joinEvent({id: Number(params?.eventid), auth_token: user.authToken || ''})
            unload()
            showToast('Join success')
            setIsJoined(true)
            fetchData()
        } catch (e: any) {
            console.error(e)
            unload()
            showToast(e.message)
        }
    }

    const handleHostCheckIn = async () => {
        router.push(`/event/checkin/${event!.id}`)
    }

    const handleUserCheckIn = async () => {
        router.push(`/event/checkin/${event!.id}`)
    }

    const copyLink = () => {
        router.push(`/event/success/${event?.id}`)
    }

    const handlePunchIn = async () => {
        const a = await punchIn({
            auth_token: user.authToken || '',
            id: Number(params?.eventid)
        })
    }

    const genGoogleMapUrl = (lng: string, lat: string) => {
        return `https://www.google.com/maps/search/?api=1&query=${lat}%2C${lng}`
    }

    return (<>
        <Head>
            <meta property="og:title" content={`${event?.title} | ${props.appName}`}/>
            <meta property="og:type" content="website"/>
            <meta property="og:url" content={`${props.host}/event/detail/${event?.id}`}/>
            <meta property="og:image" content={event?.cover_url || ''}/>
            {event?.content &&
                <meta name="description" property="og:description" content={event?.content.slice(0, 300) + '...'}/>
            }

            {
                !!event &&
                <>
                    <meta name="fc:frame" content="vNext"/>
                    {!!event.cover_url &&
                        <meta name="fc:frame:image" content={event.cover_url!}/>
                    }
                    <meta name="fc:frame:input:text"
                          content={event.title + ' 📅' + formatTime2(event.start_time!, event.timezone!) + `${event.location ? ` 📍${event.location}` : ''}`}/>
                    <meta name="fc:frame:button:1" content="Join"/>
                    <meta name="fc:frame:button:1:action" content="post_redirect"/>
                    <meta name="fc:frame:post_url" content={`${process.env.NEXT_PUBLIC_HOST}/api/frame/${event.id}`}/>
                </>
            }
            <title>{`${event?.title} | ${props.appName}`}</title>
        </Head>

        {
            !!event &&
            <div className={'event-detail'}>
                <div className={'event-detail-head'}>
                    <PageBack
                        to={`/event/${eventGroup?.username}`}
                        menu={() =>
                            <div className={'event-top-btn'}>
                                {(isHoster || isManager || isOperator) && !canceled &&
                                    <Link href={`/event/edit/${event?.id}`}>
                                        <i className={'icon-edit'}></i>{lang['Activity_Detail_Btn_Modify']}</Link>
                                }
                                {event?.status !== 'pending' &&
                                    <Link href={`/event/success/${event?.id}`}>
                                        <img src="/images/icon_share.svg" alt=""/>{lang['IssueFinish_Title']}</Link>
                                }
                            </div>}
                    />
                </div>
                <div className={'event-detail-content'}>
                    <div className={'event-detail-content-main'}>
                        <div className={'cover'}>
                            {
                                event.cover_url ?
                                    <ImgLazy src={event.cover_url} alt="" width={624}/>
                                    : <EventDefaultCover event={event} width={324} height={324}/>
                            }
                        </div>

                        <div className={'detail'}>
                            <div className={'center'}>
                                <div className={'name'}>
                                    {event.status === 'pending' && <span className={'pending'}>Pending</span>}
                                    {event.status === 'cancel' && <span className={'cancel'}>Canceled</span>}
                                    {event.title}
                                </div>

                                {event.tags && !!event.tags.length &&
                                    <div className={'label'}>
                                        <EventLabels data={event.tags} value={event.tags} disabled/>
                                    </div>
                                }

                                {!!hoster &&
                                    <div className={'hoster'}>
                                        <Swiper
                                            direction={'horizontal'}
                                            slidesPerView={'auto'}
                                            freeMode={true}
                                            mousewheel={true}
                                            modules={[FreeMode, Mousewheel]}
                                            spaceBetween={12}>
                                            <SwiperSlide className={'slide'}>
                                                <div className={'host-item'}
                                                     onClick={e => {
                                                         !!hoster?.username && goToProfile(hoster.username, !!(hoster as Group).creator || undefined)
                                                     }}>
                                                    <img src={hoster.image_url || defaultAvatar(hoster.id)} alt=""/>
                                                    <div>
                                                        <div
                                                            className={'host-name'}>{hoster.nickname || hoster.username}</div>
                                                        <div>{lang['Activity_Form_Hoster']}</div>
                                                    </div>
                                                </div>
                                                {cohost.map((item, index) => {
                                                    return <div className={'host-item'} key={item.username! + index}
                                                                onClick={e => {
                                                                    !!item?.username && goToProfile(item.username)
                                                                }}>
                                                        <img src={item.image_url || defaultAvatar(item.id)} alt=""/>
                                                        <div>
                                                            <div
                                                                className={'host-name'}>{item.nickname || item.username}</div>
                                                            <div>{'Co-host'}</div>
                                                        </div>
                                                    </div>
                                                })
                                                }

                                                {speaker.map((item, index) => {
                                                    return <div className={'host-item'} key={item.username! + index}
                                                                onClick={e => {
                                                                    !!item?.username && goToProfile(item.username)
                                                                }}>
                                                        <img src={item.image_url || defaultAvatar(item.id)} alt=""/>
                                                        <div>
                                                            <div
                                                                className={'host-name'}>{item.nickname || item.username}</div>
                                                            <div>{'Speaker'}</div>
                                                        </div>
                                                    </div>
                                                })}
                                            </SwiperSlide>


                                        </Swiper>
                                    </div>
                                }

                                {event.start_time &&
                                    <div className={'detail-item'}>
                                        <i className={'icon-calendar'}/>
                                        <div>
                                            <div
                                                className={'main'}>{formatTime(event.start_time, event.end_time!, event.timezone!).data}</div>
                                            <div
                                                className={'sub'}>{formatTime(event.start_time, event.end_time!, event.timezone!).time}</div>
                                        </div>
                                    </div>
                                }

                                {!!event.location &&
                                    <>
                                        <div className={'detail-item'}>
                                            <i className={'icon-Outline'}/>
                                            {event.formatted_address ?
                                                <a href={genGoogleMapUrl(event.geo_lng!, event.geo_lat!)}
                                                   target={'_blank'}>
                                                    <div className={'main'}>{event.location}</div>
                                                    <div className={'sub'}>{event.formatted_address}</div>
                                                </a>
                                                : <div>{event.location}</div>
                                            }
                                        </div>
                                        {MapReady &&
                                            <>
                                                <div className={'switch-preview-map'}
                                                     onClick={() => {
                                                         setShowMap(!showMap)
                                                     }
                                                     }
                                                >{showMap ? 'Hide Map' : 'Show Map'}</div>
                                                {showMap &&
                                                    <Link href={genGoogleMapUrl(event.geo_lng!, event.geo_lat!)}
                                                          target={'_blank'}
                                                          className={`map-preview`}>
                                                        <img
                                                            src={`https://maps.googleapis.com/maps/api/staticmap?center=${event.geo_lat},${event.geo_lng}&zoom=14&size=600x260&key=AIzaSyCNT9TndlC4dSd0oNR_L4vHYWafLDU1gbg`}
                                                            alt=""/>
                                                        <div>{event.title}</div>
                                                    </Link>
                                                }
                                            </>
                                        }
                                    </>
                                }

                                {!event.location && event.event_site &&
                                    <>
                                        <div className={'detail-item'}>
                                            <i className={'icon-Outline'}/>
                                            <a href={genGoogleMapUrl(event.event_site.geo_lng!, event.event_site.geo_lat!)}
                                               target={'_blank'}>
                                                <div className={'main'}>{event.event_site.title}</div>
                                                <div className={'sub'}>{event.event_site.formatted_address}
                                                </div>
                                            </a>
                                        </div>
                                        {MapReady &&
                                            <>
                                                <div className={'switch-preview-map'}
                                                     onClick={() => {
                                                         setShowMap(!showMap)
                                                     }
                                                     }
                                                >{showMap ? 'Hide Map' : ' Show Map'}</div>
                                                {showMap &&
                                                    <Link href={genGoogleMapUrl(event.geo_lng!, event.geo_lat!)}
                                                          target={'_blank'}
                                                          className={`map-preview`}>
                                                        <img
                                                            src={`https://maps.googleapis.com/maps/api/staticmap?center=${event.geo_lat},${event.geo_lng}&zoom=14&size=600x260&key=AIzaSyCNT9TndlC4dSd0oNR_L4vHYWafLDU1gbg`}
                                                            alt=""/>
                                                        <div>{event.title}</div>
                                                    </Link>
                                                }
                                            </>
                                        }
                                    </>
                                }

                                {event.meeting_url &&
                                    <div className={'detail-item'} onClick={e => {
                                        if (isJoined) {
                                            copy(event!.meeting_url!)
                                            showToast('Online location has been copied!')
                                        }
                                    }}>
                                        <i className={'icon-link'}/>
                                        <div>
                                            <div className={'main'}>{getMeetingName(event.meeting_url)}</div>
                                            <div className={'sub'}>{event.meeting_url}</div>
                                        </div>
                                    </div>
                                }
                            </div>

                            <div className={'center'}>
                                {!!event.external_url &&
                                    <div className={'event-login-status'}>
                                        <div className={'user-info'}>
                                            <div>{'External url'}</div>
                                        </div>
                                        <div className={'des'}>{event.external_url}</div>
                                        <div className={'event-action'}>
                                            <AppButton
                                                special
                                                onClick={e => {
                                                    const url = (event as any).external_url
                                                    if ((event as any).external_url) {
                                                        location.href = url
                                                    }
                                                }}>
                                                {lang['Go_to_Event_Page']}</AppButton>
                                        </div>
                                    </div>
                                }

                                {!!event.padge_link &&
                                    <div className={'event-login-status'}>
                                        <Link className={'link'} href={event.padge_link} target={"_blank"}>
                                            Click and get a badge of .bit
                                            <ImgLazy src={'https://ik.imagekit.io/soladata/ag4z4mmm_oJ33HdkUX'} width={100} height={100} />
                                        </Link>
                                    </div>
                                }

                                {user.userName && canAccess && !event.external_url && event.status !== 'pending' &&
                                    <div className={'event-login-status'}>
                                        <div className={'user-info'}>
                                            <img src={user.avatar || defaultAvatar(user.id!)} alt=""/>
                                            <div>{user.nickname || user.userName}</div>
                                        </div>
                                        {!isJoined ?
                                            <div className={'des'}>Welcome! To join the event, please attend
                                                below.</div>
                                            :
                                            <div className={'des'}>You're attended, we’d love to have you join us.</div>
                                        }

                                        <div className={'event-action'}>
                                            <div className={'center'}>
                                                {canceled &&
                                                    <AppButton
                                                        disabled>{lang['Activity_Detail_Btn_has_Cancel']}</AppButton>
                                                }

                                                {!canceled &&
                                                    <AppButton
                                                        onClick={e => {
                                                            addToCalender({
                                                                name: event!.title,
                                                                startTime: event!.start_time!,
                                                                endTime: event!.end_time!,
                                                                location: eventSite?.title || event!.location || '',
                                                                details: event!.content,
                                                                url: window.location.href
                                                            })
                                                        }}>
                                                        <i className="icon-calendar" style={{marginRight: '8px'}}/>
                                                        {lang['Activity_Detail_Btn_add_Calender']}</AppButton>
                                                }

                                                {!isJoined && !canceled && (inCheckinTime || notStart) &&
                                                    <AppButton special onClick={e => {
                                                        handleJoin()
                                                    }}>{lang['Activity_Detail_Btn_Attend']}</AppButton>
                                                }

                                                {!canceled && isJoined && !isHoster && !isManager && inCheckinTime && !isOperator &&
                                                    <AppButton
                                                        special
                                                        onClick={e => {
                                                            handleUserCheckIn()
                                                        }}>{lang['Activity_Detail_Btn_Checkin']}</AppButton>
                                                }

                                                {!canceled && isJoined && inProgress && !!event.meeting_url &&
                                                    <AppButton
                                                        onClick={e => {
                                                            copy(event!.meeting_url!);
                                                            showToast('Online location has been copied!')
                                                            // window.open(getUrl(event!.online_location!) || '#', '_blank')
                                                        }}
                                                        special>{lang['Activity_Detail_Btn_AttendOnline']}</AppButton>
                                                }
                                            </div>

                                            <div className={'center'}>
                                                {(isHoster || isManager || isOperator) && !canceled &&
                                                    <AppButton
                                                        onClick={e => {
                                                            handleHostCheckIn()
                                                        }}>{
                                                        event.badge_id
                                                            ? lang['Activity_Host_Check_And_Send']
                                                            : lang['Activity_Detail_Btn_Checkin']
                                                    }</AppButton>
                                                }
                                            </div>
                                        </div>

                                        {!canAccess &&
                                            <div className={'event-action'}>
                                                <div className={'can-not-access'}> Event only open to members of the
                                                    group
                                                </div>
                                            </div>
                                        }
                                    </div>
                                }


                                {!user.userName &&
                                    <div className={'center'}>
                                        <div className={'home-login-panel'}>
                                            <img src="/images/balloon.png" alt=""/>
                                            <div className={'text'}>{lang['Activity_login_des']}</div>
                                            <AppButton onClick={e => {
                                                openConnectWalletDialog()
                                            }} special size={'compact'}>{lang['Activity_login_btn']}</AppButton>
                                        </div>
                                    </div>
                                }
                            </div>

                            <div className={'event-tab'}>
                                <div className={'tab-titles'}>
                                    <div className={'center'}>
                                        <div className={tab === 1 ? 'tab-title active' : 'tab-title'}
                                             onClick={e => {
                                                 setTab(1)
                                             }}>
                                            <div>{lang['Activity_Des']}</div>
                                        </div>
                                        <div className={'split'}/>
                                        <div className={tab === 2 ? 'tab-title active' : 'tab-title'}
                                             onClick={e => {
                                                 setTab(2)
                                             }}>
                                            <div>{lang['Activity_Participants']}({participants.length})</div>
                                        </div>
                                    </div>
                                </div>


                                <div className={'tab-contains'}>
                                    {tab === 1 &&
                                        <div className={'tab-contain'}>
                                            {
                                                !!badge && <div className={'center'}>
                                                    <div className={'event-badge'}>
                                                        <div>{lang['Activity_Detail_Badge']}</div>
                                                        <img src={badge.image_url} alt=""/>
                                                    </div>
                                                </div>
                                            }

                                            <div className={'center'}>
                                                {!!event.wechat_contact_group &&
                                                    <>
                                                        <div
                                                            className={'wechat-title'}>{lang['Activity_Detail_Wechat']}</div>
                                                        {
                                                            !!event.wechat_contact_person &&
                                                            <div
                                                                className={'wechat-account'}>{lang['Activity_Detail_Account']}
                                                                <span onClick={e => {
                                                                    copy(event?.wechat_contact_person!);
                                                                    showToast('Copied!')
                                                                }}>
                                                        {event.wechat_contact_person}
                                                        </span>
                                                            </div>
                                                        }
                                                        <div className={'wechat-contact-group'} onClick={e => {
                                                            showImage(event?.wechat_contact_group!)
                                                        }}>
                                                            <img src={event.wechat_contact_group} alt=""/>
                                                        </div>
                                                    </>
                                                }
                                                {!!event.telegram_contact_group &&
                                                    <div className={'wechat-account'}>
                                                        <div className={'wechat-title'}>Join the Telegram group</div>
                                                        <a href={event.telegram_contact_group} target={'_blank'}>
                                                            {event.telegram_contact_group}
                                                        </a>
                                                    </div>
                                                }
                                                <ReasonText className={'event-des'} text={event.content}/>

                                                {!!event.notes &&
                                                    <EventNotes hide={!isJoined && !isHoster} notes={event.notes}/>
                                                }
                                            </div>
                                        </div>}
                                    {tab === 2 &&
                                        <div className={'tab-contain'}>
                                            <div className={'center'}>
                                                {!!event.min_participant &&
                                                    <div
                                                        className={'min-participants-alert'}>{lang['Activity_Detail_min_participants_Alert']([event.min_participant])}</div>
                                                }
                                                {!!hoster &&
                                                    <ListCheckinUser
                                                        onChange={e => {
                                                            fetchData()
                                                        }}
                                                        editable={false}
                                                        participants={participants}
                                                        isHost={isHoster}
                                                        eventId={Number(params?.eventid)}
                                                    />
                                                }

                                                {!participants.length &&
                                                    <Empty/>
                                                }
                                            </div>
                                        </div>
                                    }
                                    {tab === 3 &&
                                        <div className={'tab-contain'}>
                                            <div className={'center'}>
                                                <ListCheckLog eventId={Number(params?.eventid)}/>
                                            </div>
                                        </div>}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={'event-detail-content-site'}>
                        <div className={'cover'}>
                            {
                                event.cover_url ?
                                    <ImgLazy src={event.cover_url} alt="" width={624}/>
                                    : <EventDefaultCover event={event} width={324} height={324}/>
                            }
                        </div>
                        <div className={'center'}>

                            {!!event.external_url &&
                                <div className={'event-login-status'}>
                                    <div className={'user-info'}>
                                        <div>{'External url'}</div>
                                    </div>
                                    <div className={'des'}>{event.external_url}</div>
                                    <div className={'event-action'}>
                                        <AppButton
                                            special
                                            onClick={e => {
                                                const url = (event as any).external_url
                                                if ((event as any).external_url) {
                                                    location.href = url
                                                }
                                            }}>
                                            {lang['Go_to_Event_Page']}</AppButton>
                                    </div>
                                </div>
                            }


                            {user.userName && canAccess && event.status !== 'pending' && !props.event?.external_url &&
                                <div className={'event-login-status'}>
                                    <div className={'user-info'}>
                                        <img src={user.avatar || defaultAvatar(user.id!)} alt=""/>
                                        <div>{user.nickname || user.userName}</div>
                                    </div>
                                    {!isJoined ?
                                        <div className={'des'}>Welcome! To join the event, please attend below.</div>
                                        : <div className={'des'}>You're attended, we’d love to have you join us.</div>
                                    }

                                    <div className={'event-action'}>
                                        {canceled &&
                                            <AppButton disabled>{lang['Activity_Detail_Btn_has_Cancel']}</AppButton>
                                        }

                                        {!canceled &&
                                            <AppButton
                                                onClick={e => {
                                                    addToCalender({
                                                        name: event!.title,
                                                        startTime: event!.start_time!,
                                                        endTime: event!.end_time!,
                                                        location: eventSite?.title || event!.location || '',
                                                        details: event!.content,
                                                        url: window.location.href
                                                    })
                                                }}>
                                                <i className="icon-calendar" style={{marginRight: '8px'}}/>
                                                {lang['Activity_Detail_Btn_add_Calender']}</AppButton>
                                        }

                                        {!isJoined && !canceled && (inCheckinTime || notStart) &&
                                            <AppButton special onClick={e => {
                                                handleJoin()
                                            }}>{lang['Activity_Detail_Btn_Attend']}</AppButton>
                                        }

                                        {!canceled && isJoined && inProgress && !!event.meeting_url &&
                                            <AppButton
                                                onClick={e => {
                                                    copy(event!.meeting_url!);
                                                    showToast('Online location has been copied!')
                                                    // window.open(getUrl(event!.online_location!) || '#', '_blank')
                                                }}
                                                special>{lang['Activity_Detail_Btn_AttendOnline']}</AppButton>
                                        }
                                    </div>

                                    <div className={'event-action'}>
                                        {(isHoster || isManager || isOperator) && !canceled &&
                                            <AppButton
                                                onClick={e => {
                                                    handleHostCheckIn()
                                                }}>{
                                                event.badge_id
                                                    ? lang['Activity_Host_Check_And_Send']
                                                    : lang['Activity_Detail_Btn_Checkin']
                                            }</AppButton>
                                        }
                                    </div>

                                    {!canAccess &&
                                        <div className={'event-action'}>
                                            <div className={'can-not-access'}> Event only open to members of the group
                                            </div>
                                        </div>
                                    }
                                </div>
                            }

                            {!!event.padge_link &&
                                <div className={'event-login-status'}>
                                    <Link className={'link'} href={event.padge_link} target={"_blank"}>
                                        Click and get a badge of .bit
                                        <ImgLazy src={'https://ik.imagekit.io/soladata/ag4z4mmm_oJ33HdkUX'} width={100} height={100} />
                                    </Link>
                                </div>
                            }

                            {!user.userName &&
                                <div className={'center'}>
                                    <div className={'home-login-panel'}>
                                        <img src="/images/balloon.png" alt=""/>
                                        <div className={'text'}>{lang['Activity_login_des']}</div>
                                        <AppButton onClick={e => {
                                            openConnectWalletDialog()
                                        }} special size={'compact'}>{lang['Activity_login_btn']}</AppButton>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        }
    </>)
}

export default EventDetail

export const getServerSideProps: any = (async (context: any) => {
    const eventid = context.params?.eventid
    if (eventid) {
        const detail = await queryEventDetail({id: eventid})
        return {
            props: {
                event: detail || null,
                host: process.env.NEXT_PUBLIC_HOST,
                appName: process.env.NEXT_PUBLIC_APP_NAME
            },
        }
    } else {
        return {props: {event: null, host: process.env.NEXT_PUBLIC_HOST, appName: process.env.NEXT_PUBLIC_APP_NAME}}
    }
})
