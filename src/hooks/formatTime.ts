import {useContext} from "react";
import LangContext from "../components/provider/LangProvider/LangContext";
import * as dayjsLib from 'dayjs'

const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const dayjs: any = dayjsLib
dayjs.extend(utc)
dayjs.extend(timezone)

export const formatTime = (dateString: string) => {
    dateString = dateString.endsWith('Z') ? dateString : dateString + 'Z'

    const dateObject = new Date(dateString)
    const year = dateObject.getFullYear() + ''
    const mon = dateObject.getMonth() + 1 + ''
    const date = dateObject.getDate() + ''
    const hour = dateObject.getHours() + ''
    const min = dateObject.getMinutes() + ''
    return `${year}.${mon.padStart(2, '0')}.${date.padStart(2, '0')} ${hour.padStart(2, '0')}:${min.padStart(2, '0')}`
}

export const formatTimeWithTimezone = (dateString: string, timezone: string) => {
    if (process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'vitalia') {
        timezone = 'America/Tegucigalpa'
    }

    const localeTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    dateString = dateString.endsWith('Z') ? dateString : dateString + 'Z'
    const offse1 = dayjs.tz(new Date(dateString).getTime() , localeTimezone).utcOffset()
    const offse2 = dayjs.tz(new Date(dateString).getTime(), timezone).utcOffset()
    const diff = (offse1 - offse2) * 60 * 1000
    return dayjs(new Date(new Date(dateString).getTime() - diff).toString()).format("YYYY.MM.DD HH:mm")

    // dateString = dateString.endsWith('Z') ? dateString : dateString + 'Z'
    // const diff = dayjs.tz(new Date(dateString).getTime(), timezone).diff(new Date(dateString).getTime(), 'millisecond')
    // return dayjs(new Date(new Date(dateString).getTime() + diff).toString()).format("YYYY.MM.DD HH:mm")
}

function useTime() {
    const {lang} = useContext(LangContext)

    return (dateString: string, timezone?: string) => {
        dateString = dateString.endsWith('Z') ? dateString : dateString + 'Z'
        // format like:THU, SEP 26 AT 9 PM
        const dateObject = new Date(dateString)
        const isToday = new Date().toDateString() === dateObject.toDateString()
        const isTomorrow = new Date().toDateString() === new Date(dateObject.getTime() - 24 * 60 * 60 * 1000).toDateString()

        const week = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
        const month = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL',
            'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
        const mon = month[dateObject.getMonth()]
        const date = dateObject.getDate() + ''
        const hour = dateObject.getHours() > 12 ? dateObject.getHours() - 12 + '' : dateObject.getHours() + ''
        const min = dateObject.getMinutes() + ''
        const amOrPm = dateObject.getHours() >= 12 ? 'PM' : 'AM'

        const todayText = lang['Event_Today']
        const tomorrowText = lang['Event_Tomorrow']

        if (isToday) {
            return `${todayText} ${hour.padStart(2, '0')}:${min.padStart(2, '0')} ` + amOrPm
        } else if (isTomorrow) {
            return `${tomorrowText} ${hour.padStart(2, '0')}:${min.padStart(2, '0')} ` + amOrPm
        } else {
            return `${week[dateObject.getDay()]}, ${mon} ${date.padStart(2, '0')}, ${hour.padStart(2, '0')}:${min.padStart(2, '0')} ` + amOrPm
        }
    }
}

export function useTime2() {
    const {lang} = useContext(LangContext)

    return (dateString: string, timezone?: string) => {
        dateString = dateString.endsWith('Z') ? dateString : dateString + 'Z'
        timezone = timezone || 'UTC'

        if (process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'vitalia') {
            timezone = 'America/Tegucigalpa'
        }

        // format like:THU, SEP 26 AT 9 PM
        const target = dayjs.tz(new Date(dateString).getTime(), timezone)
        const now = dayjs.tz(new Date().getTime(), timezone)
        const isToday = target.date() === now.date() && target.month() === now.month() && target.year() === now.year()
        const isTomorrow = target.date() - now.date() === 1 && target.month() === now.month() && target.year() === now.year()

        const week = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
        const month = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL',
            'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
        const mon = month[target.month()]
        const date = target.date() + ''
        const hour = target.hour() + ''
        const min = target.minute() + ''
        const amOrPm = target.hour() >= 12 ? 'PM' : 'AM'

        const todayText = lang['Event_Today']
        const tomorrowText = lang['Event_Tomorrow']

        const utcOffset = target.utcOffset() >= 0 ?
            '+' + target.utcOffset() / 60 :
            target.utcOffset() / 60

        if (isToday) {
            return `${todayText} ${hour.padStart(2, '0')}:${min.padStart(2, '0')} `  + ' GMT' + utcOffset
        } else if (isTomorrow) {
            return `${tomorrowText} ${hour.padStart(2, '0')}:${min.padStart(2, '0')} ` + ' GMT' + utcOffset
        } else {
            return `${week[target.day()]}, ${mon} ${date.padStart(2, '0')}, ${hour.padStart(2, '0')}:${min.padStart(2, '0')} ` + ' GMT' + utcOffset
        }
    }
}

export function useTime3() {
    const {lang, langType} = useContext(LangContext)

    return (from: string, to: string, timezone: string = 'UTC') => {
        const fromStr = from.endsWith('Z') || !from.includes(":") ? from : from + 'Z'
        const toStr = to.endsWith('Z') || !from.includes(":") ? to : to + 'Z'

        if (process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'vitalia') {
            timezone = 'America/Tegucigalpa'
        }

        const fromDate = dayjs.tz(new Date(fromStr).getTime(), timezone)
        const toDate = dayjs.tz(new Date(toStr).getTime(), timezone)

        const now = dayjs.tz(new Date().getTime(), timezone)
        const isToday = fromDate.date() === now.date() && fromDate.month() === now.month() && fromDate.year() === now.year()
        const isTomorrow = fromDate.date() - now.date() === 1 && fromDate.month() === now.month() && fromDate.year() === now.year()

        const f_mon = lang['Month_Name'][fromDate.month()].toUpperCase()
        const f_date = fromDate.date() + ''
        const f_hour = fromDate.hour() + ''
        const f_min = fromDate.minute() + ''
        const f_year = fromDate.year() + ''
        const f_day = lang['Day_Name'][fromDate.day()]

        const t_mon = lang['Month_Name'][toDate.month()].toUpperCase()
        const t_date = toDate.date() + ''
        const t_hour = toDate.hour() + ''
        const t_min = toDate.minute() + ''
        const t_year = toDate.year() + ''
        const t_day = lang['Day_Name'][toDate.day()]


        const differentYear = f_year !== t_year
        const differentMonth = t_mon !== f_mon || differentYear
        const differentDate = t_date !== f_date || differentMonth || differentYear


        const utcOffset = fromDate.utcOffset() >= 0 ?
            '+' + fromDate.utcOffset() / 60 :
            fromDate.utcOffset() / 60

        const todayOrTomorrow = isToday ?
            lang['Event_Today'] + ' ' :
            isTomorrow ?
                lang['Event_Tomorrow'] + ' ':
                ''

        return {
            data: langType === 'cn'
                ? `${differentYear ? ' ' + f_year + ',': ''} ${todayOrTomorrow}${f_mon}${f_date.padStart(2, '0')}日 ${differentDate ? "" : f_day}${differentDate ? `- ${differentYear ? ' ' + t_year + ',': ''}${differentMonth ? t_mon : '' } ${t_date.padStart(2, '0')}日` : ''}`
                : `${todayOrTomorrow}${f_day}, ${f_mon} ${f_date.padStart(2, '0')}${differentYear ? ' ,' + f_year : ''} ${differentDate ? `- ${t_day}, ${t_mon} ${t_date.padStart(2, '0')}${differentYear ? ' ,' + t_year: ''}` : ''}`,

            time: `${f_hour.padStart(2, '0')}:${f_min.padStart(2, '0')} — ${t_hour.padStart(2, '0')}:${t_min.padStart(2, '0')}  GMT${utcOffset}`
        }
    }
}

export function useTime4 (from: string, to: string, timezone: string = 'UTC') {
    const fromStr = from.endsWith('Z') ? from : from + 'Z'
    const toStr = to.endsWith('Z') ? to : to + 'Z'


    if (process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'vitalia') {
        timezone = 'America/Tegucigalpa'
    }

    const fromDate = dayjs.tz(new Date(fromStr).getTime(), timezone)
    const toDate = dayjs.tz(new Date(toStr).getTime(), timezone)

    const now = dayjs.tz(new Date().getTime(), timezone)
    const isToday = fromDate.date() === now.date() && fromDate.month() === now.month() && fromDate.year() === now.year()
    const isTomorrow = fromDate.date() - now.date() === 1 && fromDate.month() === now.month() && fromDate.year() === now.year()

    const week = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
    const month = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL',
        'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

    const f_mon = month[fromDate.month()].toUpperCase()
    const f_date = fromDate.date() + ''
    const f_hour = fromDate.hour() + ''
    const f_min = fromDate.minute() + ''
    const f_year = fromDate.year() + ''
    const f_day = week[fromDate.day()]

    const t_hour = toDate.hour() + ''
    const t_min = toDate.minute() + ''

    const utcOffset = fromDate.utcOffset() >= 0 ?
        '+' + fromDate.utcOffset() / 60 :
        fromDate.utcOffset() / 60

    const todayOrTomorrow = isToday ?
        'Today' + ' ' :
        isTomorrow ?
            'Tomorrow' + ' ':
            ''

    return {
        data: `${todayOrTomorrow}${f_day}, ${f_mon} ${f_date.padStart(2, '0')}, ${f_year}`,
        time: `${f_hour.padStart(2, '0')}:${f_min.padStart(2, '0')} — ${t_hour.padStart(2, '0')}:${t_min.padStart(2, '0')}  GMT${utcOffset}`
    }
}

export default useTime
