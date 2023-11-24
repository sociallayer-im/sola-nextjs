import {useParams, usePathname, useSearchParams, useRouter} from "next/navigation";
import {useContext, useEffect, useRef, useState} from 'react'
import LangContext from "../../provider/LangProvider/LangContext";
import Empty from "../../base/Empty";
import CardEvent from "../../base/Cards/CardEvent/CardEvent";
import {Event, Participants, queryEvent} from "@/service/solas";
import EventLabels from "../../base/EventLabels/EventLabels";
import DialogsContext from "../../provider/DialogProvider/DialogsContext";
import scrollToLoad from "../../../hooks/scrollToLoad";
import EventHomeContext from "../../provider/EventHomeProvider/EventHomeContext";
import {formatTime} from '@/hooks/formatTime'
import MapContext from "../../provider/MapProvider/MapContext";

import {Swiper, SwiperSlide} from 'swiper/react'
import {Virtual} from 'swiper'

function ListEventVertical(props: { participants: Participants[], initData?: Event[] }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const params = useParams()
    const pathname = usePathname()
    const [tab2Index, setTab2Index] = useState<'latest' | 'coming' | 'past'>(searchParams?.get('tab') as any || 'coming')
    const {lang} = useContext(LangContext)
    const {showLoading} = useContext(DialogsContext)
    const {eventGroup, availableList, setEventGroup} = useContext(EventHomeContext)

    const [selectTag, setSelectTag] = useState<string[]>([])
    const [mode, setMode] = useState<'list' | 'map'>(searchParams?.get('mode') === 'map' ? 'map' : 'list')
    const [eventsWithLocation, setEventsWithLocation] = useState<Event[]>([])
    const [compact, setCompact] = useState(true)
    const swiperRef = useRef<any>(null)

    const getEvent = async (page: number) => {
        const unload = showLoading()
        const now = new Date()
        const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime() / 1000
        if (!eventGroup?.id) {
            unload()
            return []
        }

        try {
            if (tab2Index !== 'past') {
                let res = await queryEvent({
                    page,
                    start_time_from: todayZero,
                    event_order: 'start_time_asc',
                    group_id: eventGroup?.id || undefined
                })

                res = res.filter(item => {
                    const endTime = new Date(item.ending_time!).getTime()
                    return endTime >= new Date().getTime()
                })

                if (selectTag[0]) {
                    res = res.filter(item => {
                        return item.tags?.includes(selectTag[0])
                    })
                }
                return res
            } else {
                let res = await queryEvent({
                    page,
                    start_time_to: todayZero,
                    event_order: 'start_time_desc',
                    group_id: eventGroup?.id || undefined
                })

                res = res.filter(item => {
                    const endTime = new Date(item.ending_time!).getTime()
                    return endTime < new Date().getTime()
                })

                if (selectTag[0]) {
                    res = res.filter(item => {
                        return item.tags?.includes(selectTag[0])
                    })
                }
                return res
            }
        } catch (e: any) {
            console.error(e)
            // showToast(e.message)
            return []
        } finally {
            unload()
        }
    }

    const {list, ref, refresh, loading} = scrollToLoad({
        queryFunction: getEvent,
        initData: props.initData,
    })

    useEffect(() => {
        if (searchParams?.get('tab')) {
            setTab2Index(searchParams.get('tab') as any)
        }
    }, [searchParams])

    useEffect(() => {
        if (eventGroup) {
            if (params?.groupname
                && params?.groupname !== eventGroup?.username
                && availableList.length
                && pathname?.includes('event-home')
            ) {
                setEventGroup(availableList.find(item => item.username === params?.groupname)!)
                return () => {
                    setEventGroup(availableList[0])
                }
            } else {
                refresh()
            }
        }
    }, [selectTag, tab2Index, eventGroup, availableList, params, pathname])

    return (
        <div className={'module-tabs'}>
            <div className={mode === 'map' ? 'tab-titles fixed' : 'tab-titles'}>
                <div className={'center'}>
                    <div onClick={() => {
                        setTab2Index('coming')
                        router.push(`/event/${eventGroup?.username}?tab=coming`)
                    }}
                         className={tab2Index === 'coming' ? 'module-title' : 'tab-title'}>
                        {lang['Activity_Coming']}
                    </div>
                    <div onClick={() => {
                        setTab2Index('past')
                        router.push(`/event/${eventGroup?.username}?tab=past`)
                    }}
                         className={tab2Index === 'past' ? 'module-title' : 'tab-title'}>
                        {lang['Activity_Past']}
                    </div>
                </div>
                {!!eventGroup && eventGroup.group_event_tags && mode === 'map' && !compact &&
                    <div className={'center'}>
                        <div className={'tag-list'}>
                            <EventLabels
                                showAll={true}
                                single
                                onChange={(value) => {
                                    if (value.length === 0 && selectTag.length === 0) {
                                        return
                                    } else if (selectTag[0] === value[0]) {
                                        setSelectTag([])
                                    } else {
                                        setSelectTag(value)
                                    }
                                }}
                                data={eventGroup.group_event_tags}
                                value={selectTag}/>
                        </div>
                    </div>
                }
                {
                    mode === 'map' && eventGroup?.group_event_tags &&
                    <div className={compact ? 'toggle-compact' : 'toggle-compact active'}
                         onClick={e => {
                             setCompact(!compact)
                         }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="7" viewBox="0 0 11 7" fill="none">
                            <path
                                d="M10.2458 0.290792C10.0584 0.104542 9.80498 0 9.5408 0C9.27661 0 9.02316 0.104542 8.8358 0.290792L5.2458 3.83079L1.7058 0.290792C1.51844 0.104542 1.26498 0 1.0008 0C0.736612 0 0.483161 0.104542 0.295798 0.290792C0.20207 0.383755 0.127675 0.494356 0.0769067 0.616216C0.026138 0.738075 0 0.868781 0 1.00079C0 1.1328 0.026138 1.26351 0.0769067 1.38537C0.127675 1.50723 0.20207 1.61783 0.295798 1.71079L4.5358 5.95079C4.62876 6.04452 4.73936 6.11891 4.86122 6.16968C4.98308 6.22045 5.11379 6.24659 5.2458 6.24659C5.37781 6.24659 5.50852 6.22045 5.63037 6.16968C5.75223 6.11891 5.86283 6.04452 5.9558 5.95079L10.2458 1.71079C10.3395 1.61783 10.4139 1.50723 10.4647 1.38537C10.5155 1.26351 10.5416 1.1328 10.5416 1.00079C10.5416 0.868781 10.5155 0.738075 10.4647 0.616216C10.4139 0.494356 10.3395 0.383755 10.2458 0.290792Z"
                                fill="black"/>
                        </svg>
                    </div>
                }
            </div>

            {!!eventGroup && eventGroup.group_event_tags && mode == 'list' &&
                <div className={'tag-list'}>
                    <EventLabels
                        showAll={true}
                        single
                        onChange={(value) => {
                            if (value.length === 0 && selectTag.length === 0) {
                                return
                            } else if (selectTag[0] === value[0]) {
                                setSelectTag([])
                            } else {
                                setSelectTag(value)
                            }
                        }}
                        data={eventGroup.group_event_tags}
                        value={selectTag}/>
                </div>
            }
            <div className={'tab-contains'}>
                {!list.length ? <Empty/> :
                    <div className={'list'}>
                        {
                            list.map((item, index) => {
                                return <CardEvent participants={props.participants || []} fixed={false} key={item.id}
                                                  event={item}/>
                            })
                        }
                        {!loading && <div ref={ref}></div>}
                    </div>
                }
            </div>
        </div>
    )
}

export default ListEventVertical
