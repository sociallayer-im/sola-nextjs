import {useParams, usePathname, useSearchParams} from "next/navigation";
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

function ListEventVertical(props: { participants: Participants[] }) {
    const searchParams = useSearchParams()
    const params = useParams()
    const pathname = usePathname()
    const [tab2Index, setTab2Index] = useState<'latest' | 'soon' | 'past'>(searchParams?.get('tab') as any || 'soon')
    const {lang} = useContext(LangContext)
    const {showLoading} = useContext(DialogsContext)
    const {eventGroup, availableList, setEventGroup} = useContext(EventHomeContext)
    const GoogleMapRef = useRef<google.maps.Map | null>()
    const mapDomRef = useRef<any>()
    const markersRef = useRef<any[]>([])
    const {Map, MapEvent, Marker, MapError, MapReady} = useContext(MapContext)

    const [selectTag, setSelectTag] = useState<string[]>([])
    const [mode, setMode] = useState<'list' | 'map'>(searchParams?.get('mode') === 'map' ? 'map' : 'list')
    const [eventsWithLocation, setEventsWithLocation] = useState<Event[]>([])
    const [compact, setCompact] = useState(true)
    const swiperRef = useRef<any>(null)


    useEffect(() => {
        if (MapError) {
            setMode('list')
        }
    }, [MapError])

    useEffect(() => {
        if (MapReady && Map && MapEvent && mapDomRef.current) {
            GoogleMapRef.current = new Map(mapDomRef.current as HTMLElement, {
                center: eventGroup && eventGroup.group_location_details ? JSON.parse(eventGroup.group_location_details).geometry.location : {
                    lat: -34.397,
                    lng: 150.644
                },
                zoom: 14,
                mapId: 'e2f9ddc0facd5a80'
            })
        }
    }, [MapReady, mapDomRef, eventGroup])

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
        queryFunction: getEvent
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

    // useEffect(() => {
    //     setSearchParams({'mode': mode})
    // }, [mode])

    useEffect(() => {
        if (list.length) {
            const eventsWithLocation = list.filter(item => {
                const _item = item as Event
                if (_item.event_site?.location_details) {
                    _item.location_details = _item.event_site.location_details
                }

                return !!item.location_details
            })

            setEventsWithLocation(eventsWithLocation)

            if (MapReady) {
                if (eventsWithLocation[0]) {
                    showEventInMapCenter(eventsWithLocation[0], true)
                } else {
                    if (markersRef) {
                        markersRef.current.forEach(item => {
                            item.setMap(null)
                        })
                    }
                    return
                }
                showMarker(eventsWithLocation)
            }
        } else {
            setEventsWithLocation(eventsWithLocation)

            if (MapReady) {
                if (markersRef) {
                    markersRef.current.forEach(item => {
                        item.setMap(null)
                    })
                }
            }
        }
    }, [list, MapReady])

    const findParent = (element: HTMLElement, className: string): null | HTMLElement => {
        if (element.classList.contains(className)) {
            return element
        } else {
            if (element.parentElement) {
                return findParent(element.parentElement, className)
            } else {
                return null
            }
        }
    }

    const removeActive = () => {
        const activeMarker = document.querySelector('.event-map-marker.active')
        if (activeMarker) {
            activeMarker.classList.remove('active')
        }
    }

    const showEventInMapCenter = (event: Event, zoom?: boolean) => {
        const eventLocation = event.location_details
        if (!eventLocation) return

        const metadata = JSON.parse(eventLocation)
        if (GoogleMapRef.current) {
            const location = metadata.geometry.location
            GoogleMapRef.current!.setCenter(location)
            if (zoom) {
                GoogleMapRef.current!.setZoom(14)
            }

            setTimeout(() => {
                removeActive()
                document.getElementById(`marker-event-${event.id}`)?.classList.add('active')
            }, 100)
        }
    }

    const showMarker = (events: Event[]) => {
        const eventHasLocation = events

        // 清除marker
        if (markersRef.current.length) {
            markersRef.current.forEach(marker => {
                marker.setMap(null)
            })
        }

        // 将相同location的event合并
        let eventGrouped: Event[][] = []
        eventHasLocation.forEach(event => {
            const location = JSON.parse(event.location_details).geometry.location
            const index = eventGrouped.findIndex(item => {
                return JSON.stringify(JSON.parse(item[0].location_details).geometry.location) === JSON.stringify(location)
            })
            if (index > -1) {
                eventGrouped[index].push(event)
            } else {
                eventGrouped.push([event])
            }
        })

        // 绘制marker
        eventGrouped.map((events, index) => {
            const content = document.createElement('img');
            content.setAttribute('src', '/images/map_marker.png')
            content.className = 'map-marker'

            const markerView = new Marker!({
                map: GoogleMapRef.current,
                position: JSON.parse(events[0].location_details).geometry.location,
                content: content,
            })
        })

        eventGrouped.map((events, index) => {
            if (events.length === 1) {
                const time = formatTime(events[0].start_time!).split('.')[1] + '.' + formatTime(events[0].start_time!).split('.')[2]
                const eventMarker = document.createElement('div');
                eventMarker.className = index === 0 ? 'event-map-marker active' : 'event-map-marker'
                eventMarker.id = `marker-event-${events[0].id}`
                eventMarker.innerHTML = `<div class="title"><span>${events[0].title}</span>${time.split(' ')[0]}</div>`

                const markerView = new Marker!({
                    map: GoogleMapRef.current,
                    position: JSON.parse(events[0].location_details).geometry.location,
                    content: eventMarker,
                })

                MapEvent!.addListener(markerView, 'click', function (a: any) {
                    removeActive()
                    showEventInMapCenter(events[0])
                    const swiperIndex = eventHasLocation.findIndex(item => {
                        return item.id === events[0].id
                    })
                    swiperRef.current.slideTo(swiperIndex, 300, false)
                })

                markersRef.current.push(markerView)
            } else {
                const eventGroupMarker = document.createElement('div');
                eventGroupMarker.className = 'event-map-marker-group';
                const eventGroupInner = document.createElement('div');
                eventGroupInner.className = 'inner';
                events.map((event, index_) => {
                    const time = formatTime(event.start_time!).split('.')[1] + '.' + formatTime(event.start_time!).split('.')[2]
                    const eventMarker = document.createElement('div');
                    eventMarker.setAttribute('data-event-id', event.id + '')
                    eventMarker.className = 'event-map-marker';
                    eventMarker.className = (index === 0 && index_ === 0) ? 'event-map-marker active' : 'event-map-marker'
                    eventMarker.id = `marker-event-${event.id}`;
                    eventMarker.innerHTML = `<div class="title" data-event-id="${event.id}"><span data-event-id="${event.id}">${event.title}</span>${time.split(' ')[0]}</div>`
                    eventGroupInner.appendChild(eventMarker)
                })

                eventGroupMarker.appendChild(eventGroupInner)

                if (events.length > 2) {
                    const toggleBtn = document.createElement('div');
                    toggleBtn.className = 'toggle-btn';
                    toggleBtn.dataset.action = 'toggle';
                    toggleBtn.innerHTML = `<i class="icon-Polygon-2" data-action="toggle"></i>`
                    eventGroupMarker.appendChild(toggleBtn)
                }

                const markerView = new Marker!({
                    map: GoogleMapRef.current,
                    position: JSON.parse(events[0].location_details).geometry.location,
                    content: eventGroupMarker,
                })

                MapEvent!.addListener(markerView, 'click', function (a: any) {
                    const isEvent = a.domEvent.target.getAttribute('data-event-id')
                    if (isEvent) {
                        const eventId = Number(isEvent)
                        const targetEvent = eventHasLocation.find(item => item.id === eventId)
                        showEventInMapCenter(targetEvent!)

                        const swiperIndex = eventHasLocation.findIndex(item => {
                            return item.id === targetEvent!.id
                        })

                        swiperRef.current.slideTo(swiperIndex, 300, false)
                    }

                    const isAction = a.domEvent.target.getAttribute('data-action')
                    if (isAction) {
                        const box = findParent(a.domEvent.target, 'event-map-marker-group')
                        if (box!.className!.indexOf('active') > -1) {
                            box!.classList.remove('active')
                        } else {
                            box!.classList.add('active')
                        }
                    }
                })

                markersRef.current.push(markerView)
            }
        })
    }

    return (
        <div className={'module-tabs'}>
            <div className={mode === 'map' ? 'tab-titles fixed' : 'tab-titles'}>
                <div className={'center'}>
                    <div onClick={() => {
                        setTab2Index('soon')
                    }}
                         className={tab2Index === 'soon' ? 'module-title' : 'tab-title'}>
                        {lang['Activity_Coming']}
                    </div>
                    <div onClick={() => {
                        setTab2Index('past')
                    }}
                         className={tab2Index === 'past' ? 'module-title' : 'tab-title'}>
                        {lang['Activity_Past']}
                    </div>

                    {false && MapReady && eventGroup?.group_map_enabled &&
                        <div className={'mode-switch'}>
                            <div className={'switcher'}>
                                <div onClick={() => {
                                    setTab2Index('soon');
                                    setMode('map')
                                }}
                                     className={mode === 'map' ? 'switcher-item active' : 'switcher-item'}>
                                    <i className={'icon-location'}/>
                                </div>
                                <div onClick={() => {
                                    setMode('list')
                                }}
                                     className={mode === 'list' ? 'switcher-item active' : 'switcher-item'}>
                                    <i className={'icon-menu'}/>
                                </div>
                            </div>
                        </div>
                    }
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
                <div id={'gmap'} className={mode === 'map' ? 'show' : ''} ref={mapDomRef}/>
                {mode === 'map' && MapReady &&
                    <div className={'show-selected-event-in-map'}>
                        {eventsWithLocation.length > 0 ?
                            <Swiper
                                data-testid='HorizontalList'
                                modules={[Virtual]}
                                spaceBetween={10}
                                freeMode={true}
                                centeredSlides={true}
                                onSwiper={(swiper) => {
                                    swiperRef.current = swiper
                                }}
                                style={{paddingLeft: '12px', paddingTop: '10px', height: '207px'}}
                                onSlideChange={(swiper) => {
                                    const index = swiper.activeIndex
                                    const targetEvent = eventsWithLocation[index]
                                    showEventInMapCenter(targetEvent)
                                }}
                                slidesPerView={'auto'}>
                                {
                                    eventsWithLocation.map((data, index) => {
                                        return <SwiperSlide style={{width: '300px'}} key={index}>
                                            <CardEvent fixed={true} key={data.id} event={data}
                                                       participants={props.participants}/>
                                        </SwiperSlide>
                                    })
                                }
                            </Swiper>
                            : <div className={'no-event-on-map'}>No event to show on map</div>
                        }
                    </div>
                }
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
