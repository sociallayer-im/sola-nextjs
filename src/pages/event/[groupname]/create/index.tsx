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
    updateEvent
} from "@/service/solas";
import EventDefaultCover from "@/components/base/EventDefaultCover";
import AppButton, {BTN_KIND} from "@/components/base/AppButton/AppButton";
import UploadImage from "@/components/compose/UploadImage/UploadImage";
import RichTextEditor from "@/components/compose/RichTextEditor/Editor";
import LocationInput from "@/components/compose/LocationInput/LocationInputNew";
import TimeSlot from "@/components/compose/themu/TimeSlotNew";
import userContext from "@/components/provider/UserProvider/UserContext";
import AppEventTimeInput from "@/components/base/AppEventTimeInput/AppEventTimeInput";
import AppFlexTextArea from "@/components/base/AppFlexTextArea/AppFlexTextArea";
import EventLabels from "@/components/base/EventLabels/EventLabels";
import SelectCreator from "@/components/compose/SelectCreator/SelectCreator";
import {Delete} from "baseui/icon";
import DialogIssuePrefill from "@/components/eventSpecial/DialogIssuePrefill/DialogIssuePrefill";
import {OpenDialogProps} from "@/components/provider/DialogProvider/DialogProvider";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import IssuesInput from "@/components/base/IssuesInput/IssuesInput";
import {useRouter} from "next/navigation";
import * as dayjsLib from "dayjs";
import TriangleDown from 'baseui/icon/triangle-down'
import TriangleUp from 'baseui/icon/triangle-up'

const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const dayjs: any = dayjsLib
dayjs.extend(utc)
dayjs.extend(timezone)


const repeatEventEditOptions = [
    {label: 'Only this event', value: 'one'},
    {label: 'This and following events', value: 'after'},
    {label: 'All recurring events', value: 'all'},
]


const getNearestTime = () => {
    const now = new Date()
    const minutes = now.getMinutes()
    const minuteRange = [0, 30, 60]
    const nearestMinute = minuteRange.find((item) => {
        return item >= minutes
    })

    const initStartTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), nearestMinute || 0)
    const initEndTime = new Date(initStartTime.getTime() + 60 * 60 * 1000)
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

    // status
    const [formReady, setFormReady] = useState(true)
    const [isEditMode, setIsEditMode] = useState(!!initEvent)
    const [isSlot, setIsSlot] = useState(false)
    const [isManager, setIsManager] = useState(false)
    const [repeat, setRepeat] = useState<string | null>(null)
    const [badgeDetail, setBadgeDetail] = useState<Badge | null>(null)
    const [creating, setCreating] = useState(false)
    const [needPublish, setNeedPublish] = useState(true)
    const [enableOtherOpt, setEnableOtherOpt] = useState(false)

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

    // data
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
        event_site_id: null,
        location: null,
        formatted_address: null,
        start_time: initTime[0].toISOString(),
        end_time: initTime[1].toISOString(),
        timezone: group?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        meeting_url: '',
        tags: [],
        host_info: null,
        badge_id: null,
        max_participant: null,
        event_type: 'event',
        group_id: group?.id,
    })


    const init = async () => {
        if (!!group && user.id) {
            const memberships = await getGroupMemberShips({group_id: group.id, role: 'all'})
            const membership = memberships.find(item => item.profile.id === user.id)
            const isJoined = !!membership && membership.role === 'member'
            const isManager = !!membership && membership.role === 'manager'

            setIsManager(isManager || group.creator.id === user.id)
            if (!!initEvent && user.userName && initEvent.operators?.includes(user!.id!)) {
                setNeedPublish(false)
            } else if (!eventGroup || (eventGroup as Group).can_publish_event === 'everyone') {
                setNeedPublish(false)
            } else if ((eventGroup as Group).can_publish_event === 'member' && !isJoined) {
                setNeedPublish(true)
                return
            } else if ((eventGroup as Group).can_publish_event === 'manager' && !isManager) {
                setNeedPublish(true)
                return
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


            if (initEvent.host_info) {
                const info = JSON.parse(initEvent.host_info)
                if (info.co_host.length > 0) {
                    // setEnableCoHost(true)
                    setCohost(info.co_host.map((p: ProfileSimple) => p.username))
                } else {
                    // setEnableCoHost(false)
                    setCohost([''])
                }

                if (info.speaker.length > 0) {
                    // setEnableSpeakers(true)
                    setSpeakers(info.speaker.map((p: ProfileSimple) => p.username))
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
        const slotList = [82, 81, 80, 79, 78, 87, 86]
        if (event.event_site_id && slotList.includes(event.event_site_id)) {
            setIsSlot(true)
        } else {
            if (!event.start_time || !event.end_time) {
                setEvent({
                    ...event,
                    start_time: initEvent ? initEvent.start_time! : initTime[0].toISOString(),
                    end_time: initEvent ? initEvent.end_time! : initTime[1].toISOString()
                })
            }
            setIsSlot(false)
        }
    }, [event.event_site_id])

    useEffect(() => {
        if (event.badge_id) {
            queryBadgeDetail({id: event.badge_id}).then(res => {
                setBadgeDetail(res)
            })
        }
    }, [event.badge_id])

    useEffect(() => {
        if (event.badge_id) {
            queryBadgeDetail({id: event.badge_id}).then(res => {
                setBadgeDetail(res)
            })
        }
    }, [event.badge_id])

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
            if (event.event_site_id && start && ending) {
                const startDate = new Date(new Date(start).getFullYear(), new Date(start).getMonth(), new Date(start).getDate(), 0, 0, 0)
                const endDate = new Date(new Date(ending).getFullYear(), new Date(ending).getMonth(), new Date(ending).getDate(), 23, 59, 59)
                let events = await queryEvent({
                    event_site_id: event.event_site_id,
                    start_time_from: startDate.toISOString(),
                    start_time_to: endDate.toISOString(),
                    page: 1,
                    page_size: 50
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


                    if (e) {
                        console.log('occupied', e, res)
                        inUseEvents = e
                    }

                    return res
                })

                setSiteOccupied(occupied)
                setOccupiedError(occupied ? `${lang['Activity_Detail_site_Occupied']}  In use event :「${inUseEvents.title}」` : '')
            } else {
                setSiteOccupied(false)
                setOccupiedError('')
            }
        }

        checkOccupied()
    }, [event.event_site_id, event.start_time, event.end_time])

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
                onSelect={(res) => {
                    if (res.badgeId) {
                        setEvent({
                            ...event,
                            badge_id: res.badgeId
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

        if (repeatCounterError && repeat) {
            showToast('The number of times the event repeats must be greater than 0 and less than 100')
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

        const profiles = await getProfileBatch(usernames)
        if (profiles.length !== usernames.length) {
            const missing = usernames.find((u) => !profiles.find((p) => p.username === u))
            if (missing) {
                throw new Error(`User 「${missing}」 not exist`)
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
            cohostId: enableCoHost ? cohostUser.map((p) => p.id) : null,
            speakerId: enableSpeakers ? speakerUsers.map((p) => p.id) : null
        }
    }

    const handleSave = async () => {
        const check = checkForm()
        if (!check) return

        setCreating(true)
        const unloading = showLoading(true)
        let host_info: string | null = ''
        let cohostIds: number[] | null = null

        try {
            const info = await parseHostInfo()
            host_info = info.json
            cohostIds = info.cohostId
        } catch (e: any) {
            showToast(e.message)
            setCreating(false)
            unloading()
            return
        }

        unloading()

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
                const info = await parseHostInfo()
                const newEvent = await updateEvent(saveProps)
                if (saveProps.badge_id) {
                    const setBadge = await setEventBadge({
                        id: saveProps.id!,
                        badge_id: saveProps.badge_id,
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
                await singleSave(false)
                const unloading = showLoading(true)
                try {
                    const info = await parseHostInfo()
                    const newEvents = await RepeatEventUpdate({
                        ...saveProps,
                        selector: repeatEventSelectorRef.current
                    } as any)

                    if (saveProps.badge_id) {
                        const setBadge = await RepeatEventSetBadge({
                            auth_token: user.authToken || '',
                            badge_id: saveProps.badge_id,
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
        try {
            const info = await parseHostInfo()
            host_info = info.json
            cohostIds = info.cohostId
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

            auth_token: user.authToken || '',
        } as CreateRepeatEventProps

        try {
            if (props.interval) {
                const newEvent = await createRepeatEvent(props)
                if (props.badge_id) {
                    const setBadge = await RepeatEventSetBadge({
                        recurring_event_id: newEvent.recurring_event_id!,
                        badge_id: props.badge_id,
                        auth_token: user.authToken || ''
                    })
                }

                unloading()
                showToast('create success')
                window.localStorage.removeItem('event_draft')
                router.push(`/event/success/${newEvent.id}`)
                setCreating(false)
            } else {
                const newEvent = await createEvent(props)

                if (props.badge_id) {
                    const setBadge = await setEventBadge({
                        id: newEvent.id,
                        badge_id: props.badge_id,
                        auth_token: user.authToken || ''
                    })
                }
                unloading()
                showToast('create success')
                window.localStorage.removeItem('event_draft')
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
            confirmBtnColor: 'red',
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

                            <div className={styles['input-area']}>
                                <div className={styles['input-area-title']}>{lang['External_Url']}</div>
                                <AppInput clearable={false}
                                          value={event.external_url || ''}
                                          placeholder={lang['External_Url']}
                                          onChange={(e) => {
                                              setEvent({...event, external_url: e.target.value})
                                          }}/>
                            </div>

                            {!!eventGroup &&
                                <div className={styles['input-area']}>
                                    <LocationInput
                                        initValue={event as any}
                                        eventGroup={eventGroup as Group}
                                        onChange={values => {
                                            setEvent({
                                                ...event,
                                                ...values
                                            } as any)
                                        }}/>
                                </div>
                            }

                            {!!occupiedError && <div className={styles['start-time-error']}>{occupiedError}</div>}

                            {event.event_site_id && isSlot &&
                                <div className={styles['input-area']}>
                                    <div className={styles['input-area-title']}>{lang['Activity_Form_Starttime']}</div>
                                    <TimeSlot eventSiteId={event.event_site_id}
                                              from={event.start_time!}
                                              to={event.end_time!}
                                              allowRepeat={isManager}
                                              onChange={(from, to, timezone, repeat, counter) => {
                                                  console.log('========res', from, to, timezone, repeat, counter)
                                                  setRepeat(repeat as any || null)
                                                  setRepeatCounter(counter)
                                                  setEvent({
                                                      ...event,
                                                      start_time: from,
                                                      end_time: to,
                                                      timezone: timezone
                                                  })
                                              }}/>
                                </div>
                            }

                            {!isSlot &&
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
                                        disabled={!!initEvent?.recurring_event_id}
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
                                <div className={styles['input-area-title']}>{lang['Activity_Form_Badge']}</div>
                                <div className={styles['input-area-des']}>{lang['Activity_Form_Badge_Des']}</div>
                                {!event.badge_id &&
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
                                                badge_id: null
                                            })
                                            setBadgeDetail(null)
                                        }
                                        }/>
                                        <img src={badgeDetail.image_url} alt=""/>
                                        <div>{badgeDetail.title}</div>
                                    </div>
                                }
                            </div>

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
                                        <div className={styles['toggle']}>
                                            <div className={styles['item-title']}>{'Invite a Co-host'}</div>
                                        </div>

                                        {enableCoHost &&
                                            <IssuesInput
                                                value={cohost as any}
                                                placeholder={`Co-host`}
                                                onChange={(newIssues) => {
                                                    setCohost(newIssues)
                                                }}/>
                                        }
                                    </div>

                                    <div className={styles['input-area']}>
                                        <div className={styles['toggle']}>
                                            <div
                                                className={styles['item-title']}>{'Invite a speaker to the event'}</div>
                                        </div>

                                        {enableSpeakers &&
                                            <IssuesInput
                                                value={speakers as any}
                                                placeholder={`Speaker`}
                                                onChange={(newIssues) => {
                                                    setSpeakers(newIssues)
                                                }}/>
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

                                                <svg className={styles['edit-icon']} onClick={showMaxParticipantOption} xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                                     viewBox="0 0 16 16" fill="none">
                                                    <path
                                                        d="M3.3335 12.0001H6.16016C6.2479 12.0006 6.33488 11.9838 6.4161 11.9506C6.49733 11.9175 6.5712 11.8686 6.6335 11.8068L11.2468 7.18679L13.1402 5.33346C13.2026 5.27148 13.2522 5.19775 13.2861 5.11651C13.3199 5.03527 13.3374 4.94813 13.3374 4.86012C13.3374 4.77211 13.3199 4.68498 13.2861 4.60374C13.2522 4.5225 13.2026 4.44876 13.1402 4.38679L10.3135 1.52679C10.2515 1.4643 10.1778 1.41471 10.0965 1.38086C10.0153 1.34702 9.92817 1.32959 9.84016 1.32959C9.75216 1.32959 9.66502 1.34702 9.58378 1.38086C9.50254 1.41471 9.42881 1.4643 9.36683 1.52679L7.48683 3.41346L2.86016 8.03346C2.79838 8.09575 2.74949 8.16963 2.71632 8.25085C2.68314 8.33208 2.66632 8.41905 2.66683 8.50679V11.3335C2.66683 11.5103 2.73707 11.6798 2.86209 11.8049C2.98712 11.9299 3.15669 12.0001 3.3335 12.0001ZM9.84016 2.94012L11.7268 4.82679L10.7802 5.77346L8.8935 3.88679L9.84016 2.94012ZM4.00016 8.78012L7.9535 4.82679L9.84016 6.71346L5.88683 10.6668H4.00016V8.78012ZM14.0002 13.3335H2.00016C1.82335 13.3335 1.65378 13.4037 1.52876 13.5287C1.40373 13.6537 1.3335 13.8233 1.3335 14.0001C1.3335 14.1769 1.40373 14.3465 1.52876 14.4715C1.65378 14.5966 1.82335 14.6668 2.00016 14.6668H14.0002C14.177 14.6668 14.3465 14.5966 14.4716 14.4715C14.5966 14.3465 14.6668 14.1769 14.6668 14.0001C14.6668 13.8233 14.5966 13.6537 14.4716 13.5287C14.3465 13.4037 14.177 13.3335 14.0002 13.3335Z"
                                                        fill="#CBCDCB"/>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            }
                            <div className={styles['btns']}>

                                {
                                    isEditMode && <div>
                                        <AppButton onClick={e => {
                                            handleCancel()
                                        }}>{lang['Activity_Detail_Btn_Cancel']}</AppButton>
                                    </div>
                                }

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
                                                   needPublish
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
            show_cancel_event: true
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

function DialogShowMaxParticipant(props: { value: null | number, onChange: (value: number | null) => any , close: any}) {
    const [count, setCount] = useState(props.value || 30)

    return <div className={styles['dialog-max-participant']}>
        <i className={`icon-close ${styles['close-btn']}`} onClick={(e) => {props.close()}} />
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
                props.onChange && props.onChange( null)
                props.close()
            }}>Cancel limit</AppButton>
            <AppButton special size={'compact'} onClick={(e) => {
                props.onChange && props.onChange(count || null);  props.close()}
            }>Done</AppButton>
        </div>
    </div>
}
