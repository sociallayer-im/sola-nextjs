import {Event as SolarEvent, EventSites, getEventSide, getGroups, Group, queryEvent} from "@/service/solas";
import {useContext, useEffect, useRef, useState} from "react";
import {createCalendar, viewDay, viewMonthAgenda, viewMonthGrid, viewWeek} from '@/libs/schedule-x-calendar/core'
import '@schedule-x/theme-default/dist/index.css'
import '@/libs/schedule-x-calendar/view-selection.scss'
import styles from '../schedule/schedulenew.module.scss'
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import useTime from "@/hooks/formatTime";
import {useRouter, useSearchParams} from "next/navigation";
import userContext from "@/components/provider/UserProvider/UserContext";
import {createEventsServicePlugin} from '@schedule-x/events-service'
import {createCurrentTimePlugin} from '@schedule-x/current-time'
import {createScrollControllerPlugin} from '@schedule-x/scroll-controller'
import ScheduleHeader from "@/components/base/ScheduleHeader";
import usePicture from "@/hooks/pictrue";
import Displayer from "@/components/compose/RichTextEditor/Displayer";
import Link from "next/link";
import {EventPopup} from "@/components/compose/EventPopup/EventPopup";

import * as dayjsLib from "dayjs";
import timezoneList from "@/utils/timezone";
import {getLabelColor} from "@/hooks/labelColor";
import {PageBackContext} from "@/components/provider/PageBackProvider";
import EventDefaultCover from "@/components/base/EventDefaultCover";
import {isHideLocation} from "@/global_config";

const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const dayjs: any = dayjsLib
dayjs.extend(utc)
dayjs.extend(timezone)

const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const mouthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

interface DateItem {
    date: number,
    timestamp: number,
    dayName: string,
    day: number,
    month: number,
    year: number,
    events: Event[],
    timezone: string
    o: any
}

const getCalendarData = (timeZone: string) => {
    const now = dayjs.tz(new Date().getTime(), timeZone)

    // const timeStr = `${now.year()}-${now.month() + 1}-${now.date()} 00:00`
    // const _nowZero = dayjs(timeStr, timeZone)
    const _from = now.subtract(182, 'day')


    // 获得 from 和 to  之间所以天0点的时间戳数组
    const dayArray = []
    for (let i = 0; i < 365; i++) {
        let time = _from
        if (i !== 0) {
            time = _from.add(i, 'day')
        }
        dayArray.push({
            date: time.date(),
            timestamp: time.valueOf(),
            dayName: dayName[time.day()],
            day: time.day(),
            month: time.month(),
            year: time.year(),
            events: [] as Event[],
            timezone: timeZone,
        })
    }
    console.log('dayArray length', dayArray.length)
    return dayArray as DateItem[]
}

function ComponentName(props: { group: Group, eventSite: EventSites[] }) {
    const eventGroup = props.group
    const calendarRef = useRef<any>(null)
    const scheduleXRef = useRef<any>(null)
    const {openConfirmDialog, openDialog} = useContext(DialogsContext)
    const {user} = useContext(userContext)
    const formatTime = useTime()
    const router = useRouter()
    const searchParams = useSearchParams()

    const [timezoneSelected, setTimezoneSelected] = useState<{ label: string, id: string }[]>([])
    const [venue, setVenue] = useState<number>(0)
    const [presetDate, setPresetDate] = useState<string>(searchParams?.get('date') || '')
    const [view, setView] = useState<string>(searchParams?.get('view') || 'month')

    let presetTag = searchParams?.get('tag')
    const [selectedTags, setSelectedTags] = useState<string[]>(presetTag ? presetTag.split(',') : [])

    useEffect(() => {
        try {
            const historyTimeZone = localStorage.getItem('schedule-timezone')
            if (historyTimeZone) {
                setTimezoneSelected(JSON.parse(historyTimeZone))
            } else if (props.group.timezone) {
                setTimezoneSelected([{
                    id: props.group.timezone,
                    label: timezoneList.find(item => item.id === props.group.timezone)!.label
                }])
            } else {
                const localTimezone = dayjs.tz.guess()
                const timezoneInfo = timezoneList.find(item => item.id === localTimezone) || {
                    id: 'UTC',
                    label: 'UTC+00:00'
                }
                setTimezoneSelected([timezoneInfo])
            }
        } catch (e: any) {
        }
    }, [])

    const toggleFullDayEvent = (e: any) => {
        if (scheduleXRef.current.$app.calendarState.view.v !== 'week') return
        try {
            const height = document.querySelector('.sx__date-grid')?.clientHeight || 10
            if (e.target.scrollTop > 5) {
                document.querySelector('.sx__date-grid')?.classList.add('hide');
                (document.querySelector('.sx__week-grid') as any).style.marginTop = `${height}px`
            } else {
                document.querySelector('.sx__date-grid')?.classList.remove('hide');
                (document.querySelector('.sx__week-grid') as any).style.marginTop = '0'
            }
        } catch (e) {

        }
    }

    useEffect(() => {
        if (timezoneSelected[0]) {
            const dayList = getCalendarData(timezoneSelected[0].id)
            queryEvent({
                group_id: eventGroup.id,
                start_time_from: new Date(dayList[0].timestamp).toISOString(),
                start_time_to: new Date(dayList[dayList.length - 1].timestamp).toISOString(),
                page: 1,
                tags: selectedTags.length ? selectedTags : undefined,
                event_order: 'asc',
                page_size: 1000,
                venue_id: venue || undefined
            }).then(res => {
                const eventList = res.map((event: SolarEvent) => {
                    let host = [event.owner.username]
                    if (event.host_info) {
                        const _host = JSON.parse(event.host_info)
                        if (_host.group_host) {
                            host = [_host.group_host.nickname || _host.group_host.username]
                        }
                    }

                    const calendarId = event.tags && event.tags[0] ? event.tags[0].replace(/[^\w\s]/g, '').replace(/\s/g, '').toLowerCase() : 'sola'
                    return {
                        id: event.id,
                        title: event.title,
                        start: dayjs.tz(new Date(event.start_time!).getTime(), timezoneSelected[0].id).format('YYYY-MM-DD HH:mm'),
                        end: dayjs.tz(new Date(event.end_time!), timezoneSelected[0].id).format('YYYY-MM-DD HH:mm'),
                        people: host,
                        start_time: event.start_time,
                        end_time: event.end_time,
                        location: (!isHideLocation(event.group_id) || !!user.id) ? event.location : undefined,
                        calendarId: calendarId,
                        link: `/event/detail/${event.id}`,
                        description: event.content,
                        event: event,
                    }
                })

                if (!calendarRef.current) return

                if (scheduleXRef.current) {
                    scheduleXRef.current.events.set(eventList)
                } else {
                    let calendars: any = {
                        sola: {
                            colorName: 'sola',
                            lightColors: {
                                main: '#6CD7B2',
                                container: '#f7ffeb',
                                onContainer: '#333',
                            },
                            darkColors: {
                                main: '#6CD7B2',
                                container: '#a29742',
                                onContainer: '#f7ffeb',
                            }
                        }
                    }

                    if (eventGroup.event_tags) {
                        eventGroup.event_tags.map((tag: string) => {
                            const name = tag.replace(/[^\w\s]/g, '').replace(/\s/g, '').toLowerCase()
                            calendars[name] = {
                                colorName: name,
                                lightColors: {
                                    main: getLabelColor(tag),
                                    container: getLabelColor(tag, 0.8),
                                    onContainer: '#333',
                                },
                                darkColors: {
                                    main: getLabelColor(tag),
                                    container: getLabelColor(tag),
                                    onContainer: '#333',
                                }
                            }
                        })
                    }

                    const customTagFilter = eventGroup.event_tags?.length ?
                        {
                            options: [
                                {
                                    label: `<div class="${styles['drop-list']}"><i style="background:#f1f1f1" ></i> All Tags</div>`,
                                    value: ''
                                },
                                ...(eventGroup.event_tags || []).map((t: string) => {
                                    return {
                                        label: `<div class="${styles['drop-list']}"><i style="background: ${getLabelColor(t)}" ></i>${t}</div>`,
                                        value: t
                                    }
                                })
                            ],
                            onClick: (value: string[]) => {
                                setSelectedTags(value)
                            },
                            placeholder: 'Tags',
                            defaultValue: selectedTags
                        } : undefined

                    const venueFilter = props.eventSite?.length ?
                        {
                            options: [
                                {
                                    label: `<div class="${styles['drop-list']}"> All Venues</div>`,
                                    value: ''
                                },
                                ...(props.eventSite || []).map((venue) => {
                                    return {
                                        label: `<div class="${styles['drop-list']}">${venue.title}</div>`,
                                        value: venue.id
                                    }
                                })
                            ],
                            onClick: (value: { label: string, value: any }) => {
                                setVenue(value.value)
                            },
                            multiple: false,
                            defaultSelectedIndex: 0
                        } : undefined

                    // const customMenus = [customTagFilter, venueFilter].filter(Boolean)
                    const customMenus = customTagFilter ? [customTagFilter] : undefined

                    const selectedDate = presetDate ?
                        dayjs.tz(presetDate, timezoneSelected[0].id).format('YYYY-MM-DD') :
                        dayjs.tz(new Date().getTime(), timezoneSelected[0].id).format('YYYY-MM-DD')

                    scheduleXRef.current = createCalendar({
                        weekOptions: {
                            gridHeight: 2880
                        },
                        monthGridOptions: {
                            nEventsPerDay: 30
                        },
                        views: [viewMonthGrid, viewMonthAgenda, viewDay, viewWeek],
                        minDate: dayjs.tz(dayList[0].timestamp, timezoneSelected[0].id).format('YYYY-MM-DD'),
                        maxDate: dayjs.tz(dayList[dayList.length - 1].timestamp, timezoneSelected[0].id).format('YYYY-MM-DD'),
                        selectedDate: selectedDate,
                        plugins: [
                            createEventsServicePlugin(),
                            createCurrentTimePlugin(),
                            createScrollControllerPlugin({
                                initialScroll: '07:50',
                            })
                        ],
                        calendars,
                        defaultView: view,
                        events: eventList as any,
                        customMultiMenus: customMenus,
                        _customComponentFns: {
                            eventModal: () => <div>123</div>
                        },
                        callbacks: {
                            onClickDateTime(dateTime: string) {
                                createEvent(dateTime)
                            },
                            onRangeUpdate(range: { start: string, end: string }) {
                                const interval = dayjs(range.end.replace(/-/g, '/')).diff(dayjs(range.start.replace(/-/g, '/')), 'day')
                                let view = 'month'
                                if (interval === 0) {
                                    view = 'day'
                                } else if (interval > 20) {
                                    view = 'month'
                                } else {
                                    view = 'week'
                                }

                                setView(view)
                                setPresetDate(range.start.split(' ')[0])
                            },
                            onEventClick(calendarEvent: any) {
                                console.log('onEventClick', calendarEvent)
                                openDialog({
                                    content: (close: any) => {return <EventPopup close={close} event={calendarEvent.event} timezone={timezoneSelected[0].id} />},
                                    size: [450, 'auto'],
                                    position: 'bottom',
                                })
                            },
                        },
                    } as any)

                    console.log('scheduleXRef.current', scheduleXRef.current)

                    scheduleXRef.current.render(calendarRef.current)

                    setTimeout(() => {
                        const container = document.querySelector('.sx__view-container')
                        if (container) {
                            container.addEventListener('scroll', toggleFullDayEvent)
                        }
                    }, 1500)
                }
            })
        }

        return () => {
            const container = document.querySelector('.sx__view-container')
            if (scheduleXRef.current && container) {
                container.removeEventListener('scroll', toggleFullDayEvent)
            }
        }
    }, [timezoneSelected, selectedTags, venue, user])


    useEffect(() => {
        history.replaceState(null, '', genHref({date: presetDate, tag: selectedTags.join(','), view}))
    }, [selectedTags, presetDate, view])

    const genHref = ({date, tag, view}: { date?: string, tag?: string, view?: string }): string => {
        // 根据传参生成query string
        const query = new URLSearchParams()
        if (date) {
            query.set('date', date)
        }
        if (tag) {
            query.set('tag', tag)
        }
        if (view) {
            query.set('view', view)
        }

        if (searchParams?.get('group')) {
            query.set('group', searchParams.get('group') as string)
        }

        return '?' + query.toString()
    }

    const createEvent = (dateTime: string) => {
        const hasEventModal = document.querySelector('#calendar .sx__event-modal')
        if (hasEventModal) return

        const time = new Date(dateTime)
        time.setMinutes(0, 0)

        const selected_time_start = dayjs.tz(dateTime, timezoneSelected[0].id).minute(0).second(0).toDate() // 2024-01-01 12:37
        const selected_time_end = dayjs.tz(dateTime, timezoneSelected[0].id).minute(30).second(0).toDate()

        openConfirmDialog({
            confirmLabel: 'Create an Event',
            confirmTextColor: '#000',
            title: 'Create an Event',
            content: () => {
                return <div>
                    <div>Would you like to create an event for {formatTime(time.toISOString())} ?
                    </div>
                    <div style={{
                        lineHeight: "1.2rem",
                        fontSize: "12px",
                        color: '#666',
                        marginTop: "12px"
                    }}>* You can still modify the time during the creation process.
                    </div>
                </div>
            },
            onConfirm: (close: any) => {
                router.push(`/event/${eventGroup.username}/create?set_start_time=${selected_time_start.toISOString()}&set_end_time=${selected_time_end.toISOString()}&set_timezone=${timezoneSelected[0].id}`)
                close()
            },
        })
    }

    return <div>
        <ScheduleHeader group={eventGroup} params={genHref({
            date: presetDate,
            tag: selectedTags.join(',')
        })}/>
        <div id={'calendar'} className={styles['schedule-x']} ref={calendarRef}></div>
    </div>
}

export default ComponentName

export const getServerSideProps: any = (async (context: any) => {
    const groupname = context.params?.groupname
    if (groupname) {
        const group = await getGroups({username: groupname})
        const eventSite = await getEventSide(group[0].id)
        return {props: {group: group[0], eventSite: eventSite}}
    }
})

