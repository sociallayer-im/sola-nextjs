import {createRef, useContext, useEffect, useRef, useState} from 'react'
import styles from './map.module.scss'
import MapContext from "@/components/provider/MapProvider/MapContext";
import EventHomeContext from "@/components/provider/EventHomeProvider/EventHomeContext";
import {Event, queryEvent} from "@/service/solas";
import {Swiper, SwiperSlide} from 'swiper/react'
import {Mousewheel, Virtual} from 'swiper'
import CardMarker from "@/components/base/Cards/CardMarker/CardMarker";
import {formatTime} from "@/hooks/formatTime";

const menuList = [
    'Events',
    'Restaurants',
    'Coffee',
    'Hotels',
    'Attractions',
    'Drifting bottle'
]

function ComponentName() {
    const {Map, MapEvent, Marker, MapError, MapReady} = useContext(MapContext)
    const {eventGroup} = useContext(EventHomeContext)

    const mapDomRef = createRef()
    const GoogleMapRef = useRef<google.maps.Map | null>()
    const swiperRef = useRef<any>(null)
    const markersRef = useRef<any[]>([])

    const [eventList, setEventList] = useState<Event[]>([])
    const [eventWithLocationList, setEventWithLocationList] = useState<Event[]>([])
    const [selectedType, setSelectedType] = useState<string>('events')
    const [showList, setShowList] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
    const [itemWidth, setItemWidth] = useState(0)

    const getMyEvent = async () => {
        const now = new Date()
        const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime() / 1000


        let res = await queryEvent({
            page: 1,
            start_time_to: todayZero,
            event_order: 'start_time_desc',
            group_id: eventGroup?.id || undefined
        })
        setEventList(res)
        setEventWithLocationList(res.filter((item) => !!item.location_details))
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
        console.log('event====', event)
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

    const drawMarkers = (events: Event[]) => {
        console.log('drawMarkers====')
        // 清除原有marker
        if (markersRef.current.length) {
            markersRef.current.forEach(marker => {
                marker.setMap(null)
            })
        }

        // 将相同location的event合并
        let eventGrouped: Event[][] = []
        eventWithLocationList.filter((item) => !!item.location_details).forEach(event => {
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

        console.log('eventGrouped====', eventGrouped)

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

        // 绘制详情
        eventGrouped.map((events, index) => {
            if (events.length === 1) {
                const time = formatTime(events[0].start_time!).split('.')[1] + '.' + formatTime(events[0].start_time!).split('.')[2]
                const eventMarker = document.createElement('div');
                eventMarker.className = index === 0 ? 'event-map-marker active' : 'event-map-marker'
                eventMarker.id = `marker-event-${events[0].id}`
                eventMarker.innerHTML = `<div class="title"><span>${events[0].title}</span></div>`

                const markerView = new Marker!({
                    map: GoogleMapRef.current,
                    position: JSON.parse(events[0].location_details).geometry.location,
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

                const markerView = new Marker!({
                    map: GoogleMapRef.current,
                    position: JSON.parse(events[0].location_details).geometry.location,
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
        })
    }

    const calcWidth = () => {
        setItemWidth(window.innerWidth > 1050 ? (1050 / 2)
            : (window.innerWidth > 750 ? (window.innerWidth * 0.7)
                    : window.innerWidth * 0.8
            )
        )
    }

    useEffect(() => {
        if (!GoogleMapRef.current && MapReady && Map && MapEvent && mapDomRef.current && eventGroup?.id) {
            GoogleMapRef.current = new Map(mapDomRef.current as HTMLElement, {
                center: eventGroup && eventGroup.group_location_details ? JSON.parse(eventGroup.group_location_details).geometry.location : {
                    lat: -34.397,
                    lng: 150.644
                },
                zoom: 14,
                mapId: 'e2f9ddc0facd5a80',
            })
        }
    }, [MapReady, mapDomRef, eventGroup])

    useEffect(() => {
        if (typeof window !== 'undefined' && eventGroup?.id) {
            calcWidth()
            getMyEvent()
            setTimeout(() => {
                setShowList(true)
            }, 100)

            window.addEventListener('resize', calcWidth, false)
            return () => {
                window.removeEventListener('resize', calcWidth, false)
            }

        }
    }, [eventGroup?.id])

    useEffect(() => {
        if (typeof window !== 'undefined' && eventWithLocationList.length && Marker) {
            drawMarkers(eventList)
        }
    }, [eventWithLocationList, Marker])

    return (<div className={styles['map-page']}>
        <div id={'gmap'} className={styles['map-container']} ref={mapDomRef}/>
        <div className={styles['top-menu']}>
            <div className={styles['menu-item']}>Create Marker +</div>
            {
                menuList.map((item, index) => {
                    const isSelected = selectedType === item.toLowerCase()
                    return <div key={index}
                                className={`${styles['menu-item']} ${isSelected ? styles['menu-item-active'] : ''}`}>{item}</div>
                })
            }
        </div>
        {showList && !!eventGroup &&
            <div className={styles['marker-list']}>
                {eventWithLocationList.length > 0 ?
                    <Swiper
                        modules={[Virtual, Mousewheel]}
                        mousewheel={true}
                        spaceBetween={10}
                        freeMode={true}
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
                        }}
                    >
                        {eventWithLocationList.map((data, index) => {
                            return <SwiperSlide style={{width: `${itemWidth}px`}} key={index}>
                                <CardMarker item={data} type={'event'} key={data.id}/>
                            </SwiperSlide>
                        })
                        }
                    </Swiper>
                    : <div className={styles['nodata']}>No marker</div>
                }
                {typeof window !== 'undefined'
                    && window.innerWidth > 750
                    && swiperRef.current
                    && swiperRef.current.activeIndex > 0
                    && <img
                        onClick={() => {swiperRef.current.slidePrev()}}
                        className={window.innerWidth >= 1050 ? styles['slide-left-wide']: styles['slide-left']}
                        src="/images/slide.png" alt=""/>
                }
                {typeof window !== 'undefined'
                    && window.innerWidth > 750
                    && swiperRef.current
                    && swiperRef.current.activeIndex < eventWithLocationList.length - 2
                    && <img
                        onClick={() => {swiperRef.current.slideNext()}}
                        className={window.innerWidth >= 1050 ? styles['slide-wide']: styles['slide']}
                        src="/images/slide.png" alt=""/>
                }
            </div>
        }
    </div>)
}

export default ComponentName
