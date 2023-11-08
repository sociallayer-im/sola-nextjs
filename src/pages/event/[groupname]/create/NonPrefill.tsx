import {useRouter} from 'next/navigation'
import {useContext, useEffect, useRef, useState} from 'react'
import PageBack from '@/components/base/PageBack'
import LangContext from '@/components/provider/LangProvider/LangContext'
import UploadImage from '@/components/compose/UploadImage/UploadImage'
import AppInput from '@/components/base/AppInput'
import UserContext from '@/components/provider/UserProvider/UserContext'
import AppButton, {BTN_KIND} from '@/components/base/AppButton/AppButton'
import {
    Badge,
    cancelEvent,
    cancelRepeatEvent,
    createEvent,
    CreateEventProps,
    createRepeatEvent,
    CreateRepeatEventProps,
    Event,
    EventSites,
    getHotTags,
    getProfile,
    Group,
    inviteGuest,
    Profile,
    queryBadge,
    queryBadgeDetail,
    queryEvent,
    queryEventDetail,
    RepeatEventInvite,
    RepeatEventSetBadge,
    RepeatEventUpdate,
    setEventBadge,
    updateEvent
} from '@/service/solas'
import DialogsContext from '@/components/provider/DialogProvider/DialogsContext'
import ReasonInput from '@/components/base/ReasonInput/ReasonInput'
import SelectCreator from '@/components/compose/SelectCreator/SelectCreator'
import AppDateInput from "@/components/base/AppDateInput/AppDateInput";
import {Delete} from "baseui/icon";
import Toggle from "@/components/base/Toggle/Toggle";
import IssuesInput from "@/components/base/IssuesInput/IssuesInput";
import EventLabels from "@/components/base/EventLabels/EventLabels";
import DialogIssuePrefill from "@/components/eventSpecial/DialogIssuePrefill/DialogIssuePrefill";
import {OpenDialogProps} from "@/components/provider/DialogProvider/DialogProvider";
import UploadWecatQrcode from "@/components/compose/UploadWecatQrcode/UploadWecatQrcode";
import EventHomeContext from "@/components/provider/EventHomeProvider/EventHomeContext";
import LocationInput from "@/components/compose/LocationInput/LocationInput";
import AppFlexTextArea from "@/components/base/AppFlexTextArea/AppFlexTextArea";
import AppEventTimeInput from "@/components/base/AppEventTimeInput/AppEventTimeInput";

interface Draft {
    cover: string,
    title: string,
    content: string,
    location_type: 'online' | 'offline' | 'both',
    online_location: string,
    max_participants: number,
    min_participants: number,
    enable_min_participants: boolean,
    enable_max_participants: boolean,
    enable_guest: boolean,
    guests: string[],
    tags: string[],
    badge_id: number | null,
    creator: Group | Profile | null,
    start_time: string,
    end_time: string,
    event_type: 'event' | 'checklog',
    wechat_contact_group: string,
    wechat_contact_person: string,
    telegram_contact_group: string,
}

interface CreateEventPageProps {
    eventId?: number
}

// 函数，一天24小时分成若干时间时间点，步进为15分钟, 然后找出和当前时间最近的时间点,而且时间点必须大于等于当前时间
const getNearestTime = () => {
    const now = new Date()
    const minutes = now.getMinutes()
    const minuteRange = [0, 15, 30, 45, 60]
    const nearestMinute = minuteRange.find((item) => {
        return item >= minutes
    })

    const initStartTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), nearestMinute || 0)
    const initEndTime = new Date(initStartTime.getTime() + 60 * 60 * 1000)
    return [initStartTime, initEndTime]
}

const initTime = getNearestTime()

const repeatEventEditOptions = [
    {label: 'Only this event', value: 'one'},
    {label: 'This and following events', value: 'after'},
    {label: 'All events', value: 'all'},
]

function CreateEvent(props: CreateEventPageProps) {
    const router = useRouter()
    const {user} = useContext(UserContext)
    const {showLoading, showToast, openDialog, openConfirmDialog} = useContext(DialogsContext)
    const [creator, setCreator] = useState<Group | Profile | null>(null)
    const {lang, langType} = useContext(LangContext)
    const {eventGroup, joined} = useContext(EventHomeContext)

    const [currEvent, setCurrEvent] = useState<Event | null>(null)

    const [cover, setCover] = useState('')
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [locationType, setLocationType] = useState<'online' | 'offline' | 'both'>('offline')
    const [onlineUrl, setOnlineUrl] = useState('')
    const [eventSite, setEventSite] = useState<EventSites | null>(null)
    const [maxParticipants, setMaxParticipants] = useState<number>(10) // default 10
    const [minParticipants, setMinParticipants] = useState<number>(3) // default 3
    const [guests, setGuests] = useState<string[]>([''])
    const [label, setLabel] = useState<string[]>([])
    const [badgeId, setBadgeId] = useState<null | number>(null)
    const [wechatImage, setWechatImage] = useState('')
    const [wechatAccount, setWechatAccount] = useState('')
    const [customLocation, setCustomLocation] = useState('')
    const [locationDetail, setLocationDetail] = useState('')
    const [telegram, setTelegram] = useState('')
    const [telegramError, setTelegramError] = useState('')
    const [timezone, setTimezone] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone)

    const [start, setStart] = useState(initTime[0].toISOString())
    const [ending, setEnding] = useState(initTime[1].toISOString())
    const [eventType, setEventType] = useState<'event' | 'checklog'>('event')


    const [enableMaxParticipants, setEnableMaxParticipants] = useState(false)
    const [enableMinParticipants, setEnableMinParticipants] = useState(false)
    const [enableGuest, setEnableGuest] = useState(false)
    const [hasDuration, setHasDuration] = useState(true)
    const [badgeDetail, setBadgeDetail] = useState<Badge | null>(null)
    const [labels, setLabels] = useState<string[]>([])
    const [startTimeError, setStartTimeError] = useState('')
    const [isEditMode, setIsEditMode] = useState(!!props?.eventId)
    const [siteOccupied, setSiteOccupied] = useState(false)
    const [formReady, setFormReady] = useState(false)
    const [creating, setCreating] = useState(false)
    const [repeat, setRepeat] = useState<'day' | 'week' | 'month' | null>(null)
    const [repeatEnd, setRepeatEnd] = useState<string | null>(null)
    const repeatEventSelectorRef = useRef<'one' | 'after' | 'all'>('one')

    const toNumber = (value: string, set: any) => {
        if (!value) {
            set(0)
            return
        }

        const number = parseInt(value)
        if (!isNaN(number)) {
            set(number)
        }
    }

    const cancel = async () => {
        if (!currEvent?.repeat_event_id) {
            await cancelOne()
        } else {
            const dialog = openConfirmDialog({
                confirmLabel: 'Cancel event',
                cancelLabel: 'Not now',
                title: `Cancel repeat event 「${currEvent!.title}」`,
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
                const cancel = await cancelEvent({id: props.eventId!, auth_token: user.authToken || ''})
                unloading()
                if (redirect) {
                    showToast('Cancel success')
                    router.push(`/event`)
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
                        repeat_event_id: currEvent?.repeat_event_id!,
                        event_id: props.eventId!,
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

    async function SaveDraft() {
        if (!isEditMode && formReady) {
            const draft: Draft = {
                cover,
                title,
                content,
                location_type: 'both',
                online_location: onlineUrl,
                max_participants: maxParticipants,
                min_participants: minParticipants,
                tags: label,
                badge_id: badgeId,
                creator: creator,
                guests: guests,
                enable_min_participants: enableMinParticipants,
                enable_max_participants: enableMaxParticipants,
                enable_guest: enableGuest,
                start_time: start,
                end_time: ending,
                event_type: eventType,
                wechat_contact_group: wechatImage,
                wechat_contact_person: wechatAccount,
                telegram_contact_group: telegram,
            }
            window.localStorage.setItem('event_draft', JSON.stringify(draft))
        }
    }

    async function prefillDraft() {
        const draftStr = window.localStorage.getItem('event_draft')
        if (draftStr) {
            try {
                const draft = JSON.parse(draftStr) as Draft
                setCover(draft.cover)
                setTitle(draft.title)
                setContent(draft.content)
                setTelegram(draft.telegram_contact_group || '')

                setOnlineUrl(draft.online_location || '')

                if (draft.max_participants) {
                    setMaxParticipants(draft.max_participants)
                }

                if (draft.min_participants) {
                    setMinParticipants(draft.min_participants)
                }

                setEnableMinParticipants(draft.enable_min_participants)
                setEnableMaxParticipants(draft.enable_max_participants)

                if (draft.guests) {
                    setGuests(draft.guests)
                }

                setEnableGuest(draft.enable_guest)

                setLabel(draft.tags ? draft.tags : [])
                setBadgeId(draft.badge_id)
                setEventType(draft.event_type || 'event')

                if (draft.wechat_contact_group) {
                    setWechatImage(draft.wechat_contact_group)
                }

                if (draft.wechat_contact_person) {
                    setWechatAccount(draft.wechat_contact_person)
                }

                setTimeout(() => {
                    // setStart(draft.start_time)
                    // setEnding(draft.end_time)
                    setFormReady(true)
                }, 500)
            } catch (e) {
                console.log(e)
            }
        } else {
            setFormReady(true)
        }
    }

    useEffect(() => {
        if (props?.eventId) {
            setIsEditMode(!!props.eventId)
        }
    }, [props])

    useEffect(() => {
        if (telegram) {
            const telegramGroupRegex = /^https?:\/\/t.me\//;
            const valid = telegramGroupRegex.test(telegram)
            setTelegramError(valid ? '' : 'Invalid Telegram Group Url')
        } else {
            setTelegramError('')
        }
    }, [telegram])

    useEffect(() => {
        if (eventGroup && eventGroup.group_event_visibility !== 'public' && !joined) {
            router.replace('/event')
            return
        }
    }, [joined, eventGroup])

    useEffect(() => {
        if (start && ending) {
            if (start > ending) {
                setStartTimeError(lang['Activity_Form_Ending_Time_Error'])
            } else {
                setStartTimeError('')
            }
        }
    }, [start, ending])

    useEffect(() => {
        async function fetchBadgeDetail() {
            if (badgeId) {
                const badge = await queryBadgeDetail({id: badgeId})
                setBadgeDetail(badge)
            }
        }

        fetchBadgeDetail()
    }, [badgeId])

    useEffect(() => {
        async function prefillEventDetail(event: Event) {
            setCurrEvent(event)
            setCover(event.cover)
            setTitle(event.title)
            setContent(event.content)
            if (event.start_time) {
                setStart(event.start_time)
            }

            if (event.ending_time) {
                setEnding(event.ending_time)
                setHasDuration(true)
            }
            setLocationType(event.location_type)
            setOnlineUrl(event.online_location || '')
            setEventSite(event.event_site ? event.event_site : null)
            if (event.max_participant) {
                setMaxParticipants(event.max_participant)
                setEnableMaxParticipants(true)
            } else {
                setEnableMaxParticipants(false)
            }

            if (event.min_participant) {
                setMinParticipants(event.min_participant)
                setEnableMinParticipants(true)
            } else {
                setEnableMinParticipants(false)
            }

            setTelegram(event.telegram_contact_group || '')
            setCustomLocation(event.location || '')

            if (event.participants) {
                const gustList = event.participants
                    .filter(p => p.role === 'guest')
                    .map((p) => p.profile.domain!)
                setEnableGuest(true)
                setGuests([...gustList, ''])
            }

            setLabel(event.tags ? event.tags : [])
            setBadgeId(event.badge_id)
            setEventType(event.event_type || 'event')

            if (event.host_info) {
                const profile = await getProfile({id: Number(event.host_info)})
                setCreator(profile)
            } else {
                const profile = await getProfile({id: event.owner_id})
                setCreator(profile)
            }

            if (event.wechat_contact_group) {
                setWechatImage(event.wechat_contact_group)
            }

            if (event.wechat_contact_person) {
                setWechatAccount(event.wechat_contact_person)
            }

            if (event.location_details) {
                setLocationDetail(event.location_details)
            }

            if (event.timezone) {
                setTimezone(event.timezone)
            }

            setFormReady(true)
        }

        async function fetchEventDetail() {
            if (isEditMode) {
                try {
                    const event = await queryEventDetail({id: props.eventId!})
                    if (!event) {
                        showToast('event not found')
                        router.push('/error')
                        return
                    }
                    await prefillEventDetail(event)
                } catch (e: any) {
                    showToast(e.message)
                    router.push('/error')
                }
            } else {
                prefillDraft()
            }
        }

        async function fetchTags() {
            const tags = await getHotTags()
            setLabels(tags)
        }

        fetchTags()
        fetchEventDetail()
    }, [isEditMode])

    useEffect(() => {
        SaveDraft()
    }, [
        cover,
        title,
        content,
        onlineUrl,
        maxParticipants,
        minParticipants,
        guests,
        label,
        badgeId,
        start,
        ending,
        creator,
        enableGuest,
        enableMinParticipants,
        enableMaxParticipants,
        formReady,
        eventType,
        wechatImage,
        wechatAccount,
        telegram
    ])

    // 检查event_site在设置的event.start_time和event.ending_time否可用
    useEffect(() => {
        async function getEventBySiteAndDate() {
            if (eventSite && start && ending) {
                const startDate = new Date(new Date(start).getFullYear(), new Date(start).getMonth(), new Date(start).getDate(), 0, 0, 0)
                const endDate = new Date(new Date(ending).getFullYear(), new Date(ending).getMonth(), new Date(ending).getDate(), 23, 59, 59)
                let events = await queryEvent({
                    event_site_id: eventSite.id,
                    start_time_from: startDate.getTime() / 1000,
                    start_time_to: endDate.getTime() / 1000,
                    page: 1
                })
                console.log('eventseventsevents', events)

                // 排除自己
                events = events.filter((e) => e.id !== props.eventId && e.status !== 'cancel')

                const occupied = events.some((e) => {
                    const eventStartTime = new Date(e.start_time!).getTime()
                    const eventEndTime = new Date(e.ending_time!).getTime()
                    const selectedStartTime = new Date(start).getTime()
                    const selectedEndTime = new Date(ending).getTime()
                    return (selectedStartTime < eventStartTime && selectedEndTime > eventStartTime) ||
                        (selectedStartTime >= eventStartTime && selectedEndTime <= eventEndTime) ||
                        (selectedStartTime < eventEndTime && selectedEndTime > eventEndTime)

                })

                setSiteOccupied(occupied)
            } else {
                setSiteOccupied(false)
            }
        }

        getEventBySiteAndDate()
    }, [start, ending, eventSite])

    const showBadges = async () => {
        const props = creator?.is_group ? {
                group_id: creator!.id,
                page: 1
            } :
            {
                sender_id: creator!.id,
                page: 1
            }

        const unload = showLoading()
        const badges = await queryBadge(props)
        unload()

        openDialog({
            content: (close: any) => <DialogIssuePrefill
                badges={badges}
                profileId={user.id!}
                onSelect={(res) => {
                    if (res.badgeId) {
                        setBadgeId(res.badgeId)
                    }
                }}
                handleClose={close}/>,
            position: 'bottom',
            size: [360, 'auto']
        } as OpenDialogProps)
    }

    const handleCreate = async () => {
        if (!user.id) {
            showToast('Please login first')
            return
        }

        if (!eventGroup) {
            showToast('请选择一个组织')
            return
        }

        if (siteOccupied) {
            showToast(lang['Activity_Detail_site_Occupied'])
            return
        }

        if (new Date(start) > new Date(ending)) {
            showToast('start time should be earlier than ending time')
            return
        }

        if (!cover) {
            showToast('please upload cover')
            return
        }

        if (!title) {
            showToast('please input title')
            return
        }

        if (startTimeError) {
            showToast(lang['Activity_Form_Ending_Time_Error'])
            return
        }

        if (telegramError) {
            showToast('Invalid telegram Group Url')
            return
        }

        let lng: string | null = null
        let lat: string | null = null

        if (eventSite && eventSite.location_details) {
            lng = JSON.parse(eventSite!.location_details!).geometry.location.lng
            lat = JSON.parse(eventSite!.location_details!).geometry.location.lat
        } else if (locationDetail) {
            lng = JSON.parse(locationDetail).geometry.location.lng
            lat = JSON.parse(locationDetail).geometry.location.lat
        }

        const props: CreateRepeatEventProps = {
            title: title.trim(),
            cover,
            content,
            tags: label,
            start_time: start,
            ending_time: hasDuration ? ending : null,
            location_type: 'both',
            max_participant: enableMaxParticipants ? maxParticipants : null,
            min_participant: enableMinParticipants ? minParticipants : null,
            badge_id: badgeId,
            group_id: eventGroup.id,
            online_location: onlineUrl || null,
            event_site_id: eventSite?.id || null,
            event_type: eventType,
            wechat_contact_group: wechatImage || undefined,
            wechat_contact_person: wechatAccount || undefined,
            auth_token: user.authToken || '',
            location: customLocation,
            telegram_contact_group: telegram || null,
            location_details: locationDetail,
            host_info: creator && creator.is_group ? creator.id + '' : undefined,
            interval: repeat || undefined,
            repeat_ending_time: repeatEnd || undefined,
            timezone,
            lng,
            lat
        }

        setCreating(true)
        const unloading = showLoading(true)
        try {
            if (props.interval) {
                const newEvents = await createRepeatEvent(props)

                if (guests.length) {
                    const domains = guests.filter((g) => !!g)
                    if (domains.length) {
                        const invite = await RepeatEventInvite({
                            repeat_event_id: newEvents[0].repeat_event_id!,
                            domains,
                            auth_token: user.authToken || ''
                        })
                    }
                }

                if (badgeId) {
                    const setBadge = await RepeatEventSetBadge({
                        repeat_event_id: newEvents[0].repeat_event_id!,
                        badge_id: badgeId,
                        auth_token: user.authToken || ''
                    })
                }

                unloading()
                showToast('create success')
                window.localStorage.removeItem('event_draft')
                router.push(`/event/success/${newEvents[0].id}`)
                setCreating(false)
            } else {
                const newEvent = await createEvent(props)
                if (guests.length) {
                    const domains = guests.filter((g) => !!g)
                    if (domains.length) {
                        const invite = await inviteGuest({
                            id: newEvent.id,
                            domains,
                            auth_token: user.authToken || ''
                        })
                    }
                }
                if (badgeId) {
                    const setBadge = await setEventBadge({
                        id: newEvent.id,
                        badge_id: badgeId,
                        auth_token: user.authToken || ''
                    })
                }
                unloading()
                showToast('create success')
                window.localStorage.removeItem('event_draft')
                router.push(`/event/success/${newEvent.id}`)
                setCreating(false)
            }
        } catch (e: any) {
            unloading()
            console.error(e)
            showToast(e.message)
            setCreating(false)
        }
    }

    const handleSave = async () => {
        if (!user.id) {
            showToast('Please login first')
            return
        }

        if (siteOccupied) {
            showToast(lang['Activity_Detail_site_Occupied'])
            // window.location.href = location.pathname + '#SiteError'
            return
        }

        if (new Date(start) > new Date(ending)) {
            showToast('start time should be earlier than ending time')
            return
        }

        if (!cover) {
            showToast('please upload cover')
            return
        }

        if (!title) {
            showToast('please input title')
            return
        }

        if (startTimeError) {
            showToast(lang['Activity_Form_Ending_Time_Error'])
            return
        }

        if (telegramError) {
            showToast('Invalid telegram Group Url')
            return
        }

        let lng: string | null = null
        let lat: string | null = null

        if (eventSite && eventSite.location_details) {
            lng = JSON.parse(eventSite!.location_details!).geometry.location.lng
            lat = JSON.parse(eventSite!.location_details!).geometry.location.lat
        } else if (locationDetail) {
            lng = JSON.parse(locationDetail).geometry.location.lng
            lat = JSON.parse(locationDetail).geometry.location.lat
        }

        const saveProps: CreateEventProps = {
            id: props.eventId!,
            title: title.trim(),
            cover,
            content,
            tags: label,
            start_time: start,
            location_type: 'both',
            ending_time: hasDuration ? ending : null,
            event_site_id: eventSite?.id || null,
            max_participant: enableMaxParticipants ? maxParticipants : null,
            min_participant: enableMinParticipants ? minParticipants : null,
            badge_id: badgeId,
            online_location: onlineUrl || null,
            auth_token: user.authToken || '',
            event_type: eventType,
            host_info: creator && creator.is_group ? creator.id + '' : undefined,
            wechat_contact_group: wechatImage || undefined,
            wechat_contact_person: wechatAccount || undefined,
            location: customLocation,
            telegram_contact_group: telegram || null,
            location_details: locationDetail,
            repeat_event_id: currEvent!.repeat_event_id || undefined,
            timezone,
            lng,
            lat
        }

        if (currEvent?.repeat_event_id) {
            const dialog = openConfirmDialog({
                confirmLabel: 'Save',
                cancelLabel: 'Cancel',
                title: `Edit repeat event 「${currEvent!.title}」`,
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
            await singleSave()
        }

        async function singleSave(redirect = true) {
            const unloading = showLoading(true)
            try {
                const newEvent = await updateEvent(saveProps)
                if (guests.length) {
                    const domains = guests.filter((g) => !!g)
                    if (domains.length) {
                        const invite = await inviteGuest({
                            id: newEvent.id,
                            domains,
                            auth_token: user.authToken || ''
                        })
                    }
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
                await singleSave(false)
                const unloading = showLoading(true)
                try {
                    const newEvents = await RepeatEventUpdate({
                        ...saveProps,
                        event_id: currEvent!.id,
                        selector: repeatEventSelectorRef.current
                    })

                    if (guests.length) {
                        const domains = guests.filter((g) => !!g)
                        if (domains.length) {
                            const invite = await RepeatEventInvite({
                                repeat_event_id: currEvent!.repeat_event_id!,
                                domains,
                                selector: repeatEventSelectorRef.current,
                                auth_token: user.authToken || ''
                            })
                        }
                    }

                    unloading()
                    showToast('update success')
                    router.replace(`/event/detail/${newEvents[0].id}`)
                } catch (e: any) {
                    unloading()
                    console.error(e)
                    showToast(e.message)
                }
            }
        }
    }

    return (
        <>
            <div className='create-event-page'>
                <div className='create-badge-page-wrapper'>
                    <PageBack title={lang['Activity_Create_title']}/>

                    <div className='create-badge-page-form'>
                        <div className='input-area'>
                            <div className='input-area-title'>{lang['Activity_Form_Cover']}</div>
                            <UploadImage
                                cropper={false}
                                imageSelect={cover}
                                confirm={(coverUrl) => {
                                    setCover(coverUrl)
                                }}/>
                        </div>

                        <div className='input-area'>
                            <div className='input-area-title'>{lang['Activity_Form_Name']}</div>
                            <AppInput
                                clearable
                                maxLength={30}
                                value={title}
                                errorMsg={''}
                                placeholder={lang['Activity_Form_Name']}
                                onChange={(e) => {
                                    setTitle(e.target.value)
                                }}/>
                        </div>

                        {false &&
                            <div className='input-area'>
                                <div className={'toggle'}>
                                    <div className={'item-title'}>{lang['Activity_Form_Checklog']}</div>
                                    <div className={'item-value'}>
                                        <Toggle checked={eventType === 'checklog'} onChange={e => {
                                            setEventType(e.target.checked ? 'checklog' : 'event')
                                        }}/>
                                    </div>
                                </div>
                            </div>
                        }

                        {(!isEditMode || (!!currEvent && !currEvent.repeat_event_id)) &&
                            <div className='input-area'>
                                <div className='input-area-title'>{lang['Activity_Form_Starttime']}</div>
                                <AppEventTimeInput
                                    from={start}
                                    to={ending}
                                    arrowRepeat={!currEvent}
                                    timezone={timezone}
                                    onChange={e => {
                                        setStart(e.from)
                                        setEnding(e.to)
                                        setRepeat(e.repeat as any || null)
                                        setRepeatEnd(e.repeatEndingTime as any || null)
                                        setTimezone(e.timezone as any || null)
                                    }}/>
                            </div>
                        }

                        { false &&
                            <div className='input-area'>
                                <div className='input-area-title'>{lang['Activity_Form_Starttime']}</div>
                                <AppDateInput value={start} onChange={(data) => {
                                    console.log('start', data)
                                    setStart(data as string)
                                }}/>
                            </div>
                        }

                        {false && hasDuration &&
                            <div className='input-area'>
                                <div className='input-area-title'>{lang['Activity_Form_Ending']}</div>
                                <AppDateInput value={ending} onChange={(data) => {
                                    console.log('ending', data)
                                    setEnding(data as string)
                                }}/>
                            </div>
                        }

                        {startTimeError && <div className={'start-time-error'}>
                            {lang['Activity_Form_Ending_Time_Error']}
                        </div>}


                        {!!eventGroup && ((isEditMode && formReady) || !isEditMode) &&
                            <LocationInput
                                initValue={isEditMode ? {
                                    eventSite: eventSite,
                                    customLocation: customLocation,
                                    metaData: locationDetail
                                } as any : undefined}
                                eventGroup={eventGroup}
                                onChange={values => {
                                    setEventSite(values.eventSite?.id ? values.eventSite : null)
                                    setCustomLocation(values.customLocation)
                                    setLocationDetail(values.metaData || '')
                                }}/>
                        }

                        {eventType === 'event' &&
                            <div className='input-area'>
                                <div className='input-area-title'>{lang['Activity_Form_online_address']}</div>
                                <AppFlexTextArea
                                    icon={<i className={'icon-link'}/>}
                                    value={onlineUrl}
                                    maxHeight={80}
                                    onChange={(value) => {
                                        setOnlineUrl(value)
                                    }}
                                    placeholder={'Url...'}/>
                            </div>
                        }

                        <div className='input-area'>
                            <div className='input-area-title'>{lang['Activity_Form_Details']}</div>
                            <ReasonInput unlimited value={content} onChange={(value) => {
                                setContent(value)
                            }}/>
                        </div>

                        {eventType === 'event' &&
                            <div className={'input-area'}>
                                <div className={'toggle'}>
                                    <div className={'item-title'}>{lang['Activity_Form_participants']}</div>
                                    <div className={'item-value'}>
                                        {enableMaxParticipants &&
                                            <input value={maxParticipants} onChange={
                                                e => {
                                                    toNumber(e.target.value!.trim(), setMaxParticipants)
                                                }
                                            }/>
                                        }

                                        {!enableMaxParticipants &&
                                            <div className={'unlimited'}>Unlimited</div>
                                        }

                                        <Toggle checked={enableMaxParticipants} onChange={e => {
                                            setEnableMaxParticipants(!enableMaxParticipants)
                                        }}/>
                                    </div>
                                </div>
                            </div>
                        }

                        {eventType === 'event' &&
                            <div className={'input-area'}>
                                <div className={'toggle'}>
                                    <div className={'item-title'}>{lang['Activity_Form_participants_Min']}</div>
                                    <div className={'item-value'}>
                                        {enableMinParticipants &&
                                            <input value={minParticipants} onChange={
                                                e => {
                                                    toNumber(e.target.value!.trim(), setMinParticipants)
                                                }
                                            }/>
                                        }

                                        {!enableMinParticipants &&
                                            <div className={'unlimited'}>Unlimited</div>
                                        }

                                        <Toggle checked={enableMinParticipants} onChange={e => {
                                            setEnableMinParticipants(!enableMinParticipants)
                                        }}/>
                                    </div>
                                </div>
                            </div>
                        }

                        <div className={'input-area'}>
                            <div className={'toggle'}>
                                <div className={'item-title'}>{lang['Activity_Form_Guest']}</div>
                                <div className={'item-value'}>

                                    <Toggle checked={enableGuest} onChange={e => {
                                        setEnableGuest(!enableGuest)
                                    }}/>
                                </div>
                            </div>

                            {enableGuest &&
                                <IssuesInput
                                    value={guests}
                                    placeholder={lang['Activity_Detail_Guest']}
                                    onChange={(newIssues) => {
                                        setGuests(newIssues)
                                    }}/>
                            }
                        </div>

                        {
                            formReady &&
                            <div className='input-area'>
                                <div className='input-area-title'>{lang['Activity_originators']}</div>
                                <SelectCreator
                                    autoSet={!creator}
                                    value={creator}
                                    onChange={(res) => {
                                        console.log('switch creator', res)
                                        setCreator(res)
                                    }}/>
                            </div>
                        }

                        {!!eventGroup && eventGroup.group_event_tags &&
                            <div className={'input-area'}>
                                <div className={'input-area-title'}>{lang['Activity_Form_Label']}</div>
                                <EventLabels
                                    data={eventGroup.group_event_tags} onChange={e => {
                                    setLabel(e)
                                }} value={label}/>
                            </div>
                        }


                        {eventType === 'event' &&
                            <div className={'input-area'}>
                                <div className={'input-area-title'}>{lang['Activity_Form_Badge']}</div>
                                <div className={'input-area-des'}>{lang['Activity_Form_Badge_Des']}</div>
                                {!badgeId &&
                                    <div className={'add-badge'} onClick={async () => {
                                        await showBadges()
                                    }}>{lang['Activity_Form_Badge_Select']}</div>
                                }

                                {
                                    !!badgeDetail &&
                                    <div className={'banded-badge'}>
                                        <Delete size={22} onClick={e => {
                                            setBadgeId(null)
                                            setBadgeDetail(null)
                                        }
                                        }/>
                                        <img src={badgeDetail.image_url} alt=""/>
                                        <div>{badgeDetail.title}</div>
                                    </div>
                                }
                            </div>}


                        {langType === 'cn' &&
                            <div className={'input-area'}>
                                <div className={'input-area-title'}>{lang['Activity_Form_Wechat']}</div>
                                <div className={'input-area-des'}>{lang['Activity_Form_Wechat_Des']}</div>
                                <UploadWecatQrcode confirm={(img => {
                                    setWechatImage(img)
                                })}
                                                   imageSelect={wechatImage}/>
                            </div>
                        }

                        {!!wechatImage &&
                            <div className={'input-area'}>
                                <div className={'input-area-des'}>{lang['Activity_Form_Wechat_Account']}</div>
                                <AppInput
                                    clearable
                                    value={wechatAccount}
                                    errorMsg={''}
                                    placeholder={'your Wechat'}
                                    onChange={(e) => {
                                        setWechatAccount(e.target.value)
                                    }}/>
                            </div>
                        }

                        <div className='input-area'>
                            <div className='input-area-title'>{lang['Activity_Detail_Offline_Tg']}</div>
                            <div className='input-area-des'>{lang['Activity_Detail_Offline_Tg_des']}</div>
                            <AppInput
                                startEnhancer={() => <i className={'icon icon-link'}/>}
                                clearable
                                value={telegram}
                                errorMsg={telegramError}
                                placeholder={'Url...'}
                                onChange={(e) => {
                                    setTelegram(e.target.value)
                                }}/>
                        </div>

                        {isEditMode ?
                            <AppButton kind={BTN_KIND.primary}
                                       special
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
                                           handleCreate()
                                       }}>
                                {lang['Activity_Btn_Create']}
                            </AppButton>
                        }
                        {
                            isEditMode && <div style={{marginTop: '12px'}}>
                                <AppButton onClick={e => {
                                    cancel()
                                }}>{lang['Activity_Detail_Btn_Cancel']}</AppButton>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </>
    )
}

export default CreateEvent
