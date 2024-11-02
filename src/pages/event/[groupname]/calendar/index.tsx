import {
    Event as SolarEvent,
    EventSites,
    getEventSide,
    getGroups,
    Group,
    queryEventDetail,
    queryScheduleEvent
} from "@/service/solas";
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
import {EventPopup} from "@/components/compose/EventPopup/EventPopup";

import * as dayjsLib from "dayjs";
import timezoneList from "@/utils/timezone";
import {getLabelColor} from "@/hooks/labelColor";
import {isHideLocation} from "@/global_config";
import fetch from "@/utils/fetch";

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

const getInterval = (timeZone: string, selectedDate?: string, view?:string) => {
    const now = selectedDate ? dayjs.tz(selectedDate?.replace('-', '/'), timeZone) : dayjs.tz(new Date().getTime(), timeZone)

    // const timeStr = `${now.year()}-${now.month() + 1}-${now.date()} 00:00`
    // const _nowZero = dayjs(timeStr, timeZone)
    if (view === 'day') {
        return  {
            start: now.startOf('day'),
            end: now.endOf('day')
        }
    } else {
        // return  {
        //     start: fixNow.startOf('month').subtract(7, 'day').startOf('day'),
        //     end: fixNow.add(1, 'month').add(7, 'day').endOf('day')
        // }
        return  {
            start: now.startOf('month').subtract(7, 'day').startOf('day'),
            end: now.add(1, 'month').add(7, 'day').endOf('day')
        }
    }
}

function ComponentName(props: { group: Group, eventSite: EventSites[] }) {
    const eventGroup = props.group
    const calendarRef = useRef<any>(null)
    const scheduleXRef = useRef<any>(null)
    const {openConfirmDialog, openDialog, showLoading} = useContext(DialogsContext)
    const {user} = useContext(userContext)
    const formatTime = useTime()
    const router = useRouter()
    const searchParams = useSearchParams()

    const [timezoneSelected, setTimezoneSelected] = useState<{ label: string, id: string }[]>([])
    const [presetDate, setPresetDate] = useState<string>(searchParams?.get('date') || '')
    const [view, setView] = useState<string>(searchParams?.get('view') || 'month')

    let presetTag = searchParams?.get('tag')
    let presetVenue = searchParams?.get('venue')
    const [selectedTags, setSelectedTags] = useState<string[]>(presetTag ? presetTag.split(',') : [])
    const [venue, setVenue] = useState<number[]>(presetVenue ? presetVenue.split(',').map(i => Number(i)) : [])


    useEffect(() => {
        try {
            const localTimezone = dayjs.tz.guess()
            if (props.group.timezone) {
                const displayTimezone = props.group.timezone === 'UTC' ? localTimezone : props.group.timezone
                setTimezoneSelected([{
                    id: displayTimezone,
                    label: timezoneList.find(item => item.id === displayTimezone)!.label
                }])
            } else {
                const timezoneInfo = timezoneList.find(item => item.id === localTimezone) || {
                    id: 'UTC',
                    label: 'UTC+00:00'
                }
                setTimezoneSelected([timezoneInfo])
            }
        } catch (e: any) {
            console.error(e)
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
        ;(async ()=> {
            if (typeof window !== 'undefined' && timezoneSelected[0] ) {
                const unload = showLoading()
                const {start, end} = getInterval(timezoneSelected[0].id, presetDate, view)
                const apiSearchParams = new URLSearchParams()
                apiSearchParams.set('group_id', props.group.id.toString())
                apiSearchParams.set('limit', '1000')
                apiSearchParams.set('timezone', timezoneSelected[0].id)
                apiSearchParams.set('start_date', start.format('YYYY-MM-DD'))
                apiSearchParams.set('end_date', end.format('YYYY-MM-DD'))
                !!selectedTags.length && apiSearchParams.set('tags', selectedTags.join(','))
                !!venue.length && apiSearchParams.set('venue_id', venue[0].toString())
                if (user.authToken) {
                    apiSearchParams.set('auth_token', user.authToken)
                }
                const url = `${process.env.NEXT_PUBLIC_EVENT_LIST_API}/event/list?${apiSearchParams.toString()}`
                const res = await fetch.get({url})

                const eventList = res.data.events.map((event: SolarEvent) => {
                    let host = [event.owner.username]
                    if (event.event_roles && event.event_roles.length > 0) {
                        const groupHostRole = event.event_roles.find((role: any) => role.role === 'group_host')
                        if (!!groupHostRole) {
                            host = [groupHostRole.nickname]
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
                unload()

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
                                    value: 0
                                },
                                ...(props.eventSite || []).map((venue) => {
                                    return {
                                        label: `<div class="${styles['drop-list']}">${venue.title}</div>`,
                                        value: venue.id
                                    }
                                })
                            ],
                            onClick: (value: number[]) => {
                                setVenue(value)
                            },
                            placeholder: 'Venues',
                            multiple: false,
                            defaultValue: venue
                        } : undefined

                    const customMenus = [customTagFilter, venueFilter].filter(Boolean)
                    // const customMenus = customTagFilter ? [customTagFilter] : undefined

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
                            onSelectedDateUpdate(date: string) {
                               if (scheduleXRef.current) {
                                      scheduleXRef.current.events.set([])
                               }
                               setTimeout(() => {
                                   setPresetDate(date)
                               }, 100)
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

                            },
                            onEventClick(calendarEvent: any) {
                                console.log('onEventClick', calendarEvent)
                                const unload = showLoading()
                                queryEventDetail({id: calendarEvent.event.id})
                                    .then(e => {
                                        unload()
                                        openDialog({
                                            content: (close: any) => {
                                                return <EventPopup close={close} event={e}
                                                                   timezone={timezoneSelected[0].id}/>
                                            },
                                            size: [450, 'auto'],
                                            position: 'bottom',
                                        })
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
            }

            return () => {
                const container = document.querySelector('.sx__view-container')
                if (scheduleXRef.current && container) {
                    container.removeEventListener('scroll', toggleFullDayEvent)
                }
            }
        })()
    }, [timezoneSelected, selectedTags, venue, user, presetDate])


    useEffect(() => {
        history.replaceState(null, '', genHref({date: presetDate, tag: selectedTags.join(','), view, venue: venue.join(',')}))
    }, [selectedTags, presetDate, view])

    const genHref = ({date, tag, view, venue}: { date?: string, tag?: string, view?: string, venue?: string }): string => {
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
        if (venue) {
            query.set('venue', venue)
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
            venue: venue.join(','),
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

