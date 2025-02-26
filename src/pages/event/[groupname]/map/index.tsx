import {createRef, useContext, useEffect, useMemo, useRef, useState} from 'react'
import styles from './map.module.scss'
import MapContext from "@/components/provider/MapProvider/MapContext";
import EventHomeContext from "@/components/provider/EventHomeProvider/EventHomeContext";
import {
    CheckIn, getGroups,
    Group,
    isMember as checkIsMember,
    Marker,
    markersCheckinList,
    Participants,
    queryCheckInList, queryGroupDetail,
    queryMapEvent,
    queryMarkers,
    queryMyEvent
} from "@/service/solas";
import {Swiper, SwiperSlide} from 'swiper/react'
import {Mousewheel, Virtual} from 'swiper'
import CardMarker from "@/components/base/Cards/CardMarker/CardMarker";
import {useRouter, useSearchParams} from "next/navigation";
import {markerTypeList2} from "@/components/base/SelectorMarkerType/SelectorMarkerType";
import userContext from "@/components/provider/UserProvider/UserContext";
import DialogGuideFollow from "@/components/base/Dialog/DialogGuideFollow/DialogGuideFollow";
import GameMenu from "@/components/zugame/GameMenu/GameMenu";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import CreateMarker from '@/pages/event/[groupname]/create-marker/dialog'

const menuList = markerTypeList2

const defaultZoom = 17

function ComponentName(props: { markerType: string | null, group?: Group, isIframe?: boolean, zoom?: number }) {
    const {Map, MapEvent, Marker, MapError, MapReady} = useContext(MapContext)
    const {eventGroup: _eventgroup, isManager, setEventGroup} = useContext(EventHomeContext)
    const {openConnectWalletDialog, openDialog} = useContext(DialogsContext)
    const {user} = useContext(userContext)
    const router = useRouter()
    const searchParams = useSearchParams()

    const eventGroup = useMemo(() => {return props.group || _eventgroup}, [_eventgroup, props.group])

    useEffect(() => {
        if (props.group) {
            setEventGroup(props.group)
        }
    }, [props.group])

    const readyRef = useRef(false)
    const mapDomRef = createRef()
    const GoogleMapRef = useRef<google.maps.Map | null>()
    const swiperRef = useRef<any>(null)
    const markersRef = useRef<any[]>([])

    const [participants, setParticipants] = useState<Participants[]>([])
    const [checkinList, setCheckList] = useState<CheckIn[]>([])

    const [markers, setMarkers] = useState<Marker[]>([])
    const [selectedType, setSelectedType] = useState<string | null>(props.markerType || null)
    const [showList, setShowList] = useState(false)
    const [itemWidth, setItemWidth] = useState(0)
    const [currSwiperIndex, setCurrSwiperIndex] = useState(0)
    const [isMember, setIsMember] = useState(false)

    const [selectingMarkerPoint, setSelectingMarkerPoint] = useState(false)
    const selectingMarkerPointRef = useRef(false)

    const getMarker = async (type?: any) => {
        let res: Marker[] = []
        const now = new Date()
        const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).toISOString()
        if (!type) {
            // All
            // res = await queryMarkers({
            //     group_id: eventGroup?.id || undefined,
            //     with_checkins: user.authToken ? true : undefined,
            //     auth_token: user.authToken ? user.authToken : undefined
            // })
            setSelectedType('event')
            return
        } else if (type === 'event') {
            // res = await queryMarkers({
            //     marker_type: 'event',
            //     group_id: eventGroup?.id || undefined,
            //     with_checkins: user.authToken ? true : undefined,
            //     auth_token: user.authToken ? user.authToken : undefined,
            //     start_time_from: todayZero,
            //     sort_by: 'start_time',
            //     sort: 'asc'
            // })
            res = (await queryMapEvent({
                page: 1,
                end_time_gte: new Date().toISOString(),
                event_order: 'asc',
                page_size: 200,
                group_id: eventGroup?.id || undefined,
            })).map(event => {
                return {
                    ...event,
                    event: event,
                    event_id: event.id,
                    group_id: event.group_id,
                    group: eventGroup,
                    pin_image_url: '',
                    cover_image_url: event.cover_url,
                    about: event.content,
                    message: event.content,
                    status: event.status,
                    marker_type: 'event',
                    link: '',
                    map_checkins_count: 0,
                    voucher_id: null,
                    category: 'event',
                    recurring_id: event.recurring_id,
                } as any
            }).filter((marker: Marker) => !!marker.geo_lat)

            if (searchParams?.get('target_event')) {
                const targetEvent = res.find(item => item.id === Number(searchParams?.get('target_event')))
                if (!targetEvent) {
                    const targetEvent = await queryMapEvent({id: Number(searchParams?.get('target_event')), page: 1})
                    if (targetEvent[0]) {
                        const target = {
                            ...targetEvent[0],
                            event: targetEvent[0],
                            event_id: targetEvent[0].id,
                            group_id: targetEvent[0].group_id,
                            group: eventGroup,
                            pin_image_url: '',
                            cover_image_url: targetEvent[0].cover_url,
                            about: targetEvent[0].content,
                            message: targetEvent[0].content,
                            status: targetEvent[0].status,
                            marker_type: 'event',
                            link: '',
                            map_checkins_count: 0,
                            voucher_id: null,
                            category: 'event',
                        } as any
                        res = [target, ...res]
                    }
                }
            }
        } else if (type === 'Zugame') {
            res = await queryMarkers({
                group_id: eventGroup?.id || undefined,
                with_checkins: user.authToken ? true : undefined,
                auth_token: user.authToken ? user.authToken : undefined,
                jubmoji: 1
            })
        } else if (type === 'share') {
            res = await queryMarkers({
                category: 'share',
                group_id: eventGroup?.id || undefined,
                with_checkins: user.authToken ? true : undefined,
                auth_token: user.authToken ? user.authToken : undefined,
            })

        } else if (type === 'all') {
            res = await queryMarkers({
                group_id: eventGroup?.id || undefined,
                with_checkins: user.authToken ? true : undefined,
                auth_token: user.authToken ? user.authToken : undefined,
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
            const location = {lat: Number(marker.geo_lat), lng: Number(marker.geo_lng)}
            GoogleMapRef.current!.setCenter(location)
            if (zoom) {
                GoogleMapRef.current!.setZoom(props.zoom || defaultZoom)
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
        markers.filter((item) => item.geo_lng && item.geo_lat).forEach(event => {

            const index = markersGrouped.findIndex(target => {
                return target[0].geo_lat === event.geo_lat && target[0].geo_lng === event.geo_lng
            })

            if (index > -1) {
                if ((event as any).recurring_id) {
                   const existRecurringEvent =  markersGrouped[index].find((item) => (item as any).recurring_id === (event as any).recurring_id)
                    if (!existRecurringEvent) {
                        markersGrouped[index].push(event)
                    }
                } else {
                    markersGrouped[index].push(event)
                }
            } else {
                markersGrouped.push([event])
            }
        })

        // 为了保证marker不会遮住详情，先绘制marker
        // 绘制marker
        // todo checkin marker
        markersGrouped.map((markersList, index) => {
            const category = markersList[0].category
            const markerType = menuList.find(item => item.category === category)
            if (markerType) {
                let ifcheckIn = false

                if (category === 'event') {
                    ifcheckIn = participants.some(item => item.event_id === markersList[0].id)
                } else {
                    ifcheckIn = checkinList.some(item => item.marker_id === markersList[0].id)
                }

                const markerIcon = ifcheckIn ? markerType.pin_checked : markerType.pin
                const content = document.createElement('img');
                content.setAttribute('src', markerIcon)
                content.className = 'map-marker'

                const markerView = new Marker!({
                    map: GoogleMapRef.current,
                    position: {lat: Number(markersList[0].geo_lat), lng: Number(markersList[0].geo_lng)},
                    content: content,
                })
                markersRef.current.push(markerView)
            }
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
                    position: {lat: Number(markerList[0].geo_lat), lng: Number(markerList[0].geo_lng)},
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
                   !!swiperRef.current && swiperRef.current.slideTo(swiperIndex, 300, false)
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
                    position: {lat: Number(markerList[0].geo_lat), lng: Number(markerList[0].geo_lng)},
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

                      !!swiperRef.current && swiperRef.current.slideTo(swiperIndex, 300, false)
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

        if (markers.length && !readyRef.current) {
            if (searchParams?.get('target_event')) {
                let target_index = 0
                const target = markers.find((item, index) => {
                    if (item.id === Number(searchParams?.get('target_event'))) {
                        target_index = index
                        return true
                    }
                })
                showMarkerInMapCenter(target || markers[0], true)
                setCurrSwiperIndex(target_index)
                !!swiperRef.current && swiperRef.current.slideTo(target_index, 0, false)
            } else {
                showMarkerInMapCenter(markers[0], true)
            }
            readyRef.current = true
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
            queryMyEvent({profile_id: user.id || 0, page: 1, page_size: 100}).then(res => {
                setParticipants(res)
            })
            queryCheckInList({profile_id: user.id || 0}).then(res => {
                setCheckList(res)
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
                zoom: props.zoom || defaultZoom,
                // e696c45661cb505d 特殊色
                // e2f9ddc0facd5a80 普通
                mapId: process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'zumap' ? 'e696c45661cb505d' : 'e2f9ddc0facd5a80',
                disableDefaultUI: props.isIframe,
            })

            GoogleMapRef.current!.addListener('click', function (e: any) {
                e.domEvent.preventDefault()
                console.log('map click', e)
                if (!selectingMarkerPointRef.current) {
                    return
                }

                const map:any = document.querySelector('#gmap > div > div.gm-style > div:nth-child(1) > div:nth-child(2)')
                if (map) {
                    map.style.cursor = "url('https://maps.gstatic.com/mapfiles/openhand_8_8.cur'),default"
                }
                selectingMarkerPointRef.current = false
                setSelectingMarkerPoint(false)
                openDialog({
                    content: (close: any) => {
                        return <div className={styles['dialog-creat-marker']}>
                            <div className={styles['dialog-inner']}>
                                <CreateMarker
                                    onSuccess={async (marker: Marker) => {
                                        if (marker.category !== selectedType) {
                                            setSelectedType(marker.category)
                                            router.push(`/event/${eventGroup?.username}/map?type=${marker.category}`)
                                        } else {
                                            getMarker(selectedType)
                                            setTimeout(() => {
                                                showMarkerInMapCenter(marker)
                                            }, 1000)
                                        }
                                    }}
                                    lat={e.latLng.lat()}
                                    lng={e.latLng.lng()}
                                    close={close}/>
                            </div>
                        </div>
                    },
                    size: ['auto', 400],
                    position: 'bottom',
                })
            })
        }
    }, [MapReady, mapDomRef, eventGroup])

    useEffect(() => {
        async function initData() {
            if (typeof window !== 'undefined' && eventGroup?.id && Marker) {
                calcWidth()
                getMarker(selectedType)
                setTimeout(() => {
                    setShowList(true)
                }, 100)

                if (user.id) {
                    checkIsMember({profile_id: user.id, group_id: eventGroup.id}).then(res => {
                        setIsMember(res)
                    })
                }

                window.addEventListener('resize', calcWidth, false)
                return () => {
                    window.removeEventListener('resize', calcWidth, false)
                }

            }
        }

        initData()
    }, [eventGroup?.id, selectedType, Marker, user.id])

    useEffect(() => {
        if (searchParams && searchParams?.get('type')) {
            setSelectedType(searchParams?.get('type')!)
        }
    }, [searchParams])

    useEffect(() => {
        if (Marker) {
            drawMarkers()
        }
    }, [markers, Marker, selectedType, checkinList, participants])

    return (<div className={`${styles['map-page']} map-page`}>
        <div className={styles['follow-window']}>
            <DialogGuideFollow/>
        </div>
        <div id={'gmap'} className={`${styles['map-container']} ${props.isIframe ? styles['iframe'] : ''}`}
             ref={mapDomRef as any}/>
        {selectedType === 'Zugame' &&
            <GameMenu/>
        }

        {!props.isIframe &&
           <>
               <div className={styles['top-menu']}>
                   <div className={styles['menu-item-create']} onClick={() => {
                       if (!user.id) {
                           openConnectWalletDialog()
                           return
                       }
                       setSelectingMarkerPoint(true)
                       selectingMarkerPointRef.current = true
                       // https://maps.gstatic.com/mapfiles/openhand_8_8.cur
                       const map:any = document.querySelector('#gmap > div > div.gm-style > div:nth-child(1) > div:nth-child(2)')
                       if (map) {
                           map.style.cursor = "url('/images/map_marker_cur.png'),default"
                       }
                   }}>Create a Marker +
                   </div>
                   {(isMember || isManager) &&
                       <div className={styles['menu-item-create']} onClick={() => {
                           if (!user.id) {
                               openConnectWalletDialog()
                               return
                           }
                           router.push(`/event/${eventGroup?.username}/create-share-me`)
                       }}>Share me + </div>
                   }

                   {
                       menuList.map((item, index) => {
                           const isSelected = selectedType === item.category
                           return <div key={index}
                                       onClick={() => {
                                           const patch = `/event/${eventGroup?.username}/map?type=${item.category}`
                                           setSelectedType(item.category)
                                           window.history.pushState({}, '', patch)
                                           // router.push(`/event/${eventGroup?.username}/map?type=${item.category}`)
                                       }}
                                       className={`${styles['menu-item']} ${isSelected ? styles['menu-item-active'] : ''}`}>{item.label}</div>
                       })
                   }

                   <div className={`${styles['menu-item']} ${selectedType === 'all' ? styles['menu-item-active'] : ''}`}
                        onClick={() => {
                            setSelectedType('all')
                            const patch = `/event/${eventGroup?.username}/map?type=all`
                            window.history.pushState({}, '', patch)
                        }}>All Markers
                   </div>
               </div>
               { selectingMarkerPoint &&
                   <div className={styles['top-menu']} style={{marginTop: '50px', height: 'auto'}}>
                       <div className={styles['selecting-point']}>
                           <div className={styles['text']}>
                               <img src="/images/map_marker.png" alt="" width={18}/>
                               Select a place to create a marker
                           </div>
                           <div className={styles['btn']}
                                onClick={e => {
                                    setSelectingMarkerPoint(false)
                                    selectingMarkerPointRef.current = false
                                    const map:any = document.querySelector('#gmap > div > div.gm-style > div:nth-child(1) > div:nth-child(2)')
                                    if (map) {
                                        map.style.cursor = "url('https://maps.gstatic.com/mapfiles/openhand_8_8.cur'),default"
                                    }
                                }}
                           >Cancel</div>
                       </div>
                   </div>
               }
           </>
        }

        {showList && !!eventGroup && !props.isIframe &&
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
    const groupName = context.params?.groupname
    const groups = await getGroups({username: groupName!})
    return {props: {markerType: type || null, groupname: null, group: groups[0] || null}}
})

