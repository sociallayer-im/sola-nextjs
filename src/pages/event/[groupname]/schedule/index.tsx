import {useContext, useEffect, useMemo, useRef, useState} from 'react'
import {
    Event,
    EventSites,
    getEventSide,
    getGroups,
    getGroupsBatch,
    getTracks,
    Group,
    queryEventDetail,
    queryScheduleEvent,
    Track
} from "@/service/solas";
import styles from './schedulenew.module.scss'
import Link from 'next/link'
import UserContext from "@/components/provider/UserProvider/UserContext";
import LangContext from "@/components/provider/LangProvider/LangContext";
import usePicture from "@/hooks/pictrue";
import {getLabelColor} from "@/hooks/labelColor";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import timezoneList from "@/utils/timezone"
import {Select} from "baseui/select";
import {StatefulTooltip} from "baseui/tooltip"
import ScheduleHeader from "@/components/base/ScheduleHeader";
import {PageBackContext} from "@/components/provider/PageBackProvider";
import Check from 'baseui/icon/check'
import {EventPopup} from "@/components/compose/EventPopup/EventPopup";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";

import * as dayjsLib from "dayjs";
import {isHideLocation} from "@/global_config";
import fetch from "@/utils/fetch";
import genGoogleMapLink from "@/utils/googleMapLink";

const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore')
const updateLocale = require('dayjs/plugin/updateLocale')
const dayjs: any = dayjsLib
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(isSameOrBefore)
dayjs.extend(updateLocale)
dayjs.updateLocale(dayjs.locale(), {weekStart: 1})


const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const mouthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

let _offsetX = 0
let _offsetY = 0
let _touchStartX = 0
let _touchStartY = 0

let groupHostCache: Group[] = []

const logos = [
    {
        time: ['2024/06/10', '2024/06/16'],
        group: 3409,
        logo: 'https://ik.imagekit.io/soladata/1q58x6ec_zHuugBRKN',
        timezone: 'America/los_angeles'
    },
    // {
    //     time: ['2024/05/01', '2024/05/30'],
    //     group: 3409,
    //     logo: 'https://ik.imagekit.io/soladata/1q58x6ec_zHuugBRKN',
    //     timezone: 'America/los_angeles'
    // }
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

const getCalendarData = (timeZone: string, pageSize: number, date?: string) => {
    const now = date ? dayjs.tz(date?.replace('-', '/'), timeZone) : dayjs.tz(new Date().getTime(), timeZone)

    if (pageSize === 7) {
        const _from = now.startOf('week')
        const _end = _from.endOf('week')
        const interval = []
        let curr = _from
        while (curr.isSameOrBefore(_end)) {
            interval.push(curr)
            curr = curr.add(1, 'day')
        }

        return {
            from: _from,
            end: _end,
            now,
            interval
        }
    } else {
        const interval = []
        let curr = 0
        while (curr <= pageSize - 1) {
            interval.push(now.add(curr, 'day'))
            curr++
        }

        return {
            from: interval[0],
            end: interval[pageSize - 1],
            now,
            interval
        }
    }

}


function ComponentName(props: { group: Group, eventSite: EventSites[], tracks: Track[] }) {
    const eventGroup = props.group
    const scroll1Ref = useRef<any>(null)
    const scroll2Ref = useRef<any>(null)
    const eventListRef = useRef<Event[]>([])
    const needScroll = useRef(true)
    const lock = useRef(false)
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const {showLoading} = useContext(DialogsContext)
    const {applyScroll} = useContext(PageBackContext)
    const router = useRouter()


    const {user} = useContext(UserContext)
    const [showJoined, setShowJoined] = useState(false)
    const {lang} = useContext(LangContext)

    const [dayList, setDayList] = useState<DateItem[]>([])
    const [eventList, setEventList] = useState<Event[]>([])
    const [showList, setShowList] = useState<DateItem[]>([])
    const [pageList, setPageList] = useState<DateItem[]>([])
    const [ready, setReady] = useState(false)
    const [currMonth, setCurrMonth] = useState(new Date().getMonth())
    const [currYear, setCurrYear] = useState(new Date().getFullYear())
    const [timezoneSelected, setTimezoneSelected] = useState('')

    let presetTag = searchParams?.get('tag')
    let presetVenue = searchParams?.get('venue')
    let presetDate = searchParams?.get('date')
    let presetTrack = searchParams?.get('track')

    const [data, setData] = useState<{
        selectedTags: string[],
        selectedVenue: number[],
        selectedTrack: number[],
        selectedDate: string,
        start: null | any,
        end: null | any,
        now: null | any,
        interval: any[],
        events: Event[],
        pageSize: number
    }>({
        selectedTags: presetTag ? presetTag.split(',') : [],
        selectedVenue: presetVenue ? presetVenue.split(',').map(i => Number(i)) : [],
        selectedTrack: presetTrack ? presetTrack.split(',').map(i => Number(i)) : [],
        selectedDate: presetDate ? presetDate.replace('-', '/') : '',
        start: null,
        end: null,
        now: null,
        interval: [],
        events: [],
        pageSize: 0
    })


    useEffect(() => {
        const calcPageSize = () => {
            const win = window as any
            const clientWidth = win.document.body.clientWidth
            if (clientWidth >= 1200) {
                return 7
            } else if (clientWidth >= 1025) {
                return 5
            } else if (clientWidth >= 768) {
                return 4
            } else if (clientWidth >= 576) {
                return 3
            } else {
                return 1
            }
        }

        if (typeof window !== 'undefined' && !timezoneSelected) {
            const timezone = props.group.timezone || dayjs.tz.guess()
            setTimezoneSelected(timezone)
            setData({
                ...data,
                pageSize: calcPageSize(),
                selectedDate: presetDate || dayjs.tz(new Date(), timezone).format('YYYY-MM-DD')
            })
        }
    }, []);

    const disPlayEvents = useMemo(() => {
        console.log('interval', data.interval)
        let list: {date: any, events: Event[]}[] = data.interval.map((i) => {
            return {
                date: i,
                events: []
            }
        })
        const timezone = props.group.timezone || dayjs.tz.guess()
        list.forEach((i, index) => {
            data.events.forEach(e => {
                const eventsStart = dayjs.tz(new Date(e.start_time!).getTime(), timezone).format('YYYY-MM-DD')
                if (i.date.format('YYYY-MM-DD') === eventsStart) {
                    list[index].events.push(e)
                }
            })
        })

        return list
    }, [data.events, data.interval, props.group.timezone])

    const scrollDebounce = useRef<any>(null)

    const tags = props.group.event_tags?.filter(t=> !t.startsWith(':'))
        .map((item: string) => {
        return {
            id: item,
            label: item,
            color: getLabelColor(item)
        }
    }) || []

    const venues = props.eventSite.map((item) => {
        return {
            id: item.id,
            label: item.title,
            color: null
        }
    }) || []

    const toToday = () => {
        const nextStart = dayjs(new Date(), timezoneSelected).format('YYYY-MM-DD')
        setData({
            ...data,
            selectedDate: nextStart
        })
    }

    const nextPage = () => {
        const nextStart = data.end.add(1, 'day')
        setData({
            ...data,
            selectedDate: nextStart.format('YYYY-MM-DD')
        })
    }

    const lastPage = () => {
        const nextStart = data.start.subtract(data.pageSize, 'day')
        setData({
            ...data,
            selectedDate: nextStart.format('YYYY-MM-DD')
        })
    }

    const genHref = ({date, tag, venue}: { date?: string, tag?: string, venue?: string }) => {
        let search = '?'
        if (date) {
            search += `date=${date}`
        }

        if (tag) {
            search += search === '?' ? `tag=${tag}` : `&tag=${tag}`
        }

        if (venue) {
            search += search === '?' ? `venue=${venue}` : `&venue=${venue}`
        }

        return search === '?' ? '' : search
    }


    useEffect(() => {
        ;(async ()=> {
            if (typeof window !== 'undefined' && data.pageSize && data.selectedDate) {
                document.querySelector('.schedule-content')?.classList.add(styles['fade-out'])
                document.querySelector('.schedule-content')?.classList.add(styles[`move-left`])
                const timezone = props.group.timezone || dayjs.tz.guess()
                const {from, end, now, interval} = getCalendarData(timezone, data.pageSize, data.selectedDate)
                const apiSearchParams = new URLSearchParams()
                apiSearchParams.set('group_id', eventGroup.id.toString())
                apiSearchParams.set('limit', '1000')
                apiSearchParams.set('timezone', timezone)
                apiSearchParams.set('start_date', from.format('YYYY-MM-DD'))
                apiSearchParams.set('end_date', end.format('YYYY-MM-DD'))
                !!data.selectedTags?.[0] && apiSearchParams.set('tags', data.selectedTags.join(','))
                !!data.selectedVenue?.[0] && apiSearchParams.set('venue_id', data.selectedVenue[0].toString())
                !!data.selectedTrack?.[0] && apiSearchParams.set('track_id', data.selectedTrack[0].toString())
                if (user.authToken) {
                    apiSearchParams.set('auth_token', user.authToken)
                    if (showJoined) {
                        apiSearchParams.set('my_event', '1')
                    }
                }
                const url = `${process.env.NEXT_PUBLIC_EVENT_LIST_API}/event/list?${apiSearchParams.toString()}`
                const res = await fetch.get({url})
                setData({
                    ...data,
                    start: from,
                    end: end,
                    now: now,
                    interval: interval,
                    events: res.data.events
                })


                const pageUrl = new URL(window.location.href)
                if (!!data.selectedTags?.[0]) {
                    pageUrl.searchParams.set('tag', data.selectedTags.join(','))
                } else {
                    pageUrl.searchParams.delete('tag')
                }

                if (!!data.selectedVenue?.[0]) {
                    pageUrl.searchParams.set('venue', data.selectedVenue.join(','))
                } else {
                    pageUrl.searchParams.delete('venue')
                }

                if (!!data.selectedTags?.[0]) {
                    pageUrl.searchParams.set('tag', data.selectedTags.join(','))
                } else  {
                    pageUrl.searchParams.delete('tag')
                }

                if (!!data.selectedTrack?.[0]) {
                    pageUrl.searchParams.set('track', data.selectedTrack.join(','))
                } else  {
                    pageUrl.searchParams.delete('track')
                }

                pageUrl.searchParams.set('date', from.format('YYYY-MM-DD'))

                window.history.pushState({}, '', pageUrl.toString())



                setTimeout(() => {
                    document.querySelector('.schedule-content')?.classList.remove(styles['fade-out'])
                    document.querySelector('.schedule-content')?.classList.remove(styles[`move-left`])
                }, 100)
            }
        })()
    }, [data.selectedDate, data.selectedTags, data.selectedTrack, data.selectedVenue, showJoined])


    useEffect(() => {
        document.querySelectorAll('.input-disable input').forEach((input) => {
            input.setAttribute('readonly', 'readonly')
        })

        const scrollBar2 = scroll2Ref.current

        const checkScroll = (e: any) => {
            if (scrollBar2.scrollTop > 0) {
                const header: any = (window as any).document.querySelector('.schedule-head')
                const list: any = (window as any).document.querySelector('.event-list')
                !!header && (header.style.height = '0');
                !!list && (list.style.minHeight = `100vh`);
            } else {
                const handleScroll = () => {
                    const header: any = (window as any).document.querySelector('.schedule-head')
                    !!header && (header.style.height = '180px');
                }
                if (scrollDebounce.current) {
                    clearTimeout(scrollDebounce.current)
                }
                scrollDebounce.current = setTimeout(() => {
                    handleScroll()
                }, 100)
            }
        }

        const touchstart = (e: any) => {
            _touchStartX = e.touches[0].clientX
            _touchStartY = e.touches[0].clientY
        }

        const touchmove = (e: any) => {
            _offsetX = e.touches[0].clientX - _touchStartX
            _offsetY = e.touches[0].clientY - _touchStartY
        }

        const touchend = (e: any) => {
            setTimeout(() => {
                _offsetX = 0
                _offsetY = 0
            }, 300)
        }

        if (window.innerWidth < 450) {
            scrollBar2 && scrollBar2.addEventListener('scroll', checkScroll)
            scrollBar2.addEventListener('touchstart', touchstart)
            scrollBar2.addEventListener('touchmove', touchmove)
            scrollBar2.addEventListener('touchend', touchend)
            scrollBar2.addEventListener('touchcancel', touchend)
        }

        return () => {
            if (typeof window !== 'undefined') {
                if (window.innerWidth < 450) {
                    scrollBar2 && scrollBar2.removeEventListener('scroll', checkScroll)
                    scrollBar2.removeEventListener('touchstart', touchstart)
                    scrollBar2.removeEventListener('touchmove', touchmove)
                    scrollBar2.removeEventListener('touchend', touchend)
                    scrollBar2.removeEventListener('touchcancel', touchend)
                }
            }
        }
    }, [])

    const selectedTrackObj = props.tracks.find(i => i.id === data.selectedTrack[0])
    const selectedVenueObj = props.eventSite.find(i => i.id === data.selectedVenue[0])

    return (<div className={styles['schedule-page']}>
        {
            !pathname?.includes('iframe') &&
            <ScheduleHeader group={eventGroup} params={genHref({
                venue: data.selectedVenue.length ? data.selectedVenue.join(',') : undefined,
                tag: data.selectedTags.length ? data.selectedTags.join(',') : undefined,
                date: pageList.length ? dayjs.tz(pageList[0].timestamp, timezoneSelected).format('YYYY-MM-DD') : undefined
            })}/>
        }


        <div className={`${styles['schedule-head']} schedule-head`}>
            <div className={styles['page-center']}>
                <div className={styles['schedule-title']}>
                    <div className={styles['schedule-title-left']}>
                        <div className={'group-name'}>
                            {
                                pathname?.includes('iframe') ?
                                    <img src="/images/logo.svg" alt="" width={94} height={29}/> :
                                    <Link href={`/event/${eventGroup.username}`}>
                                        {eventGroup.nickname || eventGroup.username}
                                    </Link>
                            }
                            <div> {lang['Activity_Calendar']}</div>
                        </div>
                    </div>
                    <Link className={styles['create-btn']} href={`/event/${eventGroup.username}/create`}
                          target={'_blank'}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
                            <path
                                d="M13.1667 7.33335H9.16675V3.33335C9.16675 3.15654 9.09651 2.98697 8.97149 2.86195C8.84646 2.73693 8.67689 2.66669 8.50008 2.66669C8.32327 2.66669 8.1537 2.73693 8.02868 2.86195C7.90365 2.98697 7.83341 3.15654 7.83341 3.33335V7.33335H3.83341C3.6566 7.33335 3.48703 7.40359 3.36201 7.52862C3.23699 7.65364 3.16675 7.82321 3.16675 8.00002C3.16675 8.17683 3.23699 8.3464 3.36201 8.47142C3.48703 8.59645 3.6566 8.66669 3.83341 8.66669H7.83341V12.6667C7.83341 12.8435 7.90365 13.0131 8.02868 13.1381C8.1537 13.2631 8.32327 13.3334 8.50008 13.3334C8.67689 13.3334 8.84646 13.2631 8.97149 13.1381C9.09651 13.0131 9.16675 12.8435 9.16675 12.6667V8.66669H13.1667C13.3436 8.66669 13.5131 8.59645 13.6382 8.47142C13.7632 8.3464 13.8334 8.17683 13.8334 8.00002C13.8334 7.82321 13.7632 7.65364 13.6382 7.52862C13.5131 7.40359 13.3436 7.33335 13.1667 7.33335Z"
                                fill="#272928"/>
                        </svg>
                        {`Create an event ${pathname?.includes('iframe') ? ' from Social Layer' : ''}`}
                    </Link>
                    <Link className={styles['create-btn-2']} href={`/event/${eventGroup.username}/create`}
                          target={'_blank'}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16"
                             fill="none">
                            <path
                                d="M13.1667 7.33335H9.16675V3.33335C9.16675 3.15654 9.09651 2.98697 8.97149 2.86195C8.84646 2.73693 8.67689 2.66669 8.50008 2.66669C8.32327 2.66669 8.1537 2.73693 8.02868 2.86195C7.90365 2.98697 7.83341 3.15654 7.83341 3.33335V7.33335H3.83341C3.6566 7.33335 3.48703 7.40359 3.36201 7.52862C3.23699 7.65364 3.16675 7.82321 3.16675 8.00002C3.16675 8.17683 3.23699 8.3464 3.36201 8.47142C3.48703 8.59645 3.6566 8.66669 3.83341 8.66669H7.83341V12.6667C7.83341 12.8435 7.90365 13.0131 8.02868 13.1381C8.1537 13.2631 8.32327 13.3334 8.50008 13.3334C8.67689 13.3334 8.84646 13.2631 8.97149 13.1381C9.09651 13.0131 9.16675 12.8435 9.16675 12.6667V8.66669H13.1667C13.3436 8.66669 13.5131 8.59645 13.6382 8.47142C13.7632 8.3464 13.8334 8.17683 13.8334 8.00002C13.8334 7.82321 13.7632 7.65364 13.6382 7.52862C13.5131 7.40359 13.3436 7.33335 13.1667 7.33335Z"
                                fill="#272928"/>
                        </svg>
                    </Link>
                </div>
                <div className={styles['schedule-menu-1']}>
                    <div className={styles['menu-item'] + ' input-disable'}>
                        <Select
                            labelKey={'label'}
                            valueKey={'id'}
                            clearable={false}
                            creatable={false}
                            searchable={false}
                            value={[{id: '', label: '', color: null}] as any}
                            getOptionLabel={(opt: any) => {
                                return <div className={styles['label-item']}>
                                    {
                                        data.selectedTags.includes(opt.option.id) ?
                                            <Check size={22}/>
                                            : <span style={{marginRight: '22px'}}/>
                                    }
                                    <i className={styles['label-color']}
                                       style={{background: opt.option.color || '#f1f1f1'}}/>
                                    {opt.option.label}
                                </div>
                            }}
                            getValueLabel={(opt: any) => {
                                return <div className={styles['label-item']}>
                                    {!!data.selectedTags.length &&
                                        <i className={styles['label-notice']}
                                           style={{background: 'red'}}/>
                                    }
                                    Tags
                                </div>
                            }}
                            options={[{id: 'All', label: 'All Tags', color: null}, ...tags as any]}
                            onChange={({option}) => {
                                if (!option) return
                                if (option.id === 'All') {
                                    setData({
                                        ...data,
                                        selectedTags:[]
                                    })
                                } else if (
                                    data.selectedTags.includes(option!.id as any)) {
                                    setData({
                                        ...data,
                                        selectedTags:data.selectedTags.filter(i => i !== option.id)
                                    })
                                } else {
                                    setData({
                                        ...data,
                                        selectedTags:[...data.selectedTags, option.id as any]
                                    })
                                }
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
                            value={[{id: '', label: '', color: null}] as any}
                            getOptionLabel={(opt: any) => {
                                return <div className={styles['label-item']}>
                                    {
                                        data.selectedVenue.includes(opt.option.id) ?
                                            <Check size={22}/>
                                            : <span style={{marginRight: '22px'}}/>
                                    }
                                    {opt.option.label}
                                </div>
                            }}
                            getValueLabel={(opt: any) => {
                                return <div className={styles['label-item-venue']}>
                                    {!!selectedVenueObj ? selectedVenueObj.title : 'Venues' }
                                </div>
                            }}
                            options={[{id: 0, label: 'All Venues', color: null}, ...venues as any]}
                            onChange={({option}) => {
                                if (!option) return
                                if (option.id === 0) {
                                    setData({
                                        ...data,
                                        selectedVenue:[]
                                    })
                                } else {
                                    setData({
                                        ...data,
                                        selectedVenue:[option.id as any]
                                    })
                                }
                            }}
                        />
                    </div>
                    { props.tracks.length > 0 &&
                        <div className={styles['menu-item'] + ' input-disable'}>
                            <Select
                                labelKey={'title'}
                                valueKey={'id'}
                                clearable={false}
                                creatable={false}
                                searchable={false}
                                value={ !!selectedTrackObj
                                    ?  [selectedTrackObj]
                                    : [{id: 0, title: 'All Tracks'}] as any}
                                options={[{id: 0, title: 'All Tracks'}, ...props.tracks as any]}
                                onChange={({option}) => {
                                    if (!option) return
                                    if (option.id === 0) {
                                        setData({
                                            ...data,
                                            selectedTrack:[]
                                        })
                                    } else {
                                        setData({
                                            ...data,
                                            selectedTrack:[option.id as any]
                                        })
                                    }
                                }}
                            />
                        </div>
                    }
                </div>
            </div>
            <div className={styles['schedule-mouth']}>
                <div className={styles['schedule-menu-2']}>
                    <div className={styles['schedule-menu-center']}>
                        <div className={styles['mouth']}>
                            { !!data.start &&
                                <div className={'curr-month'}
                                     style={{marginRight: '12px'}}>{data.start.format('MMMM')} {data.start.format('YYYY')}
                                </div>
                            }
                            {timezoneSelected.length !== 0 &&
                                <>
                                    <StatefulTooltip content={() => {
                                        let gmtOffset = new Intl.DateTimeFormat('en-US', {
                                            timeZone: timezoneSelected,
                                            timeZoneName: 'short'
                                        })
                                            .formatToParts().find(part => part.type === 'timeZoneName')?.value;
                                        return <div>{timezoneSelected} {gmtOffset}</div>
                                    }}>
                                        <svg style={{padding: '0 8px'}} className="icon" viewBox="0 0 1024 1024"
                                             version="1.1"
                                             xmlns="http://www.w3.org/2000/svg" p-id="1476" width="22" height="22">
                                            <path
                                                d="M512 97.52381c228.912762 0 414.47619 185.563429 414.47619 414.47619s-185.563429 414.47619-414.47619 414.47619S97.52381 740.912762 97.52381 512 283.087238 97.52381 512 97.52381z m0 73.142857C323.486476 170.666667 170.666667 323.486476 170.666667 512s152.81981 341.333333 341.333333 341.333333 341.333333-152.81981 341.333333-341.333333S700.513524 170.666667 512 170.666667z m45.32419 487.619047v73.142857h-68.510476l-0.024381-73.142857h68.534857z m-4.047238-362.008381c44.251429 8.923429 96.889905 51.126857 96.889905 112.518096 0 61.415619-50.151619 84.650667-68.120381 96.134095-17.993143 11.50781-24.722286 24.771048-24.722286 38.863238V609.52381h-68.534857v-90.672762c0-21.504 6.89981-36.571429 26.087619-49.883429l4.315429-2.852571 38.497524-25.6c24.551619-16.530286 24.210286-49.712762 9.020952-64.365715a68.998095 68.998095 0 0 0-60.391619-15.481904c-42.715429 8.387048-47.640381 38.521905-47.932952 67.779047v16.554667H390.095238c0-56.953905 6.534095-82.773333 36.912762-115.395048 34.03581-36.449524 81.993143-42.300952 126.268952-33.328762z"
                                                p-id="1477"></path>
                                        </svg>
                                    </StatefulTooltip>


                                    <div className={styles['page-slide']}>
                                        <StatefulTooltip
                                            content={() => <div>Last Page</div>}>
                                            <svg
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
                                        </StatefulTooltip>
                                        <StatefulTooltip
                                            content={() => <div>Today</div>}>
                                            <svg
                                                onClick={e => {
                                                    toToday()
                                                }}
                                                xmlns="http://www.w3.org/2000/svg"
                                                width={28}
                                                height={40}
                                                viewBox="0 0 28 40"
                                                fill="none">
                                                <circle cx={14} cy={20} r={3} fill="#272928"/>
                                            </svg>
                                        </StatefulTooltip>
                                        <StatefulTooltip
                                            content={() => <div>Next Page</div>}>
                                            <svg
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
                                        </StatefulTooltip>
                                    </div>
                                </>
                            }
                        </div>
                        {!!user.id &&
                            <div className={styles['show-joined']} onClick={e => {
                                setShowJoined(!showJoined)
                            }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21"
                                     fill="none">
                                    <path
                                        className={showJoined ? styles['show-joined-active'] : styles['show-joined-normal']}
                                        d="M12.267 7.82533L8.692 11.4087L7.317 10.0337C7.24229 9.94642 7.15036 9.87557 7.04697 9.82555C6.94358 9.77554 6.83097 9.74743 6.71621 9.74299C6.60144 9.73856 6.487 9.7579 6.38006 9.79979C6.27312 9.84169 6.176 9.90524 6.09479 9.98645C6.01357 10.0677 5.95003 10.1648 5.90813 10.2717C5.86624 10.3787 5.8469 10.4931 5.85133 10.6079C5.85576 10.7226 5.88387 10.8352 5.93389 10.9386C5.98391 11.042 6.05476 11.134 6.142 11.2087L8.10033 13.1753C8.1782 13.2526 8.27054 13.3137 8.37207 13.3551C8.4736 13.3966 8.58232 13.4176 8.692 13.417C8.91061 13.4161 9.12011 13.3293 9.27533 13.1753L13.442 9.00866C13.5201 8.93119 13.5821 8.83902 13.6244 8.73747C13.6667 8.63592 13.6885 8.527 13.6885 8.41699C13.6885 8.30698 13.6667 8.19806 13.6244 8.09651C13.5821 7.99496 13.5201 7.90279 13.442 7.82533C13.2859 7.67012 13.0747 7.583 12.8545 7.583C12.6343 7.583 12.4231 7.67012 12.267 7.82533ZM10.0003 2.16699C8.35215 2.16699 6.74099 2.65573 5.37058 3.57141C4.00017 4.48709 2.93206 5.78858 2.30133 7.3113C1.6706 8.83401 1.50558 10.5096 1.82712 12.1261C2.14866 13.7426 2.94234 15.2274 4.10777 16.3929C5.27321 17.5583 6.75807 18.352 8.37458 18.6735C9.99109 18.9951 11.6666 18.8301 13.1894 18.1993C14.7121 17.5686 16.0136 16.5005 16.9292 15.1301C17.8449 13.7597 18.3337 12.1485 18.3337 10.5003C18.3337 9.40598 18.1181 8.32234 17.6993 7.3113C17.2805 6.30025 16.6667 5.38159 15.8929 4.60777C15.1191 3.83395 14.2004 3.22012 13.1894 2.80133C12.1783 2.38254 11.0947 2.16699 10.0003 2.16699ZM10.0003 17.167C8.68179 17.167 7.39286 16.776 6.29653 16.0435C5.2002 15.3109 4.34572 14.2697 3.84113 13.0515C3.33655 11.8334 3.20453 10.4929 3.46176 9.19972C3.719 7.90652 4.35393 6.71863 5.28628 5.78628C6.21863 4.85393 7.40652 4.21899 8.69973 3.96176C9.99293 3.70452 11.3334 3.83654 12.5516 4.34113C13.7697 4.84571 14.8109 5.7002 15.5435 6.79652C16.276 7.89285 16.667 9.18178 16.667 10.5003C16.667 12.2684 15.9646 13.9641 14.7144 15.2144C13.4641 16.4646 11.7684 17.167 10.0003 17.167Z"
                                        fill="#272928"/>
                                </svg>
                                {lang['Activity_Detail_Btn_Joined']}
                            </div>
                        }
                    </div>
                </div>

            </div>
        </div>
        <div className={`${styles['content-bg']}`}>
            <div className={`${styles['content-bg-2']}`}></div>
            <div className={`${styles['content']} schedule-content`}>
                <div className={`${styles['date-bar-wrapper']} date-bar-wrapper`} ref={scroll1Ref}>
                    <div className={`${styles['date-bar']}`}>
                        {disPlayEvents
                            .map((item: any, index) => {
                                const isMonthBegin = item.date.date() === 1

                                return <div key={index + ''}
                                            data-month={item.date.month()}
                                            data-year={item.date.year()}
                                            className={isMonthBegin ? `month-begin ${styles['date-column']}` : styles['date-column']}>
                                    <div className={styles['date-day']}>
                                        {
                                            isMonthBegin &&
                                            <span className={styles['month']}>{lang['Month_Name'][item.date.month()]} </span>
                                        }
                                        <span>{item.date.format('ddd')}</span>
                                        <span
                                            className={item.date.format('YYYY-MM-DD') === dayjs.tz(new Date().getTime(), timezoneSelected).format('YYYY-MM-DD')
                                                ? styles['date-active'] : styles['date']}>{item.date.date()}</span>
                                    </div>
                                </div>
                            })
                        }
                    </div>
                </div>
                <div className={`${styles['event-wrapper']} event-wrapper`} ref={scroll2Ref}>
                    <div className={`${styles['event-list']} event-list`}>
                        {disPlayEvents.map((item, index) => {
                            return <div key={index + ''} className={`${styles['date-column']} date-column`}>
                                <div className={`${styles['events']}`}>
                                    {item.events
                                        .map((e: Event) => {
                                            const track = props.tracks.find(i => i.id === e.track_id)
                                            return <EventCard
                                                groupHostCache={groupHostCache}
                                                blank={location.href.includes('iframe')}
                                                key={Math.random() + e.title}
                                                timezone={timezoneSelected}
                                                event={e}
                                                track={track}
                                                group={props.group}/>
                                        })}
                                </div>
                            </div>
                        })
                        }
                    </div>
                </div>
            </div>

        </div>
    </div>)
}

export default ComponentName

export const getServerSideProps: any = (async (context: any) => {
    const groupname = context.params?.groupname
    if (groupname) {
        const group = await getGroups({username: groupname})
        const eventSite = await getEventSide(group[0].id)
        const tracks = await getTracks({groupId: group[0].id})
        return {props: {group: group[0], eventSite: eventSite, tracks}}
    }
})

function EventCard({
                       event,
                       blank,
                       group,
                       timezone,
                        track,
                       groupHostCache
                   }: { track?: Track, event: Event, blank?: boolean, group?: Group, timezone: string, groupHostCache: Group[] }) {
    const showTimezone = timezone || event.timezone || 'UTC'
    const isAllDay = dayjs.tz(new Date(event.start_time!).getTime(), showTimezone).hour() === 0 && ((new Date(event.end_time!).getTime() - new Date(event.start_time!).getTime() + 60000) % 8640000 === 0)
    const fromTime = dayjs.tz(new Date(event.start_time!).getTime(), showTimezone).format('HH:mm')
    const toTime = dayjs.tz(new Date(event.end_time!).getTime(), showTimezone).format('HH:mm')
    const fromDate = dayjs.tz(new Date(event.start_time!).getTime(), showTimezone).format('YYYY-MM-DD')
    const {user} = useContext(UserContext)
    const {openDialog, showLoading} = useContext(DialogsContext)

    const offset = dayjs.tz(new Date(event.end_time!).getTime(), showTimezone).utcOffset()
    const utcOffset = offset >= 0 ?
        ' GMT +' + offset / 60 :
        ' GMT ' + offset / 60

    const showPopup = async () => {
        const unload = showLoading()
        const eventDetail = await queryEventDetail({id: event.id})
        unload()
        openDialog({
            content: (close: any) => {
                return <EventPopup close={close} event={eventDetail} timezone={showTimezone}/>
            },
            size: [450, 'auto'],
            position: 'bottom',
        })
    }

    // const highlight = event.display && event.display.includes('color:') ?
    //     {background: `linear-gradient(180deg, #fff -20%, ${event.display.split('color:')[1].split(';')[0]}`} : {}

    const highlight = event.pinned ?
        {background: '#FFF7E8'} : undefined

    const groupHost = event.event_roles?.find(i => i.role === 'group_host')

    const {defaultAvatar} = usePicture()
    return <div className={styles['schedule-event-card']}
                style={highlight}
                onClick={showPopup}
                onTouchEnd={e => {
                    // e.preventDefault()
                    // if (_offsetX === 0 && _offsetX === 0) {
                    //     showPopup()
                    // }
                }}>
        <div className={styles['schedule-event-card-time']}>
            {isAllDay ? 'All Day' : `${fromTime}-${toTime}`}
        </div>
        <div className={styles['schedule-event-card-name']}>
            {event.title}
        </div>

        <div style={{height: '18px'}}>
            {!!groupHost ? <div className={styles['schedule-event-card-host']}>
                    <img className={styles['schedule-event-card-avatar']}
                         src={groupHost.image_url || defaultAvatar(groupHost.item_id)} alt=""/>
                    <div>{groupHost.nickname}</div>
                </div>
                :
                <div className={styles['schedule-event-card-host']}>
                    <img className={styles['schedule-event-card-avatar']}
                         src={event.owner.image_url || defaultAvatar(event.owner.id)} alt=""/>
                    <div>{event.owner.nickname || event.owner.username}</div>
                </div>
            }
        </div>


        {!!event.location && !event.venue && (!isHideLocation(event.group_id) || !!user.id) &&
            <div className={styles['schedule-event-card-position']}
                 onClick={e => {
                     e.stopPropagation()
                     e.preventDefault()
                     location.href = genGoogleMapLink(event.geo_lat!, event.geo_lng!, event.location_data)
                 }}>
                <i className={`${styles['icon']} icon-Outline`}/>
                <div className={styles['location-text']}>{event.location}</div>
                <svg className={styles['link-icon']} xmlns="http://www.w3.org/2000/svg" width="8" height="8"
                     viewBox="0 0 8 8" fill="none">
                    <path
                        d="M7.10418 0.861667C7.04498 0.71913 6.93171 0.60586 6.78918 0.546667C6.71905 0.516776 6.64374 0.500922 6.56751 0.5H0.734177C0.579467 0.5 0.431094 0.561458 0.321698 0.670854C0.212302 0.780251 0.150843 0.928624 0.150843 1.08333C0.150843 1.23804 0.212302 1.38642 0.321698 1.49581C0.431094 1.60521 0.579467 1.66667 0.734177 1.66667H5.16168L0.32001 6.5025C0.265335 6.55673 0.221939 6.62125 0.192323 6.69233C0.162708 6.76342 0.147461 6.83966 0.147461 6.91667C0.147461 6.99367 0.162708 7.06992 0.192323 7.141C0.221939 7.21209 0.265335 7.2766 0.32001 7.33083C0.374238 7.38551 0.438756 7.42891 0.50984 7.45852C0.580925 7.48814 0.65717 7.50338 0.734177 7.50338C0.811184 7.50338 0.887429 7.48814 0.958513 7.45852C1.0296 7.42891 1.09411 7.38551 1.14834 7.33083L5.98418 2.48917V6.91667C5.98418 7.07138 6.04563 7.21975 6.15503 7.32915C6.26443 7.43854 6.4128 7.5 6.56751 7.5C6.72222 7.5 6.87059 7.43854 6.97999 7.32915C7.08939 7.21975 7.15084 7.07138 7.15084 6.91667V1.08333C7.14992 1.0071 7.13407 0.931796 7.10418 0.861667Z"
                        fill="#272928"/>
                </svg>
            </div>
        }

        {!!event.venue && (!isHideLocation(event.group_id) || !!user.id) &&
            <div className={styles['schedule-event-card-position']}
                 onClick={e => {
                     e.stopPropagation()
                     e.preventDefault()
                     location.href = genGoogleMapLink(event.geo_lat!, event.geo_lng!, event.location_data)
                 }}>
                <i className={`${styles['icon']} icon-Outline`}/>
                <div className={styles['location-text']}>{event.venue!.title}</div>
                <svg className={styles['link-icon']} xmlns="http://www.w3.org/2000/svg" width="8" height="8"
                     viewBox="0 0 8 8" fill="none">
                    <path
                        d="M7.10418 0.861667C7.04498 0.71913 6.93171 0.60586 6.78918 0.546667C6.71905 0.516776 6.64374 0.500922 6.56751 0.5H0.734177C0.579467 0.5 0.431094 0.561458 0.321698 0.670854C0.212302 0.780251 0.150843 0.928624 0.150843 1.08333C0.150843 1.23804 0.212302 1.38642 0.321698 1.49581C0.431094 1.60521 0.579467 1.66667 0.734177 1.66667H5.16168L0.32001 6.5025C0.265335 6.55673 0.221939 6.62125 0.192323 6.69233C0.162708 6.76342 0.147461 6.83966 0.147461 6.91667C0.147461 6.99367 0.162708 7.06992 0.192323 7.141C0.221939 7.21209 0.265335 7.2766 0.32001 7.33083C0.374238 7.38551 0.438756 7.42891 0.50984 7.45852C0.580925 7.48814 0.65717 7.50338 0.734177 7.50338C0.811184 7.50338 0.887429 7.48814 0.958513 7.45852C1.0296 7.42891 1.09411 7.38551 1.14834 7.33083L5.98418 2.48917V6.91667C5.98418 7.07138 6.04563 7.21975 6.15503 7.32915C6.26443 7.43854 6.4128 7.5 6.56751 7.5C6.72222 7.5 6.87059 7.43854 6.97999 7.32915C7.08939 7.21975 7.15084 7.07138 7.15084 6.91667V1.08333C7.14992 1.0071 7.13407 0.931796 7.10418 0.861667Z"
                        fill="#272928"/>
                </svg>
            </div>
        }

        {
            !!event.tags?.length &&
            <>
                {event.tags.filter(t=> !t.startsWith(':')).map(tag => {
                    return <div key={tag} className={styles['schedule-event-card-tag']}>
                        <i className={styles['schedule-event-card-dot']} style={{background: getLabelColor(tag)}}/>
                        <span>{tag}</span>
                    </div>
                })}
            </>
        }
        {
            !!track &&
            <div className={styles['schedule-event-card-tag']}>
                <i className={styles['schedule-event-card-dot']} style={{background: getLabelColor(track.title!)}}/>
                {track.title}
            </div>
        }
    </div>
}

