import {useContext, useEffect, useRef, useState} from 'react'
import {Event, getGroups, Group, queryEvent} from "@/service/solas";
import styles from './schedule.module.scss'
import EventLabels from "@/components/base/EventLabels/EventLabels";
import Link from 'next/link'
import UserContext from "@/components/provider/UserProvider/UserContext";
import LangContext from "@/components/provider/LangProvider/LangContext";
import {Swiper, SwiperSlide} from 'swiper/react'
import usePicture from "@/hooks/pictrue";
import {FreeMode, Mousewheel} from 'swiper';
import {covers} from "@/components/compose/SelectPointCover/SelectPointCover";
import {getLabelColor} from "@/hooks/labelColor";

const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const mouthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

interface DateItem {
    date: number,
    timestamp: number,
    dayName: string,
    day: number,
    month: number,
    year: number,
    events: Event[]
}

const getCalendarData = () => {
    const now = new Date()
    // 计算出今天前365天和后365天的日期时间戳数组
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 182, 0, 0, 0, 0).getTime()
    const to = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 182, 0, 0, 0, 0).getTime()

    // 获得 from 和 to  之间所以天0点的时间戳数组
    const dayArray = []
    for (let i = from; i <= to; i += 24 * 60 * 60 * 1000) {
        dayArray.push({
            date: new Date(i).getDate(),
            timestamp: i,
            dayName: dayName[new Date(i).getDay()],
            day: new Date(i).getDate(),
            month: new Date(i).getMonth(),
            year: new Date(i).getFullYear(),
            events: [] as Event[]
        })
    }

    return dayArray as DateItem[]
}

function ComponentName(props: { group: Group }) {
    const eventGroup = props.group
    const now = new Date()
    const [eventList, setEventList] = useState<Event[]>([])
    const [showList, setShowList] = useState<DateItem[]>([])
    const dayList = useRef(getCalendarData())
    const eventListRef = useRef<Event[]>([])

    const {user} = useContext(UserContext)
    const [showJoined, setShowJoined] = useState(false)
    const {lang} = useContext(LangContext)
    const swiperRef = useRef<any>(null)
    const [ready, setReady] = useState(false)
    const [currMonth, setCurrMonth] = useState(new Date().getMonth())
    const [currYear, setCurrYear] = useState(new Date().getFullYear())
    const [currTag, setCurrTag] = useState<string[]>([])
    const todayIndexRef = useRef(0)

    const slideToToday = () => {
        swiperRef.current.slideTo(todayIndexRef.current, 100)
    }

    useEffect(() => {
        if (swiperRef.current && ready) {
            const now = new Date()
            const todayIndex = dayList.current.findIndex(item => {
                return item.date === now.getDate() && item.year === now.getFullYear() && item.month === now.getMonth()
            })

            const offset = Math.floor(window.innerWidth / 181 / 2)

            todayIndexRef.current = todayIndex - offset
            swiperRef.current.slideTo(todayIndexRef.current, 0)
        }
    }, [swiperRef, ready])

    useEffect(() => {
        const getEventList = async () => {
            const events = await queryEvent({
                start_time_from: new Date(dayList.current[0].timestamp).toISOString(),
                start_time_to: new Date(dayList.current[dayList.current.length - 1].timestamp).toISOString(),
                page: 1
            })

            setEventList(events)
            eventListRef.current = events
            setReady(true)
        }
        getEventList()
    }, [])

    useEffect(() => {
        const list = JSON.parse(JSON.stringify(dayList.current))
        eventList.forEach(item => {
            const eventStarTime = new Date(item.start_time!)
            const targetIndex = list.findIndex((i: DateItem) => {
                return i.year === eventStarTime.getFullYear() && i.date === eventStarTime.getDate() && i.month === eventStarTime.getMonth()
            })
            if (targetIndex > 0) {
                list[targetIndex].events.push(item)
            }
        })
        setShowList(list)
        setReady(true)
    }, [eventList])

    useEffect(() => {
        let res: any = []
        if (showJoined) {
            res = eventListRef.current.filter(item => {
                return item.participants?.some(i => i.profile_id === user.id && i.status !== 'cancel')
            })
        } else {
            res = eventListRef.current
        }

        if (currTag[0]) {
            res = res.filter((e: Event) => {
                return e.tags?.includes(currTag[0])
            })
        }

        setEventList(res)
    }, [showJoined, currTag])

    return (<div className={styles['schedule-page']}>
        <div className={styles['schedule-head']}>
            <div className={styles['page-center']}>
                <div className={styles['schedule-title']}>
                    <div className={styles['schedule-title-left']}>
                        <div className={'group-name'}>{lang['Activity_Calendar']}</div>
                    </div>
                    <div className={styles['schedule-title-right']}>
                        <div className={styles['schedule-title-date']}>{now.getDate()}</div>
                        <div className={styles['schedule-title-day']}>
                            <div>{dayName[now.getDay()]}</div>
                            <div>{mouthName[now.getMonth()]} {now.getFullYear()}</div>
                        </div>
                    </div>
                </div>
                { eventGroup.event_tags?.length &&
                    <div className={`${styles['schedule-menu-1']} wamo-tags`}>
                        <EventLabels data={eventGroup.event_tags || []}
                                     onChange={e => {
                                         setCurrTag(e)
                                     }}
                                     single={true}
                                     value={currTag}
                                     showAll={true}/>
                    </div>
                }
            </div>
            <div className={styles['schedule-mouth']}>
                <div className={styles['page-center']}>
                    <div className={styles['schedule-menu-2']}>
                        <div className={styles['mouth']}>
                            <div>{mouthName[currMonth]} {currYear}</div>
                            <div className={styles['to-today']} onClick={e => {
                                slideToToday()
                            }}>Today</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className={styles['schedule-content']}>
            <div className={`${styles['page-center-full']} ${styles['height100']}`}>
                { ready &&
                    <Swiper
                        slidesPerView={'auto'}
                        className={styles['height100']}
                        modules={[FreeMode]}
                        freeMode={true}
                        spaceBetween={0}
                        onSwiper={(swiper) => {
                            swiperRef.current = swiper
                        }}
                        onSlideChange={swiper => {
                            setCurrMonth(dayList.current[swiper.activeIndex].month)
                            setCurrYear(dayList.current[swiper.activeIndex].year)
                        }}>
                        {
                            showList.map((item: any, index) => {
                                return <SwiperSlide key={index + ''} style={{width: '176px'}}>
                                    <div className={styles['date-column']}>
                                        <div className={styles['date-day']}>
                                            <span>{item.dayName}</span>
                                            <span className={item.date === now.getDate() &&  item.year === now.getFullYear() && item.month === now.getMonth()
                                                ? styles['date-active'] : styles['date']}>{item.date}</span>
                                        </div>
                                        <div className={`${styles['events']}`}>
                                            {item.events.length > 0 &&
                                                <Swiper
                                                    style={{padding:'0 2.5px', width: '100%', height:'100%', paddingBottom: '10px', boxSizing: 'border-box'}}
                                                    slidesPerView={'auto'}
                                                    spaceBetween={5}
                                                    freeMode={true}
                                                    modules={[FreeMode]}
                                                    direction={'vertical'}>
                                                    { item.events.map((e: Event) => {
                                                        return <SwiperSlide key={Math.random() + e.title} style={{height: '158px'}}>
                                                            <EventCard event={e} blank={true} />
                                                        </SwiperSlide>
                                                    })}
                                                </Swiper>
                                            }
                                        </div>
                                    </div>
                                </SwiperSlide>
                            })
                        }
                    </Swiper>
                }
            </div>
        </div>
    </div>)
}

export default ComponentName

export const getServerSideProps: any = (async (context: any) => {
    const group = await getGroups({username: 'zfdgroup2'})
    return {props: {group: group[0]}}
})

function EventCard ({event, blank}: {event: Event, blank?: boolean}) {
    const isAllDay = (new Date(event.end_time!).getTime() - new Date(event.start_time!).getTime() + 60000) % 8640000 === 0
    const fromTime = `${new Date(event.start_time!).getHours().toString().padStart(2, '0')} : ${new Date(event.start_time!).getMinutes().toString().padStart(2, '0')}`
    const toTime = `${new Date(event.end_time!).getHours().toString().padStart(2, '0')} : ${new Date(event.end_time!).getMinutes().toString().padStart(2, '0')}`

    const {defaultAvatar} = usePicture()
    return <Link  className={styles['schedule-event-card']} href={`/event/detail/${event.id}`} target={blank ? '_blank' : '_self'}>
        <div className={styles['schedule-event-card-time']}>
            {isAllDay ? 'All Day' : `${fromTime}--${toTime}`}
        </div>
        <div className={styles['schedule-event-card-name']}>
            {event.title}
        </div>
        <div className={styles['schedule-event-card-host']}>
            <img className={styles['schedule-event-card-avatar']} src={event.owner.image_url || defaultAvatar(event.owner.id)} alt=""/>
            {event.owner.nickname || event.owner.username}
        </div>
        {!!event.location && !event.event_site &&
            <div className={styles['schedule-event-card-position']}
                 onClick={e => {
                     e.stopPropagation()
                     location.href = `https://www.google.com/maps/search/?api=1&query=${event.geo_lat}%2C${event.geo_lng}`
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

        {!!event.event_site &&
            <div className={styles['schedule-event-card-position']}
                 onClick={e => {
                     e.stopPropagation()
                     location.href = `https://www.google.com/maps/search/?api=1&query=${event.geo_lat}%2C${event.geo_lng}`
                 }}>
                <i className={`${styles['icon']} icon-Outline`}/>
                <div className={styles['location-text']}>{event.event_site.title}</div>
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
            <div className={styles['schedule-event-card-tag']}>
                <i className={styles['schedule-event-card-dot']} style={{background: getLabelColor(event.tags[0])}}/>
                {event.tags[0]}
            </div>
        }
    </Link>
}
