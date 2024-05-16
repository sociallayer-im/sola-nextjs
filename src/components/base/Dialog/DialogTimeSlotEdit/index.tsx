import styles from './DialogTimeSlotEdit.module.scss'
import {useEffect, useState} from "react";
import * as  dayjsLib from 'dayjs'
import PageBack from "@/components/base/PageBack";
import AppButton from "@/components/base/AppButton/AppButton";
import AppRadio from "@/components/base/AppRadio/AppRadio";
import {TimePicker} from "baseui/datepicker";
import {CheckIndeterminate, Plus} from "baseui/icon";

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
    slot: { start: string, end: string }[]
}

const emptySlot: TimeSlotItem[] = [
    {day: 'Monday', disable: false, slot: [{start: '08:00', end: '20: 00'}]},
    {day: 'Tuesday', disable: false, slot: [{start: '08:00', end: '20: 00'}]},
    {day: 'Wednesday', disable: false, slot: [{start: '08:00', end: '20: 00'}]},
    {day: 'Thursday', disable: false, slot: [{start: '08:00', end: '20: 00'}]},
    {day: 'Friday', disable: false, slot: [{start: '08:00', end: '20: 00'}]},
    {day: 'Saturday', disable: false, slot: [{start: '08:00', end: '20: 00'}]},
    {day: 'Sunday', disable: false, slot: [{start: '08:00', end: '20: 00'}]},
]

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

export default function DialogTimeSlotEdit(props: { close: any, value: TimeSlotItem[] | null, onConfirm?: (value: TimeSlotItem[] | null) => any }) {
    const [slot, setSlot] = useState(props.value || emptySlot)

    const [allTime, setAllTime] = useState(!props.value)
    const [OverlapErr, setOverlapErr] = useState(['', '', '', '', '', '', ''])

    useEffect(() => {
        const errMsg = ['', '', '', '', '', '', '']
        slot.forEach((item, index) => {
            if (item.slot.length > 1) {
                return item.slot.forEach((s, i) => {
                    for (let j = i + 1; j < item.slot.length; j++) {

                        const isOverlap = (s.start <= item.slot[j].start && s.end > item.slot[j].start)
                            || (s.start >= item.slot[j].start && s.end <= item.slot[j].end)
                        || (s.start < item.slot[j].end && s.end >= item.slot[j].end)

                        console.log('1', s.start <= item.slot[j].start && s.end > item.slot[j].start)
                        console.log('2', s.start >= item.slot[j].start && s.end <= item.slot[j].end)
                        console.log('3', s.start < item.slot[j].end && s.end >= item.slot[j].end)

                        if (isOverlap) {
                            errMsg[index] = 'Time slot overlap'
                        }
                    }
                })
            }
        })

        setOverlapErr(errMsg)
    }, [slot])

    return <div className={styles['dialog-time-slot-edit']}>
        <div className={styles['center']}>
            <div className={styles['header']}>
                <PageBack title={'Time Slot'} onClose={() => {
                    props.close()
                }}/>
            </div>
            <div className={styles['body']}>
                <div className={styles['item']} onClick={e => {
                    setAllTime(!allTime)
                }}>
                    <div className={styles['row']}>
                        <div className={styles['title']}>Opening hours 24/7</div>
                        <AppRadio checked={allTime}/>
                    </div>
                </div>
                <div>
                    {
                        slot.map((item, index) => {
                            return <div
                                className={`${styles['slot-item']} ${item.disable || allTime ? styles['disable'] : ''}`}
                                key={index}>
                                <div className={styles['row']}>
                                    <div className={styles['title']}>{item.day}</div>
                                    <div className={styles['row']} onClick={e => {
                                        item.disable = !item.disable
                                        setSlot([...slot])
                                    }}>
                                        <AppRadio checked={item.disable}/> Closed
                                    </div>
                                </div>
                                {
                                    !!OverlapErr[index] && <div className={styles['error']}>{OverlapErr[index]}</div>
                                }
                                {
                                    item.slot.length &&
                                    <>
                                        {item.slot.map((s, i) => {
                                            return <div key={i} className={styles['row']}>
                                                <div className={styles['select']}>
                                                    <TimePicker
                                                        disabled={item.disable || allTime}
                                                        format={'24'}
                                                        step={1800}
                                                        maxTime={subtract(s.end, 30)}
                                                        value={toDate(s.start)}
                                                        onChange={(date) => {
                                                            if (date) {
                                                                s.start = dayjs(date).format('HH:mm')
                                                                setSlot([...slot])
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                <span className={styles['split']}>to</span>
                                                <div className={styles['select']}>
                                                    <TimePicker
                                                        minTime={
                                                            add(s.start, 30)
                                                        }
                                                        disabled={item.disable || allTime}
                                                        format={'24'}
                                                        step={60 * 30}
                                                        value={toDate(s.end)}
                                                        onChange={(date) => {
                                                            if (date) {
                                                                s.end = dayjs(date).format('HH:mm')
                                                                setSlot([...slot])
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                {
                                                    i === item.slot.length - 1 &&
                                                    <div className={styles['issue-input-add-btn']}
                                                         onClick={e => {
                                                             item.slot.push({start: '08:00', end: '20: 00'})
                                                             setSlot([...slot])
                                                         }}>
                                                        <Plus/>
                                                    </div>
                                                }
                                                {
                                                    (i != 0 || item.slot.length != 1) &&
                                                    <div className={styles['issue-input-remove-btn']}
                                                         onClick={e => {
                                                             item.slot.splice(i, 1)
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
            <div className={styles['actions']}>
                <AppButton size={'compact'} onClick={props.close}>Cancel</AppButton>
                <AppButton size={'compact'} special onClick={e => {
                    const hasError = OverlapErr.some(err => !!err)
                    if (hasError) return

                    props.onConfirm && props.onConfirm(allTime ? null : slot)
                    props.close()
                }}>Confirm</AppButton>
            </div>

        </div>

    </div>
}
