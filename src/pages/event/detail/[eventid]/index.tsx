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
    queryGroupDetail,
    queryProfileByEmail,
    queryTicketItems,
    queryTickets,
    queryTrackDetail,
    queryUserGroup,
    RecurringEvent,
    setEventStatus,
    Ticket,
    TicketItem,
    Track,
    unJoinEvent
} from "@/service/solas";
import LangContext from "@/components/provider/LangProvider/LangContext";
import {useTime2, useTime3} from "@/hooks/formatTime";
import EventLabels from "@/components/base/EventLabels/EventLabels";
import usePicture from "@/hooks/pictrue";
import AppButton from "@/components/base/AppButton/AppButton";
import userContext from "@/components/provider/UserProvider/UserContext";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
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
import {FreeMode, Mousewheel} from "swiper";
import EventTickets from "@/components/compose/EventTickets/EventTickets";
import EventNotes from "@/components/base/EventNotes/EventNotes";
import RichTextDisplayerNew from "@/components/compose/RichTextEditor/DisplayerNew";
import removeMarkdown from "markdown-to-text"
import {StatefulPopover} from "baseui/popover";
import {AVNeeds, SeatingStyle} from "@/pages/event/[groupname]/create";
import DialogGenPromoCode from "@/components/base/Dialog/DialogGenPromoCode/DialogGenPromoCode";
import TicketsPurchased from "@/components/base/TicketsPurchased/TicketsPurchased";
import EventComment from "@/components/compose/EventComment/EventComment";


import * as dayjsLib from "dayjs";
import Empty from "@/components/base/Empty";
import useEvent, {EVENT} from "@/hooks/globalEvent";
import useZuAuth from "@/service/zupass/useZuAuth";
import {isHideLocation} from "@/global_config";
import {cancelEventStar, getUserStaredComment, handleEventStar} from "@/service/solasv2";
import DialogFeedback from "@/components/base/Dialog/DialogFeedback";
import genGoogleMapLink from "@/utils/googleMapLink";
import {useZupassTicket} from "@/hooks/useZupassTicket";

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
    const [stared, setStared] = useState(false)

    const {claimPOD} = useZupassTicket()

    async function fetchData() {
        if (params?.eventid) {
            let res: Event | null = null
            try {
                res = await queryEventDetail({id: Number(params?.eventid)})
                console.log('res', res)
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
            }).finally(() => {
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

            if (res.event_roles && res.event_roles.length) {
                const ids: number[] = res.event_roles
                    .filter((item) => item.role !== 'group_host' && !!item.item_id)
                    .map((item) => item.item_id!)

                const profiles = await getProfileBatchById(ids)

                const speakerRole = res.event_roles.filter((item) => item.role === 'speaker')


                setSpeaker(speakerRole.map((s) => {
                    const info = profiles.find((p) => (s.item_id === p.id && !!p.username))
                    return info || {
                        id: 0,
                        nickname: s.nickname,
                        username: s.nickname,
                        image_url: s.image_url,
                        email: s.email,
                        domain: '',
                        handle: s.nickname,
                        address: ''
                    }
                }))

                const cohostRole = res.event_roles.filter((item) => item.role === 'co_host')
                setCohost(cohostRole.map((s) => {
                    const info = profiles.find((p) => (s.item_id === p.id && !!p.username))
                    return info || {
                        id: 0,
                        nickname: s.nickname,
                        username: s.nickname,
                        image_url: s.image_url,
                        email: s.email,
                        domain: '',
                        handle: s.nickname,
                        address: ''
                    }
                }))

                const groupHostRole = res.event_roles.find((item) => item.role === 'group_host')
                if (!!groupHostRole) {
                    const group = await queryGroupDetail(groupHostRole.item_id!)
                    setHoster(group as any || res.owner as Profile)
                } else {
                    setHoster(res.owner as Profile)
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

            !!user.id && getUserStaredComment({
                profile_id: user.id
            }).then(comments => {
                setStared(comments.some(item => item.item_id === res?.id))
            })
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
    }, [params, needUpdate, user.id])


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

    const handleUnJoin = async () => {
        const a = await openConfirmDialog({
            title: lang['Activity_Unjoin_Confirm_title'],
            confirmBtnColor: '#F64F4F',
            confirmTextColor: '#fff',
            confirmText: lang['Group_Member_Manage_Dialog_Confirm_Dialog_Confirm'],
            cancelText: lang['Group_Member_Manage_Dialog_Confirm_Dialog_Cancel'],
            onConfirm: async (close: any) => {
                const unload = showLoading()
                try {
                    const join = await unJoinEvent({id: event!.id, auth_token: user.authToken || ''})
                    unload()
                    showToast('Canceled')
                    setParticipants(participants.filter(item => item.profile.id !== user.id))
                    setIsJoined(false)
                    close()
                } catch (e: any) {
                    console.error(e)
                    unload()
                    showToast(e.message)
                }
            }
        })
    }

    const tagWithTrack = useMemo(() => {
        let tag = event?.tags || []
        if (props.track && props.track.title) {
            tag = [...tag, props.track.title]
        }
        return tag
    }, [event?.tags, props.track])

    const handleStar = async (e: any) => {
        if (!user.authToken) {
            openConnectWalletDialog()
            return
        }

        e.preventDefault()
        e.stopPropagation()
        const unload = showLoading()
        await handleEventStar({event_id: event!.id, auth_token: user.authToken || ''})
        setStared(true)
        unload()
    }

    const handleCancelStar = async (e: any) => {
        if (!user.authToken) {
            openConnectWalletDialog()
            return
        }

        e.preventDefault()
        e.stopPropagation()
        const unload = showLoading()
        await cancelEventStar({event_id: event!.id, auth_token: user.authToken || ''})
        setStared(false)
        unload()
    }

    const showFeedBackDialog = async () => {
        openDialog({
            content: (close: any) => <DialogFeedback event_id={event!.id} close={close}/>,
            size: [420, 'auto'],
            position: 'bottom'
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
                            {!stared ?
                                <AppButton size={'compact'} onClick={handleStar}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 16 16"
                                         fill="none">
                                        <path
                                            d="M14.6665 6.44579C14.6244 6.32385 14.5478 6.21674 14.446 6.13745C14.3443 6.05817 14.2217 6.01012 14.0932 5.99912L10.2998 5.44579L8.59982 1.99912C8.54523 1.88641 8.46 1.79135 8.35388 1.72484C8.24777 1.65832 8.12506 1.62305 7.99982 1.62305C7.87458 1.62305 7.75188 1.65832 7.64576 1.72484C7.53965 1.79135 7.45441 1.88641 7.39982 1.99912L5.69982 5.43912L1.90649 5.99912C1.7831 6.01666 1.6671 6.06843 1.57166 6.14856C1.47621 6.22869 1.40513 6.33397 1.36649 6.45245C1.33112 6.56824 1.32794 6.69147 1.35731 6.80892C1.38667 6.92637 1.44746 7.0336 1.53316 7.11912L4.28649 9.78579L3.61982 13.5725C3.59291 13.6981 3.60286 13.8288 3.64848 13.9489C3.6941 14.069 3.77345 14.1733 3.87698 14.2494C3.9805 14.3254 4.1038 14.37 4.23204 14.3776C4.36028 14.3853 4.48799 14.3557 4.59982 14.2925L7.99982 12.5125L11.3998 14.2925C11.4934 14.3452 11.5991 14.3728 11.7065 14.3725C11.8477 14.373 11.9854 14.3286 12.0998 14.2458C12.2033 14.1717 12.2833 14.0696 12.3306 13.9514C12.3778 13.8333 12.3903 13.7041 12.3665 13.5791L11.6998 9.79245L14.4532 7.12579C14.5494 7.04424 14.6206 6.93706 14.6583 6.81669C14.6961 6.69632 14.6989 6.5677 14.6665 6.44579ZM10.5665 9.11245C10.4893 9.18739 10.4314 9.27989 10.3978 9.38204C10.3641 9.4842 10.3557 9.59299 10.3732 9.69912L10.8532 12.4991L8.34649 11.1658C8.24907 11.1176 8.14184 11.0925 8.03316 11.0925C7.92447 11.0925 7.81724 11.1176 7.71982 11.1658L5.21316 12.4991L5.69316 9.69912C5.71065 9.59299 5.7022 9.4842 5.66854 9.38204C5.63487 9.27989 5.57698 9.18739 5.49982 9.11245L3.49982 7.11245L6.30649 6.70579C6.41449 6.69076 6.51715 6.64948 6.60549 6.58556C6.69382 6.52163 6.76513 6.43701 6.81316 6.33912L7.99982 3.79912L9.25316 6.34579C9.30118 6.44368 9.37249 6.5283 9.46082 6.59222C9.54916 6.65615 9.65182 6.69743 9.75982 6.71245L12.5665 7.11912L10.5665 9.11245Z"
                                            fill="black"/>
                                    </svg>
                                    <span>{'Star'}</span>
                                </AppButton> :
                                <AppButton size={'compact'} onClick={handleCancelStar}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14"
                                         fill="none">
                                        <path
                                            d="M13.4463 5.13745C13.5481 5.21674 13.6246 5.32385 13.6667 5.44579C13.6992 5.5677 13.6963 5.69632 13.6586 5.81669C13.6208 5.93706 13.5497 6.04424 13.4534 6.12579C13.3571 6.20733 10.7001 8.79245 10.7001 8.79245C10.7001 8.79245 11.3429 12.4541 11.3667 12.5791C11.3905 12.7041 11.3781 12.8333 11.3308 12.9514C11.2836 13.0696 11.2035 13.1717 11.1001 13.2458C10.9857 13.3286 10.848 13.373 10.7067 13.3725C10.5993 13.3728 10.4936 13.3452 10.4001 13.2925L7.00007 11.5125L3.60007 13.2925C3.48824 13.3557 3.36052 13.3853 3.23229 13.3776C3.10405 13.37 2.98075 13.3254 2.87722 13.2494C2.77369 13.1733 2.69434 13.069 2.64872 12.9489C2.6031 12.8288 2.59315 12.6981 2.62007 12.5725L3.28673 8.78579L0.5334 6.11912C0.447705 6.0336 0.386914 5.92637 0.357552 5.80892C0.328189 5.69147 0.331363 5.56824 0.366733 5.45245C0.405373 5.33397 0.476451 5.22869 0.5719 5.14856C0.667349 5.06843 0.783348 5.01666 0.906733 4.99912C0.906733 4.99912 3.48921 5.32013 4.70007 4.43912C5.91177 3.55749 6.40007 0.99912 6.40007 0.99912C6.45466 0.886406 6.53989 0.791348 6.64601 0.724836C6.75212 0.658324 6.87483 0.623047 7.00007 0.623047C7.1253 0.623047 7.24801 0.658324 7.35413 0.724836C7.46024 0.791348 7.54548 0.886406 7.60007 0.99912L9.30007 4.44579L13.0934 4.99912C13.2219 5.01012 13.3445 5.05817 13.4463 5.13745Z"
                                            fill="#F1CB45"/>
                                    </svg>
                                    <span>{'Star'}</span>
                                </AppButton>
                            }
                            {(isHoster || isManager || isOperator || isGroupOwner || isTrackManager) && !canceled &&
                                <>
                                    {!!tickets.length &&
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
                                    : <EventDefaultCover event={event} width={324} height={324}
                                                         showLocation={!isHideLocation(event.group_id) || isOperator || isGroupOwner || isHoster || isJoined || isManager || isTrackManager}/>
                            }
                        </div>

                        <div className={'detail'}>
                            <div className={'center'}>
                                <div className={'name'}>
                                    {event.status === 'pending' && <span className={'pending'}>Pending</span>}
                                    {event.status === 'closed' && <span className={'cancel'}>Closed</span>}
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
                                        <EventLabels data={tagWithTrack} value={tagWithTrack} disabled/>
                                    </div>
                                }

                                {event.theme &&
                                    <a className={'theme'}
                                       href={`/theme/${encodeURIComponent(event.theme)}?group_id=${event.group_id}`}>#{event.theme}</a>
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
                                                    return <SwiperSlide className={'slide'}
                                                                        key={item.username! + index}>
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
                                                            <a href={genGoogleMapLink(event.geo_lat!, event.geo_lng!, event.location_data)}
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
                                                    {!!event.formatted_address &&
                                                        <div className={'switch-preview-map'}
                                                             onClick={() => {
                                                                 setShowMap(!showMap)
                                                             }
                                                             }
                                                        >{showMap ? 'Hide Map' : 'Show Map'}</div>
                                                    }
                                                    <div className={'switch-preview-map'}
                                                         onClick={() => {
                                                             copy(event.formatted_address || event?.location)
                                                             showToast('Copied')
                                                         }}
                                                    >Copy Address
                                                    </div>
                                                </div>
                                                {showMap && !!event.formatted_address &&
                                                    <Link href={genGoogleMapLink(event.geo_lat!, event.geo_lng!, event.location_data)}
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

                                                <AppButton
                                                    onClick={e => {
                                                        showFeedBackDialog()
                                                    }}>{'Feedback'}</AppButton>
                                            </div>

                                            <div className={'center'}>
                                                {!isJoined && !canceled && !tickets.length && event?.status !== 'closed' &&
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

                                                {isJoined &&
                                                    <AppButton

                                                        onClick={e => {
                                                            handleUnJoin()
                                                        }}>{lang['Profile_Edit_Cancel']}</AppButton>
                                                }

                                            </div>
                                        </div>

                                        {isJoined && event.group_id === 1516 &&
                                            <div className={'event-action'}>
                                                <AppButton
                                                    onClick={e => {
                                                        claimPOD(event.id)
                                                    }}
                                                    special>Claim Zupass POD</AppButton>
                                            </div>
                                        }

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
                                    <div className={'center'} style={{flexWrap: 'wrap'}}>
                                        <div className={tab === 1 ? 'tab-title active' : 'tab-title'}
                                             onClick={e => {
                                                 setTab(1)
                                             }}>
                                            <div>{lang['Activity_Des']}</div>
                                        </div>
                                        {tickets.length > 0 &&
                                            <>
                                                <div className={'split mobile-item'}/>
                                                <div
                                                    className={tab === 4 ? 'tab-title mobile-item active' : 'mobile-item tab-title'}
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

                                        <div className={'split'}/>
                                        <div className={tab === 5 ? 'tab-title active' : 'tab-title'}
                                             onClick={e => {
                                                 setTab(5)
                                             }}>
                                            <div>{'Comments'}</div>
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
                                                {!!event.requirement_tags && !!event.group_id && [3427, 3409, 3463, 3454].includes(event.group_id) && (isOperator || isManager || isHoster || isGroupOwner || isTrackManager) &&
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
                                                <div>

                                                </div>
                                                <RichTextDisplayerNew markdownStr={event.content}/>

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

                                    {
                                        tab === 5 && !!event &&
                                        <EventComment event={event}/>
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
                                    : <EventDefaultCover event={event} width={324} height={324}
                                                         showLocation={!isHideLocation(event.group_id) || isOperator || isGroupOwner || isHoster || isJoined || isManager || isTrackManager}/>
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


                            {user.userName && canAccess && !props.event?.external_url &&
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

                                        <AppButton
                                            onClick={e => {
                                                showFeedBackDialog()
                                            }}>{'Feedback'}</AppButton>
                                    </div>

                                    <div className={'event-action'}>
                                        {!isJoined && !canceled && !tickets.length &&  event.status !== 'pending' && event?.status !== 'closed' &&
                                            <AppButton special onClick={e => {
                                                handleJoin()
                                            }}>{lang['Activity_Detail_Btn_Attend']}</AppButton>
                                        }

                                        {event.status === 'pending' && (isManager || isGroupOwner || isTrackManager) &&
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


                                    {isJoined &&
                                        <div className={'event-action'}>
                                            <AppButton
                                                onClick={e => {
                                                    handleUnJoin()
                                                }}>{lang['Profile_Edit_Cancel']}</AppButton>
                                        </div>
                                    }

                                    {!canAccess &&
                                        <div className={'event-action'}>
                                            <div className={'can-not-access'}> Event only open to members of the group
                                            </div>
                                        </div>
                                    }

                                    {isJoined && event.group_id === 1516 &&
                                        <div className={'event-action'}>
                                            <AppButton
                                                onClick={e => {
                                                    claimPOD(event.id)
                                                }}
                                                special>Claim Zupass POD</AppButton>
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

                            {!!event && tickets.length > 0 &&
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
