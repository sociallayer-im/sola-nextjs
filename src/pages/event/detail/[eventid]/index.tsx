import {useParams, useRouter, useSearchParams} from 'next/navigation'
import {useContext, useEffect, useMemo, useState} from 'react'
import {
    Badge,
    checkEventPermission,
    Event,
    getProfileBatchById,
    getRecurringEvents,
    Group,
    joinEvent,
    Participants,
    Profile,
    ProfileSimple,
    punchIn,
    queryBadgeDetail,
    queryEvent,
    queryEventDetail,
    queryTickets,
    Ticket,
    queryGroupDetail,
    queryProfileByEmail,
    queryUserGroup,
    RecurringEvent, setEventStatus, TicketItem, queryTicketItems, queryTrackDetail, Track
} from "@/service/solas";
import LangContext from "@/components/provider/LangProvider/LangContext";
import {useTime2, useTime3} from "@/hooks/formatTime";
import EventLabels from "@/components/base/EventLabels/EventLabels";
import usePicture from "@/hooks/pictrue";
import AppButton from "@/components/base/AppButton/AppButton";
import userContext from "@/components/provider/UserProvider/UserContext";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import PageBack from "@/components/base/PageBack";
import ListCheckLog from "@/components/compose/ListCheckLog/ListCheckLog";
import useCalender from "@/hooks/addToCalendar/addToCalendar";
import ListEventParticipants from "@/components/compose/ListEventParticipants/ListEventParticipants";
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
import {Mousewheel, FreeMode} from "swiper";
import EventTickets from "@/components/compose/EventTickets/EventTickets";
import EventNotes from "@/components/base/EventNotes/EventNotes";
import RichTextDisplayer from "@/components/compose/RichTextEditor/Displayer";
import removeMarkdown from "markdown-to-text"
import {StatefulPopover} from "baseui/popover";
import {AVNeeds, SeatingStyle} from "@/pages/event/[groupname]/create";
import DialogGenPromoCode from "@/components/base/Dialog/DialogGenPromoCode/DialogGenPromoCode";
import TicketsPurchased from "@/components/base/TicketsPurchased/TicketsPurchased";


import * as dayjsLib from "dayjs";
import Empty from "@/components/base/Empty";
import useEvent, {EVENT} from "@/hooks/globalEvent";
import useZuAuth from "@/service/zupass/useZuAuth";
import {isHideLocation} from "@/global_config";
import copy from "@/utils/copy";

const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const dayjs: any = dayjsLib
dayjs.extend(utc)
dayjs.extend(timezone)


function EventDetail(props: { event: Event | null, appName: string, host: string, des: string, track: Track | null }) {
    const router = useRouter()
    const [event, setEvent] = useState<Event | null>(props.event || null)
    const [hoster, setHoster] = useState<Profile | null>(null)
    const params = useParams()
    const searchParams = useSearchParams()
    const {lang} = useContext(LangContext)
    const formatTime = useTime3()
    const formatTime2 = useTime2()
    const {defaultAvatar} = usePicture()
    const {user} = useContext(userContext)
    const {showLoading, showToast, openDialog, openConnectWalletDialog, openConfirmDialog} = useContext(DialogsContext)
    const {addToCalenderDialog} = useCalender()
    const {showImage} = useShowImage()
    const {copy} = useCopy()
    const {setEventGroup, eventGroup, ready, isManager, joined: isMember} = useContext(EventHomeContext)
    const {getMeetingName, getUrl} = useGetMeetingName()
    const {MapReady} = useContext(MapContext)
    const [needUpdate, _] = useEvent(EVENT.participantUpdate)
    const zuAuthLogin = useZuAuth()

    const isTrackManager = useMemo(() => {
        if (!user.id) return false
        return props.track?.manager_ids?.includes(user.id)
    }, [props.track, user])

    const [tab, setTab] = useState(1)
    const [isHoster, setIsHoster] = useState(false)
    const [isOperator, setIsOperator] = useState(false)
    const [isGroupOwner, setIsGroupOwner] = useState(false)
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
    const [hasPermission, setHasPermission] = useState(false)
    const [eventSite, setEventSite] = useState<any | null>(null)
    const [showMap, setShowMap] = useState(false)
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [group, setGroup] = useState<Group | null>(null)
    const [ticketItems, setTicketItems] = useState<TicketItem[]>([])

    const [cohost, setCohost] = useState<ProfileSimple[]>([])
    const [speaker, setSpeaker] = useState<ProfileSimple[]>([])
    const [repeatEventDetail, setRepeatEventDetail] = useState<RecurringEvent | null>(null)
    const [ticketReady, setTicketReady] = useState(false)

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

            queryTickets({event_id: res.id}).then((res) => {
                setTickets(res)
            }).finally(()=>{
                setTicketReady(true)
            })

            queryTicketItems({event_id: res.id}).then(res => {
                setTicketItems(res)
            })

            setEvent(res)
            setEventSite(res.venue)
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

                if (now >= start) {
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
                if (now >= start) {
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
                    const ids: number[] = [...info.speaker, ...info.co_host]
                        .filter((item: any) => !!item.id)
                        .map((item: any) => item.id)

                    const profiles = await getProfileBatchById(ids)

                    if (info.speaker) {
                        setSpeaker(info.speaker.map((p: Profile) => {
                            const info = profiles.find((item: any) => (item.id === p.id && !!p.username))
                            return info || p
                        }))
                    }

                    if (info.co_host) {
                        setCohost(info.co_host.map((p: Profile) => {
                            const info = profiles.find((item: any) => item.id === p.id && !!p.username)
                            return info || p
                        }))
                    }

                    if (info.group_host) {
                        const group =  await queryGroupDetail(info.group_host.id)
                        setHoster(group as any || info.group_host)
                    } else {
                        setHoster(res.owner as Profile)
                    }
                }
            } else {
                setHoster(res.owner as Profile)
            }

            if (res?.badge_class_id) {
                const badge = await queryBadgeDetail({id: res.badge_class_id})
                setBadge(badge)
            }

            if (res?.recurring_id) {
                const repeatEvent = await getRecurringEvents(res.recurring_id)
                setRepeatEventDetail(repeatEvent as RecurringEvent)
            }
        } else {
            router.push('/error')
        }
    }

    async function checkJoined() {
        if (hoster && user.id) {
            const eventParticipants = event?.participants || []
            const joined = eventParticipants.find((item: Participants) => {
                const ticket = tickets.find(t => t.id === item.ticket_id)
                return (!item.ticket_id && item.profile.id === user.id && (item.status === 'applied' || item.status === 'attending' || item.status === 'checked')) // no tickets needed
                    || (!!ticket && !!item.ticket_id && item.profile.id === user.id && (item.status === 'applied' || item.status === 'attending' || item.status === 'checked') && item.payment_status?.includes('succe')) // paid ticket
                    || (!!ticket && !!item.ticket_id && item.profile.id === user.id && (item.status === 'applied' || item.status === 'attending' || item.status === 'checked') && ticket.payment_methods.length === 0) // free ticket
            })

            setIsJoined(!!joined)
            if (!!joined && !!searchParams?.get('payment_intent')) {
                showToast('Payment success')
            }
        }
    }

    function getRepeatText(startDate: Date, repeatType: string, timezones: string) {
        const getDateWord = (date: number) => {
            let suffix = 'th';

            if (date === 1 || date === 21 || date === 31) {
                suffix = 'st';
            } else if (date === 2 || date === 22) {
                suffix = 'nd';
            } else if (date === 3 || date === 23) {
                suffix = 'rd';
            }
            return `${date}${suffix}`
        }

        const date = dayjs.tz(startDate.getTime(), timezones).date()
        const day = dayjs.tz(startDate.getTime(), timezones).day()
        return repeatType === 'month' ?
            'Every month on ' + getDateWord(date)
            : repeatType === 'week' ?
                'Every week on ' + lang['Day_Name'][day] : 'Every day'
    }

    async function showAllRepeatEvent() {
        const unloading = showLoading()
        const events = await queryEvent({recurring_id: event!.recurring_id!, page: 1, page_size: 1000})
        unloading()

        openDialog({
            content: (close: any) => {
                return <div className={'dialog-repeat-event-list'}>
                    <i className={'icon-close close-btn'} onClick={close}></i>
                    <div className={'title'}>Event time</div>
                    <div className={'repeat-event-list'}>
                        {
                            events.sort((a, b) => a.id - b.id).map((event, index: number) => {
                                const format = (from: string, to: string, timezone: string) => {
                                    const fromTime = dayjs.tz(new Date(from).getTime(), timezone)
                                    const toTime = dayjs.tz(new Date(to).getTime(), timezone)

                                    const fromYear = fromTime.year()
                                    const fromMonth = fromTime.month()
                                    const fromDate = fromTime.date()
                                    const fromHour = fromTime.hour().toString().padStart(2, '0')
                                    const fromMinute = fromTime.minute().toString().padStart(2, '0')

                                    const toYear = toTime.year()
                                    const toMonth = toTime.month()
                                    const toDate = toTime.date()
                                    const toHour = toTime.hour().toString().padStart(2, '0')
                                    const toMinute = toTime.minute().toString().padStart(2, '0')

                                    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
                                    if (toYear === fromYear && toMonth === fromMonth && toDate === fromDate) {
                                        // April 18 2024 20:00-21:00
                                        return `${monthNames[fromMonth]} ${fromDate}, ${fromYear} (${fromHour}:${fromMinute}-${toHour}:${toMinute})`
                                    } else if (toYear !== fromYear) {
                                        // April 18 2024 20:00- April 18 2025 21:00
                                        return `${monthNames[fromMonth]} ${fromDate}, ${fromYear} ${fromHour}:${fromMinute} - ${monthNames[toMonth]} ${toDate}, ${toYear} ${toHour}:${toMinute}`
                                    } else {
                                        // April 18 20:00 - April 19 20:00, 2024
                                        return `${monthNames[fromMonth]} ${fromDate} ${fromHour}:${fromMinute}-${monthNames[toMonth]} ${toDate} ${toHour}:${toMinute}, ${fromYear}`
                                    }
                                }

                                return <Link target={'_blank'} href={`/event/detail/${event.id}`} key={event.id}
                                             className={event.id === props.event!.id ? 'active' : ''}>
                                    {index + 1}. <span>{format(event.start_time!, event.end_time!, event.timezone!)}</span>
                                </Link>
                            })
                        }
                    </div>
                </div>
            },
            size: [310, 'auto'],
            position: 'bottom'
        })
    }

    const filteredParticipants = useMemo(() => {
        if (!participants.length || !ticketReady) return []
        if (!tickets.length) return participants

        return participants.filter(participant => {
            if (!participant.ticket_id) return true

            const ticket = tickets.find((ticket) => {
                return ticket.id == participant.ticket_id
            })

            if (ticket!.payment_methods.length === 0) {
                return true
            } else return participant.payment_status === 'succeeded';

        })
    }, [participants, tickets])

    useEffect(() => {
        if (params?.eventid || needUpdate) {
            fetchData()
        }
    }, [params, needUpdate])

    useEffect(() => {
        if (event && event.group_id && ready) {
            queryGroupDetail(event.group_id).then((group) => {
                if (!group) {
                    console.warn('no group found')
                    router.push('/')
                    return
                }

                setEventGroup(group as Group)
                setGroup(group as Group)
                const selectedGroup = group as Group

                if ((user.id && event.operators?.includes(user.id)) || (!!user.email && event.extra?.includes(user.email))) {
                    setIsOperator(true)
                    setCanAccess(true)
                } else if (user.id && (selectedGroup as Group).can_join_event === 'member') {
                    const myGroup = queryUserGroup({profile_id: user.id}).then(res => {
                        const joined = res.find(item => item.id === selectedGroup.id)
                        setCanAccess(!!joined)
                    })
                } else if ((selectedGroup as Group).can_join_event === 'everyone') {
                    setCanAccess(true)
                } else {
                    setCanAccess(false)
                    setIsOperator(false)
                }
            })

        }
    }, [event, ready, user.id])

    useEffect(() => {
        if (!user.id) {
            setHasPermission(false)
        } else {
            if (event) {
                checkEventPermission({id: event.id, auth_token: user.authToken || ''})
                    .then(res => {
                    setHasPermission(res)
                })
            }
        }
    }, [event, ready, user.id])

    useEffect(() => {
        setIsHoster(hoster?.id === user.id ||
            (!!(hoster as Group)?.creator && (hoster as Group)?.creator.id === user.id))
        checkJoined()
    }, [hoster, user.id, tickets])

    useEffect(() => {
        setIsGroupOwner(group?.creator.id === user.id)
    }, [group, user.id])

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
            showToast('The event has reached its maximum capacity.')
            return
        }

        const unload = showLoading()
        try {
            const hasPermission = await checkEventPermission({id: event!.id, auth_token: user.authToken || ''})
            if (!hasPermission) {
                unload()
                openConfirmDialog({
                    title: 'Can not join event',
                    confirmLabel: 'Add Ticket',
                    cancelLabel: 'OK',
                    content: 'Please Add Ticket(s) in Zupass and confirm the ticket type',
                    onConfirm: async (close: any) => {
                        close()
                        const unload = showLoading()
                        try {
                            await zuAuthLogin()
                        } catch (e: any) {
                            showToast(e.message)
                        } finally {
                            unload()
                        }
                    }
                })
                return
            }

            const join = await joinEvent({id: Number(params?.eventid), auth_token: user.authToken || ''})
            unload()
            showToast('You have successfully registered for the event.')
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

    const genGoogleMapUrl = () => {
        // if (marker.formatted_address && marker.location !== 'Custom location') {
        //     const json = JSON.parse(marker.formatted_address)
        //     return `https://www.google.com/maps/search/?api=1&query=${json.name.split('').join('+')}`
        // } else {
        //     return `https://www.google.com/maps/search/?api=1&query=${marker.geo_lat}%2C${marker.geo_lng}`
        // }

        return `https://www.google.com/maps/search/?api=1&query=${event!.geo_lat}%2C${event!.geo_lng}`
    }

    const handlePublish = (e: any) => {
        e.preventDefault()
        openConfirmDialog({
            title: lang['Are_You_Sure_To_Publish_This_Event'],
            content: `${event!.title}`,
            confirmLabel: lang['Yes'],
            cancelLabel: lang['No'],
            onConfirm: async (close: any) => {
                const unload = showLoading()
                try {
                    await setEventStatus({
                        id: event!.id,
                        status: 'open',
                        auth_token: user.authToken || ''
                    })
                    unload()
                    showToast('Publish success')
                    router.refresh()
                    close()
                } catch (e: any) {
                    unload()
                    close()
                    showToast(e.message)
                }
            }
        })
    }

    const showGenPromoCodeDialog = async () => {
        if (!event) return
        openDialog({
            content: (close: any) => {
                return <DialogGenPromoCode
                    close={close}
                    coupons={[]}
                    event={event!}
                    onChange={(codes) => {
                        console.log('codes', codes)
                    }}
                />
            },
            size: ['100%', '100%'],
        })
    }

    return (<>
        <Head>
            <meta property="og:title" content={`${event?.title} | ${props.appName}`}/>
            <meta property="og:type" content="website"/>
            <meta property="og:url" content={`${props.host}/event/detail/${event?.id}`}/>
            <meta property="og:image"
                  content={event?.cover_url || 'https://app.sola.day/images/facaster_default_cover.png'}/>
            {event?.content &&
                <meta name="description" property="og:description" content={props.des.slice(0, 300) + '...'}/>
            }

            {
                !!event &&
                <>
                    <meta name="fc:frame" content="vNext"/>
                    <meta name="fc:frame:image"
                          content={event.cover_url || 'https://app.sola.day/images/facaster_default_cover.png'}/>
                    <meta name="fc:frame:input:text"
                          content={event.title.slice(0, 32).trim()}/>
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
                    <div className={'event-detail-head-menu'}>
                        <div className={'event-detail-head-event-home'}>
                            {!!group &&
                                <Link href={`/event/${group?.username}`}>
                                    <img src={group?.image_url || defaultAvatar(group.id)} alt=""/>
                                    <div>{group?.nickname || group?.username}</div>
                                </Link>
                            }
                        </div>
                        <div className={'event-top-btn'}>
                            {(isHoster || isManager || isOperator || isGroupOwner || isTrackManager) && !canceled &&
                                <>
                                { !!tickets.length &&
                                    <AppButton
                                        onClick={showGenPromoCodeDialog}
                                        kind={'primary'} size={'compact'}>
                                        {lang['Promo_Code']}
                                    </AppButton>
                                }
                                    <Link href={`/event/edit/${event?.id}`}>
                                        <i className={'icon-edit'}></i>
                                        <span>{lang['Activity_Detail_Btn_Modify']}</span>
                                    </Link>
                                </>
                            }
                            {event?.status !== 'pending' &&
                                <Link href={`/event/success/${event?.id}`}>
                                    <img src="/images/icon_share.svg" alt=""/>
                                    <span>{lang['IssueFinish_Title']}</span>
                                </Link>
                            }
                        </div>

                    </div>
                </div>
                <div className={'event-detail-content'}>
                    <div className={'event-detail-content-main'}>
                        <div className={'cover'}>
                            {
                                event.cover_url ?
                                    <ImgLazy src={event.cover_url} alt="" width={624}/>
                                    : <EventDefaultCover event={event} width={324} height={324} showLocation={!isHideLocation(event.group_id) || isOperator || isGroupOwner || isHoster || isJoined || isManager || isTrackManager}/>
                            }
                        </div>

                        <div className={'detail'}>
                            <div className={'center'}>
                                <div className={'name'}>
                                    {event.status === 'pending' && <span className={'pending'}>Pending</span>}
                                    {event.status === 'cancel' && <span className={'cancel'}>Canceled</span>}
                                    {event.display === 'private' && <StatefulPopover
                                        placement={'bottom'}
                                        returnFocus={false}
                                        autoFocus={false}
                                        triggerType={'hover'}
                                        content={() => {
                                            return <div style={{"padding": '6px', maxWidth: "310px"}}>
                                                private event only be viewed through the link, and users can view the
                                                event in <a href={'/my-event'} target={'_blank'}>My Event</a> page.
                                            </div>
                                        }}>
                                        <span className={'private'}>Private</span>
                                    </StatefulPopover>}
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
                                                                    if (!!item?.username && item.id) {
                                                                        goToProfile(item.username)
                                                                    } else if (!item.id && item.email) {
                                                                        queryProfileByEmail(item.email).then(res => {
                                                                            if (res) {
                                                                                goToProfile(res.username!)
                                                                            }
                                                                        })
                                                                    }
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
                                            </SwiperSlide>
                                        </Swiper>
                                        {speaker.length > 0 &&
                                            <Swiper
                                                style={{marginTop: '6px'}}
                                                direction={'horizontal'}
                                                slidesPerView={'auto'}
                                                freeMode={true}
                                                mousewheel={true}
                                                modules={[FreeMode, Mousewheel]}
                                                spaceBetween={12}>
                                                {speaker.map((item, index) => {
                                                    return <SwiperSlide className={'slide'} key={item.username! + index}>
                                                        <div className={'host-item'} key={item.username! + index}
                                                             onClick={e => {
                                                                 if (!!item?.username && item.id) {
                                                                     goToProfile(item.username)
                                                                 } else if (!item.id && item.email) {
                                                                     queryProfileByEmail(item.email).then(res => {
                                                                         if (res) {
                                                                             goToProfile(res.username!)
                                                                         }
                                                                     })
                                                                 }
                                                             }}>
                                                            <img src={item.image_url || defaultAvatar(item.id)} alt=""/>
                                                            <div>
                                                                <div
                                                                    className={'host-name'}>{item.nickname || item.username}</div>
                                                                <div>{'Speaker'}</div>
                                                            </div>
                                                        </div>
                                                    </SwiperSlide>
                                                })}
                                            </Swiper>

                                        }
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
                                            {
                                                repeatEventDetail &&
                                                <div className={'repeat'}
                                                     onClick={showAllRepeatEvent}>{`Repeat event (${getRepeatText(new Date(repeatEventDetail.start_time), repeatEventDetail.interval, repeatEventDetail.timezone)})`}</div>
                                            }
                                        </div>
                                    </div>
                                }

                                {!!event.location &&
                                    <>
                                        <div className={'detail-item'}>
                                            <i className={'icon-Outline'}/>
                                            {
                                                (isJoined || isManager || isOperator || isGroupOwner || isHoster || isMember || isTrackManager || !isHideLocation(event.group_id)) ? <>
                                                        {event.formatted_address ?
                                                            <a href={genGoogleMapUrl()}
                                                               target={'_blank'}>
                                                                <div className={'main'}>{event.location}</div>
                                                                <div className={'sub'}>{event.formatted_address}</div>
                                                            </a>
                                                            : <div>{event.location}</div>
                                                        }
                                                    </>
                                                    :
                                                    <div style={{color: '#7B7C7B'}}>RSVP to see the event address</div>
                                            }
                                        </div>
                                        {
                                            !!eventSite && eventSite.link && (isJoined || isManager || isOperator || isGroupOwner || isHoster || isMember || isTrackManager || !isHideLocation(event.group_id)) &&
                                            <div className={'venue-link'}><a href={eventSite.link}
                                                                             target="_blank">{'View venue photos'}</a>
                                            </div>
                                        }

                                        {MapReady && (isJoined || isManager || isOperator || isGroupOwner || isHoster || isMember || isTrackManager || !isHideLocation(event.group_id)) &&
                                            <>
                                                <div className="map-action">
                                                    <div className={'switch-preview-map'}
                                                         onClick={() => {
                                                             setShowMap(!showMap)
                                                         }
                                                         }
                                                    >{showMap ? 'Hide Map' : 'Show Map'}</div>
                                                    <div className={'switch-preview-map'}
                                                         onClick={()=> {
                                                             copy(event.formatted_address)
                                                             showToast('Copied')
                                                         }}
                                                    >Copy Address</div>
                                                </div>
                                                {showMap &&
                                                    <Link href={genGoogleMapUrl()}
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

                                {event.meeting_url && (isJoined || isManager || isOperator || isGroupOwner || isHoster || isMember || isTrackManager || !isHideLocation(event.group_id)) &&
                                    <div className={'detail-item'} onClick={e => {
                                        if (isJoined) {
                                            copy(event!.meeting_url!)
                                            showToast('Online location has been copied!')
                                        }
                                    }}>
                                        <i className={'icon-link'}/>
                                        <div>
                                            <div className={'main'}>{getMeetingName(event.meeting_url)}</div>
                                            {
                                                event.meeting_url.startsWith('https') || event.meeting_url.startsWith('http') ?
                                                    <a className={'sub'} href={event.meeting_url}
                                                       target={'_blank'}>{event.meeting_url}</a>
                                                    : <div className={'sub'}>{event.meeting_url}</div>
                                            }

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
                                            <ImgLazy src={'https://ik.imagekit.io/soladata/ag4z4mmm_oJ33HdkUX'}
                                                     width={100} height={100}/>
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
                                            <div className={'des'}>Welcome to join the event.</div>
                                            :
                                            <div className={'des'}>You have registered, we’d love to have you join
                                                us.</div>
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
                                                            addToCalenderDialog({
                                                                name: event!.title,
                                                                startTime: event!.start_time!,
                                                                endTime: event!.end_time!,
                                                                location: eventSite?.title || event!.location || '',
                                                                details: event!.content,
                                                                url: event!.meeting_url || window.location.href
                                                            })
                                                        }}>
                                                        <i className="icon-calendar" style={{marginRight: '8px'}}/>
                                                        {lang['Activity_Detail_Btn_add_Calender']}</AppButton>
                                                }


                                                {!isJoined && !canceled && !tickets.length &&
                                                    <AppButton special onClick={e => {
                                                        handleJoin()
                                                    }}>{lang['Activity_Detail_Btn_Attend']}</AppButton>
                                                }

                                                {!canceled && isJoined && !isHoster && !isManager && !isOperator && !isGroupOwner && !isTrackManager && !event.meeting_url &&
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
                                                            if (event!.meeting_url!.startsWith('http') || event!.meeting_url!.startsWith('https')) {
                                                                window.open(getUrl(event!.meeting_url!) || '#', '_blank')
                                                            }
                                                        }}
                                                        special>{lang['Activity_Detail_Btn_AttendOnline']}</AppButton>
                                                }
                                            </div>

                                            <div className={'center'}>
                                                {(isHoster || isManager || isOperator || isGroupOwner) && !canceled && !isTrackManager &&
                                                    <AppButton
                                                        onClick={e => {
                                                            handleHostCheckIn()
                                                        }}>{
                                                        event.badge_class_id
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
                                        { tickets.length > 0 &&
                                            <>
                                                <div className={'split mobile-item'}/>
                                                <div className={tab === 4 ? 'tab-title mobile-item active' : 'mobile-item tab-title'}
                                                     onClick={e => {
                                                         setTab(4)
                                                     }}>
                                                    <div>{lang['Tickets']}</div>
                                                </div>
                                            </>
                                        }
                                        {
                                            (!tickets.length || isHoster || isManager || isOperator || isGroupOwner || isTrackManager) &&
                                            <>
                                                <div className={'split'}/>
                                                <div className={tab === 2 ? 'tab-title active' : 'tab-title'}
                                                     onClick={e => {
                                                         setTab(2)
                                                     }}>
                                                    <div>{lang['Activity_Participants']}({filteredParticipants.length})</div>
                                                </div>
                                            </>
                                        }
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
                                                {!!event.requirement_tags && !!event.group_id && [3427, 3409, 3463, 3454].includes(event.group_id) && (isOperator || isManager || isHoster || isGroupOwner || isTrackManager ) &&
                                                    <>
                                                        {!!event.requirement_tags.filter((t) => {
                                                                return SeatingStyle.includes(t)
                                                            }).length &&
                                                            <div className={'wechat-account'}>
                                                                <div className={'wechat-title'}>Seating arrangement
                                                                    style
                                                                </div>
                                                                <div>{event.requirement_tags.filter((t) => {
                                                                    return SeatingStyle.includes(t)
                                                                }).join(', ')}</div>
                                                            </div>
                                                        }
                                                        {!!event.requirement_tags.filter((t) => {
                                                                return AVNeeds.includes(t)
                                                            }).length &&
                                                            <div className={'wechat-account'}>
                                                                <div className={'wechat-title'}>AV needed</div>
                                                                <div>{event.requirement_tags.filter((t) => {
                                                                    return AVNeeds.includes(t)
                                                                }).join(', ')}</div>
                                                            </div>
                                                        }
                                                    </>
                                                }
                                                <RichTextDisplayer markdownStr={event.content}/>

                                                {!!event.notes &&
                                                    <EventNotes
                                                        hide={!isJoined && !isHoster && !isOperator && !isGroupOwner && !isTrackManager}
                                                        notes={event.notes}/>
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
                                                    <ListEventParticipants
                                                        ticketItems={ticketItems}
                                                        onChange={e => {
                                                            fetchData()
                                                        }}
                                                        showDownload={isHoster || isOperator || isGroupOwner || isManager || isTrackManager}
                                                        participants={filteredParticipants}
                                                        isHost={isHoster || isOperator || isGroupOwner || isManager || isTrackManager}
                                                        eventId={Number(params?.eventid)}
                                                        tickets={tickets}
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

                                    {
                                        tab === 4 && !!event &&
                                        <EventTickets tickets={tickets} event={event} canAccess={canAccess}/>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={'event-detail-content-site'}>
                        <div className={'cover'}>
                            {
                                event.cover_url ?
                                    <ImgLazy src={event.cover_url} alt="" width={624}/>
                                    : <EventDefaultCover event={event} width={324} height={324} showLocation={!isHideLocation(event.group_id) || isOperator || isGroupOwner || isHoster || isJoined || isManager || isTrackManager} />
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


                            {user.userName && canAccess  && !props.event?.external_url &&
                                <div className={'event-login-status'}>
                                    <div className={'user-info'}>
                                        <img src={user.avatar || defaultAvatar(user.id!)} alt=""/>
                                        <div>{user.nickname || user.userName}</div>
                                    </div>
                                    {!isJoined ?

                                        <div className={'des'}>Welcome! To join the event, please register below.</div>
                                        :
                                        <div className={'des'}>You have registered for the event. We’d love to have you
                                            join us.</div>
                                    }

                                    <div className={'event-action'}>
                                        {canceled &&
                                            <AppButton disabled>{lang['Activity_Detail_Btn_has_Cancel']}</AppButton>
                                        }

                                        {!canceled &&
                                            <AppButton
                                                onClick={e => {
                                                    addToCalenderDialog({
                                                        name: event!.title,
                                                        startTime: event!.start_time!,
                                                        endTime: event!.end_time!,
                                                        location: eventSite?.title || event!.location || '',
                                                        details: event!.content,
                                                        url: event!.meeting_url || window.location.href
                                                    })
                                                }}>
                                                <i className="icon-calendar" style={{marginRight: '8px'}}/>
                                                {lang['Activity_Detail_Btn_add_Calender']}</AppButton>
                                        }


                                        {!isJoined && !canceled && !tickets.length &&  event.status !== 'pending' &&
                                            <AppButton special onClick={e => {
                                                handleJoin()
                                            }}>{lang['Activity_Detail_Btn_Attend']}</AppButton>
                                        }

                                        {  event.status === 'pending' && (isManager || isGroupOwner || isTrackManager) &&
                                            <AppButton special onClick={handlePublish}>{lang['Publish']}</AppButton>
                                        }

                                        {!canceled && isJoined && !isHoster && !isManager && !isOperator && !isGroupOwner && !isTrackManager && !event.meeting_url &&
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
                                                    if (event!.meeting_url!.startsWith('http') || event!.meeting_url!.startsWith('https')) {
                                                        window.open(getUrl(event!.meeting_url!) || '#', '_blank')
                                                    }
                                                }}
                                                special>{lang['Activity_Detail_Btn_AttendOnline']}</AppButton>
                                        }
                                    </div>

                                    <div className={'event-action'}>
                                        {(isHoster || isManager || isOperator || isGroupOwner || isTrackManager) && !canceled && event.status !== 'pending' &&
                                            <AppButton
                                                onClick={e => {
                                                    handleHostCheckIn()
                                                }}>{
                                                event.badge_class_id
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
                                        <ImgLazy src={'https://ik.imagekit.io/soladata/ag4z4mmm_oJ33HdkUX'} width={100}
                                                 height={100}/>
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

                            {tickets.length > 0 && !!group && !!event &&
                                <TicketsPurchased eventGroup={group} event={event}/>
                            }

                            { !!event && tickets.length > 0 &&
                                <EventTickets tickets={tickets} event={event} canAccess={canAccess}/>
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
        const track = detail?.track_id ? await queryTrackDetail(detail.track_id) : null
        return {
            props: {
                event: detail || null,
                host: process.env.NEXT_PUBLIC_HOST,
                appName: process.env.NEXT_PUBLIC_APP_NAME,
                des: removeMarkdown(detail?.content || ''),
                track: track || null
            },
        }
    } else {
        return {
            props: {
                des: '',
                event: null,
                host: process.env.NEXT_PUBLIC_HOST,
                appName: process.env.NEXT_PUBLIC_APP_NAME
            }
        }
    }
})
