import {useContext, useEffect, useRef, useState} from 'react'
import {Event, getGroups, Group, queryEvent} from "@/service/solas";
import styles from './schedule.module.scss'
import EventLabels from "@/components/base/EventLabels/EventLabels";
import Link from 'next/link'
import UserContext from "@/components/provider/UserProvider/UserContext";
import LangContext from "@/components/provider/LangProvider/LangContext";
import {SwiperSlide} from 'swiper/react'
import usePicture from "@/hooks/pictrue";
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
    // 计算出今天前15天和后15天的日期时间戳数组 182
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30, 0, 0, 0, 0).getTime()
    const to = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30, 0, 0, 0, 0).getTime()

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
    const scroll1Ref = useRef<any>(null)
    const scroll2Ref = useRef<any>(null)
    const eventListRef = useRef<Event[]>([])
    const dayList = useRef(getCalendarData())

    const {user} = useContext(UserContext)
    const [showJoined, setShowJoined] = useState(false)
    const {lang} = useContext(LangContext)


    const [eventList, setEventList] = useState<Event[]>([])
    const [showList, setShowList] = useState<DateItem[]>([])
    const [ready, setReady] = useState(false)
    const [currMonth, setCurrMonth] = useState(new Date().getMonth())
    const [currYear, setCurrYear] = useState(new Date().getFullYear())
    const [currTag, setCurrTag] = useState<string[]>([])

    const slideToToday = (init=false) => {
        const scrollBar1 = scroll1Ref.current
        const scrollBar2 = scroll2Ref.current

        const targetColumnIndex = dayList.current.findIndex((item: DateItem) => {
            return item.year === now.getFullYear() && item.month === now.getMonth() && item.date === now.getDate()
        })

        const offset = (targetColumnIndex - 1) * 176

        if (scrollBar2.scrollLeft === 0 && init) {
            scrollBar1.scrollLeft = offset
            scrollBar2.scrollLeft = offset

            if (init) {
                setTimeout(() => {
                    slideToToday(true)
                }, 100)
            }
        } else {
            scrollBar1.scrollLeft = offset
            scrollBar2.scrollLeft = offset
        }
    }


    useEffect(() => {
        const getEventList = async () => {
            const events = await queryEvent({
                group_id: eventGroup.id,
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
        const checkScroll = (e: any) => {
            const offset = e.target.scrollLeft
            const target = window.document.querySelector('.event-wrapper')
            if (target?.scrollLeft !== offset) {
                target!.scrollLeft = offset
            }
        }

        const checkScroll2 = (e: any) => {
            const offset = e.target.scrollLeft
            const target = window.document.querySelector('.date-bar-wrapper')
            if (target?.scrollLeft !== offset) {
                target!.scrollLeft = offset
            }

            const offsetTop = e.target.scrollTop
            if (offsetTop > 0) {
                (window.document.querySelector('.schedule-head') as any)!.style.height = '0'
            } else {
                (window.document.querySelector('.schedule-head') as any)!.style.height = '188px'
            }
        }

        if(scroll1Ref.current && scroll2Ref.current) {
            const scrollBar1 = scroll1Ref.current
            const scrollBar2 = scroll2Ref.current

            scrollBar1.addEventListener('scroll', checkScroll)
            scrollBar2.addEventListener('scroll', checkScroll2)

            slideToToday(true)

            return () => {
                scrollBar1?.removeEventListener('scroll', checkScroll)
                scrollBar2?.removeEventListener('scroll', checkScroll2)
            }
        }
    }, [scroll1Ref, scroll2Ref])

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
        <div className={`${styles['schedule-head']} schedule-head`}>
            <div className={styles['page-center']}>
                <div className={styles['schedule-title']}>
                    <div className={styles['schedule-title-left']}>
                        <div className={'group-name'}>{lang['Activity_Calendar']}</div>
                    </div>
                    <Link className={styles['create-btn']} href={`/event/${eventGroup.username}/create`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
                            <path
                                d="M13.1667 7.33335H9.16675V3.33335C9.16675 3.15654 9.09651 2.98697 8.97149 2.86195C8.84646 2.73693 8.67689 2.66669 8.50008 2.66669C8.32327 2.66669 8.1537 2.73693 8.02868 2.86195C7.90365 2.98697 7.83341 3.15654 7.83341 3.33335V7.33335H3.83341C3.6566 7.33335 3.48703 7.40359 3.36201 7.52862C3.23699 7.65364 3.16675 7.82321 3.16675 8.00002C3.16675 8.17683 3.23699 8.3464 3.36201 8.47142C3.48703 8.59645 3.6566 8.66669 3.83341 8.66669H7.83341V12.6667C7.83341 12.8435 7.90365 13.0131 8.02868 13.1381C8.1537 13.2631 8.32327 13.3334 8.50008 13.3334C8.67689 13.3334 8.84646 13.2631 8.97149 13.1381C9.09651 13.0131 9.16675 12.8435 9.16675 12.6667V8.66669H13.1667C13.3436 8.66669 13.5131 8.59645 13.6382 8.47142C13.7632 8.3464 13.8334 8.17683 13.8334 8.00002C13.8334 7.82321 13.7632 7.65364 13.6382 7.52862C13.5131 7.40359 13.3436 7.33335 13.1667 7.33335Z"
                                fill="#272928"/>
                        </svg>
                        Create an event
                    </Link>
                    <Link className={styles['create-btn-2']} href={`/event/${eventGroup.username}/create`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
                            <path
                                d="M13.1667 7.33335H9.16675V3.33335C9.16675 3.15654 9.09651 2.98697 8.97149 2.86195C8.84646 2.73693 8.67689 2.66669 8.50008 2.66669C8.32327 2.66669 8.1537 2.73693 8.02868 2.86195C7.90365 2.98697 7.83341 3.15654 7.83341 3.33335V7.33335H3.83341C3.6566 7.33335 3.48703 7.40359 3.36201 7.52862C3.23699 7.65364 3.16675 7.82321 3.16675 8.00002C3.16675 8.17683 3.23699 8.3464 3.36201 8.47142C3.48703 8.59645 3.6566 8.66669 3.83341 8.66669H7.83341V12.6667C7.83341 12.8435 7.90365 13.0131 8.02868 13.1381C8.1537 13.2631 8.32327 13.3334 8.50008 13.3334C8.67689 13.3334 8.84646 13.2631 8.97149 13.1381C9.09651 13.0131 9.16675 12.8435 9.16675 12.6667V8.66669H13.1667C13.3436 8.66669 13.5131 8.59645 13.6382 8.47142C13.7632 8.3464 13.8334 8.17683 13.8334 8.00002C13.8334 7.82321 13.7632 7.65364 13.6382 7.52862C13.5131 7.40359 13.3436 7.33335 13.1667 7.33335Z"
                                fill="#272928"/>
                        </svg>
                    </Link>
                </div>
                <div className={styles['schedule-menu-1']}>
                    <EventLabels data={eventGroup.event_tags || []}
                                 nowrap={true}
                                 onChange={e => {
                                     setCurrTag(e)
                                 }}
                                 single={true}
                                 value={currTag}
                                 showAll={true}/>
                </div>
            </div>
            <div className={styles['schedule-mouth']}>
                <div className={styles['schedule-menu-2']}>
                    <div className={styles['schedule-menu-center']}>
                        <div className={styles['mouth']}>
                            <div>{mouthName[currMonth]} {currYear}</div>
                            <div className={styles['to-today']} onClick={e => {
                                slideToToday()
                            }}>Today
                            </div>
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
        <div className={`${styles['content']}`}>
            <div className={`${styles['date-bar-wrapper']} date-bar-wrapper`} ref={scroll1Ref}>
                <div className={`${styles['date-bar']}`}>
                    {showList.map((item: any, index) => {
                        return <div key={index + ''} className={styles['date-column']}>
                            <div className={styles['date-day']}>
                                <span>{item.dayName}</span>
                                <span
                                    className={item.date === now.getDate() && item.year === now.getFullYear() && item.month === now.getMonth()
                                        ? styles['date-active'] : styles['date']}>{item.date}</span>
                            </div>
                        </div>
                    })
                    }
                </div>
            </div>
            <div className={`${styles['event-wrapper']} event-wrapper`}  ref={scroll2Ref}>
                <div className={`${styles['event-list']} event-list`}>
                    {showList.map((item: any, index) => {
                        return <div key={index + ''} className={`${styles['date-column']} date-column`}>
                            <div className={`${styles['events']}`}>
                                {item.events.map((e: Event) => {
                                    return <EventCard key={Math.random() + e.title} event={e}/>
                                })}
                            </div>
                        </div>
                    })
                    }
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
        return {props: {group: group[0]}}
    }
})

function EventCard({event, blank}: { event: Event, blank?: boolean }) {
    const isAllDay = new Date(event.start_time!).getHours() === 0 && ( (new Date(event.end_time!).getTime() - new Date(event.start_time!).getTime() + 60000) % 8640000 === 0)
    const fromTime = `${new Date(event.start_time!).getHours().toString().padStart(2, '0')} : ${new Date(event.start_time!).getMinutes().toString().padStart(2, '0')}`
    const toTime = `${new Date(event.end_time!).getHours().toString().padStart(2, '0')} : ${new Date(event.end_time!).getMinutes().toString().padStart(2, '0')}`

    const {defaultAvatar} = usePicture()
    return <Link className={styles['schedule-event-card']} href={`/event/detail/${event.id}`}
                 target={blank ? '_blank' : '_self'}>
        <div className={styles['schedule-event-card-time']}>
            {isAllDay ? 'All Day' : `${fromTime}--${toTime}`}
        </div>
        <div className={styles['schedule-event-card-name']}>
            {event.title}
        </div>
        <div className={styles['schedule-event-card-host']}>
            <img className={styles['schedule-event-card-avatar']}
                 src={event.owner.image_url || defaultAvatar(event.owner.id)} alt=""/>
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
