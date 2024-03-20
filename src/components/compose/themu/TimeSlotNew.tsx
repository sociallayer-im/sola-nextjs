import {useContext, useEffect, useRef, useState} from 'react'
import * as dayjsLib from "dayjs";
import {DatePicker} from "baseui/datepicker";
import LangContext from "@/components/provider/LangProvider/LangContext";
import {Select} from "baseui/select";

const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const dayjs: any = dayjsLib
dayjs.extend(utc)
dayjs.extend(timezone)

export interface Slot {
    label: string,
    id: string
}

export interface Slots {
    [index: string]: {
        des: string,
        slots: Array<Slot[]>,
    }
}

const config: Slots = {
    "80": {
        des: 'Kitchen',
        slots: [
            [
                {label: '10:00', id: '10:00'},
                {label: '10:30', id: '10:30'},
                {label: '11:00', id: '10:00'},
                {label: '11:30', id: '10:30'},
                {label: '12:00', id: '12:00'},
                {label: '12:30', id: '12:30'},
                {label: '13:00', id: '13:00'},
                {label: '13:30', id: '13:30'},
                {label: '14:00', id: '14:00'},
                {label: '14:30', id: '14:30'},
            ],
            [
                {label: '16:00', id: '16:00'},
                {label: '16:30', id: '16:30'},
                {label: '17:00', id: '17:00'},
                {label: '17:30', id: '17:30'},
                {label: '18:00', id: '18:00'},
                {label: '18:30', id: '18:30'},
                {label: '19:00', id: '19:00'},
                {label: '19:30', id: '19:30'},
                {label: '20:00', id: '20:00'},
            ]
        ]
    },
    "82": {
        des: "Classrooms",
        slots: [
            [
                {label: '10:30', id: '10:30'},
                {label: '11:00', id: '11:00'},
                {label: '11:30', id: '11:30'},
                {label: '12:00', id: '12:00'},
            ],
            [
                {label: '15:00', id: '15:00'},
                {label: '15:30', id: '15:30'},
                {label: '16:00', id: '16:00'},
                {label: '16:30', id: '16:30'},
                {label: '17:00', id: '17:00'},
                {label: '17:30', id: '17:30'},
                {label: '18:00', id: '18:00'},
                {label: '18:30', id: '18:30'},
                {label: '19:00', id: '19:00'},
            ]
        ]
    },
    "81": {
        des: 'Entire floor upstairs',
        slots: [
            [
                {label: '10:30', id: '10:30'},
                {label: '11:00', id: '11:00'},
                {label: '11:30', id: '11:30'},
                {label: '12:00', id: '12:00'},
            ],
            [
                {label: '15:00', id: '15:00'},
                {label: '15:30', id: '15:30'},
                {label: '16:00', id: '16:00'},
                {label: '16:30', id: '16:30'},
                {label: '17:00', id: '17:00'},
                {label: '17:30', id: '17:30'},
                {label: '18:00', id: '18:00'},
                {label: '18:30', id: '18:30'},
                {label: '19:00', id: '19:00'},
            ]
        ]
    },
    "79": {
        des: 'Round table',
        slots: [
            [
                {label: '10:30', id: '10:30'},
                {label: '11:00', id: '11:00'},
                {label: '11:30', id: '11:30'},
                {label: '12:00', id: '12:00'},
            ],
            [
                {label: '15:00', id: '15:00'},
                {label: '15:30', id: '15:30'},
                {label: '16:00', id: '16:00'},
                {label: '16:30', id: '16:30'},
                {label: '17:00', id: '17:00'},
                {label: '17:30', id: '17:30'},
                {label: '18:00', id: '18:00'},
                {label: '18:30', id: '18:30'},
                {label: '19:00', id: '19:00'},
            ]
        ]
    },
    "78": {
        des: 'Terrance',
        slots: [
            [
                {label: '8:30', id: '8:30'},
                {label: '9:00', id: '9:00'},
                {label: '9:30', id: '11:00'},
                {label: '10:00', id: '10:00'},
                {label: '10:30', id: '10:30'},
                {label: '11:00', id: '11:00'},
                {label: '11:30', id: '11:30'},
                {label: '12:00', id: '11:00'},
                {label: '12:30', id: '11:30'},
                {label: '13:00', id: '13:00'},
                {label: '13:30', id: '13:30'},
                {label: '14:00', id: '14:00'},
                {label: '14:30', id: '14:30'},
                {label: '15:00', id: '15:00'},
                {label: '15:30', id: '15:30'},
                {label: '16:00', id: '16:00'},
                {label: '16:30', id: '16:30'},
                {label: '17:00', id: '16:00'},
                {label: '17:30', id: '16:30'},
                {label: '18:00', id: '18:00'},
                {label: '18:30', id: '18:30'},
                {label: '19:00', id: '19:00'},
                {label: '19:30', id: '19:30'},
                {label: '20:00', id: '20:00'},
                {label: '20:30', id: '20:30'},
            ]
        ]
    },
    "87": {
        des: "Movie Theater",
        slots: [
            [
                {label: '10:00', id: '10:00'},
                {label: '10:30', id: '10:30'},
                {label: '11:00', id: '11:00'},
                {label: '11:30', id: '11:30'},
                {label: '12:00', id: '11:00'},
                {label: '12:30', id: '11:30'},
                {label: '13:00', id: '13:00'},
                {label: '13:30', id: '13:30'},
                {label: '14:00', id: '14:00'},
                {label: '14:30', id: '14:30'},
                {label: '15:00', id: '15:00'},
                {label: '15:30', id: '15:30'},
                {label: '16:00', id: '16:00'},
                {label: '16:30', id: '16:30'},
                {label: '17:00', id: '16:00'},
                {label: '17:30', id: '16:30'},
                {label: '18:00', id: '18:00'},
                {label: '18:30', id: '18:30'},
                {label: '19:00', id: '19:00'},
            ]
        ]
    },
    "86": {
        des: "Classroom, 12 seats",
        slots: [
            [
                {label: '10:00', id: '10:00'},
                {label: '10:30', id: '10:30'},
                {label: '11:00', id: '11:00'},
                {label: '11:30', id: '11:30'},
                {label: '12:00', id: '12:00'},
                {label: '12:30', id: '12:30'},
            ],
            [
                {label: '15:00', id: '15:00'},
                {label: '15:30', id: '15:30'},
                {label: '16:00', id: '16:00'},
                {label: '16:30', id: '16:30'},
                {label: '17:00', id: '16:00'},
                {label: '17:30', id: '16:30'},
                {label: '18:00', id: '18:00'},
                {label: '18:30', id: '18:30'},
                {label: '19:00', id: '19:00'},
                {label: '19:30', id: '19:30'},
                {label: '20:00', id: '20:00'},
            ]
        ]
    }
}

function TimeSlot(props: {
    eventSiteId: number,
    from: string,
    to: string,
    allowRepeat?: boolean,
    onChange?: (from: string, to: string, timezone: string, repeat: string, counter: number) => any }) {
    const {lang} = useContext(LangContext)
    // const timezone = 'Asia/Shanghai'
    const timezone = 'America/Argentina/Buenos_Aires'
    const [evenSiteId, setEvenSiteId] = useState<number | null>(null)
    const [data, setData] = useState<{from: Slot[] | null, to: Slot[] | null, date: Date}>({
        from: null,
        to: null,
        date: new Date()
    })

    const repeatOptions: any = [
        {label: lang['Form_Repeat_Not'], id: ''},
        {label: lang['Form_Repeat_Day'], id: "day"},
        {label: lang['Form_Repeat_Week'], id: "week"},
        {label: lang['Form_Repeat_Month'], id: "month"},
    ]

    let repeatDefault: { label: string, id: string }[] = [repeatOptions[0]]
    const [repeat, setRepeat] = useState<{ label: string, id: string }[]>(repeatDefault)
    const [counter, setCounter] = useState(1)


    useEffect(() => {
        document.querySelectorAll('.slots input').forEach((input) => {
            input.setAttribute('readonly', 'readonly')
        })
    }, [])

    useEffect(() => {
        if (props.eventSiteId && props.from && props.to && !evenSiteId) {
            const fromHour = dayjs.tz(new Date(props.from).getTime(), timezone).hour()
            const fromMinute = dayjs.tz(new Date(props.from).getTime(), timezone).minute()
            const fromStr = `${(fromHour + '').padStart(2, '0')}:${(fromMinute + '').padStart(2, '0')}`

            const toHour = dayjs.tz(new Date(props.to).getTime(), timezone).hour()
            const toMinute = dayjs.tz(new Date(props.to).getTime(), timezone).minute()
            const toStr = `${(toHour + '').padStart(2, '0')}:${(toMinute + '').padStart(2, '0')}`

            let initFrom: null | Slot = null
            let initFromSlot: Slot[] = []
            config[props.eventSiteId + ''].slots.find((slot: Slot[]) => {
                return slot.find((s: Slot) => {
                    const res = s.id === fromStr
                    if (res) {
                        initFrom = s
                        initFromSlot = slot
                    }
                    return res
                })
            })

            let totalSlots:Slot[] = []
            config[props.eventSiteId + ''].slots.forEach((slot: Slot[]) => {
                totalSlots =  totalSlots.concat(slot)
            })

            const initTo = totalSlots.find((s: Slot) => {
                return s.id === toStr
            })

            if (!!initFrom && !!initTo) {
                console.log('init====')
                const target = dayjs.tz(new Date(props.from).getTime(), timezone)
                setEvenSiteId(props.eventSiteId)
                setData({
                    from: [initFrom],
                    to: [initTo],
                    date: new Date(`${target.year()}-${target.month() + 1}-${target.date()} 00:00`)
                })
            }
        } else {
            if (props.eventSiteId !== evenSiteId) {
                setEvenSiteId(props.eventSiteId)
                console.log('reset=====')
                setData({
                    from: null,
                    to: null,
                    date: new Date()
                })
                props.onChange && props.onChange('', '', timezone, repeat.length? repeat[0].id : '', counter)
            }
        }
    }, [props.from, props.to, props.eventSiteId])


    useEffect(() => {
        console.log('onchange data', data)
        if (data.from && data.from.length > 0 && data.to && data.to.length > 0) {
            const from_str = data.from?.[0].id
            const to_str = data.to?.[0].id
            const date = data.date
            const fromRes = dayjs.tz(`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${from_str}`, timezone).toISOString()
            const toRes = dayjs.tz(`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${to_str}`, timezone).toISOString()
            props.onChange && props.onChange(fromRes, toRes, timezone, repeat.length? repeat[0].id : '', counter)
        } else {
            props.onChange && props.onChange('', '', timezone, repeat.length? repeat[0].id : '', counter)
        }
    }, [data, repeat, counter])


    function showDate(data: Date) {
        const month = data.getMonth()
        const day = data.getDay()
        const date = data.getDate()

        const monthName = lang['Month_Name']
        const dayName = lang['Day_Name']
        return dayName[day] + ', ' + monthName[month] + ' ' + date
    }

    const genFromSlotList = (eventSiteId: number) => {
        let res: Slot[] = []
        const slots = config[eventSiteId + ''].slots
        slots.forEach((slot: Slot[]) => {
            res = res.concat(slot.slice(0, -1))
        })

        return res
    }

    const genToSlotList = (eventSiteId: number, from?: string | null) => {
        if (!from) return []

        const slots = config[eventSiteId + ''].slots
        const zone = slots.find((slot: Slot[]) => {
            const inZone = slot.find((s: Slot) => {
                return s.id === from
            })
            console.log('inZone', inZone)
            return !!inZone
        })

        const res = (zone || []).filter((slot: Slot) => {
            return slot.id > from
        })

        console.log('to res', res)
        return res
    }

    return !!evenSiteId ?
        <>
            <div className={'app-date-input-v2'}>
                <div className={'date-input'}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
                        <path
                            d="M8.17936 9.33398C8.31122 9.33398 8.44011 9.29489 8.54974 9.22163C8.65938 9.14838 8.74482 9.04426 8.79528 8.92244C8.84574 8.80062 8.85894 8.66658 8.83322 8.53726C8.8075 8.40794 8.744 8.28915 8.65077 8.19591C8.55753 8.10268 8.43874 8.03918 8.30942 8.01346C8.1801 7.98774 8.04606 8.00094 7.92424 8.0514C7.80242 8.10186 7.6983 8.1873 7.62505 8.29694C7.5518 8.40657 7.5127 8.53546 7.5127 8.66732C7.5127 8.84413 7.58293 9.0137 7.70796 9.13872C7.83298 9.26375 8.00255 9.33398 8.17936 9.33398ZM11.5127 9.33398C11.6445 9.33398 11.7734 9.29489 11.8831 9.22163C11.9927 9.14838 12.0782 9.04426 12.1286 8.92244C12.1791 8.80062 12.1923 8.66658 12.1666 8.53726C12.1408 8.40794 12.0773 8.28915 11.9841 8.19591C11.8909 8.10268 11.7721 8.03918 11.6428 8.01346C11.5134 7.98774 11.3794 8.00094 11.2576 8.0514C11.1358 8.10186 11.0316 8.1873 10.9584 8.29694C10.8851 8.40657 10.846 8.53546 10.846 8.66732C10.846 8.84413 10.9163 9.0137 11.0413 9.13872C11.1663 9.26375 11.3359 9.33398 11.5127 9.33398ZM8.17936 12.0007C8.31122 12.0007 8.44011 11.9616 8.54974 11.8883C8.65938 11.815 8.74482 11.7109 8.79528 11.5891C8.84574 11.4673 8.85894 11.3332 8.83322 11.2039C8.8075 11.0746 8.744 10.9558 8.65077 10.8626C8.55753 10.7693 8.43874 10.7059 8.30942 10.6801C8.1801 10.6544 8.04606 10.6676 7.92424 10.7181C7.80242 10.7685 7.6983 10.854 7.62505 10.9636C7.5518 11.0732 7.5127 11.2021 7.5127 11.334C7.5127 11.5108 7.58293 11.6804 7.70796 11.8054C7.83298 11.9304 8.00255 12.0007 8.17936 12.0007ZM11.5127 12.0007C11.6445 12.0007 11.7734 11.9616 11.8831 11.8883C11.9927 11.815 12.0782 11.7109 12.1286 11.5891C12.1791 11.4673 12.1923 11.3332 12.1666 11.2039C12.1408 11.0746 12.0773 10.9558 11.9841 10.8626C11.8909 10.7693 11.7721 10.7059 11.6428 10.6801C11.5134 10.6544 11.3794 10.6676 11.2576 10.7181C11.1358 10.7685 11.0316 10.854 10.9584 10.9636C10.8851 11.0732 10.846 11.2021 10.846 11.334C10.846 11.5108 10.9163 11.6804 11.0413 11.8054C11.1663 11.9304 11.3359 12.0007 11.5127 12.0007ZM4.84603 9.33398C4.97788 9.33398 5.10678 9.29489 5.21641 9.22163C5.32604 9.14838 5.41149 9.04426 5.46195 8.92244C5.51241 8.80062 5.52561 8.66658 5.49989 8.53726C5.47416 8.40794 5.41067 8.28915 5.31743 8.19591C5.2242 8.10268 5.10541 8.03918 4.97609 8.01346C4.84677 7.98774 4.71272 8.00094 4.59091 8.0514C4.46909 8.10186 4.36497 8.1873 4.29172 8.29694C4.21846 8.40657 4.17936 8.53546 4.17936 8.66732C4.17936 8.84413 4.2496 9.0137 4.37462 9.13872C4.49965 9.26375 4.66922 9.33398 4.84603 9.33398ZM12.846 2.66732H12.1794V2.00065C12.1794 1.82384 12.1091 1.65427 11.9841 1.52925C11.8591 1.40422 11.6895 1.33398 11.5127 1.33398C11.3359 1.33398 11.1663 1.40422 11.0413 1.52925C10.9163 1.65427 10.846 1.82384 10.846 2.00065V2.66732H5.5127V2.00065C5.5127 1.82384 5.44246 1.65427 5.31743 1.52925C5.19241 1.40422 5.02284 1.33398 4.84603 1.33398C4.66922 1.33398 4.49965 1.40422 4.37462 1.52925C4.2496 1.65427 4.17936 1.82384 4.17936 2.00065V2.66732H3.5127C2.98226 2.66732 2.47355 2.87803 2.09848 3.2531C1.72341 3.62818 1.5127 4.13688 1.5127 4.66732V12.6673C1.5127 13.1978 1.72341 13.7065 2.09848 14.0815C2.47355 14.4566 2.98226 14.6673 3.5127 14.6673H12.846C13.3765 14.6673 13.8852 14.4566 14.2602 14.0815C14.6353 13.7065 14.846 13.1978 14.846 12.6673V4.66732C14.846 4.13688 14.6353 3.62818 14.2602 3.2531C13.8852 2.87803 13.3765 2.66732 12.846 2.66732ZM13.5127 12.6673C13.5127 12.8441 13.4425 13.0137 13.3174 13.1387C13.1924 13.2637 13.0228 13.334 12.846 13.334H3.5127C3.33588 13.334 3.16632 13.2637 3.04129 13.1387C2.91627 13.0137 2.84603 12.8441 2.84603 12.6673V6.66732H13.5127V12.6673ZM13.5127 5.33398H2.84603V4.66732C2.84603 4.49051 2.91627 4.32094 3.04129 4.19591C3.16632 4.07089 3.33588 4.00065 3.5127 4.00065H12.846C13.0228 4.00065 13.1924 4.07089 13.3174 4.19591C13.4425 4.32094 13.5127 4.49051 13.5127 4.66732V5.33398ZM4.84603 12.0007C4.97788 12.0007 5.10678 11.9616 5.21641 11.8883C5.32604 11.815 5.41149 11.7109 5.46195 11.5891C5.51241 11.4673 5.52561 11.3332 5.49989 11.2039C5.47416 11.0746 5.41067 10.9558 5.31743 10.8626C5.2242 10.7693 5.10541 10.7059 4.97609 10.6801C4.84677 10.6544 4.71272 10.6676 4.59091 10.7181C4.46909 10.7685 4.36497 10.854 4.29172 10.9636C4.21846 11.0732 4.17936 11.2021 4.17936 11.334C4.17936 11.5108 4.2496 11.6804 4.37462 11.8054C4.49965 11.9304 4.66922 12.0007 4.84603 12.0007Z"
                            fill="var(--color-text-main)"/>
                    </svg>
                    <div className={'show-date'}>{showDate(data.date)}</div>
                    <DatePicker
                        filterDate={(date) => { return date.getDay() !== 0 && date.getDay() !== 6}}
                        minDate={new Date()}
                        value={data.date}
                        onChange={({date}) => {
                            // setDate(Array.isArray(date) ? date : [date][0] as any)
                            const res = Array.isArray(date) ? date : [date][0] as any
                            setData({
                                date: res,
                                from: null,
                                to: null
                            })
                        }
                        }/>
                </div>
            </div>

            <div className={'app-date-input-v2 second'}>
                <div className={'from-label'}>From</div>
                <div className={'slots'}>
                    <Select
                        labelKey={'label'}
                        clearable={false}
                        creatable={false}
                        value={data.from as any}
                        options={genFromSlotList(evenSiteId)}
                        onChange={({option}) => {
                            console.log('option=====', option)
                            // setFrom([option] as any)
                            setData({
                                ...data,
                                from: [option] as any,
                                to: null
                            })
                        }}
                    />
                </div>

                <div className={'from-label'}>to</div>

                <div className={'slots'}>
                    <Select
                        labelKey={'label'}
                        clearable={false}
                        creatable={false}
                        value={data.to as any}
                        options={genToSlotList(evenSiteId, data.from?.[0].id)}
                        onChange={({option}) => {
                            console.log('option=====', option)
                            // setTo([option] as any)
                            setData({
                                ...data,
                                to: [option] as any
                            })
                        }}
                    />
                </div>
            </div>

            { props.allowRepeat &&
                <div className={'all-day-repeat time-slot'}>
                    <Select
                        clearable={false}
                        searchable={false}
                        options={repeatOptions}
                        value={repeat}
                        placeholder="Select repeat"
                        onChange={params => setRepeat(params.value as any)}
                    />
                </div>
            }

            {
                !!repeat[0] && !!repeat[0].id &&
                <div className={'repeat-counter'}>
                    <div className={'title'}>How many times does it repeat?</div>
                    <div className={'repeat-counter-input'}>
                        <input type="number"
                               value={Boolean(counter) ? counter : ''}
                               onChange={e => {
                                   setCounter(e.target.value as any * 1)
                               }}/>
                        <span>times</span>
                    </div>
                </div>
            }


        </>: <></>
}

export default TimeSlot
