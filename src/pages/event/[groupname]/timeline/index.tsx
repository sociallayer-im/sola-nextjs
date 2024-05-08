import {Event, getGroups, Group, queryEvent, queryTimeLineEvent} from "@/service/solas";
import {useContext, useEffect, useRef, useState} from "react";
import styles from '../schedule/schedulenew.module.scss';
import Gantt from '@/libs/frappe-gantt'
import usePicture from "@/hooks/pictrue";
import {Select} from "baseui/select";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import LangContext from "@/components/provider/LangProvider/LangContext";
import {renderToStaticMarkup} from 'react-dom/server'
import * as dayjsLib from "dayjs";
import timezoneList from "@/utils/timezone";
import {getLabelColor, getLightColor} from "@/hooks/labelColor";
import Link from "next/link";
import EventDefaultCover from "@/components/base/EventDefaultCover";
import removeMarkdown from "markdown-to-text"

const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const dayjs: any = dayjsLib
dayjs.extend(utc)
dayjs.extend(timezone)

const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const mouthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatDate(dateStr: string, timezone: string) {
    const time = dayjs.tz(dateStr, timezone)
    const date = time.date();
    const month = mouthName[time.month()];
    const hour = time.hour() + ''
    const minute = time.minute() + '';

    let suffix = 'th';

    if (date === 1 || date === 21 || date === 31) {
        suffix = 'st';
    } else if (date === 2 || date === 22) {
        suffix = 'nd';
    } else if (date === 3 || date === 23) {
        suffix = 'rd';
    }

    return `${month} ${date}${suffix} ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
}

const views = [
    {
        id: 'Day',
        label: 'Day',
    },
    {
        label: 'Hour',
        id: 'Quarter Day'
    },
    {
        label: 'Month',
        id: 'Month'
    }
]

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

function Gan(props: { group: Group }) {
    const eventGroup = props.group
    const ganttRef = useRef<any>(null)
    const {defaultAvatar} = usePicture()
    const {showLoading} = useContext(DialogsContext)
    const {lang} = useContext(LangContext)

    const [timezoneSelected, setTimezoneSelected] = useState<{ label: string, id: string }[]>([])
    const [viewMode, setViewMode] = useState([views[0]])
    const [tag, setTag] = useState([{id: 'All', label: 'All', color: null}])
    const [page, setPage] = useState(1)
    const [start, setStart] = useState(new Date())
    const [end, setEnd] = useState(new Date())
    const [firstDate, setFirstDate] = useState<Date | null>(null)

    const tags = props.group.event_tags?.map((item: string) => {
        return {
            id: item,
            label: item,
            color: getLabelColor(item)
        }
    }) || []


    useEffect(() => {
        document.querySelectorAll('.input-disable input').forEach((input) => {
            input.setAttribute('readonly', 'readonly')
        })

        try {
            let timezone: { label: string, id: string }[]
            const historyTimeZone = localStorage.getItem('schedule-timezone')
            if (historyTimeZone) {
                timezone = JSON.parse(historyTimeZone)
            } else if (props.group.timezone) {
                timezone = [{
                    id: props.group.timezone,
                    label: timezoneList.find(item => item.id === props.group.timezone)!.label
                }]
            } else {
                const localTimezone = dayjs.tz.guess()
                const timezoneInfo = timezoneList.find(item => item.id === localTimezone) || {
                    id: 'UTC',
                    label: 'UTC+00:00'
                }
                timezone = [timezoneInfo]
            }

            setTimezoneSelected(timezone)

            const now = new Date()
            const {start, end} = getDuration(new Date(), timezone[0].id)
            let first: Date

            queryTimeLineEvent(eventGroup.id, start, end).then(res => {
                if (res.latest.length && !res.curr.length) {
                    first = new Date(res.latest[0].start_time!)
                } else if (res.first.length && !res.curr.length && !res.latest.length) {
                    first = new Date(res.first[0].start_time!)
                } else {
                    first = now
                }
                setFirstDate(first)
            })
        } catch (e: any) {
            console.error(e)
        }
    }, [])

    const getDuration = (date: Date, timezone: string) => {
        let start: string, end: string
        if (viewMode[0].id === 'Quarter Day') {
            start = dayjs.tz(date.getTime(), timezone).add(page - 1, 'month').startOf('month').toISOString()
            end = dayjs.tz(date.getTime(), timezoneSelected[0].id).add(page - 1, 'month').endOf('month').toISOString()
        } else if (viewMode[0].id === 'Day') {
            start = dayjs.tz(date.getTime(), timezone).add(page - 1, 'month').startOf('month').toISOString()
            end = dayjs.tz(date.getTime(), timezone).add(page - 1, 'month').endOf('month').toISOString()
        } else {
            start = dayjs.tz(date.getTime(), timezone).add(page - 1, 'year').startOf('year').toISOString()
            end = dayjs.tz(date.getTime(), timezone).add(page - 1, 'year').endOf('year').toISOString()
        }

        return {start, end}
    }


    useEffect(() => {
        if (timezoneSelected[0] && firstDate) {
            const now = firstDate
            const {start, end} = getDuration(now, timezoneSelected[0].id)
            const unload = showLoading()
            setStart(new Date(start))
            setEnd(new Date(end))
            queryEvent({
                group_id: eventGroup.id,
                start_time_from: start,
                start_time_to: end,
                page: 1,
                event_order: 'asc',
                page_size: 1000,
                tag: tag[0].id === 'All' ? undefined : tag[0].id
            }).then(res => {
                let eventList = []
                eventList = res
                    .map((event: Event) => {
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
                            start: dayjs.tz(new Date(event.start_time!), timezoneSelected[0].id).format('YYYY-MM-DD HH:mm'),
                            end: dayjs.tz(new Date(event.end_time!).getTime(), timezoneSelected[0].id).format('YYYY-MM-DD HH:mm'),
                            progress: progress,
                            location: event.location,
                            avatar: event.owner.image_url || defaultAvatar(event.owner.id),
                            host: event.owner.username,
                            host_info: event.host_info,
                            hide: false,
                            color: event.tags?.length ? getLabelColor(event.tags[0]) : '#a3a3ff',
                            bar_color: event.tags?.length ? getLabelColor(event.tags[0], 0.8) :getLightColor('#a3a3ff', 0.8),
                            tag: event.tags,
                            event: event
                        }
                    })


                if (!eventList.length) {
                    const pad = 30
                    for (let i = 0; i < pad; i++) {
                        eventList.push({
                            id: i + '',
                            name: '',
                            start: dayjs.tz(new Date(start).getTime(), timezoneSelected[0].id).format('YYYY-MM-DD HH:mm'),
                            end: dayjs.tz(new Date(end).getTime(), timezoneSelected[0].id).add(1, 'day').format('YYYY-MM-DD HH:mm'),
                            progress: 0,
                            location: '',
                            avatar: '',
                            host: '',
                            host_info: null,
                            hide: true,
                            color: '#a3a3ff',
                            bar_color: '#a3a3ff',
                            tag: [],
                            event: null as any
                        })
                    }
                } else if (eventList.length < 30) {
                    const pad = 30 - eventList.length
                    const padStartDate = eventList[eventList.length - 1].start
                    for (let i = 0; i < pad; i++) {
                        eventList.push({
                            id: i + '',
                            name: '',
                            start: dayjs.tz(new Date(padStartDate).getTime(), timezoneSelected[0].id).add(1, 'day').format('YYYY-MM-DD HH:mm'),
                            end: dayjs.tz(new Date(padStartDate).getTime(), timezoneSelected[0].id).add(2, 'day').format('YYYY-MM-DD HH:mm'),
                            progress: 0,
                            location: '',
                            avatar: '',
                            host: '',
                            hide: true,
                            color: '#a3a3ff',
                            bar_color: '#a3a3ff',
                            host_info: '',
                            tag: [],
                            event: null as any
                        })
                    }
                }

                console.log('eventList', eventList)
                console.log('ganttRef.current', ganttRef.current)
                ganttRef.current && ganttRef.current.clear()
                document.querySelector('#gantt-head')!.innerHTML = ''
                document.querySelector('#gantt')!.innerHTML = ''
                ganttRef.current = new Gantt('#gantt', eventList, {
                    view_mode: viewMode[0].id,
                    date_format: 'YYYY-MM-DD',
                    start: new Date(start),
                    end: new Date(end),
                    scrollToday: page === 1,
                    gantt_head: '#gantt-head',
                    popup_trigger: 'click',
                    custom_popup_html: function (task: any) {
                        let host = task.host
                        let avatar = task.avatar
                        if (task.host_info) {
                            const info = JSON.parse(task.host_info)
                            if (info.group_host) {
                                host = info.group_host.username
                                avatar = info.group_host.image_url || defaultAvatar(info.group_host.id)
                            }
                        }

                        // return `<div class="${styles['gantt-popup']}">
                        //            <div>
                        //                <div class="${styles['name']}">${task.name}</div>
                        //                <div class="${styles['detail']}"> <img src="${avatar}" alt=""><span>by ${host}</span></div>
                        //                <div class="${styles['detail']}"><i class="icon-calendar"></i><span>${formatDate(task.start, timezoneSelected[0].id)} - ${formatDate(task.end, timezoneSelected[0].id)}</span></div>
                        //                     ${task.location ? `<div class="${styles['detail']}"><i class="icon-Outline"></i><span>${task.location}</span></div>` : ''}
                        //                <a href="/event/detail/${task.id}" class="${styles['link']}" target="_blank">View Event</a>
                        //            </div>
                        //         </div>`
                        return renderToStaticMarkup(
                            <Link href={`/event/detail/${task.event.id}`} className={'event-card'}
                                  style={{width: '380px'}} target={'_blank'}>
                                <div className={'info'}>
                                    <div className={'left'}>
                                        <div className={'details'}>
                                            <div
                                                style={{color: '#272928'}}>{`${formatDate(task.start, timezoneSelected[0].id)} - ${formatDate(task.end, timezoneSelected[0].id)}`}</div>
                                            <div className={'title'}>
                                                {task.event.title}
                                            </div>
                                            <div className={'des'} style={{color: '#272928', wordBreak: 'break-word'}}>
                                                {removeMarkdown(task.event.content).slice(0, 50) + `${task.event.content.length > 50 ? '...' : ''}`}
                                            </div>
                                            <div className={'tags'}>
                                                {
                                                    task.tags?.map((tag: string) => {
                                                        return <div key={tag} className={'tag'}>
                                                            <i className={'dot'}
                                                               style={{background: getLabelColor(tag)}}/>
                                                            {tag}
                                                        </div>
                                                    })
                                                }
                                            </div>

                                            <div className={'detail'}>
                                                <img src={avatar} width={16} height={16} alt=""/>
                                                <span>host by {host}</span>
                                            </div>

                                            {!!task.location &&
                                                <div className={'detail'}>
                                                    <i className={'icon-Outline'}/>
                                                    <span>{task.location}</span>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                    <div className={'post'}>
                                        {
                                            task.event.cover_url ?
                                                <img src={task.event.cover_url} width={280} alt=""/>
                                                : <EventDefaultCover event={task.event} width={140} height={140}/>
                                        }
                                    </div>
                                    <div className={'post mobile'}>
                                        {
                                            task.event.cover_url ?
                                                <img src={task.event.cover_url} width={280} alt=""/>
                                                : <EventDefaultCover event={task.event} width={100} height={100}/>
                                        }
                                    </div>
                                </div>
                            </Link>
                        )
                    }
                })
            })
                .finally(() => {
                    unload()
                })
        }
    }, [firstDate, timezoneSelected, tag, page, viewMode])

    const toToday = () => {
        if (ganttRef.current) {
            setPage(1)
            ganttRef.current.change_view_mode()
        }
    }
    const lastPage = () => {
        setPage(page - 1)
    }
    const nextPage = () => {
        setPage(page + 1)
    }

    return <div className={styles['gant-page']}>
        <div className={styles['gant-menu']}>
            <div className={styles['left']}>
                <div className={styles['menu-item'] + ' input-disable'}>
                    <div className={styles[`year`]}>{(firstDate || new Date()).getFullYear()}
                        {viewMode[0].id !== 'Month' &&
                            <span>{lang['Month_Name'][(firstDate || new Date()).getMonth()]}</span>
                        }
                    </div>
                    <div className={styles['page-slide']}>
                        <svg
                            className={viewMode[0].id === 'Month' ? styles['disable'] : ''}
                            onClick={lastPage}
                            xmlns="http://www.w3.org/2000/svg"
                            width={20}
                            height={20}
                            viewBox="0 0 20 20"
                            fill="none">
                            <path
                                d="M7.8334 10.0013L14.2501 18.3346H11.0834L4.66675 10.0013L11.0834 1.66797H14.2501L7.8334 10.0013Z"
                                fill="#272928"
                            />
                        </svg>
                        <svg
                            onClick={() => {
                                toToday()
                            }}
                            xmlns="http://www.w3.org/2000/svg"
                            width={28}
                            height={40}
                            viewBox="0 0 28 40"
                            fill="none">
                            <circle cx={14} cy={20} r={3} fill="#272928"/>
                        </svg>
                        <svg
                            className={viewMode[0].id === 'Month' ? styles['disable'] : ''}
                            onClick={nextPage}
                            xmlns="http://www.w3.org/2000/svg"
                            width={20}
                            height={20}
                            viewBox="0 0 20 20"
                            fill="none">
                            <path
                                d="M15.3332 10.0013L8.91659 18.3346H5.74991L12.1666 10.0013L5.74991 1.66797H8.91659L15.3332 10.0013Z"
                                fill="#272928"
                            />
                        </svg>
                    </div>
                </div>
            </div>
            <div className={styles['right']}>
                <div className={styles['menu-item'] + ' input-disable'}>
                    <Select
                        labelKey={'label'}
                        valueKey={'id'}
                        clearable={false}
                        creatable={false}
                        searchable={false}
                        value={tag}
                        getOptionLabel={(opt: any) => {
                            return <div className={styles['label-item']}>
                                <i className={styles['label-color']}
                                   style={{background: opt.option.color || '#f1f1f1'}}/>
                                {opt.option.label}
                            </div>
                        }}
                        getValueLabel={(opt: any) => {
                            return <div className={styles['label-item']}>
                                <i className={styles['label-color']}
                                   style={{background: opt.option.color || '#f1f1f1'}}/>
                                {opt.option.label}
                            </div>
                        }}
                        options={[{id: 'All', label: 'All', color: null}, ...tags as any]}
                        onChange={({option}) => {
                            setTag([option] as any)
                        }}
                    />
                </div>
                <div className={styles['menu-item'] + ' input-disable'}>
                    <Select
                        labelKey={'label'}
                        valueKey={'id'}
                        clearable={false}
                        creatable={false}
                        searchable={false}
                        value={viewMode}
                        options={views}
                        onChange={({option}) => {
                            setPage(1)
                            setViewMode([option] as any)
                            // ganttRef.current && ganttRef.current.change_view_mode(option!.id)
                        }}
                    />
                </div>
            </div>
        </div>

        <div className={styles['gantt-warp']}>
            <div id={'gantt-head'} className={`${styles['gantt']} ${styles['gantt-head']}`}/>
            <div id={'gantt'} className={styles['gantt']}/>
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

