import styles from './DialogTimeSlotEdit.module.scss'
import {useEffect, useMemo, useState} from "react";
import * as  dayjsLib from 'dayjs'
import PageBack from "@/components/base/PageBack";
import AppButton from "@/components/base/AppButton/AppButton";
import AppRadio from "@/components/base/AppRadio/AppRadio";
import {TimePicker} from "baseui/datepicker";
import {CheckIndeterminate, Plus} from "baseui/icon";
import {VenueTimeslot} from "@/service/solas";

const isSameOrBefore = require('dayjs/plugin/isSameOrBefore')
const isSameOrAfter = require('dayjs/plugin/isSameOrAfter')
const isBetween = require('dayjs/plugin/isBetween')

const dayjs: any = dayjsLib
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)
dayjs.extend(isBetween)

export interface TimeSlotItem {
    day: string,
    disable: boolean,
    slot: { start: string, end: string, _destroy?: number }[]
}

const emptySlot: VenueTimeslotWithIndex[] = [
    {day_of_week: 'monday', disabled: false, start_at: '08:00', end_at: '20:00', _index: 0},
    {day_of_week: 'tuesday', disabled: false, start_at: '08:00', end_at: '20:00', _index: 1},
    {day_of_week: 'wednesday', disabled: false, start_at: '08:00', end_at: '20:00', _index: 2},
    {day_of_week: 'thursday', disabled: false, start_at: '08:00', end_at: '20:00',_index: 3},
    {day_of_week: 'friday', disabled: false, start_at: '08:00', end_at: '20:00', _index: 4},
    {day_of_week: 'saturday', disabled: false, start_at: '08:00', end_at: '20:00', _index: 5},
    {day_of_week: 'sunday', disabled: false, start_at: '08:00', end_at: '20:00', _index: 6},
]

interface VenueTimeslotWithIndex extends VenueTimeslot {
    _index: number
}

const toDate = (time: string) => {
    const [hour, minute] = time.split(':')
    return dayjs().hour(parseInt(hour)).minute(parseInt(minute)).second(0).millisecond(0).toDate()
}

const toStr = (date: Date) => {
    return dayjs(date).format('HH:mm')
}

const add = (time: string, offset: number) => {
    const [hour, minute] = time.split(':')
    return dayjs().hour(parseInt(hour)).minute(parseInt(minute)).second(0).millisecond(0).add(offset, 'minute').toDate()
}

const subtract = (time: string, offset: number) => {
    const [hour, minute] = time.split(':')
    return dayjs().hour(parseInt(hour)).minute(parseInt(minute)).second(0).millisecond(0).subtract(offset, 'minute').toDate()
}

const timeStep = 5

export default function DialogTimeSlotEdit(props: { close: any, value: VenueTimeslot[], onChange?: (value:  VenueTimeslot[]) => any, hasTimeSlotError?: (hasError:  boolean) => any }) {
    const [slot, setSlot] = useState(props.value && props.value.length ? props.value : emptySlot)

    const [allTime,setAllTime] = useState(!props.value || !props.value.length)
    const [OverlapErr, setOverlapErr] = useState(['', '', '', '', '', '', ''])

    useEffect(() => {
        !!props.onChange && props.onChange(slot)
    }, [slot]);

    const showSlot = useMemo(() => {
        // mon -> sun


        let showSlots = [[],[],[],[],[],[],[]] as VenueTimeslotWithIndex[][]

        slot.forEach((item, index) => {
            switch (item.day_of_week) {
                case 'monday':
                    !item._destroy && showSlots[0].push({...item, _index: index})
                    break
                case 'tuesday':
                    !item._destroy && showSlots[1].push({...item, _index: index})
                    break
                case 'wednesday':
                    !item._destroy && showSlots[2].push({...item, _index: index})
                    break
                case 'thursday':
                    !item._destroy && showSlots[3].push({...item, _index: index})
                    break
                case 'friday':
                    !item._destroy && showSlots[4].push({...item, _index: index})
                    break
                case 'saturday':
                    !item._destroy && showSlots[5].push({...item, _index: index})
                    break
                case 'sunday':
                    !item._destroy && showSlots[6].push({...item, _index: index})
            }
        })

        console.log('showSlots', showSlots)
        console.log('slot', slot)
        return showSlots
    }, [slot])

    useEffect(() => {
        const errMsg = ['', '', '', '', '', '', '']
        showSlot.forEach((item, index) => {
            if (item.length > 1) {
                return item.forEach((s, i) => {
                    for (let j = i + 1; j < item.length; j++) {

                        const isOverlap = (s.start_at <= item[j].start_at && s.end_at > item[j].start_at)
                            || (s.start_at >= item[j].start_at && s.end_at <= item[j].end_at)
                        || (s.start_at < item[j].end_at && s.end_at >= item[j].end_at)

                        if (isOverlap) {
                            errMsg[index] = 'Time slot overlap'
                        }
                    }
                })
            }
        })
        !!props.hasTimeSlotError && props.hasTimeSlotError(errMsg.some(i => !!i))
        setOverlapErr(errMsg)
    }, [showSlot])

    return <div className={styles['dialog-time-slot-edit']}>
        <div className={styles['center']}>
            <div className={styles['body']}>
                <div className={styles['item']} onClick={e => {
                    if (!allTime) {
                        setSlot(slot.filter(s => !!s.id).map(s => {
                            s._destroy = '1'
                            return s
                        }))
                        setAllTime(true)
                    } else {
                        if (props.value && props.value.length) {
                            setSlot(props.value.map(i => {
                                return {...i, _destroy: undefined}
                            }))
                        } else {
                            setSlot((JSON.parse(JSON.stringify(emptySlot))))
                        }
                        setAllTime(false)
                    }
                }}>
                    <div className={styles['row']}>
                        <div className={styles['title']}>Opening hours 24/7 {allTime.toString()}</div>
                        <AppRadio checked={allTime}/>
                    </div>
                </div>

                <div></div>
                <div>
                    {
                       !allTime && showSlot.map((item, index) => {
                            return <div
                                className={`${styles['slot-item']}`}
                                key={index}>
                                <div className={styles['row']}>
                                    <div className={styles['title']}>{item[0].day_of_week}</div>
                                    <div className={styles['row']} onClick={e => {
                                        const value = !item[0].disabled
                                        slot.forEach((s) => {
                                            if (s.day_of_week === item[0].day_of_week) {
                                                s.disabled = value
                                            }
                                        })
                                        setSlot([...slot])
                                    }}>
                                        <AppRadio checked={item[0].disabled}/> Closed
                                    </div>
                                </div>
                                {
                                    !!OverlapErr[index] && <div className={styles['error']}>{OverlapErr[index]}</div>
                                }
                                {
                                    item.length &&
                                    <>
                                        {item.map((s, i) => {
                                            return <div key={i} className={item[0].disabled ? `${styles['row']} ${styles['disable']}` : styles['row']}>
                                                <div className={styles['select']}>
                                                    <TimePicker
                                                        disabled={item[0].disabled || allTime}
                                                        format={'24'}
                                                        step={60 * timeStep}
                                                        maxTime={subtract(s.end_at, timeStep)}
                                                        value={toDate(s.start_at)}
                                                        onChange={(date) => {
                                                            if (date) {
                                                                slot[s._index].start_at = dayjs(date).format('HH:mm')
                                                                setSlot([...slot])
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                <span className={styles['split']}>to</span>
                                                <div className={styles['select']}>
                                                    <TimePicker
                                                        minTime={
                                                            add(s.start_at, timeStep)
                                                        }
                                                        disabled={item[0].disabled || allTime}
                                                        format={'24'}
                                                        step={60 * timeStep}
                                                        value={toDate(s.end_at)}
                                                        onChange={(date) => {
                                                            if (date) {
                                                                slot[s._index].end_at = dayjs(date).format('HH:mm')
                                                                setSlot([...slot])
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                {
                                                    i === item.length - 1 &&
                                                    <div className={styles['issue-input-add-btn']}
                                                         onClick={e => {
                                                             slot.push({day_of_week: item[0].day_of_week, disabled: false, start_at: '08:00', end_at: '20:00'})
                                                             setSlot([...slot])
                                                         }}>
                                                        <Plus/>
                                                    </div>
                                                }
                                                {
                                                    (i != 0 || item.length != 1) &&
                                                    <div className={styles['issue-input-remove-btn']}
                                                         onClick={e => {
                                                             slot[s._index]._destroy = '1'
                                                             setSlot([...slot])
                                                         }}>
                                                        <CheckIndeterminate/>
                                                    </div>
                                                }
                                            </div>
                                        })
                                        }
                                    </>
                                }
                            </div>
                        })
                    }
                </div>
            </div>
        </div>

    </div>
}
