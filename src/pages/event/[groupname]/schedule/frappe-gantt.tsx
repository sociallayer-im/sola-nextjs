import {Event, getGroups, Group, queryEvent} from "@/service/solas";
import {useEffect, useRef, useState} from "react";
import styles from './schedulenew.module.scss';
import Gantt from '@/libs/frappe-fantt/index'
import AppButton from "@/components/base/AppButton/AppButton";

import * as dayjsLib from "dayjs";
import timezoneList from "@/utils/timezone";

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
    const _from = now.subtract(3, 'day')


    // 获得 from 和 to  之间所以天0点的时间戳数组
    const dayArray = []
    for (let i = 0; i < 7; i++) {
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

function Gan(props: { group: Group }) {
    const eventGroup = props.group
    const calendarRef = useRef<any>(null)
    const ganttRef = useRef<any>(null)

    const [timezoneSelected, setTimezoneSelected] = useState<{ label: string, id: string }[]>([])


    useEffect(()=> {
        try {
            const historyTimeZone = localStorage.getItem('schedule-timezone')
            if (historyTimeZone) {
                setTimezoneSelected(JSON.parse(historyTimeZone))
            } else {
                const localTimezone = dayjs.tz.guess()
                const timezoneInfo = timezoneList.find(item => item.id === localTimezone) || {
                    id: 'UTC',
                    label: 'UTC+00:00'
                }
                setTimezoneSelected([timezoneInfo])
            }
        } catch (e: any) { }
    }, [])

    useEffect(() => {
        if (timezoneSelected[0]) {
            const dayList = getCalendarData(timezoneSelected[0].id)
            const start = dayjs.tz(new Date().getTime(), timezoneSelected[0].id).startOf('week').toISOString()
            const end = dayjs.tz(new Date().getTime(), timezoneSelected[0].id).endOf('week').toISOString()

            console.log('start', start)
            console.log('end', end)

         queryEvent({
                group_id: eventGroup.id,
                start_time_from: dayjs.tz(new Date().getTime(), timezoneSelected[0].id).startOf('month').toISOString(),
                start_time_to: dayjs.tz(new Date().getTime(), timezoneSelected[0].id).endOf('month').toISOString(),
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

                    let progress = 0
                    if (new Date() > new Date(event.start_time!) && new Date() < new Date(event.end_time!)) {
                        progress = (new Date().getTime() - new Date(event.start_time!).getTime()) / (new Date(event.end_time!).getTime() - new Date(event.start_time!).getTime()) * 100
                    } else if (new Date() > new Date(event.end_time!)) {
                        progress = 100
                    }

                    return {
                        id: event.id.toString(),
                        name: event.title,
                        // name: dayjs.tz(new Date(event.start_time!).getTime(), timezoneSelected[0].id).format('YYYY-MM-DD HH:mm') + ' - ' + dayjs.tz(new Date(event.end_time!).getTime(), timezoneSelected[0].id).format('YYYY-MM-DD HH:mm'),
                        start: dayjs.tz(new Date(event.start_time!).getTime(), timezoneSelected[0].id).format('YYYY-MM-DD HH:mm'),
                        end: dayjs.tz(new Date(event.end_time!).getTime(), timezoneSelected[0].id).format('YYYY-MM-DD HH:mm'),
                        progress: progress
                    }
                })

             ganttRef.current = new Gantt('#gantt', eventList, {
                    view_mode: 'Quarter Day',
                })
            })
        }
    }, [timezoneSelected])

    return <div>
        <div className={styles['gant-menu']}>
            <AppButton size={'compact'} onClick={e => {ganttRef.current && ganttRef.current.change_view_mode('Quarter Day')}}>Hour</AppButton>
            <AppButton size={'compact'} onClick={e => {ganttRef.current && ganttRef.current.change_view_mode('Day')}}>Day</AppButton>
            <AppButton size={'compact'} onClick={e => {ganttRef.current && ganttRef.current.change_view_mode('Month')}}>Month</AppButton>
        </div>
       <div className={styles['gantt-warp']}>
           <svg id={'gantt'} className={styles['gantt']} />
       </div>
    </div>
}

export default Gan

export const getServerSideProps: any = (async (context: any) => {
    const groupname = context.params?.groupname
    if (groupname) {
        const group = await getGroups({username: groupname})
        return {props: {group: group[0]}}
    }
})

