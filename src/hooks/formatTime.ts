import {useContext} from "react";
import LangContext from "../components/provider/LangProvider/LangContext";
import * as dayjsLib from 'dayjs'

const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const dayjs: any = dayjsLib
dayjs.extend(utc)
dayjs.extend(timezone)

export const formatTime = (dateString: string) => {
    const dateObject = new Date(dateString)
    const year = dateObject.getFullYear() + ''
    const mon = dateObject.getMonth() + 1 + ''
    const date = dateObject.getDate() + ''
    const hour = dateObject.getHours() + ''
    const min = dateObject.getMinutes() + ''
    return `${year}.${mon.padStart(2, '0')}.${date.padStart(2, '0')} ${hour.padStart(2, '0')}:${min.padStart(2, '0')}`
}

export const formatTimeWithTimezone = (dateString: string, timezone: string) => {
    const diff = dayjs.tz('2023-01-01 00:00', timezone).diff(dayjs.tz('2023-01-01 00:00'), 'millisecond')
    return dayjs(new Date(new Date(dateString).getTime() - diff).toString()).format("YYYY.MM.DD HH:mm")
}

function useTime () {
    const {lang} = useContext(LangContext)

    return (dateString: string, langType?: string) => {
        // format like:THU, SEP 26 AT 9 PM
        const dateObject = new Date(dateString)
        const isToday = new Date().toDateString() === dateObject.toDateString()
        const isTomorrow = new Date().toDateString() === new Date(dateObject.getTime() - 24 * 60 * 60 * 1000).toDateString()

        const week = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
        const month = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL',
            'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
        const mon = month[dateObject.getMonth()]
        const date = dateObject.getDate() + ''
        const hour = dateObject.getHours() >  12 ? dateObject.getHours() - 12 + '' : dateObject.getHours() + ''
        const min = dateObject.getMinutes() + ''
        const amOrPm = dateObject.getHours() >= 12 ? 'PM' : 'AM'

        const todayText = lang['Event_Today']
        const tomorrowText = lang['Event_Tomorrow']

        if (isToday) {
            return `${todayText} ${hour.padStart(2, '0')}:${min.padStart(2, '0')} ` + amOrPm
        } else if (isTomorrow) {
            return `${tomorrowText} ${hour.padStart(2, '0')}:${min.padStart(2, '0')} ` + amOrPm
        } else {
            return `${week[dateObject.getDay()]}, ${mon} ${date.padStart(2, '0')}, ${hour.padStart(2, '0')}:${min.padStart(2, '0')} `  + amOrPm
        }
    }
}

export default useTime
