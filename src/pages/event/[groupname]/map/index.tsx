import {createRef, useContext, useEffect, useRef, useState} from 'react'
import styles from './map.module.scss'
import MapContext from "@/components/provider/MapProvider/MapContext";
import EventHomeContext from "@/components/provider/EventHomeProvider/EventHomeContext";
import {Event, getProfile, Marker, markersCheckinList, Participants, queryMarkers, queryMyEvent} from "@/service/solas";
import {Swiper, SwiperSlide} from 'swiper/react'
import {Mousewheel, Virtual} from 'swiper'
import CardMarker from "@/components/base/Cards/CardMarker/CardMarker";
import {useRouter, useSearchParams} from "next/navigation";
import {markerTypeList} from "@/components/base/SelectorMarkerType/SelectorMarkerType";
import userContext from "@/components/provider/UserProvider/UserContext";
import DialogGuideFollow from "@/components/base/Dialog/DialogGuideFollow/DialogGuideFollow";
import GameMenu from "@/components/zugame/GameMenu/GameMenu";

const menuList = markerTypeList

const MarkerCache: any = {...markerTypeList}
const cacheGroupId: number = 0
Object.keys(MarkerCache).forEach(item => {
    MarkerCache[item] = []
})

const defaultZoom = 17

function ComponentName(props: {markerType: string | null}) {
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
    const [selectedType, setSelectedType] = useState<string | null>(props.markerType || null)
    const [showList, setShowList] = useState(false)
    const [itemWidth, setItemWidth] = useState(0)
    const [currSwiperIndex, setCurrSwiperIndex] = useState(0)

    const getMarker = async (type?: any) => {
        let res: Marker[] = []
        if (!type) {
            // All
            res = await queryMarkers({
                group_id: eventGroup?.id || undefined,
                with_checkins: user.authToken ? true : undefined,
                auth_token: user.authToken ? user.authToken : undefined
            })
        } else if (type === 'Event') {
            res = await queryMarkers({
                marker_type: 'event',
                group_id: eventGroup?.id || undefined,
                with_checkins: user.authToken ? true : undefined,
                auth_token: user.authToken ? user.authToken : undefined
            })
        } else if (type === 'Zugame') {
            console.log('===== Zugame')
            res = await queryMarkers({
                group_id: eventGroup?.id || undefined,
                with_checkins: user.authToken ? true : undefined,
                auth_token: user.authToken ? user.authToken : undefined,
                jubmoji: 1
            })
        } else {
            res = await queryMarkers({
                category: selectedType!,
                group_id: eventGroup?.id || undefined,
                with_checkins: user.authToken ? true : undefined,
                auth_token: user.authToken ? user.authToken : undefined
            })
        }

        setMarkers(res)
        console.log('============', type)
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

    const showMarkerInMapCenter = (marker: Marker, zoom?: boolean) => {
        if (GoogleMapRef.current) {
            const location = {lat: Number(marker.lat), lng: Number(marker.lng)}
            GoogleMapRef.current!.setCenter(location)
            if (zoom) {
                GoogleMapRef.current!.setZoom(defaultZoom)
            }

            setTimeout(() => {
                removeActive()
                document.getElementById(`marker-event-${marker.id}`)?.classList.add('active')
            }, 100)
        }
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
        markers.filter((item) => item.lng && item.lat).forEach(event => {

            const index = markersGrouped.findIndex(target => {
                return target[0].lat === event.lat && target[0].lng === event.lng
            })

            if (index > -1) {
                markersGrouped[index].push(event)
            } else {
                markersGrouped.push([event])
            }
        })

        // 为了保证marker不会遮住详情，先绘制marker
        // 绘制marker
        markersGrouped.map((markersList, index) => {
            const category = markersList[0].category[0].toUpperCase() + markersList[0].category.slice(1)
            const content = document.createElement('img');
            const iconUrl = markersList[0].jubmoji_code
                ? markersList[0].zugame_state === 'a'
                    ? (markerTypeList as any)['Zugame'].split('#')[2]
                    : markersList[0].zugame_state === 'b'
                        ? (markerTypeList as any)['Zugame'].split('#')[3]
                        : markersList[0].zugame_state === 'c' ?
                            (markerTypeList as any)['Zugame'].split('#')[3]
                            : (markerTypeList as any)['Zugame'].split('#')[0]
                : markersList[0].checkin
                    ? (markerTypeList as any)[category].split('#')[1]
                    : (markerTypeList as any)[category].split('#')[0]
            content.setAttribute('src', iconUrl)
            content.className = 'map-marker'

            const markerView = new Marker!({
                map: GoogleMapRef.current,
                position: {lat: Number(markersList[0].lat), lng: Number(markersList[0].lng)},
                content: content,
            })
            markersRef.current.push(markerView)
        })

        // 绘制详情
        markersGrouped.map((markerList, index) => {
            if (markerList.length === 1) {
                const eventMarker = document.createElement('div');
                eventMarker.className = index === 0 ? 'event-map-marker active' : 'event-map-marker'
                eventMarker.id = `marker-event-${markerList[0].id}`
                eventMarker.innerHTML = `<div class="title"><span>${markerList[0].title}</span></div>`

                const markerView = new Marker!({
                    map: GoogleMapRef.current,
                    position: {lat: Number(markerList[0].lat), lng: Number(markerList[0].lng)},
                    content: eventMarker,
                })

                if (markerList[0].jubmoji_code) {
                    const checkLog = markersCheckinList({id: markerList[0].id, page: 1})
                        .then(res => {
                            const checkInList: any = {a: 0, b: 0, c: 0}
                            if (res.length) {
                                res.map(item => {
                                    if (item.zugame_team) {
                                        checkInList[item.zugame_team] = checkInList[item.zugame_team] + 1
                                    }
                                })
                            }
                            const panel = document.createElement('div');
                            panel.className = 'marker-zugame-panel';
                            panel.innerText = `🐦:${checkInList.a} 🧙🏻:${checkInList.b} 🐺:${checkInList.c}`
                            const target = document.getElementById(`marker-event-${markerList[0].id}`)?.querySelector('.title')
                            target?.classList.add('game')
                            target?.appendChild(panel)

                        })
                }

                MapEvent!.addListener(markerView, 'click', function (a: any) {
                    removeActive()
                    showMarkerInMapCenter(markerList[0])
                    const swiperIndex = markers.findIndex(item => {
                        return item.id === markerList[0].id
                    })
                    swiperRef.current.slideTo(swiperIndex, 300, false)
                })

                markersRef.current.push(markerView)
            } else {
                const eventGroupMarker = document.createElement('div');
                eventGroupMarker.className = 'event-map-marker-group';
                const eventGroupInner = document.createElement('div');
                eventGroupInner.className = 'inner';
                markerList.map((marker, index_) => {
                    const eventMarker = document.createElement('div');
                    eventMarker.setAttribute('data-event-id', marker.id + '')
                    eventMarker.className = 'event-map-marker';
                    eventMarker.className = (index === 0 && index_ === 0) ? 'event-map-marker active' : 'event-map-marker'
                    eventMarker.id = `marker-event-${marker.id}`;
                    eventMarker.innerHTML = `<div class="title" data-event-id="${marker.id}"><span data-event-id="${marker.id}">${marker.title}</span></div>`
                    eventGroupInner.appendChild(eventMarker)
                })

                eventGroupMarker.appendChild(eventGroupInner)

                if (markerList.length > 2) {
                    const toggleBtn = document.createElement('div');
                    toggleBtn.className = 'toggle-btn';
                    toggleBtn.dataset.action = 'toggle';
                    toggleBtn.innerHTML = `<i class="icon-Polygon-2" data-action="toggle"></i>`
                    eventGroupMarker.appendChild(toggleBtn)
                }

                const markerView = new Marker!({
                    map: GoogleMapRef.current,
                    position: {lat: Number(markerList[0].lat), lng: Number(markerList[0].lng)},
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
        }
    }, [user.id])

    useEffect(() => {
        if (typeof window !== 'undefined' && !GoogleMapRef.current && MapReady && Map && MapEvent && mapDomRef.current && eventGroup?.id) {
            GoogleMapRef.current = new Map(mapDomRef.current as HTMLElement, {
                center: eventGroup && eventGroup.group_location_details ? JSON.parse(eventGroup.group_location_details).geometry.location : {
                    lat: -34.397,
                    lng: 150.644
                },
                zoom: defaultZoom,
                mapId: eventGroup.id === 1984 ? '2c7555ce0787c1b' : 'e2f9ddc0facd5a80',
            })
        }
    }, [MapReady, mapDomRef, eventGroup])

    useEffect(() => {
        async function initData() {
            if (typeof window !== 'undefined' && eventGroup?.id && Marker) {
                calcWidth()
                getMarker(selectedType)
                setTimeout( () => {
                    setShowList(true)
                }, 100)
                window.addEventListener('resize', calcWidth, false)
                return () => {
                    window.removeEventListener('resize', calcWidth, false)
                }

            }
        }

        initData()
    }, [eventGroup?.id, selectedType, Marker, user.id])

    useEffect(() => {
        if (searchParams && searchParams.get('type')) {
            setSelectedType(searchParams?.get('type')!)
        }
    }, [searchParams])

    useEffect(() => {
        if (Marker) {
            drawMarkers()
        }
    }, [markers, Marker, selectedType])

    return (<div className={`${styles['map-page']} map-page`}>
        <div className={styles['follow-window']}>
            <DialogGuideFollow/>
        </div>
        <div id={'gmap'} className={styles['map-container']} ref={mapDomRef as any}/>
        <GameMenu/>

        {(eventGroup?.id === 1984 || eventGroup?.id === 1516) &&
            <div className={styles['top-menu']}>
                <div className={styles['menu-item']} onClick={() => {
                    router.push(`/event/${eventGroup?.username}/create-marker`)
                }}>Create a Marker +
                </div>
                <div className={`${styles['menu-item']} ${!selectedType ? styles['menu-item-active'] : ''}`}
                     onClick={() => {
                         setSelectedType('')
                         router.push(`/event/${eventGroup?.username}/map`)
                     }}>All
                </div>
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

        {showList && !!eventGroup &&
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
                                <CardMarker
                                    isActive={currSwiperIndex === index}
                                    item={data} key={data.id} participants={participants}/>
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

export const getServerSideProps: any = (async (context: any) => {
    const type = context.query?.type
    return { props: { markerType: type || null} }
})

