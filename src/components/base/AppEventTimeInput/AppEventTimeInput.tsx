import {useContext, useEffect, useRef, useState} from 'react'
import {DatePicker, TimePicker} from "baseui/datepicker";
import LangContext from "../../provider/LangProvider/LangContext";
import Toggle from "../Toggle/Toggle";
import {Select} from "baseui/select";
import timezoneList, {locateTimeTransfer} from "@/utils/timezone";
import * as dayjsLib from 'dayjs'

const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const dayjs: any = dayjsLib
dayjs.extend(utc)
dayjs.extend(timezone)


export function mapTimezone(value: any) {
    const target =  timezoneList.find((item) => {
        return item.id === value
    })

    if (!target) return {id: 'UTC', label: 'UTC (GMT+0:00)'}
    return target
}

function output (date: Date, timezone: string) {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = date.getHours()
    const minute = date.getMinutes()

    const str =  `${year}-${month}-${day} ${hours}:${minute}`
    return dayjs.tz(str, timezone).toISOString()
}

function input (dateStr: string, timezone: string ) {
    const date = new Date(dateStr)
    const diff = dayjs.tz('2023-01-01 00:00', timezone).diff(dayjs.tz('2023-01-01 00:00', localeTimezone), 'millisecond')
    return new Date(date.getTime() - diff)
}

const localeTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

interface AppDateInputProps {
    from: string
    to: string
    repeat?: string,
    arrowRepeat?: boolean,
    timezone: string,
    onChange: (value: {
        from: string,
        to: string,
        repeat: string,
        timezone: string,
        repeatEndingTime: string }) => any
}

function AppDateInput({arrowRepeat = true, ...props}: AppDateInputProps) {
    const {lang} = useContext(LangContext)
    const [from, setFrom] = useState(input(props.from, props.timezone))
    const [to, setTo] = useState(input(props.to, props.timezone))
    const [allDay, setAllDay] = useState(false)
    const [timezone, setTimezone] = useState([mapTimezone(props.timezone)])
    const history = useRef<[Date, Date]>([from, to])

    const repeatOptions: any = [
        {label: lang['Form_Repeat_Not'], id: ''},
        {label: lang['Form_Repeat_Day'], id: "day"},
        {label: lang['Form_Repeat_Week'], id: "week"},
        {label: lang['Form_Repeat_Month'], id: "month"},
    ]

    let repeatDefault: { label: string, id: string }[] = [repeatOptions[0]]
    const [repeat, setRepeat] = useState<{ label: string, id: string }[]>(repeatDefault)

    function calculateDuration(start: Date, end: Date) {
        const duration = end.getTime() - start.getTime()
        if (allDay) {
            return Math.ceil(duration / (1000 * 60 * 60 * 24)) + lang['Days']
        } else {
            return Math.floor(duration / (1000 * 60)) + lang['Minute']
        }
    }

    function showDate(data: Date) {
        const month = data.getMonth()
        const day = data.getDay()
        const date = data.getDate()

        const monthName = lang['Month_Name']
        const dayName = lang['Day_Name']
        return dayName[day] + ', ' + monthName[month] + ' ' + date
    }

    function changeFromDate(date: Date) {
        const year = date.getFullYear()
        const mouth = date.getMonth()
        const day = date.getDate()

        const hour = from.getHours()
        const minute = from.getMinutes()

        const newDate = new Date(year, mouth, day, hour, minute)
        setFrom(newDate)
        if (!allDay) {
            const toHour = to.getHours()
            const toMinute = to.getMinutes()
            const _date = new Date(year, mouth, day, toHour, toMinute)
            changeToDate(_date)
        }
    }

    function changeToDate(date: Date) {
        const year = date.getFullYear()
        const mouth = date.getMonth()
        const toDate = date.getDate()

        const fromDay = from.getDate()

        if (toDate === fromDay) {
            const newDate = new Date(year, mouth, fromDay, 23, 59)
            setTo(newDate)
        } else {
            setTo(date)
        }
    }

    function changeFromTime(date: Date) {
        setFrom(date)

        const fromYear = date.getFullYear()
        const fromMouth = date.getMonth()
        const formDay = date.getDate()

        const toHour = to.getHours()
        const toMinute = to.getMinutes()


        const _date = new Date(fromYear, fromMouth, formDay, toHour, toMinute)

        if (date.getTime() < _date.getTime()) {
            setTo(_date)
        } else {
            setTo(new Date(fromYear, fromMouth, formDay + 1, toHour, toMinute))
        }
    }

    function changeToTime(date: Date) {
        const year = from.getFullYear()
        const mouth = from.getMonth()
        const day = from.getDate()

        const toHour = date.getHours()
        const toMinute = date.getMinutes()
        const fromHour = from.getHours()
        const fromMinute = from.getMinutes()


        const newDate_1 = new Date(year, mouth, day, fromHour, fromMinute)
        const newDate_2 = new Date(year, mouth, day, toHour, toMinute)

        if (newDate_2.getTime() > newDate_1.getTime()) {
            setTo(newDate_2)
        } else {
            const newDate = new Date(year, mouth, day + 1, toHour, toMinute)
            setTo(newDate)
        }
    }

    useEffect(() => {
        // repeatEndingTime 是to的一年后
        const toTime = new Date(output(to, timezone[0]!.id))
        const repeatEndingTime = new Date(toTime.getFullYear() + 1, toTime.getMonth(), toTime.getDate(), toTime.getHours(), toTime.getMinutes()).toISOString()
        const res = {
            from: output(from, timezone[0]!.id),
            to: output(to, timezone[0]!.id),
            repeat: repeat[0]!.id,
            repeatEndingTime,
            timezone: timezone[0]!.id
        }


        console.log('duration',res)
        console.log(res.from, '→', res.to, repeat[0]!.id)
        props.onChange(res)
    }, [from, to, repeat, timezone])

    useEffect(() => {
        if ((new Date(props.to).getTime() - new Date(props.from).getTime() + 60000) % 8640000 === 0) {
            setAllDay(true)
        }

        setFrom(input(props.from, props.timezone))
        setTo(input(props.to, props.timezone))
        setTimezone([mapTimezone(props.timezone)])

    }, [props.from, props.to, props.repeat, props.timezone])


    return (<>
        <div className={'app-date-input-v2'}>
            <div className={'date-input'}>
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
                    <path
                        d="M8.17936 9.33398C8.31122 9.33398 8.44011 9.29489 8.54974 9.22163C8.65938 9.14838 8.74482 9.04426 8.79528 8.92244C8.84574 8.80062 8.85894 8.66658 8.83322 8.53726C8.8075 8.40794 8.744 8.28915 8.65077 8.19591C8.55753 8.10268 8.43874 8.03918 8.30942 8.01346C8.1801 7.98774 8.04606 8.00094 7.92424 8.0514C7.80242 8.10186 7.6983 8.1873 7.62505 8.29694C7.5518 8.40657 7.5127 8.53546 7.5127 8.66732C7.5127 8.84413 7.58293 9.0137 7.70796 9.13872C7.83298 9.26375 8.00255 9.33398 8.17936 9.33398ZM11.5127 9.33398C11.6445 9.33398 11.7734 9.29489 11.8831 9.22163C11.9927 9.14838 12.0782 9.04426 12.1286 8.92244C12.1791 8.80062 12.1923 8.66658 12.1666 8.53726C12.1408 8.40794 12.0773 8.28915 11.9841 8.19591C11.8909 8.10268 11.7721 8.03918 11.6428 8.01346C11.5134 7.98774 11.3794 8.00094 11.2576 8.0514C11.1358 8.10186 11.0316 8.1873 10.9584 8.29694C10.8851 8.40657 10.846 8.53546 10.846 8.66732C10.846 8.84413 10.9163 9.0137 11.0413 9.13872C11.1663 9.26375 11.3359 9.33398 11.5127 9.33398ZM8.17936 12.0007C8.31122 12.0007 8.44011 11.9616 8.54974 11.8883C8.65938 11.815 8.74482 11.7109 8.79528 11.5891C8.84574 11.4673 8.85894 11.3332 8.83322 11.2039C8.8075 11.0746 8.744 10.9558 8.65077 10.8626C8.55753 10.7693 8.43874 10.7059 8.30942 10.6801C8.1801 10.6544 8.04606 10.6676 7.92424 10.7181C7.80242 10.7685 7.6983 10.854 7.62505 10.9636C7.5518 11.0732 7.5127 11.2021 7.5127 11.334C7.5127 11.5108 7.58293 11.6804 7.70796 11.8054C7.83298 11.9304 8.00255 12.0007 8.17936 12.0007ZM11.5127 12.0007C11.6445 12.0007 11.7734 11.9616 11.8831 11.8883C11.9927 11.815 12.0782 11.7109 12.1286 11.5891C12.1791 11.4673 12.1923 11.3332 12.1666 11.2039C12.1408 11.0746 12.0773 10.9558 11.9841 10.8626C11.8909 10.7693 11.7721 10.7059 11.6428 10.6801C11.5134 10.6544 11.3794 10.6676 11.2576 10.7181C11.1358 10.7685 11.0316 10.854 10.9584 10.9636C10.8851 11.0732 10.846 11.2021 10.846 11.334C10.846 11.5108 10.9163 11.6804 11.0413 11.8054C11.1663 11.9304 11.3359 12.0007 11.5127 12.0007ZM4.84603 9.33398C4.97788 9.33398 5.10678 9.29489 5.21641 9.22163C5.32604 9.14838 5.41149 9.04426 5.46195 8.92244C5.51241 8.80062 5.52561 8.66658 5.49989 8.53726C5.47416 8.40794 5.41067 8.28915 5.31743 8.19591C5.2242 8.10268 5.10541 8.03918 4.97609 8.01346C4.84677 7.98774 4.71272 8.00094 4.59091 8.0514C4.46909 8.10186 4.36497 8.1873 4.29172 8.29694C4.21846 8.40657 4.17936 8.53546 4.17936 8.66732C4.17936 8.84413 4.2496 9.0137 4.37462 9.13872C4.49965 9.26375 4.66922 9.33398 4.84603 9.33398ZM12.846 2.66732H12.1794V2.00065C12.1794 1.82384 12.1091 1.65427 11.9841 1.52925C11.8591 1.40422 11.6895 1.33398 11.5127 1.33398C11.3359 1.33398 11.1663 1.40422 11.0413 1.52925C10.9163 1.65427 10.846 1.82384 10.846 2.00065V2.66732H5.5127V2.00065C5.5127 1.82384 5.44246 1.65427 5.31743 1.52925C5.19241 1.40422 5.02284 1.33398 4.84603 1.33398C4.66922 1.33398 4.49965 1.40422 4.37462 1.52925C4.2496 1.65427 4.17936 1.82384 4.17936 2.00065V2.66732H3.5127C2.98226 2.66732 2.47355 2.87803 2.09848 3.2531C1.72341 3.62818 1.5127 4.13688 1.5127 4.66732V12.6673C1.5127 13.1978 1.72341 13.7065 2.09848 14.0815C2.47355 14.4566 2.98226 14.6673 3.5127 14.6673H12.846C13.3765 14.6673 13.8852 14.4566 14.2602 14.0815C14.6353 13.7065 14.846 13.1978 14.846 12.6673V4.66732C14.846 4.13688 14.6353 3.62818 14.2602 3.2531C13.8852 2.87803 13.3765 2.66732 12.846 2.66732ZM13.5127 12.6673C13.5127 12.8441 13.4425 13.0137 13.3174 13.1387C13.1924 13.2637 13.0228 13.334 12.846 13.334H3.5127C3.33588 13.334 3.16632 13.2637 3.04129 13.1387C2.91627 13.0137 2.84603 12.8441 2.84603 12.6673V6.66732H13.5127V12.6673ZM13.5127 5.33398H2.84603V4.66732C2.84603 4.49051 2.91627 4.32094 3.04129 4.19591C3.16632 4.07089 3.33588 4.00065 3.5127 4.00065H12.846C13.0228 4.00065 13.1924 4.07089 13.3174 4.19591C13.4425 4.32094 13.5127 4.49051 13.5127 4.66732V5.33398ZM4.84603 12.0007C4.97788 12.0007 5.10678 11.9616 5.21641 11.8883C5.32604 11.815 5.41149 11.7109 5.46195 11.5891C5.51241 11.4673 5.52561 11.3332 5.49989 11.2039C5.47416 11.0746 5.41067 10.9558 5.31743 10.8626C5.2242 10.7693 5.10541 10.7059 4.97609 10.6801C4.84677 10.6544 4.71272 10.6676 4.59091 10.7181C4.46909 10.7685 4.36497 10.854 4.29172 10.9636C4.21846 11.0732 4.17936 11.2021 4.17936 11.334C4.17936 11.5108 4.2496 11.6804 4.37462 11.8054C4.49965 11.9304 4.66922 12.0007 4.84603 12.0007Z"
                        fill="var(--color-text-main)"/>
                </svg>
                <div className={'show-date'}>{showDate(from)}</div>
                <DatePicker
                    minDate={new Date()}
                    value={from}
                    onChange={({date}) => {
                        changeFromDate(Array.isArray(date) ? date : [date][0] as any)
                    }
                    }/>
            </div>

            {!allDay &&
                <div className={'time-input'}>
                    <TimePicker
                        step={60 * 15}
                        value={from}
                        format={'24'}
                        onChange={date => {
                            changeFromTime(date as any)
                        }}/>
                </div>
            }

            <svg className={'arrow'} xmlns="http://www.w3.org/2000/svg" width="16" height="8" viewBox="0 0 16 8"
                 fill="none">
                <path
                    d="M1 3.5C0.723858 3.5 0.5 3.72386 0.5 4C0.5 4.27614 0.723858 4.5 1 4.5L1 3.5ZM15.3536 4.35355C15.5488 4.15829 15.5488 3.84171 15.3536 3.64645L12.1716 0.464466C11.9763 0.269204 11.6597 0.269204 11.4645 0.464466C11.2692 0.659728 11.2692 0.976311 11.4645 1.17157L14.2929 4L11.4645 6.82843C11.2692 7.02369 11.2692 7.34027 11.4645 7.53553C11.6597 7.7308 11.9763 7.7308 12.1716 7.53553L15.3536 4.35355ZM1 4.5L15 4.5V3.5L1 3.5L1 4.5Z"
                    fill="var(--color-text-main)"/>
            </svg>

            {
                !allDay &&
                <div className={'time-input time-input-ending'}>
                    <TimePicker
                        step={60 * 15}
                        value={to}
                        format={'24'}
                        onChange={date => {
                            changeToTime(date as any)
                        }}/>
                </div>
            }


            {
                allDay &&
                <div className={'date-input'}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
                        <path
                            d="M8.17936 9.33398C8.31122 9.33398 8.44011 9.29489 8.54974 9.22163C8.65938 9.14838 8.74482 9.04426 8.79528 8.92244C8.84574 8.80062 8.85894 8.66658 8.83322 8.53726C8.8075 8.40794 8.744 8.28915 8.65077 8.19591C8.55753 8.10268 8.43874 8.03918 8.30942 8.01346C8.1801 7.98774 8.04606 8.00094 7.92424 8.0514C7.80242 8.10186 7.6983 8.1873 7.62505 8.29694C7.5518 8.40657 7.5127 8.53546 7.5127 8.66732C7.5127 8.84413 7.58293 9.0137 7.70796 9.13872C7.83298 9.26375 8.00255 9.33398 8.17936 9.33398ZM11.5127 9.33398C11.6445 9.33398 11.7734 9.29489 11.8831 9.22163C11.9927 9.14838 12.0782 9.04426 12.1286 8.92244C12.1791 8.80062 12.1923 8.66658 12.1666 8.53726C12.1408 8.40794 12.0773 8.28915 11.9841 8.19591C11.8909 8.10268 11.7721 8.03918 11.6428 8.01346C11.5134 7.98774 11.3794 8.00094 11.2576 8.0514C11.1358 8.10186 11.0316 8.1873 10.9584 8.29694C10.8851 8.40657 10.846 8.53546 10.846 8.66732C10.846 8.84413 10.9163 9.0137 11.0413 9.13872C11.1663 9.26375 11.3359 9.33398 11.5127 9.33398ZM8.17936 12.0007C8.31122 12.0007 8.44011 11.9616 8.54974 11.8883C8.65938 11.815 8.74482 11.7109 8.79528 11.5891C8.84574 11.4673 8.85894 11.3332 8.83322 11.2039C8.8075 11.0746 8.744 10.9558 8.65077 10.8626C8.55753 10.7693 8.43874 10.7059 8.30942 10.6801C8.1801 10.6544 8.04606 10.6676 7.92424 10.7181C7.80242 10.7685 7.6983 10.854 7.62505 10.9636C7.5518 11.0732 7.5127 11.2021 7.5127 11.334C7.5127 11.5108 7.58293 11.6804 7.70796 11.8054C7.83298 11.9304 8.00255 12.0007 8.17936 12.0007ZM11.5127 12.0007C11.6445 12.0007 11.7734 11.9616 11.8831 11.8883C11.9927 11.815 12.0782 11.7109 12.1286 11.5891C12.1791 11.4673 12.1923 11.3332 12.1666 11.2039C12.1408 11.0746 12.0773 10.9558 11.9841 10.8626C11.8909 10.7693 11.7721 10.7059 11.6428 10.6801C11.5134 10.6544 11.3794 10.6676 11.2576 10.7181C11.1358 10.7685 11.0316 10.854 10.9584 10.9636C10.8851 11.0732 10.846 11.2021 10.846 11.334C10.846 11.5108 10.9163 11.6804 11.0413 11.8054C11.1663 11.9304 11.3359 12.0007 11.5127 12.0007ZM4.84603 9.33398C4.97788 9.33398 5.10678 9.29489 5.21641 9.22163C5.32604 9.14838 5.41149 9.04426 5.46195 8.92244C5.51241 8.80062 5.52561 8.66658 5.49989 8.53726C5.47416 8.40794 5.41067 8.28915 5.31743 8.19591C5.2242 8.10268 5.10541 8.03918 4.97609 8.01346C4.84677 7.98774 4.71272 8.00094 4.59091 8.0514C4.46909 8.10186 4.36497 8.1873 4.29172 8.29694C4.21846 8.40657 4.17936 8.53546 4.17936 8.66732C4.17936 8.84413 4.2496 9.0137 4.37462 9.13872C4.49965 9.26375 4.66922 9.33398 4.84603 9.33398ZM12.846 2.66732H12.1794V2.00065C12.1794 1.82384 12.1091 1.65427 11.9841 1.52925C11.8591 1.40422 11.6895 1.33398 11.5127 1.33398C11.3359 1.33398 11.1663 1.40422 11.0413 1.52925C10.9163 1.65427 10.846 1.82384 10.846 2.00065V2.66732H5.5127V2.00065C5.5127 1.82384 5.44246 1.65427 5.31743 1.52925C5.19241 1.40422 5.02284 1.33398 4.84603 1.33398C4.66922 1.33398 4.49965 1.40422 4.37462 1.52925C4.2496 1.65427 4.17936 1.82384 4.17936 2.00065V2.66732H3.5127C2.98226 2.66732 2.47355 2.87803 2.09848 3.2531C1.72341 3.62818 1.5127 4.13688 1.5127 4.66732V12.6673C1.5127 13.1978 1.72341 13.7065 2.09848 14.0815C2.47355 14.4566 2.98226 14.6673 3.5127 14.6673H12.846C13.3765 14.6673 13.8852 14.4566 14.2602 14.0815C14.6353 13.7065 14.846 13.1978 14.846 12.6673V4.66732C14.846 4.13688 14.6353 3.62818 14.2602 3.2531C13.8852 2.87803 13.3765 2.66732 12.846 2.66732ZM13.5127 12.6673C13.5127 12.8441 13.4425 13.0137 13.3174 13.1387C13.1924 13.2637 13.0228 13.334 12.846 13.334H3.5127C3.33588 13.334 3.16632 13.2637 3.04129 13.1387C2.91627 13.0137 2.84603 12.8441 2.84603 12.6673V6.66732H13.5127V12.6673ZM13.5127 5.33398H2.84603V4.66732C2.84603 4.49051 2.91627 4.32094 3.04129 4.19591C3.16632 4.07089 3.33588 4.00065 3.5127 4.00065H12.846C13.0228 4.00065 13.1924 4.07089 13.3174 4.19591C13.4425 4.32094 13.5127 4.49051 13.5127 4.66732V5.33398ZM4.84603 12.0007C4.97788 12.0007 5.10678 11.9616 5.21641 11.8883C5.32604 11.815 5.41149 11.7109 5.46195 11.5891C5.51241 11.4673 5.52561 11.3332 5.49989 11.2039C5.47416 11.0746 5.41067 10.9558 5.31743 10.8626C5.2242 10.7693 5.10541 10.7059 4.97609 10.6801C4.84677 10.6544 4.71272 10.6676 4.59091 10.7181C4.46909 10.7685 4.36497 10.854 4.29172 10.9636C4.21846 11.0732 4.17936 11.2021 4.17936 11.334C4.17936 11.5108 4.2496 11.6804 4.37462 11.8054C4.49965 11.9304 4.66922 12.0007 4.84603 12.0007Z"
                            fill="var(--color-text-main)"/>
                    </svg>
                    <div className={'show-date'}>{showDate(to)}</div>

                    <DatePicker
                        minDate={from}
                        value={to}
                        onChange={({date}) => {
                            changeToDate(Array.isArray(date) ? date : [date][0] as any)
                        }
                        }/>
                </div>
            }

            <div className={'duration'}>{calculateDuration(from, to)}</div>
        </div>

        <div className={'timezone'}>
            <Select
                clearable={false}
                searchable={true}
                creatable={false}
                options={timezoneList}
                value={timezone as any}
                placeholder=""
                onChange={params => {
                    if (params.type === 'select') {
                        setTimezone(params.value as any)
                    }
                }}
            />
        </div>

        <div className={'all-day-repeat'}>
            <div className={'all-day'}>
                <Toggle checked={allDay} onChange={e => {
                    if (e.target.checked) {
                        history.current = [from, to]
                        const year = from.getFullYear()
                        const mouth = from.getMonth()
                        const day = from.getDate()
                        setFrom(new Date(year, mouth, day, 0, 0))
                        setTo(new Date(year, mouth, day, 23, 59))
                    } else {
                        setFrom(history.current[0])
                        setTo(history.current[1])
                    }

                    setAllDay(e.target.checked)
                }}></Toggle>
                <span onClick={e => {
                    const target = document.querySelector('.all-day label[data-baseweb="checkbox"]') as HTMLDivElement
                    target.click()
                }}>{lang['Form_All_Day']}</span>
            </div>
            {arrowRepeat &&
                <Select
                    clearable={false}
                    searchable={false}
                    options={repeatOptions}
                    value={repeat}
                    placeholder="Select repeat"
                    onChange={params => setRepeat(params.value as any)}
                />
            }
        </div>
    </>)
}

export default AppDateInput
