import {Event, getGroups, Group, queryEvent} from "@/service/solas";
import {useEffect, useRef, useState} from "react";
import {createCalendar, viewDay, viewMonthAgenda, viewMonthGrid, viewWeek} from '@schedule-x/calendar'
import {createEventModalPlugin} from '@schedule-x/event-modal'
import '@schedule-x/theme-default/dist/index.css'
import styles from '../schedule/schedulenew.module.scss'

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

function ComponentName(props: { group: Group }) {
    const eventGroup = props.group
    const calendarRef = useRef<any>(null)

    const [timezoneSelected, setTimezoneSelected] = useState<{ label: string, id: string }[]>([])


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

    useEffect(() => {
        if (timezoneSelected[0]) {
            const dayList = getCalendarData(timezoneSelected[0].id)

           queryEvent({
                group_id: eventGroup.id,
                start_time_from: new Date(dayList[0].timestamp).toISOString(),
                start_time_to: new Date(dayList[dayList.length - 1].timestamp).toISOString(),
                page: 1,
                event_order: 'asc',
                page_size: 1000
            }).then(res => {
                const eventList = res.map((event: Event) => {
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
                                container: getLabelColor(tag,  0.8),
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

                console.log('calendars', calendars)
                const selectedDate = dayjs.tz(new Date().getTime(), timezoneSelected[0].id).format('YYYY-MM-DD')
                const calendar = createCalendar({
                    views: [viewMonthGrid, viewMonthAgenda, viewDay, viewWeek],
                    minDate: dayjs.tz(dayList[0].timestamp, timezoneSelected[0].id).format('YYYY-MM-DD'),
                    maxDate: dayjs.tz(dayList[dayList.length - 1].timestamp, timezoneSelected[0].id).format('YYYY-MM-DD'),
                    selectedDate: selectedDate,
                    plugins: [createEventModalPlugin()],
                    calendars,
                    events: eventList as any,
                } as any)

                calendar.render(calendarRef.current)
            })
        }
    }, [timezoneSelected])

    return <div id={'calendar'} className={styles['schedule-x']} ref={calendarRef}></div>
}

export default ComponentName

export const getServerSideProps: any = (async (context: any) => {
    const groupname = context.params?.groupname
    if (groupname) {
        const group = await getGroups({username: groupname})
        return {props: {group: group[0]}}
    }
})

