import {useContext, useEffect, useState} from 'react'
import langContext from "@/components/provider/LangProvider/LangContext";
import {Event, getDateList, Profile, ProfileSimple, queryEvent, queryMyEvent, getProfile} from "@/service/solas";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import EventHomeContext from "@/components/provider/EventHomeProvider/EventHomeContext";
import EventCalendar from "@/components/compose/EventCalendar/EventCalendar";
import EventLabels from "@/components/base/EventLabels/EventLabels";
import UserContext from "@/components/provider/UserProvider/UserContext";
import {getLabelColor} from "@/hooks/labelColor";
import usePicture from "@/hooks/pictrue";
import Empty from "@/components/base/Empty";
import PageBack from "@/components/base/PageBack";
import {useParams, useSearchParams, useRouter} from "next/navigation";


interface EventWithProfile extends Event {
    profile: ProfileSimple | null
}

const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const mouthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const cache = new Map<string, EventWithProfile[]>()
const cacheProfile = new Map<number, Profile>()
const cacheDateHasEvent= new Map<number, Date[]>()

function Calendar() {
    const router = useRouter()
    const {lang} = useContext(langContext)
    const {showLoading} = useContext(DialogsContext)
    const {setEventGroup, availableList, ready, eventGroup} = useContext(EventHomeContext)
    const params = useParams()
    const {user} = useContext(UserContext)
    const {defaultAvatar} = usePicture()
    const searchParams = useSearchParams()

    const now = new Date()
    const specificDate = searchParams?.get('date')
    const [selectedDate, setSelectedDate] = useState(specificDate ? new Date(Number(specificDate)) : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0))
    const [selectedLabel, setSelectedLabel] = useState<string[]>([])
    const [showJoined, setShowJoined] = useState(false)
    const [theDateHasEvent, setTheDateHasEvent] = useState<Date[]>([])
    const [MyEvent, setMyEvent] = useState<Event[]>([])
    const [currMonthEventList, setCurrMonthEventList] = useState<EventWithProfile[]>([])

    useEffect(() => {
        if (params?.groupname && ready && availableList.length) {
            const eventGroup = availableList.find(item => item.username === params?.groupname)
            setEventGroup(eventGroup!)
        }
    }, [params, ready, availableList])

    useEffect(() => {
        async function fetchData2() {
            if (user.authToken) {
                const res = await queryMyEvent({auth_token: user.authToken!})
                setMyEvent(res.map(item => item.event))
            } else {
                setMyEvent([])
            }
        }

        fetchData2()
    }, [user.authToken])

    const getDateHasEvent = async (date?: Date) => {
        const target = date || selectedDate
        const mouthStart = new Date(target.getFullYear(), target.getMonth(), 1, 0, 0, 0, 0)
        const mouthEnd = new Date(target.getFullYear(), target.getMonth() + 1, 0, 23, 59, 59, 999)

        const checkCache = cacheDateHasEvent.get(mouthStart.getTime())
        if (checkCache) {
            return
        }

        const res = await getDateList({
            group_id: eventGroup!.id,
            start_time_from: Math.floor(mouthStart.getTime() / 1000),
            start_time_to: Math.floor(mouthEnd.getTime() / 1000),
            page: 1,
        })
        setTheDateHasEvent([...theDateHasEvent, ...res])
        cacheDateHasEvent.set(mouthStart.getTime(), res)
    }

    const getEventList = async (date?: Date) => {
        async function fetchData(date: Date) {
            const unload = showLoading()
           // const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
           // const dateEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)

            // 获得选中日期的星期日到星期六的日期
            const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay(), 0, 0, 0, 0)
            const dateEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + (6 - date.getDay()), 23, 59, 59, 999)

            let res = await queryEvent({
                group_id: eventGroup!.id,
                event_order: 'start_time_asc',
                page: 1,
                tag: selectedLabel[0] || undefined,
                start_time_from: Math.floor(dateStart.getTime() / 1000),
                start_time_to: Math.floor(dateEnd.getTime() / 1000),
            })
            unload()
            return res
        }

        const target = date || selectedDate
        const dateStart = new Date(target.getFullYear(), target.getMonth(), target.getDate(), 0, 0, 0, 0)
        const getCache = cache.get(dateStart.toISOString() + eventGroup?.username)

        if (getCache) {
            setCurrMonthEventList(getCache)
        } else {
            const events = await fetchData(target)
            const eventWithProfileTask = events.map(async (event, index) => {
                if (!event.host_info) {
                    return {
                        ...event,
                        profile: event.event_owner
                    }
                } else {
                    const profile = await getProfile({id: Number(event.host_info!)})
                    return {
                        ...event,
                        profile: profile
                    }
                }
            })
            const eventWithProfile = await Promise.all(eventWithProfileTask)
            setCurrMonthEventList(eventWithProfile)
            cache.set(dateStart.toISOString() + eventGroup?.username, eventWithProfile)
        }
    }

    useEffect(() => {
        if (eventGroup) {
            getEventList()
            getDateHasEvent()
        }

        return () => {
            cache.clear()
            cacheProfile.clear()
            cacheDateHasEvent.clear()
        }
    }, [selectedLabel, eventGroup])

    const gotoEventDetail = (id: number) => {
        router.push(`/event/detail/${id}`)
    }

    let list = currMonthEventList.sort((a, b) => {
        return new Date(a.start_time!).getTime() - new Date(b.start_time!).getTime()
    })
    if (showJoined) {
        list = list.filter(item => {
            return MyEvent.find(event => event.id === item.id)
        })
    }

    // 先按start_time 的日期分组
    const eventGroupByDate: { date: Date, events: EventWithProfile[] }[] = []
    list.forEach((event) => {
        const startDate = new Date(event.start_time!).getDate()
        const checkHasDate = eventGroupByDate.find(item => item.date.getDate() === startDate)
        if (checkHasDate) {
            checkHasDate.events.push(event)
        } else {
            eventGroupByDate.push({
                date: new Date(event.start_time!),
                events: [event]
            })
        }
    })

    // 再合并开始时间和结束时间相同的event
    let eventGroupByDateMerged: { date: Date, events: EventWithProfile[][] }[] = []
    eventGroupByDate.forEach((item) => {
        const mergedEvents: EventWithProfile[][] = []
        item.events.map(e => {
            const checkHasEvent = mergedEvents.find(events => {
                return events[0].start_time === e.start_time && events[0].ending_time === e.ending_time
            })
            if (checkHasEvent) {
                checkHasEvent.push(e)
            } else {
                mergedEvents.push([e])
            }
        })

        eventGroupByDateMerged.push({
            date: item.date,
            events: mergedEvents
        })
    })

    const scrollIntoView = (id: string) => {
        const target = document.getElementById(id)
        if (target) {
            // const targetHeight = target.offsetTop - 260
            const targetHeight = target.offsetTop - 60
            document.querySelector('#PageContent')!.scroll(0, targetHeight);
        }
    }

    const handleSelectedDate = async (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const currMonth = selectedDate.getMonth()
        const currYear = selectedDate.getFullYear()
        if (year !== currYear || month !== currMonth && eventGroup) {
            getDateHasEvent(date)
        }

        const dateStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() - selectedDate.getDay(), 0, 0, 0, 0)
        const dateEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + (6 - selectedDate.getDay()), 23, 59, 59, 999)

        if (eventGroup && (dateStart.getTime() > date.getTime() || dateEnd.getTime() < date.getTime())) {
            await getEventList(date)
            router.push(`/event/${eventGroup?.username}/calendar?date=${date.getTime()}`)
            setSelectedDate(date)
            setTimeout(() => {
                scrollIntoView(`date-${date.getDate()}`)
            },300)
        } else {
            scrollIntoView(`date-${date.getDate()}`)
        }
    }

    return (
        <>
            <div className={'calender-new'}>
                <div className={'calendar-head'}>
                    <div className={'center'}>
                      <div className={'page-back'}>
                          <PageBack onClose={() => {
                              router.push(`/event/${eventGroup?.username || ''}`)
                          }} />
                      </div>
                        <div className={'calendar-head-title'}>
                            <div className={'left'}>
                                <div
                                    className={'group-name'}>{eventGroup?.nickname || eventGroup?.username || '--'}</div>
                                <div className={'group-name'}>{'Event schedule'}</div>
                            </div>
                            <div className={'curr-date'}>
                                <div className={'date'}>{now.getDate()}</div>
                                <div className={'other'}>
                                    <div>{dayName[now.getDay()]}</div>
                                    <div>{mouthName[now.getMonth()]} {now.getFullYear()}</div>
                                </div>
                            </div>
                        </div>
                        <div className={'calendar-wrapper'}>
                            <EventCalendar
                                onMonthChange={async (date) =>{
                                    if (eventGroup) {
                                        await getDateHasEvent(date)
                                    }
                                }}
                                hasEventDates={theDateHasEvent}
                                selectedDate={selectedDate}
                                onSelectedDate={async (date) => {
                                    await handleSelectedDate(date)
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className={'calendar-event-list'}>
                    <div className={'calendar-event-title'}>
                        <div className={'col1'}>{lang['Activity_Calendar_Page_Time']}</div>
                        <div className={'col2'}>{lang['Activity_Calendar_Page_Name']}</div>
                        {
                            !!user.id &&
                            <div className={showJoined ? 'col3 active' : 'col3'} onClick={e => {
                                setShowJoined(!showJoined)
                            }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21"
                                     fill="none">
                                    <path
                                        d="M12.267 7.82533L8.692 11.4087L7.317 10.0337C7.24229 9.94642 7.15036 9.87557 7.04697 9.82555C6.94358 9.77554 6.83097 9.74743 6.71621 9.74299C6.60144 9.73856 6.487 9.7579 6.38006 9.79979C6.27312 9.84169 6.176 9.90524 6.09479 9.98645C6.01357 10.0677 5.95003 10.1648 5.90813 10.2717C5.86624 10.3787 5.8469 10.4931 5.85133 10.6079C5.85576 10.7226 5.88387 10.8352 5.93389 10.9386C5.98391 11.042 6.05476 11.134 6.142 11.2087L8.10033 13.1753C8.1782 13.2526 8.27054 13.3137 8.37207 13.3551C8.4736 13.3966 8.58232 13.4176 8.692 13.417C8.91061 13.4161 9.12011 13.3293 9.27533 13.1753L13.442 9.00866C13.5201 8.93119 13.5821 8.83902 13.6244 8.73747C13.6667 8.63592 13.6885 8.527 13.6885 8.41699C13.6885 8.30698 13.6667 8.19806 13.6244 8.09651C13.5821 7.99496 13.5201 7.90279 13.442 7.82533C13.2859 7.67012 13.0747 7.583 12.8545 7.583C12.6343 7.583 12.4231 7.67012 12.267 7.82533ZM10.0003 2.16699C8.35215 2.16699 6.74099 2.65573 5.37058 3.57141C4.00017 4.48709 2.93206 5.78858 2.30133 7.3113C1.6706 8.83401 1.50558 10.5096 1.82712 12.1261C2.14866 13.7426 2.94234 15.2274 4.10777 16.3929C5.27321 17.5583 6.75807 18.352 8.37458 18.6735C9.99109 18.9951 11.6666 18.8301 13.1894 18.1993C14.7121 17.5686 16.0136 16.5005 16.9292 15.1301C17.8449 13.7597 18.3337 12.1485 18.3337 10.5003C18.3337 9.40598 18.1181 8.32234 17.6993 7.3113C17.2805 6.30025 16.6667 5.38159 15.8929 4.60777C15.1191 3.83395 14.2004 3.22012 13.1894 2.80133C12.1783 2.38254 11.0947 2.16699 10.0003 2.16699ZM10.0003 17.167C8.68179 17.167 7.39286 16.776 6.29653 16.0435C5.2002 15.3109 4.34572 14.2697 3.84113 13.0515C3.33655 11.8334 3.20453 10.4929 3.46176 9.19972C3.719 7.90652 4.35393 6.71863 5.28628 5.78628C6.21863 4.85393 7.40652 4.21899 8.69973 3.96176C9.99293 3.70452 11.3334 3.83654 12.5516 4.34113C13.7697 4.84571 14.8109 5.7002 15.5435 6.79652C16.276 7.89285 16.667 9.18178 16.667 10.5003C16.667 12.2684 15.9646 13.9641 14.7144 15.2144C13.4641 16.4646 11.7684 17.167 10.0003 17.167Z"
                                        fill="#272928"/>
                                </svg>
                                {lang['Activity_Detail_Btn_Joined']}
                            </div>
                        }
                    </div>

                    {!!eventGroup && eventGroup.group_event_tags &&
                        <div className={'label-bar'}>
                            <EventLabels single data={eventGroup.group_event_tags} value={selectedLabel} onChange={
                                (value) => {
                                    setSelectedLabel(value)
                                }
                            }/>
                        </div>
                    }

                    {!eventGroupByDateMerged.length &&
                        <Empty/>
                    }

                    {
                        eventGroupByDateMerged.map((item, index) => {
                            return <div key={index}>
                                <div className={'date-marker'} id={`date-${item.date.getDate()}`}>
                                    <div>{item.date.getDate()} {mouthName[item.date.getMonth()]}</div>
                                </div>
                                <div className={'grouped-events'}>
                                    {
                                        item.events.map((group, index) => {
                                            return <div className={'grouped-events-item'} key={index}>
                                                <div className={'col1'}>
                                                    <div
                                                        className={'start'}>{(new Date(group[0].start_time!).getHours() + '').padStart(2, '0')} : {(new Date(group[0].start_time!).getMinutes() + '').padStart(2, '0')}</div>
                                                    {
                                                        group[0].ending_time &&
                                                        <div
                                                            className={'ending'}>{(new Date(group[0].ending_time!).getHours() + '').padStart(2, '0')} : {(new Date(group[0].ending_time!).getMinutes() + '').padStart(2, '0')}</div>
                                                    }
                                                </div>
                                                <div className={'col2'}>
                                                    {
                                                        group.map(item => {
                                                            return (
                                                                <div className={'event-item'}
                                                                     key={item.id}
                                                                     onClick={e => {
                                                                         gotoEventDetail(item.id)
                                                                     }}>
                                                                    <div className={'label-color'}>
                                                                        {
                                                                            item.tags?.map((tag, index) => {
                                                                                return <span key={index}
                                                                                             style={{background: getLabelColor(tag)}}/>
                                                                            })
                                                                        }
                                                                    </div>
                                                                    <div className={'event-name'}>{item.title}</div>
                                                                    <div className={'creator'}>
                                                                        <img
                                                                            src={item.profile?.image_url || defaultAvatar(item.profile?.id)}
                                                                            alt=""/>
                                                                        {item.profile?.nickname || item.profile?.username || ''}
                                                                    </div>
                                                                </div>
                                                            )
                                                        })
                                                    }
                                                </div>
                                            </div>
                                        })
                                    }
                                </div>
                            </div>
                        })
                    }
                </div>
            </div>
        </>
    )
}

export default Calendar
