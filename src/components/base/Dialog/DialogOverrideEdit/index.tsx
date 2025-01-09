import styles from './DialogOverrideEdit.module.scss'
import {useState, useEffect} from "react";
import * as  dayjsLib from 'dayjs'
import PageBack from "@/components/base/PageBack";
import {StatefulCalendar, TimePicker} from "baseui/datepicker";
import {VenueOverride} from "@/service/solas";
import Toggle from "@/components/base/Toggle/Toggle";
import AppButton from "@/components/base/AppButton/AppButton"
import {Select} from "baseui/select";

const isSameOrBefore = require('dayjs/plugin/isSameOrBefore')
const isSameOrAfter = require('dayjs/plugin/isSameOrAfter')
const isBetween = require('dayjs/plugin/isBetween')

const dayjs: any = dayjsLib
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)
dayjs.extend(isBetween)
const timeStep = 5

const roleOpts = [{id: 'all', label: 'All'}, {id: 'member', label: 'Member'}, {id: 'manager', label: 'Manager'}]

export default function DialogOverrideEdit(props: {
    close: any,
    value: VenueOverride,
    onConfirm?: (value: VenueOverride) => any
    blockDate: Date[]
}) {
    const [newVenueOverride, setNewVenueOverride] = useState(props.value)

    useEffect(() => {
        console.log('newVenueOverride', newVenueOverride)
    }, [newVenueOverride]);

    const handleConfirm = () => {
        props.onConfirm &&  props.onConfirm(newVenueOverride)
        props.close()
    }


    return <div className={styles['dialog-time-slot-edit']}>
        <div className={styles['center']}>
            <div className={styles['header']}>
                <PageBack title={'Edit Override'} onClose={() => {
                    props.close()
                }}/>
            </div>
            <div className={styles['body']}>
                <div style={{transform: 'scale(0.93)', transformOrigin: 'left top'}}>
                    <StatefulCalendar
                        filterDate={(date) => {
                            return !props.blockDate.some(d => dayjs(date).isSame(d, 'day'))
                        }}
                        quickSelect={false}
                        initialState={{value: new Date(newVenueOverride.day)}}
                        onChange={({date}) => {
                            console.log('date', date)
                            if (date) {
                                setNewVenueOverride({
                                    ...newVenueOverride,
                                    day: dayjs(date).format('YYYY/MM/DD'),
                                    start_at: '00:00',
                                    end_at: '23:59'
                                })
                            }
                        }}
                    />
                </div>
                <div className={styles['toggle']}>
                    <Toggle checked={newVenueOverride.disabled} onChange={e => {
                        setNewVenueOverride({
                            ...newVenueOverride,
                            disabled: !newVenueOverride.disabled
                        })
                    }}/>
                    <div>Mark unavailable</div>
                </div>
                <div className={styles['time']}>
                    <TimePicker
                        format={'24'}
                        value={new Date(`${newVenueOverride.day} ${newVenueOverride.start_at || '00:00'}`)}
                        maxTime={new Date(`${newVenueOverride.day} ${newVenueOverride.end_at || '23:59'}`)}
                        step={60 * timeStep}
                        onChange={date => {
                            const time = dayjs(date).format('HH:mm')
                            setNewVenueOverride({
                                ...newVenueOverride,
                                start_at: time,
                                end_at: '23:59'
                            })
                        }}
                    />

                    <div className={styles['to']}>to</div>
                    <TimePicker
                        format={'24'}
                        value={new Date(`${newVenueOverride.day} ${newVenueOverride.end_at || '23:59'}`)}
                        minTime={new Date(`${newVenueOverride.day} ${newVenueOverride.start_at || '00:00'}`)}
                        step={60 * timeStep}
                        onChange={date => {
                            const time = dayjs(date).format('HH:mm')
                            setNewVenueOverride({
                                ...newVenueOverride,
                                end_at: time
                            })
                        }}
                    />
                </div>

                <div className={styles['time']} style={{marginTop: 0}}>
                    <div className={styles['to']} style={{whiteSpace: 'nowrap'}}>For</div>
                    <Select
                        clearable={false}
                        searchable={false}
                        options={roleOpts as any}
                        value={newVenueOverride.role
                            ? [roleOpts.find((ro) => ro.id === newVenueOverride.role)]
                            : [{id: 'all', label: 'All'}] as any
                        }
                        onChange={({option}) => {
                            if (option) {
                                newVenueOverride.role = option.id as any
                                setNewVenueOverride({
                                    ...newVenueOverride
                                })
                            }
                        }}
                    />
                </div>

                <AppButton kind={'primary'} onClick={handleConfirm}>Confirm</AppButton>
            </div>
        </div>

    </div>
}
