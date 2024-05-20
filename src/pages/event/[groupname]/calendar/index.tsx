import {Event as SolarEvent, EventSites, getEventSide, getGroups, Group, queryEvent} from "@/service/solas";
import {useContext, useEffect, useRef, useState} from "react";
import {createCalendar, viewDay, viewMonthAgenda, viewMonthGrid, viewWeek} from '@/libs/schedule-x-calendar/core'
import {createEventModalPlugin} from '@schedule-x/event-modal'
import '@schedule-x/theme-default/dist/index.css'
import '@/libs/schedule-x-calendar/view-selection.scss'
import styles from '../schedule/schedulenew.module.scss'
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import useTime from "@/hooks/formatTime";
import {useRouter} from "next/navigation";
import userContext from "@/components/provider/UserProvider/UserContext";
import {createEventsServicePlugin} from '@schedule-x/events-service'
import { createCurrentTimePlugin } from '@schedule-x/current-time'
import { createScrollControllerPlugin } from '@schedule-x/scroll-controller'
import ScheduleHeader from "@/components/base/ScheduleHeader";
import {useSearchParams} from "next/navigation";

import * as dayjsLib from "dayjs";
import timezoneList from "@/utils/timezone";
import {getLabelColor} from "@/hooks/labelColor";

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
    const {openConfirmDialog} = useContext(DialogsContext)
    const {user} = useContext(userContext)
    const formatTime = useTime()
    const router = useRouter()
    const searchParams = useSearchParams()

    const [timezoneSelected, setTimezoneSelected] = useState<{ label: string, id: string }[]>([])
    const [tag, setTag] = useState<string>('')
    const [venue, setVenue] = useState<number>(0)

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

    const createEvent = (dateTime: string) => {
        const hasEventModal = document.querySelector('#calendar .sx__event-modal')
        if (hasEventModal) return

        const time = new Date(dateTime)
        time.setMinutes(0, 0)

        const selected_time_start = dayjs.tz(dateTime, timezoneSelected[0].id).minute(0).second(0).toDate() // 2024-01-01 12:37
        const selected_time_end = dayjs.tz(dateTime, timezoneSelected[0].id).minute(30).second(0).toDate()

        openConfirmDialog({
            confirmLabel: 'Create Event',
            confirmTextColor: '#000',
            title: 'Create Event',
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

    useEffect(() => {
        if (timezoneSelected[0]) {
            const dayList = getCalendarData(timezoneSelected[0].id)

            queryEvent({
                group_id: eventGroup.id,
                start_time_from: new Date(dayList[0].timestamp).toISOString(),
                start_time_to: new Date(dayList[dayList.length - 1].timestamp).toISOString(),
                page: 1,
                tag: tag || undefined,
                event_order: 'asc',
                page_size: 1000,
                event_site_id: venue || undefined
            }).then(res => {
                const eventList = res.map((event: SolarEvent) => {
                    let host = [event.owner.username]
                    if (event.host_info) {
                        const _host = JSON.parse(event.host_info)
                        if (_host.group_host) {
                            host = [_host.group_host.username]
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
                        location: event.location,
                        calendarId: calendarId,
                    }
                })


                if (scheduleXRef.current) {
                    scheduleXRef.current.events.set(eventList)
                } else {
                    let calendars: any = {
                        sola: {
                            colorName: 'sola',
                            lightColors: {
                                main: '#6CD7B2',
                                container: '#f7ffeb',
                                onContainer: '#594800',
                            },
                            darkColors: {
                                main: '#6CD7B2',
                                onContainer: '#f7ffeb',
                                container: '#a29742',
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
                                    onContainer: getLabelColor(tag),
                                },
                                darkColors: {
                                    main: getLabelColor(tag),
                                    container: getLabelColor(tag),
                                    onContainer: getLabelColor(tag),
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
                                ...(eventGroup.event_tags || []).map((tag: string) => {
                                    return {
                                        label: `<div class="${styles['drop-list']}"><i style="background: ${getLabelColor(tag)}" ></i>${tag}</div>`,
                                        value: tag
                                    }
                                })
                            ],
                            onClick: (value: { label: string, value: any }) => {
                                setTag(value.value)
                            },
                            defaultSelectedIndex: 0
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
                            defaultSelectedIndex: 0
                        } : undefined

                    const customMenus = [customTagFilter, venueFilter].filter(Boolean)

                    const presetDate = searchParams?.get('date')

                    const selectedDate = presetDate ?
                        dayjs.tz(presetDate, timezoneSelected[0].id).format('YYYY-MM-DD'):
                        dayjs.tz(new Date().getTime(), timezoneSelected[0].id).format('YYYY-MM-DD')

                    scheduleXRef.current = createCalendar({
                        views: [viewMonthGrid, viewMonthAgenda, viewDay, viewWeek],
                        minDate: dayjs.tz(dayList[0].timestamp, timezoneSelected[0].id).format('YYYY-MM-DD'),
                        maxDate: dayjs.tz(dayList[dayList.length - 1].timestamp, timezoneSelected[0].id).format('YYYY-MM-DD'),
                        selectedDate: selectedDate,
                        plugins: [
                            createEventModalPlugin(),
                            createEventsServicePlugin(),
                            createCurrentTimePlugin(),
                            createScrollControllerPlugin({
                                initialScroll: '07:50',
                            })
                        ]
                        ,
                        calendars,
                        defaultView: 'week',
                        events: eventList as any,
                        customMenus: customMenus.length ? customMenus : undefined,
                        callbacks: {
                            onClickDateTime(dateTime: string) {
                                createEvent(dateTime)
                            }
                        },
                    } as any)
                    scheduleXRef.current.render(calendarRef.current)

                    const showEvent = searchParams?.get('event')
                    if(showEvent) {
                        setTimeout(() => {
                            // const eventTarget = document.querySelector(`div[data-event-id="${showEvent}"]`);
                            // (window as any).eventTarget = document.querySelector(`div[data-event-id="${showEvent}"]`)
                            // eventTarget?.dispatchEvent(new Event('click'))
                            // console.log('eventTarget', eventTarget)
                        }, 1000)
                    }
                }
            })
        }
    }, [timezoneSelected, tag, venue])

    return <div>
        <ScheduleHeader group={eventGroup}/>
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

