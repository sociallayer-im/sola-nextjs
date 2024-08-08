import styles from './CreateEvent.module.scss'
import PageBack from "@/components/base/PageBack";
import LangContext from "@/components/provider/LangProvider/LangContext";
import {useContext, useEffect, useRef, useState} from "react";
import AppInput from "@/components/base/AppInput";
import {
    Badge,
    cancelEvent,
    cancelRepeatEvent,
    createEvent,
    createRepeatEvent,
    CreateRepeatEventProps,
    Event,
    EventSites,
    getEventSide,
    getGroupMemberShips,
    getProfile,
    getProfileBatch,
    getRecurringEvents,
    Group,
    Profile,
    ProfileSimple,
    queryBadge,
    queryBadgeDetail,
    queryEvent,
    queryGroupDetail,
    RecurringEvent,
    RepeatEventSetBadge,
    RepeatEventUpdate,
    setEventBadge,
    Ticket,
    updateEvent,
    queryTickets,
} from "@/service/solas";
import EventDefaultCover from "@/components/base/EventDefaultCover";
import AppButton, {BTN_KIND} from "@/components/base/AppButton/AppButton";
import UploadImage from "@/components/compose/UploadImage/UploadImage";
import RichTextEditor from "@/components/compose/RichTextEditor/Editor";
import LocationInput from "@/components/compose/LocationInput/LocationInputNew";
import TimeSlotInput from "@/components/compose/TimeSlotInput/TimeSlotInput";
import userContext from "@/components/provider/UserProvider/UserContext";
import AppEventTimeInput from "@/components/base/AppEventTimeInput/AppEventTimeInput";
import AppFlexTextArea from "@/components/base/AppFlexTextArea/AppFlexTextArea";
import EventLabels from "@/components/base/EventLabels/EventLabels";
import SelectCreator from "@/components/compose/SelectCreator/SelectCreator";
import {Delete} from "baseui/icon";
import DialogIssuePrefill from "@/components/eventSpecial/DialogIssuePrefill/DialogIssuePrefill";
import {OpenDialogProps} from "@/components/provider/DialogProvider/DialogProvider";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
// import IssuesInput from "@/components/base/IssuesInput/IssuesInput";
import CohostInput, {emptyProfile} from "@/components/base/IssuesInput/CohostInput";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import Toggle from "@/components/base/Toggle/Toggle";

import * as dayjsLib from "dayjs";
import TriangleDown from 'baseui/icon/triangle-down'
import TriangleUp from 'baseui/icon/triangle-up'
import TicketSetting from "@/components/compose/TicketSetting/TicketSetting";

const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const isSameOrAfter = require('dayjs/plugin/isSameOrAfter')
const isBetween = require('dayjs/plugin/isBetween')
const dayjs: any = dayjsLib
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(isSameOrAfter)
dayjs.extend(isBetween)


const repeatEventEditOptions = [
    {label: 'Only this event', value: 'one'},
    {label: 'This and following events', value: 'after'},
    {label: 'All recurring events', value: 'all'},
]

export const SeatingStyle = ['theater', 'workshop', 'single table + chairs', 'Yoga mats']
export const AVNeeds = ['presentation screen', 'microphone', 'speakers']


const getNearestTime = (timeStr?: string) => {
    const now = timeStr ? new Date(timeStr) : new Date()
    const minutes = now.getMinutes()
    const minuteRange = [0, 30, 60]
    const nearestMinute = minuteRange.find((item) => {
        return item >= minutes
    })

    const initStartTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), nearestMinute || 0)
    const initEndTime = new Date(initStartTime.getTime() + 60 * 30 * 1000)
    return [initStartTime, initEndTime]
}

function EditEvent({
                       initEvent,
                       group,
                       initCreator
                   }: { initEvent?: Event, group?: Group, initCreator?: Profile | Group }) {
    if (!group && !initEvent) {
        throw new Error('group or event is required')
    }

    // context
    const initTime = getNearestTime()
    const {lang} = useContext(LangContext)
    const {user} = useContext(userContext)
    const {openDialog, showLoading, showToast, openConfirmDialog} = useContext(DialogsContext)
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // status
    const [formReady, setFormReady] = useState(false)
    const [isEditMode, setIsEditMode] = useState(!!initEvent)
    const [isManager, setIsManager] = useState(false)
    const [repeat, setRepeat] = useState<string | null>(null)
    const [badgeDetail, setBadgeDetail] = useState<Badge | null>(null)
    const [creating, setCreating] = useState(false)
    const [needPublish, setNeedPublish] = useState(true)
    const [enableOtherOpt, setEnableOtherOpt] = useState(false)
    const [requireApproval, setRequireApproval] = useState(false)

    // refs
    const uploadCoverRef = useRef<any>()
    const repeatEventSelectorRef = useRef<'one' | 'after' | 'all'>('one')

    // switch
    const [enableNotes, setEnableNotes] = useState(false)
    const [enableCoHost, setEnableCoHost] = useState(true)
    const [enableSpeakers, setEnableSpeakers] = useState(true)

    //errors
    const [occupiedError, setOccupiedError] = useState('')
    const [siteOccupied, setSiteOccupied] = useState(false)
    const [repeatCounterError, setRepeatCounterError] = useState(false)
    const [startTimeError, setStartTimeError] = useState('')
    const [labelError, setLabelError] = useState(false)
    const [dayDisable, setDayDisable] = useState('')
    const [capacityError, setCapacityError] = useState('')

    // data
    const [cohostList, setCohostList] = useState<ProfileSimple[]>([emptyProfile])
    const [speakerList, setSpeakerList] = useState<ProfileSimple[]>([emptyProfile])

    // ticket
    const [enableTicket, setEnableTicket] = useState(false)
    const [tickets, setTickets] = useState<Partial<Ticket>[]>([])
    const ticketSettingRef = useRef<{verify : () => boolean} | null>(null)
    const ticketsRef = useRef<Partial<Ticket>[]>([])

    const [venueInfo, setVenueInfo] = useState<null | EventSites>(null)
    const [cohost, setCohost] = useState<string[]>([''])
    const [repeatEventDetail, setRepeatEventDetail] = useState<null | RecurringEvent>(null)
    const [speakers, setSpeakers] = useState<string[]>([''])
    const [creator, setCreator] = useState<Group | Profile | undefined>(initCreator)
    const [eventGroup, setEventGroup] = useState<Group | undefined>(group)
    const [repeatCounter, setRepeatCounter] = useState(1)
    const [event, setEvent] = useState<Partial<Event>>(initEvent || {
        title: '',
        cover_url: '',
        content: '',
        notes: '',
        external_url: null,
        geo_lng: null,
        geo_lat: null,
        venue_id: null,
        location: null,
        formatted_address: null,
        start_time: initTime[0].toISOString(),
        end_time: initTime[1].toISOString(),
        timezone: group?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        meeting_url: '',
        tags: [],
        host_info: null,
        badge_class_id: searchParams?.get('set_badge') ? Number(searchParams?.get('set_badge')) : null,
        max_participant: null,
        event_type: 'event',
        group_id: group?.id,
        display: 'normal',
        requirement_tags: [],
        extra: null,
    })


    const init = async () => {
        if (!!group && user.id) {

            const memberships = await getGroupMemberShips({group_id: group.id, role: 'all'})
            const membership = memberships.find(item => item.profile.id === user.id)
            const isJoined = !!membership && (membership.role === 'member' || membership.role === 'manager' || membership.role === 'owner')
            const isManager = !!membership && membership.role === 'manager' || group.creator.id === user.id

            setIsManager(isManager)

            if (!!initEvent && user.userName && initEvent.operators?.includes(user!.id!)) {
                setNeedPublish(false)
            } else if (!eventGroup || (eventGroup as Group).can_publish_event === 'everyone') {
                setNeedPublish(false)
            } else if ((eventGroup as Group).can_publish_event === 'member' && !isJoined) {
                setNeedPublish(true)
            } else if ((eventGroup as Group).can_publish_event === 'manager' && !isManager) {
                setNeedPublish(true)
            } else {
                setNeedPublish(false)
            }

        } else {
            setIsManager(false)
            setNeedPublish(false)
        }



        if (initEvent) {
            // prefill

            setEnableNotes(!!initEvent.notes)

            queryTickets({event_id: initEvent.id}).then((res) => {
                if (res && res.length > 0) {
                    setTickets(res)
                    ticketsRef.current = res
                    setEnableTicket(true)
                } else {
                    setEnableTicket(false)
                }
            })


            if (initEvent.host_info) {
                const info = JSON.parse(initEvent.host_info)
                if (info.co_host.length > 0) {
                    // setEnableCoHost(true)
                    setCohost(info.co_host.map((p: ProfileSimple) => p.username))
                    setCohostList(info.co_host)
                } else {
                    // setEnableCoHost(false)
                    setCohost([''])
                }

                if (info.speaker.length > 0) {
                    // setEnableSpeakers(true)
                    setSpeakers(info.speaker.map((p: ProfileSimple) => p.username))
                    setSpeakerList(info.speaker)
                } else {
                    // setEnableSpeakers(false)
                    setSpeakers([''])
                }
            }

            if (initEvent.recurring_event_id) {
                const recurring_event = await getRecurringEvents(initEvent.recurring_event_id)
                if (recurring_event) {
                    setRepeatCounter(recurring_event.event_count)
                    setRepeat(recurring_event.interval)
                }
            }
        }
    }

    useEffect(() => {
        init()
    }, [user.id, group, initEvent])

    useEffect(() => {
        if (!venueInfo) {
            if (!event.start_time || !event.end_time) {
                setEvent({
                    ...event,
                    start_time: initEvent ? initEvent.start_time! : initTime[0].toISOString(),
                    end_time: initEvent ? initEvent.end_time! : initTime[1].toISOString()
                })
            }
            setRequireApproval(false)
        } else {
            setRequireApproval(!!venueInfo.require_approval)
        }
    }, [venueInfo])

    useEffect(() => {
        if (event.badge_class_id) {
            queryBadgeDetail({id: event.badge_class_id}).then(res => {
                setBadgeDetail(res)
            })
        }
    }, [event.badge_class_id])

    useEffect(() => {
        if (event.badge_class_id) {
            queryBadgeDetail({id: event.badge_class_id}).then(res => {
                setBadgeDetail(res)
            })
        }
    }, [event.badge_class_id])

    // check time
    useEffect(() => {
        if (event.start_time && event.end_time) {
            if (new Date(event.start_time) >= new Date(event.end_time)) {
                setStartTimeError(lang['Activity_Form_Ending_Time_Error'])
            } else {
                setStartTimeError('')
            }
        } else {
            setStartTimeError('Please select a time slot')
        }
    }, [event.start_time, event.end_time])

    // 检查event_site在设置的event.start_time和event.ending_time否可用
    useEffect(() => {
        async function checkOccupied() {
            const start = event.start_time
            const ending = event.end_time
            if (event.venue_id && start && ending) {
                const startDate = new Date(new Date(start).getFullYear(), new Date(start).getMonth(), new Date(start).getDate(), 0, 0, 0)
                const endDate = new Date(new Date(ending).getFullYear(), new Date(ending).getMonth(), new Date(ending).getDate(), 23, 59, 59)
                let events = await queryEvent({
                    venue_id: event.venue_id,
                    start_time_from: startDate.toISOString(),
                    start_time_to: endDate.toISOString(),
                    page: 1,
                    page_size: 50,
                    allow_private: true
                })

                // 排除自己
                events = events.filter((e) => e.id !== initEvent?.id)
                let inUseEvents: any = null
                const occupied = events.some((e) => {
                    const eventStartTime = new Date(e.start_time!).getTime()
                    const eventEndTime = new Date(e.end_time!).getTime()
                    const selectedStartTime = new Date(start).getTime()
                    const selectedEndTime = new Date(ending).getTime()
                    const eventIsAllDay = dayjs.tz(eventStartTime, event.timezone).hour() === 0 && (eventEndTime - eventStartTime + 60000) % 8640000 === 0
                    const selectedIsAllDay = dayjs.tz(selectedStartTime, event.timezone).hour() === 0 && (selectedEndTime - selectedStartTime + 60000) % 8640000 === 0
                    const res = ((selectedStartTime < eventStartTime && selectedEndTime > eventStartTime) ||
                            (selectedStartTime >= eventStartTime && selectedEndTime <= eventEndTime) ||
                            (selectedStartTime < eventEndTime && selectedEndTime > eventEndTime)) &&
                        (!eventIsAllDay && !selectedIsAllDay)

                    if (res) {
                        console.log('occupied', e, res)
                        inUseEvents = e
                    }

                    return res
                })

                setSiteOccupied(occupied)
                setOccupiedError(occupied ? `${lang['Activity_Detail_site_Occupied']}  In use event : <a href="/event/detail/${inUseEvents.id}" target="_blank">「${inUseEvents.title}」</a>` : '')
            } else {
                setSiteOccupied(false)
                setOccupiedError('')
            }
        }

        checkOccupied()
    }, [event.venue_id, event.start_time, event.end_time])

    // check tags
    useEffect(() => {
        if (event.tags?.length) {
            setLabelError(event.tags?.length > 3)
        } else {
            setLabelError(false)
        }
    }, [event.tags])

    // check repeat counter
    useEffect(() => {
        if (repeat) {
            setRepeatCounterError(repeatCounter < 1 || repeatCounter > 100)
        } else {
            setRepeatCounterError(false)
        }
    }, [repeatCounter, repeat])

    // prefill draft
    useEffect(() => {
        const draft = window.sessionStorage.getItem('event_draft')

        const preset_badge_id = searchParams?.get('set_badge')
        const preset_start_time = searchParams?.get('set_start_time')
        const preset_end_time = searchParams?.get('set_end_time')
        const preset_timezone = searchParams?.get('set_timezone')


        let _event: Partial<Event> | null = null

        if (preset_badge_id) {
            _event = !initEvent && draft
                ? {...JSON.parse(draft), badge_class_id: Number(preset_badge_id)}
                : {...event, badge_class_id: Number(preset_badge_id)}

        }

        if (preset_start_time && preset_end_time && preset_timezone) {
            _event = _event
                ? {..._event, start_time: preset_start_time, end_time: preset_start_time, timezone: preset_timezone}
                : {...event, start_time: preset_start_time, end_time: preset_end_time, timezone: preset_timezone}
        }

        if (_event) {
            setEvent(_event)
        }

        setFormReady(true)
    }, [searchParams])

    // save draft
    useEffect(() => {
        if (!initEvent) {
            window.sessionStorage.setItem('event_draft', JSON.stringify(event))
        }
    }, [event, initEvent])

    useEffect(() => {
        if (initEvent && initEvent.venue_id) {
            getEventSide(initEvent.group_id!, true).then((res) => {
                setVenueInfo(res.find((item) => item.id === initEvent.venue_id) || null)
            })
        }
    }, [initEvent])

    // check available day for curr venue
    useEffect(() => {
        if (!!venueInfo && !!venueInfo.venue_timeslots && event.start_time) {
            const day = dayjs.tz(new Date(event.start_time).getTime(), event.timezone).day()
            const dayFullName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
            const target = venueInfo.venue_timeslots.find(item => item.day_of_week === dayFullName[day])

            const startTime = dayjs.tz(new Date(event.start_time).getTime(), event.timezone)
            const endTime = dayjs.tz(new Date(event.end_time!).getTime(), event.timezone)
            const availableStart = venueInfo.start_date ? dayjs.tz(venueInfo.start_date, event.timezone) : null
            const availableEnd = venueInfo.end_date ? dayjs.tz(venueInfo.end_date, event.timezone).hour(23).minute(59) : null

            const overrideAvailable = venueInfo.venue_overrides!.filter((item) => {
                return !item.disabled
            })
            if (overrideAvailable.length) {
                const available = overrideAvailable.find((item) => {
                    return startTime.isBetween(dayjs.tz(`${item.day} ${item.start_at}`, event.timezone), dayjs.tz(`${item.day} ${item.end_at}`, event.timezone), null, '[]')
                        || endTime.isBetween(dayjs.tz(`${item.day} ${item.start_at}`, event.timezone), dayjs.tz(`${item.day} ${item.end_at}`, event.timezone), null, '[]')
                })

                if (!!available) {
                    setDayDisable('')
                    return
                }
            }

            let available = true
            if (availableStart && !availableEnd) {
                available = startTime.isSameOrAfter(availableStart)
            } else if (!availableStart && availableEnd) {
                available = endTime.isBefore(availableEnd)
            } else if (availableStart && availableEnd) {
                console.log('here', startTime.isSameOrAfter(availableStart), endTime.isBefore(availableEnd))
                available = startTime.isSameOrAfter(availableStart) && endTime.isBefore(availableEnd)
            }

            if (!!venueInfo.venue_overrides) {
                const overrides = venueInfo.venue_overrides
                const override = overrides.find((item) => {
                    const itemStartTime = item.start_at || '00:00'
                    const itemEndTime =  item.end_at || '23:59'

                    const itemStart = dayjs.tz(`${item.day} ${itemStartTime}`, event.timezone)
                    const itemEnd = dayjs.tz(`${item.day} ${itemEndTime}`, event.timezone)

                    return startTime.isBetween(itemStart, itemEnd, null, '[]') || endTime.isBetween(itemStart, itemEnd, null, '[]')
                })

                if (override) {
                    available = false
                }
            }

            if (target?.disabled || !available ) {
                setDayDisable('The date you selected is not available for the current venue')
            } else {
                setDayDisable('')
            }
        } else {
            setDayDisable('')
        }
    }, [event, venueInfo])

    // check max_participant
    useEffect(() => {
        if (venueInfo?.capacity && !event.max_participant) {
            setEnableOtherOpt(true)
            setEvent({
                ...event,
                max_participant: venueInfo.capacity
            })
        }

        if (venueInfo?.capacity && event.max_participant && event.max_participant > venueInfo.capacity) {
            setCapacityError(`The maximum number of participants cannot exceed the capacity of the venue: ${venueInfo.capacity}`)
        } else {
            setCapacityError('')
        }
    }, [event.max_participant, venueInfo])

    const showBadges = async () => {
        const props = !!(creator as Group)?.creator ? {
                group_id: creator!.id,
                page: 1
            } :
            {
                sender_id: creator!.id,
                page: 1
            }

        const unload = showLoading()
        const badges = (await queryBadge(props)).data
        unload()

        openDialog({
            content: (close: any) => <DialogIssuePrefill
                badges={badges}
                profileId={user.id!}
                returnUrl={pathname || ''}
                onSelect={(res) => {
                    if (res.badgeId) {
                        setEvent({
                            ...event,
                            badge_class_id: res.badgeId
                        })
                    }
                }}
                handleClose={close}/>,
            position: 'bottom',
            size: [360, 'auto']
        } as OpenDialogProps)
    }

    const showMaxParticipantOption = async () => {
        openDialog({
            content: (close: any) => {
                return <DialogShowMaxParticipant
                    close={close}
                    value={event.max_participant || null}
                    onChange={(value) => {
                        setEvent({
                            ...event,
                            max_participant: value
                        })
                    }}/>
            },
            size: [360, 'auto'],
            position: 'bottom'
        })
    }

    const checkForm = () => {
        if (!user.id) {
            showToast('Please login first')
            return false
        }


        if (siteOccupied) {
            showToast(lang['Activity_Detail_site_Occupied'])
            return false
        }

        if (dayDisable) {
            showToast('The date you selected is not available for the current venue')
            return false
        }

        if (!event.title) {
            showToast('please input title')
            return false
        }

        if (startTimeError) {
            showToast(startTimeError)
            return false
        }

        if (labelError) {
            showToast('The maximum number of tags is 3')
            return false
        }

        if (enableTicket && (!ticketSettingRef?.current?.verify())) {
            showToast('Invalid ticket setting')
            return false
        }

        if (repeatCounterError && repeat) {
            showToast('The number of times the event repeats must be greater than 0 and less than 100')
            return false
        }

        if (capacityError) {
            showToast(capacityError)
            return false
        }

        if (!!tickets && tickets.length > 0 && (event.recurring_event_id || repeat)) {
            showToast('Recurring events do not support ticket features')
            return false
        }

        return true
    }

    const parseHostInfo = async () => {
        const usernames = [...cohost, ...speakers].filter((u) => !!u)
        if (!usernames.length) {
            if (!!(creator as Group).creator) {
                const hostinfo = {
                    speaker: [],
                    co_host: [],
                    group_host: {
                        id: creator!.id,
                        creator: true,
                        username: creator!.username,
                        nickname: creator!.nickname,
                        image_url: creator!.image_url,
                    }
                }
                return {
                    json: JSON.stringify(hostinfo),
                    cohostId: null,
                    speakerId: null
                }
            } else {
                return {
                    json: null,
                    cohostId: null,
                    speakerId: null
                }
            }
        }

        let profiles = await getProfileBatch(usernames)
        if (profiles.length !== usernames.length) {
            const missing = usernames.filter((u) => !profiles.find((p) => p.username === u))
            if (missing.length) {
                // throw new Error(`User 「${missing}」 not exist`)
                missing.forEach((m, i) => {
                    profiles.push({
                        id: 0,
                        username: m,
                        nickname: null,
                        image_url: '/images/default_avatar/avatar_0.png',
                        sol_address: null
                    } as any)
                })
            }
        }

        const cohostUser = profiles.filter((p) => cohost.some((u) => u === p.username))
        const speakerUsers = profiles.filter((p) => speakers.some((u) => u === p.username))

        const hostinfo = {
            speaker: enableSpeakers ? speakerUsers : [],
            co_host: enableCoHost ? cohostUser : [],
            group_host: creator && !!(creator as Group).creator ? {
                id: creator.id,
                creator: true,
                username: creator.username,
                nickname: creator.nickname,
                image_url: creator.image_url,
            } : undefined,
        }

        return {
            json: JSON.stringify(hostinfo),
            cohostId: enableCoHost ? cohostUser.filter(p => !!p.id).map((p) => p.id) : null,
            speakerId: enableSpeakers ? speakerUsers.filter(p => !!p.id).map((p) => p.id) : null
        }
    }

    const getHostInfo = async () => {
        const hosts = cohostList.filter(p => !!p.username)
        const speakers = speakerList.filter(p => !!p.username)

        if (!hosts.length && !speakers.length) {
            if (!!(creator as Group).creator) {
                const hostinfo = {
                    speaker: [],
                    co_host: [],
                    group_host: {
                        id: creator!.id,
                        creator: true,
                        username: creator!.username,
                        nickname: creator!.nickname,
                        image_url: creator!.image_url,
                    }
                }
                return {
                    json: JSON.stringify(hostinfo),
                    cohostId: null,
                    speakerId: null,
                    extra: null
                }
            } else {
                return {
                    json: null,
                    cohostId: null,
                    speakerId: null,
                    extra: null
                }
            }
        } else {
            const hostinfo = {
                speaker: enableSpeakers ? speakers : [],
                co_host: enableCoHost ? hosts : [],
                group_host: creator && !!(creator as Group).creator ? {
                    id: creator.id,
                    creator: true,
                    username: creator.username,
                    nickname: creator.nickname,
                    image_url: creator.image_url,
                } : undefined,
            }

            const extra = hosts.filter(p => p.id === 0 && !!p.email).map((p) => p.email!)
            const hasInvalid = extra.find(e => !e.includes('@') || !e.includes('.'))

            if (hasInvalid) {
                throw new Error('Invalid email address for inviting co-host')
            }

            return {
                json: JSON.stringify(hostinfo),
                cohostId: enableCoHost ? hosts.filter((p) => p.id).map((p) => p.id) : null,
                speakerId: enableSpeakers ? speakers.map((p) => p.id) : null,
                extra: extra.length ? extra : null
            }
        }
    }

    const handleSave = async () => {
        const check = checkForm()
        if (!check) return

        setCreating(true)
        const unloading = showLoading(true)
        let host_info: string | null = ''
        let cohostIds: number[] | null = null
        let extra: string[] | null = null

        try {
            const info = await getHostInfo()
            host_info = info.json
            cohostIds = info.cohostId
            extra = info.extra
        } catch (e: any) {
            showToast(e.message)
            setCreating(false)
            unloading()
            return
        }

        unloading()


        let _tickets: null | Partial<Ticket>[] = null
        if (ticketsRef.current && ticketsRef.current.length && !enableTicket) {
            _tickets = ticketsRef.current.map(ticket => {
                return {
                    ...ticket,
                    _destroy: '1',
                    payment_methods: ticket.payment_methods ? ticket.payment_methods.map(p => {
                        return {
                            ...p,
                            _destroy: '1'
                        }
                    }) : []
                }
            })
        } else if (ticketsRef.current && ticketsRef.current.length && enableTicket && tickets.length) {
            _tickets = tickets
            ticketsRef.current.forEach((ticket, index) => {
                if (!_tickets!.find((t) => { return  t.id === ticket.id})) {
                    _tickets!.push({
                        ...ticket,
                        _destroy: '1'
                    } as any)
                }
            })
        } else if (enableTicket && tickets.length) {
            _tickets = tickets
        }

        const saveProps = {
            ...event,
            id: initEvent!.id,
            event_id: initEvent!.id,
            operators: cohostIds,
            host_info: host_info,
            max_participant: event.max_participant,
            notes: enableNotes ? event.notes : null,
            repeat_start_time: event.start_time as any,
            interval: repeat || undefined,
            event_count: repeatCounter,
            extra,
            tickets: _tickets,

            auth_token: user.authToken || '',
        } as CreateRepeatEventProps

        if (initEvent?.recurring_event_id) {
            const dialog = openConfirmDialog({
                confirmLabel: 'Save',
                cancelLabel: 'Cancel',
                title: `Edit repeat event 「${initEvent!.title}」`,
                content: function Dialog() {
                    const [repeatEventSelector, setRepeatEventSelector] = useState<'one' | 'after' | 'all'>('one')
                    return <div className={'repeat-event-edit-option'}>
                        {
                            repeatEventEditOptions.map(item => {
                                const isSelected = repeatEventSelector === item.value
                                return <div className={'option'} onClick={() => {
                                    setRepeatEventSelector(item.value as any)
                                    repeatEventSelectorRef.current = item.value as any
                                }} key={item.value}>
                                    {
                                        isSelected ?
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                                 viewBox="0 0 20 20" fill="none">
                                                <g clipPath="url(#clip0_2149_24559)">
                                                    <path fillRule="evenodd" clipRule="evenodd"
                                                          d="M10 0.833252C4.93743 0.833252 0.833374 4.93731 0.833374 9.99992C0.833374 15.0625 4.93743 19.1666 10 19.1666C15.0626 19.1666 19.1667 15.0625 19.1667 9.99992C19.1667 4.93731 15.0626 0.833252 10 0.833252ZM10 6.56242C8.10156 6.56242 6.56254 8.10144 6.56254 9.99992C6.56254 11.8984 8.10156 13.4374 10 13.4374C11.8985 13.4374 13.4375 11.8984 13.4375 9.99992C13.4375 8.10144 11.8985 6.56242 10 6.56242Z"
                                                          fill="#6CD7B2"/>
                                                </g>
                                                <defs>
                                                    <clipPath id="clip0_2149_24559">
                                                        <rect width="20" height="20" fill="white"/>
                                                    </clipPath>
                                                </defs>
                                            </svg> :
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                                 viewBox="0 0 20 20" fill="none">
                                                <g clipPath="url(#clip0_2150_24722)">
                                                    <path
                                                        d="M1.58331 9.99992C1.58331 5.35152 5.35158 1.58325 9.99998 1.58325C14.6484 1.58325 18.4166 5.35152 18.4166 9.99992C18.4166 14.6483 14.6484 18.4166 9.99998 18.4166C5.35158 18.4166 1.58331 14.6483 1.58331 9.99992Z"
                                                        fill="white" stroke="#CECED3" strokeWidth="1.5"/>
                                                </g>
                                                <defs>
                                                    <clipPath id="clip0_2150_24722">
                                                        <rect width="20" height="20" fill="white"/>
                                                    </clipPath>
                                                </defs>
                                            </svg>
                                    }
                                    <div className={'label'}>{item.label}</div>
                                </div>
                            })
                        }
                    </div>
                },
                onConfirm: async (close: any) => {
                    await repeatSave().finally(close())
                }
            })
        } else {
            if (!!repeat) {
                // from single event switch to repeat event, cancel the old one, create a new one
                try {
                    await cancel(false)
                    await handleCreate()
                } catch (e: any) {
                    console.error(e)
                    showToast(e.message)
                }
            } else {
                await singleSave()
            }
        }

        async function singleSave(redirect = true) {
            const unloading = showLoading(true)
            try {
                const newEvent = await updateEvent(saveProps)
                if (saveProps.badge_class_id) {
                    const setBadge = await setEventBadge({
                        id: saveProps.id!,
                        badge_class_id: saveProps.badge_class_id,
                        auth_token: user.authToken || ''
                    })
                }
                unloading()
                if (redirect) {
                    showToast('update success')
                    router.replace(`/event/detail/${newEvent.id}`)
                }
            } catch (e: any) {
                unloading()
                console.error(e)
                showToast(e.message)
            }
        }

        async function repeatSave() {
            if (repeatEventSelectorRef.current === 'one') {
                await singleSave()
                return
            } else {
                if (repeatEventSelectorRef.current !== 'all') {
                    await singleSave(false)
                }
                const unloading = showLoading(true)
                try {
                    const newEvents = await RepeatEventUpdate({
                        ...saveProps,
                        selector: repeatEventSelectorRef.current,
                        start_time_diff: saveProps.start_time !== initEvent!.start_time ?
                            Math.floor((new Date(saveProps.start_time!).getTime() - new Date(initEvent!.start_time!).getTime()) / 1000) : 0,
                        end_time_diff: saveProps.end_time !== initEvent!.end_time ?
                            Math.floor((new Date(saveProps.end_time!).getTime() - new Date(initEvent!.end_time!).getTime()) / 1000) : 0
                    } as any)

                    if (saveProps.badge_class_id) {
                        const setBadge = await RepeatEventSetBadge({
                            auth_token: user.authToken || '',
                            badge_class_id: saveProps.badge_class_id,
                            recurring_event_id: saveProps.recurring_event_id!,
                            selector: repeatEventSelectorRef.current
                        })
                    }

                    unloading()
                    showToast('update success')
                    router.replace(`/event/detail/${initEvent!.id}`)
                } catch (e: any) {
                    unloading()
                    console.error(e)
                    showToast(e.message)
                }
            }
        }
    }

    const handleCreate = async () => {
        const check = checkForm()
        if (!check) return

        setCreating(true)
        const unloading = showLoading(true)

        let host_info: string | null = ''
        let cohostIds: number[] | null = null
        let extra: string[] | null = null
        try {
            const info = await getHostInfo()
            host_info = info.json
            cohostIds = info.cohostId
            extra = info.extra
        } catch (e: any) {
            showToast(e.message)
            setCreating(false)
            unloading()
            return
        }


        const props = {
            ...event,
            operators: cohostIds,
            host_info: host_info,
            max_participant: event.max_participant,
            notes: enableNotes ? event.notes : null,
            repeat_start_time: event.start_time as any,
            interval: repeat || undefined,
            event_count: repeatCounter,
            extra,
            tickets: enableTicket && tickets.length ? tickets : null,

            auth_token: user.authToken || '',
        } as CreateRepeatEventProps

        try {
            if (props.interval) {
                const newEvent = await createRepeatEvent(props)
                if (props.badge_class_id) {
                    const setBadge = await RepeatEventSetBadge({
                        recurring_event_id: newEvent.recurring_event_id!,
                        badge_class_id: props.badge_class_id,
                        auth_token: user.authToken || ''
                    })
                }

                unloading()
                showToast('create success')
                window.sessionStorage.removeItem('event_draft')
                router.push(`/event/success/${newEvent.id}`)
                setCreating(false)
            } else {
                const newEvent = await createEvent(props)

                if (props.badge_class_id) {
                    const setBadge = await setEventBadge({
                        id: newEvent.id,
                        badge_class_id: props.badge_class_id,
                        auth_token: user.authToken || ''
                    })
                }
                unloading()
                showToast('create success')
                window.sessionStorage.removeItem('event_draft')
                if (newEvent.status === 'pending') {
                    router.push(`/event/detail/${newEvent.id}`)
                } else {
                    router.push(`/event/success/${newEvent.id}`)

                }
                setCreating(false)
            }
        } catch (e: any) {
            unloading()
            console.error(e)
            showToast(e.message)
            setCreating(false)
        }
    }

    const cancel = async (redirect = true) => {
        if (!initEvent?.recurring_event_id) {
            await cancelOne(redirect)
        } else {
            const dialog = openConfirmDialog({
                confirmLabel: 'Cancel event',
                cancelLabel: 'Not now',
                title: `Cancel repeat event 「${initEvent!.title}」`,
                content: function Dialog() {
                    const [repeatEventSelector, setRepeatEventSelector] = useState<'one' | 'after' | 'all'>('one')
                    return <div className={'repeat-event-edit-option'}>
                        {
                            repeatEventEditOptions.map(item => {
                                const isSelected = repeatEventSelector === item.value
                                return <div className={'option'} onClick={() => {
                                    setRepeatEventSelector(item.value as any)
                                    repeatEventSelectorRef.current = item.value as any
                                }} key={item.value}>
                                    {
                                        isSelected ?
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                                 viewBox="0 0 20 20" fill="none">
                                                <g clipPath="url(#clip0_2149_24559)">
                                                    <path fillRule="evenodd" clipRule="evenodd"
                                                          d="M10 0.833252C4.93743 0.833252 0.833374 4.93731 0.833374 9.99992C0.833374 15.0625 4.93743 19.1666 10 19.1666C15.0626 19.1666 19.1667 15.0625 19.1667 9.99992C19.1667 4.93731 15.0626 0.833252 10 0.833252ZM10 6.56242C8.10156 6.56242 6.56254 8.10144 6.56254 9.99992C6.56254 11.8984 8.10156 13.4374 10 13.4374C11.8985 13.4374 13.4375 11.8984 13.4375 9.99992C13.4375 8.10144 11.8985 6.56242 10 6.56242Z"
                                                          fill="#6CD7B2"/>
                                                </g>
                                                <defs>
                                                    <clipPath id="clip0_2149_24559">
                                                        <rect width="20" height="20" fill="white"/>
                                                    </clipPath>
                                                </defs>
                                            </svg> :
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                                 viewBox="0 0 20 20" fill="none">
                                                <g clipPath="url(#clip0_2150_24722)">
                                                    <path
                                                        d="M1.58331 9.99992C1.58331 5.35152 5.35158 1.58325 9.99998 1.58325C14.6484 1.58325 18.4166 5.35152 18.4166 9.99992C18.4166 14.6483 14.6484 18.4166 9.99998 18.4166C5.35158 18.4166 1.58331 14.6483 1.58331 9.99992Z"
                                                        fill="white" stroke="#CECED3" strokeWidth="1.5"/>
                                                </g>
                                                <defs>
                                                    <clipPath id="clip0_2150_24722">
                                                        <rect width="20" height="20" fill="white"/>
                                                    </clipPath>
                                                </defs>
                                            </svg>
                                    }
                                    <div className={'label'}>{item.label}</div>
                                </div>
                            })
                        }
                    </div>
                },
                onConfirm: async (close: any) => {
                    await cancelRepeat().finally(close())
                }
            })
        }

        async function cancelOne(redirect = true) {
            const unloading = showLoading()
            try {
                const cancel = await cancelEvent({id: initEvent!.id, auth_token: user.authToken || ''})
                unloading()
                if (redirect) {
                    showToast('Cancel success')
                    router.push(`/event/${eventGroup?.username}`)
                }
            } catch (e) {
                unloading()
                console.error(e)
                showToast('Cancel failed')
            }
        }

        async function cancelRepeat() {
            if (repeatEventSelectorRef.current === 'one') {
                await cancelOne()
                return
            } else {
                await cancelOne(false)
                const unloading = showLoading()
                try {
                    const cancel = await cancelRepeatEvent({
                        auth_token: user.authToken || '',
                        recurring_event_id: initEvent!.recurring_event_id!,
                        event_id: initEvent!.id,
                        selector: repeatEventSelectorRef.current,
                    })
                    unloading()
                    showToast('Cancel success')
                    router.push(`/event/${eventGroup?.username}`)
                } catch (e) {
                    unloading()
                    console.error(e)
                    showToast('Cancel failed')
                }
            }
        }
    }

    const handleCancel = () => {
        openConfirmDialog({
            title: 'Are you sure to cancel this event?',
            confirmBtnColor: '#F64F4F',
            confirmLabel: 'Yes',
            confirmTextColor: '#fff',
            cancelLabel: 'No',
            onConfirm: (close: any) => {
                close()
                cancel()
            }
        })
    }

    const showCreateConfirm = async () => {
        const check = checkForm()
        if (!check) return

        openConfirmDialog({
            title: 'The Event you posted needs to be reviewed by a manager. Would you like to send it?',
            onConfirm: async (close: any) => {
                close()
                handleCreate()
            }
        })
    }

    return (
        <>
            <div className={styles['create-event-page']}>
                <div className={styles['create-page-wrapper']}>
                    <PageBack title={lang['Activity_Create_title']}/>
                    <div className={styles['flex']}>
                        <div className={styles['create-form']}>

                            <div className={styles['input-area']}>
                                <div className={styles['input-area-title']}>{lang['Activity_Form_Name']}</div>
                                <AppInput
                                    clearable
                                    maxLength={100}
                                    value={event.title || ''}
                                    errorMsg={''}
                                    placeholder={lang['Activity_Form_Name']}
                                    onChange={(e) => {
                                        setEvent({...event, title: e.target.value})
                                    }}/>
                            </div>

                            {formReady &&
                                <div className={styles['input-area']}>
                                    <div className={styles['input-area-title']}>{lang['Activity_Form_Details']}</div>
                                    <RichTextEditor
                                        height={150}
                                        maxHeight={300}
                                        initText={event.content || ''}
                                        onChange={text => {
                                            const newEvent = () => {
                                                return {...event, content: text}
                                            }

                                            setEvent(newEvent())
                                        }}/>

                                    <div className={styles['input-area']}>
                                        <div className={styles['dropdown']} onClick={e => {
                                            setEnableNotes(!enableNotes)
                                        }}>
                                            <div className={styles['item-title main']}>{lang['Event_Notes_']}</div>
                                            <div className={styles['item-value']}>
                                                {enableNotes ?
                                                    <TriangleUp size={18}/> :
                                                    <TriangleDown size={18}/>
                                                }
                                            </div>
                                        </div>
                                        {enableNotes &&
                                            <RichTextEditor
                                                height={150}
                                                maxHeight={300}
                                                initText={event.notes || ''} onChange={text => {
                                                setEvent({...event, notes: text})
                                            }}></RichTextEditor>
                                        }
                                    </div>
                                </div>
                            }

                            {false &&
                                <div className={styles['input-area']}>
                                    <div className={styles['input-area-title']}>{lang['External_Url']}</div>
                                    <AppInput clearable={false}
                                              value={event.external_url || ''}
                                              placeholder={lang['External_Url']}
                                              onChange={(e) => {
                                                  setEvent({...event, external_url: e.target.value})
                                              }}/>
                                </div>
                            }

                            {!!eventGroup &&
                                <div className={styles['input-area']}>
                                    <LocationInput
                                        role = {isManager ? 'manager' : undefined}
                                        event={event as any}
                                        initValue={event as any}
                                        eventGroup={eventGroup as Group}
                                        onChange={values => {
                                            console.log('location values', values)
                                            setVenueInfo(values.venue || null)
                                            setEvent({
                                                ...event,
                                                ...values
                                            } as any)
                                        }}/>

                                    {!!venueInfo &&
                                        <div className={styles['venue-detail']}>
                                            {
                                                venueInfo.require_approval &&
                                                <div className={'approval-tag'}>Require Approval</div>
                                            }
                                            <div>
                                                {venueInfo.about}
                                                {
                                                    !!venueInfo.link &&
                                                    <a href={venueInfo.link} target="_blank" rel="noreferrer"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                                                             viewBox="0 0 12 12" fill="none">
                                                            <path
                                                                d="M11.2941 6.93176C11.1069 6.93176 10.9274 7.00613 10.795 7.13851C10.6626 7.27089 10.5882 7.45044 10.5882 7.63765V9.88235C10.5882 10.0696 10.5139 10.2491 10.3815 10.3815C10.2491 10.5139 10.0696 10.5882 9.88235 10.5882H2.11765C1.93044 10.5882 1.75089 10.5139 1.61851 10.3815C1.48613 10.2491 1.41176 10.0696 1.41176 9.88235V2.11765C1.41176 1.93044 1.48613 1.75089 1.61851 1.61851C1.75089 1.48613 1.93044 1.41176 2.11765 1.41176H4.36235C4.54956 1.41176 4.72911 1.3374 4.86149 1.20502C4.99387 1.07264 5.06824 0.893094 5.06824 0.705882C5.06824 0.518671 4.99387 0.339127 4.86149 0.206748C4.72911 0.0743697 4.54956 0 4.36235 0H2.11765C1.55601 0 1.01738 0.223109 0.620244 0.620245C0.223108 1.01738 0 1.55601 0 2.11765V9.88235C0 10.444 0.223108 10.9826 0.620244 11.3798C1.01738 11.7769 1.55601 12 2.11765 12H9.88235C10.444 12 10.9826 11.7769 11.3798 11.3798C11.7769 10.9826 12 10.444 12 9.88235V7.63765C12 7.45044 11.9256 7.27089 11.7933 7.13851C11.6609 7.00613 11.4813 6.93176 11.2941 6.93176ZM11.9435 0.437647C11.8719 0.265165 11.7348 0.1281 11.5624 0.0564705C11.4775 0.0203004 11.3864 0.00111529 11.2941 0H7.05882C6.87161 0 6.69207 0.0743695 6.55969 0.206748C6.42731 0.339127 6.35294 0.518671 6.35294 0.705882C6.35294 0.893094 6.42731 1.07264 6.55969 1.20502C6.69207 1.3374 6.87161 1.41176 7.05882 1.41176H9.59294L4.44 6.55765C4.37384 6.62327 4.32133 6.70134 4.28549 6.78736C4.24965 6.87338 4.2312 6.96564 4.2312 7.05882C4.2312 7.15201 4.24965 7.24427 4.28549 7.33029C4.32133 7.41631 4.37384 7.49438 4.44 7.56C4.50562 7.62616 4.58369 7.67867 4.66971 7.71451C4.75573 7.75035 4.84799 7.7688 4.94118 7.7688C5.03436 7.7688 5.12662 7.75035 5.21264 7.71451C5.29866 7.67867 5.37673 7.62616 5.44235 7.56L10.5882 2.40706V4.94118C10.5882 5.12839 10.6626 5.30793 10.795 5.44031C10.9274 5.57269 11.1069 5.64706 11.2941 5.64706C11.4813 5.64706 11.6609 5.57269 11.7933 5.44031C11.9256 5.30793 12 5.12839 12 4.94118V0.705882C11.9989 0.61364 11.9797 0.52251 11.9435 0.437647Z"
                                                                fill="#7492EF"/>
                                                        </svg>
                                                    </a>
                                                }
                                            </div>
                                            {
                                                !!venueInfo.capacity &&
                                                <div>{venueInfo.capacity} seats</div>
                                            }
                                        </div>
                                    }
                                </div>
                            }

                            {!!occupiedError && <div className={styles['start-time-error']} dangerouslySetInnerHTML={{__html: occupiedError}}></div>}
                            {!!dayDisable && <div className={styles['start-time-error']}>{dayDisable}</div>}

                            {event.venue_id && (eventGroup?.id === 3427 || eventGroup?.id === 3409) &&
                                <>
                                    <div className={styles['input-area']}>
                                        <div className={styles['input-area-title']}>{'Seating arrangement style'}</div>
                                        <EventLabels
                                            colorDisabled={true}
                                            data={SeatingStyle} onChange={e => {
                                            setEvent({
                                                ...event,
                                                requirement_tags: Array.from(new Set([...(event.requirement_tags || [])
                                                    .filter(t => AVNeeds.includes(t)), ...e]))
                                            })
                                        }} value={event.requirement_tags || []}/>
                                    </div>
                                    <div className={styles['input-area']}>
                                        <div className={styles['input-area-title']}>{'AV needed'}</div>
                                        <EventLabels
                                            colorDisabled={true}
                                            data={AVNeeds} onChange={e => {
                                            setEvent({
                                                ...event,
                                                requirement_tags: Array.from(new Set([...(event.requirement_tags || [])
                                                    .filter(t => SeatingStyle.includes(t)), ...e]))
                                            })
                                        }} value={event.requirement_tags || []}/>
                                    </div>
                                </>
                            }

                            {!!venueInfo && !!venueInfo.venue_timeslots && !!venueInfo.venue_timeslots.length && formReady &&
                                <div className={styles['input-area']}>
                                    <div className={styles['input-area-title']}>{lang['Activity_Form_Starttime']}</div>
                                    <TimeSlotInput
                                        initData={{
                                            from: event.start_time!,
                                            to: event.end_time!,
                                            timezone: event.timezone!
                                        }}
                                        eventSite={venueInfo!}
                                        repeatCount={repeatCounter}
                                        repeat={repeat}
                                        showRepeat={isManager}
                                        repeatDisabled={!!initEvent?.recurring_event_id}
                                        recurringEventId={initEvent?.recurring_event_id}
                                        disabled={false}
                                        onChange={e => {
                                            console.log('slot value', e)
                                            setRepeatCounter(e.counter)
                                            setRepeat(e.repeat as any || null)
                                            setEvent({
                                                ...event,
                                                start_time: e.from,
                                                end_time: e.to,
                                                timezone: e.timezone
                                            })
                                        }}
                                    />
                                </div>
                            }

                            {formReady && (!venueInfo || !venueInfo.venue_timeslots || !venueInfo.venue_timeslots.length) &&
                                <div className={styles['input-area']}>
                                    <div className={styles['input-area-title']}>{lang['Activity_Form_Starttime']}</div>
                                    <AppEventTimeInput
                                        initData={{
                                            from: event.start_time!,
                                            to: event.end_time!,
                                            timezone: event.timezone!
                                        }}
                                        repeatCount={repeatCounter}
                                        repeat={repeat}
                                        showRepeat={isManager}
                                        repeatDisabled={!!initEvent?.recurring_event_id}
                                        recurringEventId={initEvent?.recurring_event_id}
                                        disabled={false}
                                        onChange={e => {
                                            console.log('eee', e)
                                            setRepeatCounter(e.counter)
                                            setRepeat(e.repeat as any || null)
                                            setEvent({
                                                ...event,
                                                start_time: e.from,
                                                end_time: e.to,
                                                timezone: e.timezone
                                            })
                                        }}/>
                                </div>
                            }

                            {repeatCounterError &&
                                <div className={styles['start-time-error']}>
                                    {'The number of times the event repeats must be greater than 0 and less than 100'}
                                </div>
                            }

                            {startTimeError && <div className={styles['start-time-error']}>
                                {startTimeError}
                            </div>
                            }

                            <div className={styles['input-area']}>
                                <div className={styles['input-area-title']}>{lang['Activity_Form_online_address']}</div>
                                <AppFlexTextArea
                                    icon={<i className={'icon-link'}/>}
                                    value={event.meeting_url || ''}
                                    maxHeight={80}
                                    onChange={(value) => {
                                        setEvent({
                                            ...event,
                                            meeting_url: value
                                        })
                                    }}
                                    placeholder={'Url...'}/>
                            </div>

                            <div className={styles['input-area']} data-test-id="host">
                                <div className={styles['input-area-title']}>{lang['Activity_originators']}</div>
                                <SelectCreator
                                    autoSet={!creator}
                                    value={creator || null}
                                    onChange={(res) => {
                                        console.log('switch creator', res)
                                        setCreator(res)
                                    }}/>
                            </div>


                            {eventGroup?.event_tags &&
                                <div className={styles['input-area']}>
                                    <div className={styles['input-area-title']}>{lang['Activity_Form_Label']}</div>
                                    <EventLabels
                                        data={eventGroup.event_tags} onChange={e => {
                                        setEvent({
                                            ...event,
                                            tags: e
                                        })
                                    }} value={event.tags!}/>

                                    {labelError &&
                                        <div className={styles['label-error']}>{'The maximum number of tags is 3'}</div>
                                    }
                                </div>
                            }

                            <div className={styles['input-area']}>
                                <div className={styles['toggle']}>
                                    <div className={styles['item-title']}>{'Invite a Co-host'}</div>
                                </div>

                                {/*{enableCoHost &&*/}
                                {/*    <IssuesInput*/}
                                {/*        value={cohost as any}*/}
                                {/*        placeholder={`Co-host`}*/}
                                {/*        onChange={(newIssues) => {*/}
                                {/*            setCohost(newIssues)*/}
                                {/*        }}/>*/}
                                {/*}*/}

                                { enableCoHost &&
                                    <CohostInput
                                        placeholder={'Enter your cohost’s name, domain, or wallet address'}
                                        allowInviteEmail={true}
                                        value={cohostList}
                                        onChange={(cohost) => {
                                            console.log('cohost list', cohost)
                                            setCohostList(cohost)
                                        }}
                                    />

                                }
                            </div>

                            <div className={styles['input-area']}>
                                <div className={styles['toggle']}>
                                    <div
                                        className={styles['item-title']}>{'Invite a speaker to the event'}</div>
                                </div>

                                {/*{enableSpeakers &&*/}
                                {/*    <IssuesInput*/}
                                {/*        value={speakers as any}*/}
                                {/*        placeholder={`Speaker`}*/}
                                {/*        onChange={(newIssues) => {*/}
                                {/*            setSpeakers(newIssues)*/}
                                {/*        }}/>*/}
                                {/*}*/}

                                {
                                    enableSpeakers &&
                                    <CohostInput
                                        placeholder={'Enter your speaker’s name, domain, or wallet address'}
                                        value={speakerList}
                                        onChange={(speakers) => {
                                            console.log('speaker list', speakers)
                                            setSpeakerList(speakers)
                                        }}
                                    />
                                }
                            </div>

                            <div className={styles['input-area']} data-testid={'input-event-participants'}>
                                <div className={styles['toggle']}>
                                    <div
                                        className={styles['item-title']}>{lang['Activity_Form_participants']}</div>
                                    <div className={styles['item-value']}>
                                        <div className={styles['unlimited']}>
                                            {
                                                event.max_participant === null ?
                                                    'no limited' :
                                                    event.max_participant
                                            }
                                        </div>

                                        <svg className={styles['edit-icon']} onClick={showMaxParticipantOption}
                                             xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                             viewBox="0 0 16 16" fill="none">
                                            <path
                                                d="M3.3335 12.0001H6.16016C6.2479 12.0006 6.33488 11.9838 6.4161 11.9506C6.49733 11.9175 6.5712 11.8686 6.6335 11.8068L11.2468 7.18679L13.1402 5.33346C13.2026 5.27148 13.2522 5.19775 13.2861 5.11651C13.3199 5.03527 13.3374 4.94813 13.3374 4.86012C13.3374 4.77211 13.3199 4.68498 13.2861 4.60374C13.2522 4.5225 13.2026 4.44876 13.1402 4.38679L10.3135 1.52679C10.2515 1.4643 10.1778 1.41471 10.0965 1.38086C10.0153 1.34702 9.92817 1.32959 9.84016 1.32959C9.75216 1.32959 9.66502 1.34702 9.58378 1.38086C9.50254 1.41471 9.42881 1.4643 9.36683 1.52679L7.48683 3.41346L2.86016 8.03346C2.79838 8.09575 2.74949 8.16963 2.71632 8.25085C2.68314 8.33208 2.66632 8.41905 2.66683 8.50679V11.3335C2.66683 11.5103 2.73707 11.6798 2.86209 11.8049C2.98712 11.9299 3.15669 12.0001 3.3335 12.0001ZM9.84016 2.94012L11.7268 4.82679L10.7802 5.77346L8.8935 3.88679L9.84016 2.94012ZM4.00016 8.78012L7.9535 4.82679L9.84016 6.71346L5.88683 10.6668H4.00016V8.78012ZM14.0002 13.3335H2.00016C1.82335 13.3335 1.65378 13.4037 1.52876 13.5287C1.40373 13.6537 1.3335 13.8233 1.3335 14.0001C1.3335 14.1769 1.40373 14.3465 1.52876 14.4715C1.65378 14.5966 1.82335 14.6668 2.00016 14.6668H14.0002C14.177 14.6668 14.3465 14.5966 14.4716 14.4715C14.5966 14.3465 14.6668 14.1769 14.6668 14.0001C14.6668 13.8233 14.5966 13.6537 14.4716 13.5287C14.3465 13.4037 14.177 13.3335 14.0002 13.3335Z"
                                                fill="#CBCDCB"/>
                                        </svg>
                                    </div>
                                </div>
                                <div className={styles['start-time-error']}>{capacityError}</div>
                            </div>

                            <div className={styles['input-area']} data-testid={'input-event-participants'}>
                                <div className={styles['toggle']}>
                                    <div
                                        className={styles['item-title']}>{lang['Ticket_Type_Setting']}</div>

                                    <div className={styles['item-value']}>
                                        <Toggle
                                            onChange={(e: any) => {
                                                setEnableTicket(!enableTicket)
                                            }}
                                            checked={enableTicket}/>
                                    </div>
                                </div>
                            </div>

                            {
                                enableTicket && creator &&
                                <TicketSetting
                                    ref={ticketSettingRef}
                                    creator={creator}
                                    value={tickets}
                                    onChange={
                                        (tickets) => {
                                            console.log('setTicket', tickets)
                                            setTickets(tickets)
                                            if (!tickets.length) {
                                                setEnableTicket(false)
                                            }
                                        }
                                    }/>
                            }

                            <div className={styles['input-area']}>
                                <div className={styles['dropdown']} onClick={e => {
                                    setEnableOtherOpt(!enableOtherOpt)
                                }}>
                                    <div className={styles['item-title']}>{lang['More_Settings']}</div>
                                    <div className={styles['item-value']}>
                                        {enableOtherOpt ?
                                            <TriangleUp size={18}/> :
                                            <TriangleDown size={18}/>
                                        }
                                    </div>
                                </div>
                            </div>

                            {
                                enableOtherOpt &&
                                <>
                                    <div className={styles['input-area']}>
                                        <div className={styles['input-area-title']}>{lang['Activity_Form_Badge']}</div>
                                        <div className={styles['input-area-des']}>{lang['Activity_Form_Badge_Des']}</div>
                                        {!event.badge_class_id &&
                                            <div className={styles['add-badge']} onClick={async () => {
                                                await showBadges()
                                            }}>{lang['Activity_Form_Badge_Select']}</div>
                                        }

                                        {
                                            !!badgeDetail &&
                                            <div className={styles['banded-badge']}>
                                                <Delete size={22} onClick={e => {
                                                    setEvent({
                                                        ...event,
                                                        badge_class_id: null
                                                    })
                                                    setBadgeDetail(null)
                                                }
                                                }/>
                                                <img src={badgeDetail.image_url} alt=""/>
                                                <div>{badgeDetail.title}</div>
                                            </div>
                                        }
                                    </div>

                                    <div className={styles['input-area']} data-testid={'input-event-participants'}>
                                        <div className={styles['toggle']}>
                                            <div
                                                className={styles['item-title']}>{lang['Activity_Form_participants']}</div>
                                            <div className={styles['item-value']}>
                                                <div className={styles['unlimited']}>
                                                    {
                                                        event.max_participant === null ?
                                                            'no limited' :
                                                            event.max_participant
                                                    }
                                                </div>

                                                <svg className={styles['edit-icon']} onClick={showMaxParticipantOption}
                                                     xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                                     viewBox="0 0 16 16" fill="none">
                                                    <path
                                                        d="M3.3335 12.0001H6.16016C6.2479 12.0006 6.33488 11.9838 6.4161 11.9506C6.49733 11.9175 6.5712 11.8686 6.6335 11.8068L11.2468 7.18679L13.1402 5.33346C13.2026 5.27148 13.2522 5.19775 13.2861 5.11651C13.3199 5.03527 13.3374 4.94813 13.3374 4.86012C13.3374 4.77211 13.3199 4.68498 13.2861 4.60374C13.2522 4.5225 13.2026 4.44876 13.1402 4.38679L10.3135 1.52679C10.2515 1.4643 10.1778 1.41471 10.0965 1.38086C10.0153 1.34702 9.92817 1.32959 9.84016 1.32959C9.75216 1.32959 9.66502 1.34702 9.58378 1.38086C9.50254 1.41471 9.42881 1.4643 9.36683 1.52679L7.48683 3.41346L2.86016 8.03346C2.79838 8.09575 2.74949 8.16963 2.71632 8.25085C2.68314 8.33208 2.66632 8.41905 2.66683 8.50679V11.3335C2.66683 11.5103 2.73707 11.6798 2.86209 11.8049C2.98712 11.9299 3.15669 12.0001 3.3335 12.0001ZM9.84016 2.94012L11.7268 4.82679L10.7802 5.77346L8.8935 3.88679L9.84016 2.94012ZM4.00016 8.78012L7.9535 4.82679L9.84016 6.71346L5.88683 10.6668H4.00016V8.78012ZM14.0002 13.3335H2.00016C1.82335 13.3335 1.65378 13.4037 1.52876 13.5287C1.40373 13.6537 1.3335 13.8233 1.3335 14.0001C1.3335 14.1769 1.40373 14.3465 1.52876 14.4715C1.65378 14.5966 1.82335 14.6668 2.00016 14.6668H14.0002C14.177 14.6668 14.3465 14.5966 14.4716 14.4715C14.5966 14.3465 14.6668 14.1769 14.6668 14.0001C14.6668 13.8233 14.5966 13.6537 14.4716 13.5287C14.3465 13.4037 14.177 13.3335 14.0002 13.3335Z"
                                                        fill="#CBCDCB"/>
                                                </svg>
                                            </div>
                                        </div>
                                        <div className={styles['start-time-error']}>{capacityError}</div>
                                    </div>

                                    <div className={styles['input-area']} data-testid={'input-event-participants'}>
                                        <div className={styles['toggle']}>
                                            <div
                                                className={styles['item-title']}>{'Private event'}</div>

                                            <div className={styles['item-value']}>
                                                <Toggle
                                                    onChange={(e: any) => {
                                                        setEvent({
                                                            ...event,
                                                            display: e.target.checked ? 'private' : 'normal'
                                                        })
                                                    }
                                                    }
                                                    checked={event.display !== 'normal'}/>
                                            </div>
                                        </div>
                                        <div className={styles['input-area-des']}>Select a private event, the event you
                                            created can only be viewed through the link, and users can view the event
                                            in <a href={'/my-event'} target={'_blank'}>My Event</a> page.
                                        </div>
                                    </div>
                                </>
                            }
                            {
                                requireApproval && <div className={styles['require-approval']}>{`You will apply to use venue "${venueInfo?.title}"`}</div>
                            }
                            <div className={styles['btns']}>

                                {
                                    isEditMode && <div>
                                        <AppButton
                                            style={{
                                                color: '#F64F4F',
                                                ':hover': {
                                                    opacity: '0.8'
                                                }
                                            }}
                                            onClick={e => {
                                                handleCancel()
                                            }}>{lang['Activity_Detail_Btn_Cancel']}</AppButton>
                                    </div>
                                }

                                {isEditMode ?
                                    <AppButton kind={BTN_KIND.primary}
                                               special
                                               style={{
                                                   ':hover': {
                                                       opacity: '0.8'
                                                   }
                                               }}
                                               onClick={() => {
                                                   handleSave()
                                               }}>
                                        {lang['Profile_Edit_Save']}
                                    </AppButton>
                                    :
                                    <AppButton kind={BTN_KIND.primary}
                                               disabled={creating}
                                               special
                                               onClick={() => {
                                                   (needPublish || requireApproval)
                                                       ? showCreateConfirm()
                                                       : handleCreate()
                                               }}>
                                        {lang['Activity_Btn_Create']}
                                    </AppButton>
                                }
                            </div>

                        </div>

                        <div className={styles['event-cover']}>
                            {!!event.cover_url &&
                                <div className={styles['cover-preview']}>
                                    <img src={event.cover_url} alt=""/>
                                    <i className={'icon-close ' + styles['delete-cover']}
                                       onClick={e => {
                                           setEvent({
                                               ...event,
                                               cover_url: ''
                                           })
                                       }}
                                    />
                                </div>
                            }
                            <div style={{display: !event.cover_url ? "block" : 'none'}}>
                                <EventDefaultCover
                                    event={event as Event}
                                    width={328}
                                    height={328}/>
                            </div>
                            <div style={{display: 'none'}}>
                                <UploadImage
                                    ref={uploadCoverRef}
                                    cropper={false}
                                    imageSelect={event.cover_url || undefined}
                                    confirm={(coverUrl) => {
                                        setEvent({...event, cover_url: coverUrl})
                                    }}/>
                            </div>

                            <AppButton style={{width: "328px", marginTop: '12px'}} onClick={() => {
                                uploadCoverRef.current?.selectFile()
                            }}>{"Upload"}</AppButton>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}

export default EditEvent;

export const getServerSideProps: any = async (context: any) => {
    const groupname = context.params?.groupname
    const eventid = context.params?.eventid

    if (groupname) {
        const group = await queryGroupDetail(undefined, groupname)
        return {props: {group}}
    } else if (eventid) {
        const events = await queryEvent({
            id: Number(eventid),
            page: 1,
            show_pending_event: true,
            show_cancel_event: true,
            allow_private: true
        })
        if (!events[0]) {
            return {props: {}}
        } else {
            const [group, creator] = await Promise.all(
                [
                    queryGroupDetail(events[0].group_id!),
                    getProfile({id: events[0].owner_id})
                ]
            )

            if (!!events[0].host_info) {
                const info = JSON.parse(events[0].host_info!)
                if (info.group_host) {
                    return {props: {group: group, initEvent: events[0], initCreator: info.group_host}}
                } else {
                    return {props: {group: group, initEvent: events[0], initCreator: creator}}
                }
            } else {
                return {props: {group: group, initEvent: events[0], initCreator: creator}}
            }
        }
    } else {
        return {props: {}}
    }
}

function DialogShowMaxParticipant(props: { value: null | number, onChange: (value: number | null) => any, close: any }) {
    const [count, setCount] = useState(props.value || 30)

    return <div className={styles['dialog-max-participant']}>
        <i className={`icon-close ${styles['close-btn']}`} onClick={(e) => {
            props.close()
        }}/>
        <div className={styles['title']}>Participants Limit</div>
        <div className={styles['select-label']}>Maximum</div>
        <input
            className={styles['max-participant-input']}
            type={'number'}
            value={Number(count) + ''}
            onChange={
                e => {
                    let value = e.target.value as any
                    if (isNaN(Number(value))) return
                    if (!value) {
                        value = 0
                    } else if (Number(value) < 0) {
                        value = 1
                    } else if (value.includes('.')) {
                        value = value.split('.')[0]
                    }

                    setCount(Number(value))
                }
            }/>

        <div className={styles['btns']}>
            <AppButton size={'compact'} onClick={() => {
                props.onChange && props.onChange(null)
                props.close()
            }}>Cancel limit</AppButton>
            <AppButton special size={'compact'} onClick={(e) => {
                props.onChange && props.onChange(count || null);
                props.close()
            }
            }>Done</AppButton>
        </div>
    </div>
}
