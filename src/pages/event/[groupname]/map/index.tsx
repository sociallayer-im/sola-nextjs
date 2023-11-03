import {createRef, useContext, useEffect, useRef, useState} from 'react'
import styles from './map.module.scss'
import MapContext from "@/components/provider/MapProvider/MapContext";
import EventHomeContext from "@/components/provider/EventHomeProvider/EventHomeContext";
import {Event, Marker, Participants, queryEvent, queryMarkers, queryMyEvent} from "@/service/solas";
import {Swiper, SwiperSlide} from 'swiper/react'
import {Mousewheel, Virtual} from 'swiper'
import CardMarker from "@/components/base/Cards/CardMarker/CardMarker";
import CardEvent from "@/components/base/Cards/CardEvent/CardEvent";
import {useRouter, useSearchParams} from "next/navigation";
import {markerTypeList} from "@/components/base/SelectorMarkerType/SelectorMarkerType";
import userContext from "@/components/provider/UserProvider/UserContext";
import DialogGuideFollow from "@/components/base/Dialog/DialogGuideFollow/DialogGuideFollow";

const menuList = markerTypeList

const MarkerCache: any = {...markerTypeList}
const cacheGroupId: number = 0
Object.keys(MarkerCache).forEach(item => {
    MarkerCache[item] = []
})

function ComponentName() {
    const {Map, MapEvent, Marker, MapError, MapReady} = useContext(MapContext)
    const {eventGroup, isManager} = useContext(EventHomeContext)
    const {user} = useContext(userContext)
    const router = useRouter()
    const searchParams = useSearchParams()

    const mapDomRef = createRef()
    const GoogleMapRef = useRef<google.maps.Map | null>()
    const swiperRef = useRef<any>(null)
    const markersRef = useRef<any[]>([])

    const [participants, setParticipants] = useState<Participants[]>([])

    const [markers, setMarkers] = useState<Marker[]>([])
    const [eventWithLocationList, setEventWithLocationList] = useState<Event[]>([])
    const [selectedType, setSelectedType] = useState<string | null>()
    const [showList, setShowList] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
    const [itemWidth, setItemWidth] = useState(0)

    const [currSwiperIndex, setCurrSwiperIndex] = useState(0)

    const getMyEvent = async () => {
        const now = new Date()
        const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime() / 1000


        let res: Event[] = []
        // if (MarkerCache['Event'].length && cacheGroupId === eventGroup?.id) {
        //     res = MarkerCache['Event']
        // } else {
        //     res = await queryEvent({
        //         page: 1,
        //         start_time_from: todayZero,
        //         event_order: 'start_time_asc',
        //         group_id: eventGroup?.id || undefined
        //     })
        // }
        res = await queryEvent({
            page: 1,
            start_time_from: todayZero,
            event_order: 'start_time_asc',
            group_id: eventGroup?.id || undefined
        })

        const eventWithLocation = res.filter(item => !!item.location_details || !!item.event_site?.location_details)
        setEventWithLocationList(eventWithLocation)
       // MarkerCache['Event'] = eventWithLocation
        // cacheGroupId === eventGroup?.id
    }

    const getMarker = async () => {
        let res: Marker[] = []
        // if (MarkerCache[selectedType!].length && cacheGroupId === eventGroup?.id) {
        //     res = MarkerCache[selectedType!]
        // } else {
        //     res = await queryMarkers({
        //         category: selectedType!,
        //         group_id: eventGroup?.id || undefined,
        //         with_checkins: user.authToken ? true : undefined,
        //         auth_token: user.authToken ? user.authToken : undefined
        //     })
        //
        // }

        res = await queryMarkers({
            category: selectedType!,
            group_id: eventGroup?.id || undefined,
            with_checkins: user.authToken ? true : undefined,
            auth_token: user.authToken ? user.authToken : undefined
        })

        // MarkerCache[selectedType!] = res
        // cacheGroupId === eventGroup?.id
        setMarkers(res)
    }

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
        const eventLocation = event.event_site?.location_details || event.location_details
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

    const showMarkerInMapCenter = (marker: Marker, zoom?: boolean) => {
        const eventLocation = marker.location_detail
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
                document.getElementById(`marker-event-${marker.id}`)?.classList.add('active')
            }, 100)
        }
    }

    const drawEventMarkers = () => {
        // 清除原有marker
        if (markersRef.current.length) {
            markersRef.current.forEach(marker => {
                marker.setMap(null)
            })
            markersRef.current = []
        }

        // 将相同location的event合并
        let eventGrouped: Event[][] = []
        eventWithLocationList.forEach(event => {
            const locationStr = event.event_site?.location_details || event.location_details
            const location = JSON.parse(locationStr).geometry.location
            const index = eventGrouped.findIndex(item => {
                const itemLocationStr = item[0].event_site?.location_details || item[0].location_details
                return JSON.stringify(JSON.parse(itemLocationStr).geometry.location) === JSON.stringify(location)
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

            const locationStr = events[0].event_site?.location_details || events[0].location_details
            const markerView = new Marker!({
                map: GoogleMapRef.current,
                position: JSON.parse(locationStr).geometry.location,
                content: content,
            })
            markersRef.current.push(markerView)
        })

        // 绘制详情
        eventGrouped.map((events, index) => {
            if (events.length === 1) {
                const eventMarker = document.createElement('div');
                eventMarker.className = index === 0 ? 'event-map-marker active' : 'event-map-marker'
                eventMarker.id = `marker-event-${events[0].id}`
                eventMarker.innerHTML = `<div class="title"><span>${events[0].title}</span></div>`

                const locationStr = events[0].event_site?.location_details || events[0].location_details
                const markerView = new Marker!({
                    map: GoogleMapRef.current,
                    position: JSON.parse(locationStr).geometry.location,
                    content: eventMarker,
                })

                MapEvent!.addListener(markerView, 'click', function (a: any) {
                    removeActive()
                    showEventInMapCenter(events[0])
                    const swiperIndex = eventWithLocationList.findIndex(item => {
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
                    const eventMarker = document.createElement('div');
                    eventMarker.setAttribute('data-event-id', event.id + '')
                    eventMarker.className = 'event-map-marker';
                    eventMarker.className = (index === 0 && index_ === 0) ? 'event-map-marker active' : 'event-map-marker'
                    eventMarker.id = `marker-event-${event.id}`;
                    eventMarker.innerHTML = `<div class="title" data-event-id="${event.id}"><span data-event-id="${event.id}">${event.title}</span></div>`
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

                const locationStr = events[0].event_site?.location_details || events[0].location_details
                const markerView = new Marker!({
                    map: GoogleMapRef.current,
                    position: JSON.parse(locationStr).geometry.location,
                    content: eventGroupMarker,
                })

                MapEvent!.addListener(markerView, 'click', function (a: any) {
                    const isEvent = a.domEvent.target.getAttribute('data-event-id')
                    if (isEvent) {
                        const eventId = Number(isEvent)
                        const targetEvent = eventWithLocationList.find(item => item.id === eventId)
                        showEventInMapCenter(targetEvent!)

                        const swiperIndex = eventWithLocationList.findIndex(item => {
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

            if (events.length) {
                showEventInMapCenter(eventWithLocationList[0], true)
            }
        })
    }

    const drawMarkers = () => {
        // 清除原有marker
        if (markersRef.current.length) {
            markersRef.current.forEach(marker => {
                marker.setMap(null)
            })
            markersRef.current = []
        }

        // 将相同location的event合并
        let markersGrouped: Marker[][] = []
        markers.filter((item) => !!item.location_detail).forEach(event => {
            const location = JSON.parse(event.location_detail).geometry.location
            const index = markersGrouped.findIndex(item => {
                return JSON.stringify(JSON.parse(item[0].location_detail).geometry.location) === JSON.stringify(location)
            })
            if (index > -1) {
                markersGrouped[index].push(event)
            } else {
                markersGrouped.push([event])
            }
        })

        // 绘制marker
        markersGrouped.map((markers, index) => {
            const content = document.createElement('img');
            content.setAttribute('src', (markerTypeList as any)[markers[0].category] || '/images/map_marker.png')
            content.className = 'map-marker'

            const markerView = new Marker!({
                map: GoogleMapRef.current,
                position: JSON.parse(markers[0].location_detail).geometry.location,
                content: content,
            })
            markersRef.current.push(markerView)
        })

        // 绘制详情
        markersGrouped.map((markers, index) => {
            if (markers.length === 1) {
                const eventMarker = document.createElement('div');
                eventMarker.className = index === 0 ? 'event-map-marker active' : 'event-map-marker'
                eventMarker.id = `marker-event-${markers[0].id}`
                eventMarker.innerHTML = `<div class="title"><span>${markers[0].title}</span></div>`

                const markerView = new Marker!({
                    map: GoogleMapRef.current,
                    position: JSON.parse(markers[0].location_detail).geometry.location,
                    content: eventMarker,
                })

                MapEvent!.addListener(markerView, 'click', function (a: any) {
                    removeActive()
                    showMarkerInMapCenter(markers[0])
                    const swiperIndex = eventWithLocationList.findIndex(item => {
                        return item.id === markers[0].id
                    })
                    swiperRef.current.slideTo(swiperIndex, 300, false)
                })

                markersRef.current.push(markerView)
            } else {
                const eventGroupMarker = document.createElement('div');
                eventGroupMarker.className = 'event-map-marker-group';
                const eventGroupInner = document.createElement('div');
                eventGroupInner.className = 'inner';
                markers.map((event, index_) => {
                    const eventMarker = document.createElement('div');
                    eventMarker.setAttribute('data-event-id', event.id + '')
                    eventMarker.className = 'event-map-marker';
                    eventMarker.className = (index === 0 && index_ === 0) ? 'event-map-marker active' : 'event-map-marker'
                    eventMarker.id = `marker-event-${event.id}`;
                    eventMarker.innerHTML = `<div class="title" data-event-id="${event.id}"><span data-event-id="${event.id}">${event.title}</span></div>`
                    eventGroupInner.appendChild(eventMarker)
                })

                eventGroupMarker.appendChild(eventGroupInner)

                if (markers.length > 2) {
                    const toggleBtn = document.createElement('div');
                    toggleBtn.className = 'toggle-btn';
                    toggleBtn.dataset.action = 'toggle';
                    toggleBtn.innerHTML = `<i class="icon-Polygon-2" data-action="toggle"></i>`
                    eventGroupMarker.appendChild(toggleBtn)
                }

                const markerView = new Marker!({
                    map: GoogleMapRef.current,
                    position: JSON.parse(markers[0].location_detail).geometry.location,
                    content: eventGroupMarker,
                })

                MapEvent!.addListener(markerView, 'click', function (a: any) {
                    const isEvent = a.domEvent.target.getAttribute('data-event-id')
                    if (isEvent) {
                        const eventId = Number(isEvent)
                        const targetEvent = markers.find(item => item.id === eventId)
                        showMarkerInMapCenter(targetEvent!)

                        const swiperIndex = markers.findIndex(item => {
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

        if (markers.length) {
            showMarkerInMapCenter(markers[0], true)
        }
    }

    const calcWidth = () => {
        setItemWidth(window.innerWidth > 1050 ? (1050 / 2.5)
            : (window.innerWidth > 750 ? (window.innerWidth * 0.7)
                    : window.innerWidth * 0.8
            )
        )
    }

    useEffect(() => {
        if (user.id) {
            queryMyEvent({auth_token: user.authToken || '', page: 1}).then(res => {
                setParticipants(res)
            })
            getMarker()
        }
    }, [user.id])

    useEffect(() => {
        if (searchParams?.get('type')) {
            setSelectedType(searchParams?.get('type')!)
        } else {
            setSelectedType('Event')
        }
    }, [searchParams])

    useEffect(() => {
        if (typeof window !== 'undefined' && !GoogleMapRef.current && MapReady && Map && MapEvent && mapDomRef.current && eventGroup?.id) {
            GoogleMapRef.current = new Map(mapDomRef.current as HTMLElement, {
                center: eventGroup && eventGroup.group_location_details ? JSON.parse(eventGroup.group_location_details).geometry.location : {
                    lat: -34.397,
                    lng: 150.644
                },
                zoom: 14,
                mapId: '2c7555ce0787c1b',
            })
        }
    }, [MapReady, mapDomRef, eventGroup])

    useEffect(() => {
        async function initData() {
            if (typeof window !== 'undefined' && eventGroup?.id && selectedType && Marker) {
                calcWidth()
                if (selectedType === 'Event') {
                    await getMyEvent()
                } else {
                    await getMarker()
                }
                setTimeout(() => {
                    setShowList(true)
                }, 100)

                window.addEventListener('resize', calcWidth, false)
                return () => {
                    window.removeEventListener('resize', calcWidth, false)
                }

            }
        }

        initData()
    }, [eventGroup?.id, selectedType, Marker])

    useEffect(() => {
        if (Marker) {
            if (selectedType === 'Event') {
                drawEventMarkers()
            } else {
                drawMarkers()
            }
        }
    }, [eventWithLocationList, markers, Marker, selectedType])

    return (<div className={`${styles['map-page']} map-page`}>
        <div className={styles['follow-window']}>
            <DialogGuideFollow />
        </div>
        <div id={'gmap'} className={styles['map-container']} ref={mapDomRef as any}/>
        { (eventGroup?.id === 1984 || eventGroup?.id === 1516) &&
            <div className={styles['top-menu']}>
                {(isManager || eventGroup?.group_owner_id === user.id) &&
                    <div className={styles['menu-item']} onClick={() => {
                        router.push(`/event/${eventGroup?.username}/create-marker`)
                    }}>Create a Marker +
                    </div>
                }
                {
                    Object.keys(menuList).map((item, index) => {
                        const isSelected = selectedType === item
                        return <div key={index}
                                    onClick={() => {
                                        router.push(`/event/${eventGroup?.username}/map?type=${item}`)
                                    }}
                                    className={`${styles['menu-item']} ${isSelected ? styles['menu-item-active'] : ''}`}>{item}</div>
                    })
                }
            </div>
        }
        {showList && !!eventGroup && selectedType === 'Event' &&
            <div className={styles['marker-list']}>
                {eventWithLocationList.length > 0 ?
                    <Swiper
                        modules={[Virtual, Mousewheel]}
                        mousewheel={true}
                        spaceBetween={10}
                        freeMode={true}
                        centeredSlides={eventWithLocationList.length === 1}
                        slidesPerView={'auto'}
                        style={{paddingLeft: '12px', paddingRight: '12px'}}
                        onSwiper={(swiper) => {
                            swiperRef.current = swiper
                        }}
                        onSlideChange={(swiper) => {
                            const index = swiper.activeIndex
                            const targetEvent = eventWithLocationList[index]
                            setSelectedEvent(targetEvent)
                            showEventInMapCenter(targetEvent)
                            setCurrSwiperIndex(swiper.activeIndex)
                        }}
                    >
                        {eventWithLocationList.map((data, index) => {
                            return <SwiperSlide style={{width: `${itemWidth}px`}} key={index}>
                                <CardEvent event={data} key={data.id} participants={participants}/>
                            </SwiperSlide>
                        })
                        }
                    </Swiper>
                    : <div className={styles['nodata']}>No marker</div>
                }
                {typeof window !== 'undefined'
                    && window.innerWidth > 750
                    && swiperRef.current
                    && currSwiperIndex > 0
                    && <img
                        onClick={() => {
                            swiperRef.current.slidePrev()
                            setTimeout(() => {
                                setCurrSwiperIndex(swiperRef.current.activeIndex)
                            }, 300)
                        }}
                        className={window.innerWidth >= 1050 ? styles['slide-left-wide'] : styles['slide-left']}
                        src="/images/slide.png" alt=""/>
                }
                {typeof window !== 'undefined'
                    && window.innerWidth > 750
                    && swiperRef.current
                    && currSwiperIndex < eventWithLocationList.length - 2
                    && <img
                        onClick={() => {
                            swiperRef.current.slideNext()
                            setTimeout(() => {
                                setCurrSwiperIndex(swiperRef.current.activeIndex)
                            }, 300)
                        }}
                        className={window.innerWidth >= 1050 ? styles['slide-wide'] : styles['slide']}
                        src="/images/slide.png" alt=""/>
                }
            </div>
        }


        {showList && !!eventGroup && selectedType !== 'Event' &&
            <div className={styles['marker-list']}>
                {markers.length > 0 ?
                    <Swiper
                        modules={[Virtual, Mousewheel]}
                        mousewheel={true}
                        centeredSlides={markers.length === 1}
                        spaceBetween={10}
                        freeMode={true}
                        slidesPerView={'auto'}
                        style={{paddingLeft: '12px', paddingRight: '12px'}}
                        onSwiper={(swiper) => {
                            swiperRef.current = swiper
                        }}
                        onSlideChange={(swiper) => {
                            const index = swiper.activeIndex
                            const targetEvent = markers[index]
                            showMarkerInMapCenter(targetEvent)
                            setCurrSwiperIndex(index)
                        }}
                    >
                        {markers.map((data, index) => {
                            return <SwiperSlide style={{width: `${itemWidth}px`}} key={index}>
                                <CardMarker item={data} key={data.id}/>
                            </SwiperSlide>
                        })
                        }
                    </Swiper>
                    : <div className={styles['nodata']}>No marker</div>
                }
                {typeof window !== 'undefined'
                    && window.innerWidth > 750
                    && swiperRef.current
                    && currSwiperIndex > 0
                    && <img
                        onClick={() => {
                            swiperRef.current.slidePrev()
                            setTimeout(() => {
                                setCurrSwiperIndex(swiperRef.current.activeIndex)
                            }, 300)
                        }}
                        className={window.innerWidth >= 1050 ? styles['slide-left-wide'] : styles['slide-left']}
                        src="/images/slide.png" alt=""/>
                }
                {typeof window !== 'undefined'
                    && window.innerWidth > 750
                    && swiperRef.current
                    && currSwiperIndex < markers.length - 2
                    && <img
                        onClick={() => {
                            swiperRef.current.slideNext()
                            setTimeout(() => {
                                setCurrSwiperIndex(swiperRef.current.activeIndex)
                            }, 300)
                        }}
                        className={window.innerWidth >= 1050 ? styles['slide-wide'] : styles['slide']}
                        src="/images/slide.png" alt=""/>
                }
            </div>
        }
    </div>)
}

export default ComponentName
