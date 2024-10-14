import {useParams, usePathname, useRouter, useSearchParams} from "next/navigation";
import React, {useContext, useEffect, useMemo, useRef, useState} from 'react'
import LangContext from "../../provider/LangProvider/LangContext";
import Empty from "../../base/Empty";
import CardEvent from "../../base/Cards/CardEventNew/CardEvent";
import {Event, EventSites, getEventSide, getTracks, Group} from "@/service/solas";
import EventLabels from "../../base/EventLabels/EventLabels";
import DialogsContext from "../../provider/DialogProvider/DialogsContext";
import AppButton from "@/components/base/AppButton/AppButton";
import Link from "next/link";
import useEvent, {EVENT} from "@/hooks/globalEvent";
import AppInput from "@/components/base/AppInput";
import userContext from "@/components/provider/UserProvider/UserContext";
import EventFilter from "@/components/base/EventFilter/EventFilter";
import DialogCalendarLinks from "@/components/base/Dialog/DialogCalendarLinks/DialogCalendarLinks";
import fetch from "@/utils/fetch";

import * as dayjsLib from "dayjs";
import {PageBackContext} from "@/components/provider/PageBackProvider";
import TrackSelect from "@/components/base/TrackSelect/TrackSelect";

const dayjs: any = dayjsLib
let scrollInterval: any = null

function ListEventVertical({eventGroup, ...props}: {
    isManager?: boolean,
    initData?: Event[],
    patch?: string,
    eventGroup: Group
}) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const params = useParams()
    const pathname = usePathname()
    const [tab2Index, setTab2Index] = useState<'coming' | 'past' | 'private'>(searchParams?.get('tab') as any || 'coming')
    const {lang} = useContext(LangContext)
    const {showLoading, openDialog} = useContext(DialogsContext)
    const [needUpdate, _] = useEvent(EVENT.setEventStatus)
    const {applyScroll} = useContext(PageBackContext)
    const {user} = useContext(userContext)


    const [venues, setVenues] = useState<EventSites[]>([])
    const [selectTag, setSelectTag] = useState<string[]>([])
    const [loadAll, setIsLoadAll] = useState(true)
    const [loading, setLoading] = useState(false)
    const [ready, setReady] = useState(false)

    const pageRef = useRef(searchParams?.get('page') ? Number(searchParams?.get('page')) : 1)
    const [list, setList] = useState<Event[]>([])
    const [listToShow, setListToShow] = useState<Event[]>([])

    const tagRef = useRef<string>(searchParams?.get('tag') || '')
    const checkedComingEmpty = useRef(true)
    const tab2IndexRef = useRef<'coming' | 'past' | 'private'>(tab2Index)
    const filter = useRef<'' | 'coming' | 'past' | 'today' | 'week' | 'month'>('')
    const selectVenueIdRef = useRef(searchParams?.get('venue') ? searchParams!.get('venue')!.split(',').map(v => Number(v)) : [])
    const trackIdRef = useRef(searchParams?.get('track') ? Number(searchParams?.get('track')) : undefined)

    const searchRef = useRef<any>(null)
    const [searchKeyword, setSearchKeyword] = useState('')

    const [tracks, setTracks] = useState<any[]>([])

    const isGroupOwner = useMemo(() => {
        if (!user.id || !eventGroup) {
            return false
        }

        return user.id === eventGroup.creator.id
    }, [eventGroup, user])

    const queryPass = async (page: number, page_size: number, venue_ids: number[], search?: string, trackid?: number) => {
        const searchParams = new URLSearchParams()
        const {start_date, end_date} = getTimeProps()
        searchParams.set('collection', 'past')
        !!start_date && searchParams.set('start_date', start_date)
        !!end_date && searchParams.set('end_date', end_date)
        !!eventGroup?.id && searchParams.set('group_id', eventGroup.id.toString())
        !!eventGroup?.timezone && searchParams.set('timezone', eventGroup.timezone)
        !!user.authToken && searchParams.set('auth_token', user.authToken)
        !!search && searchParams.set('search_title', search)
        !!tagRef.current && searchParams.set('tags', tagRef.current)
        !!venue_ids.length && searchParams.set('venue_id', venue_ids[0].toString())
        !!trackid && searchParams.set('track_id', trackid.toString())

        const url = `${process.env.NEXT_PUBLIC_EVENT_LIST_API}/event/list?${searchParams.toString()}`

        const res = await fetch.get({url})

        setTracks(res.data.group.tracks || [])

        return res.data.events.map((e: any) => {
            return {
                ...e,
                track: e.track_id ? res.data.group.tracks.find((t: any) => t.id === e.track_id) : undefined
            }
        }) as Event[]
    }

    const queryPrivate = async (page: number, page_size: number, venue_ids: number[], search?: string, trackid?: number) => {
        const searchParams = new URLSearchParams()
        const {start_date, end_date} = getTimeProps()
        searchParams.set('private_event', '1')
        !!start_date && searchParams.set('start_date', start_date)
        !!end_date && searchParams.set('end_date', end_date)
        !!eventGroup?.id && searchParams.set('group_id', eventGroup.id.toString())
        !!eventGroup?.timezone && searchParams.set('timezone', eventGroup.timezone)
        !!user.authToken && searchParams.set('auth_token', user.authToken)
        !!search && searchParams.set('search', search)
        !!tagRef.current && searchParams.set('tags', tagRef.current)
        !!venue_ids.length && searchParams.set('venue_ids', venue_ids[0].toString())
        !!trackid && searchParams.set('track_id', trackid.toString())

        const url = `${process.env.NEXT_PUBLIC_EVENT_LIST_API}/event/list?${searchParams.toString()}`

        const res = await fetch.get({url})

        setTracks(res.data.group.tracks || [])

        return res.data.events.map((e: any) => {
            return {
                ...e,
                track: e.track_id ? res.data.group.tracks.find((t: any) => t.id === e.track_id) : undefined
            }
        }) as Event[]
    }

    const queryComing = async (page: number, page_size: number, venue_ids: number[], search?: string, trackid?: number) => {
        const searchParams = new URLSearchParams()
        const {start_date, end_date} = getTimeProps()

        searchParams.set('collection', 'upcoming')
        !!start_date && searchParams.set('start_date', start_date)
        !!end_date && searchParams.set('end_date', end_date)
        !!eventGroup?.id && searchParams.set('group_id', eventGroup.id.toString())
        !!eventGroup?.timezone && searchParams.set('timezone', eventGroup.timezone)
        !!user.authToken && searchParams.set('auth_token', user.authToken)
        !!search && searchParams.set('search', search)
        !!tagRef.current && searchParams.set('tags', tagRef.current)
        !!venue_ids.length && searchParams.set('venue_ids', venue_ids[0].toString())
        !!trackid && searchParams.set('track_id', trackid.toString())

        const url = `${process.env.NEXT_PUBLIC_EVENT_LIST_API}/event/list?${searchParams.toString()}`

        const res = await fetch.get({url})

        setTracks(res.data.group.tracks || [])

        return res.data.events.map((e: any) => {
            return {
                ...e,
                track: e.track_id ? res.data.group.tracks.find((t: any) => t.id === e.track_id) : undefined
            }
        }) as Event[]
    }

    const getTimeProps = () => {
        if (filter.current === 'today') {
            return {
                start_date: dayjs().format('YYYY-MM-DD'),
                end_date: dayjs().format('YYYY-MM-DD'),
            }
        } else if (filter.current === 'week') {
            return {
                start_date: dayjs().format('YYYY-MM-DD'),
                end_date: dayjs().endOf('week').format('YYYY-MM-DD'),
            }
        } else if (filter.current === 'month') {
            return {
                start_date: dayjs().format('YYYY-MM-DD'),
                end_date: dayjs().endOf('month').format('YYYY-MM-DD'),
            }
        } else {
            return {
                start_date: dayjs().format('YYYY-MM-DD'),
            }
        }
    }

    function updatePageParam(key: string, value: string) {
        const urlObj = new URL(location.href);
        const params = new URLSearchParams(urlObj.search);

        if (value === '1' || !value) {
            params.delete(key);
        } else if (params.has(key)) {
            params.set(key, value);
        } else {
            params.append(key, value);
        }

        urlObj.search = params.toString();
        return urlObj.toString().replace(location.origin, '')
    }

    function updatePageParams(props: { key: string, value: string }[]) {
        const urlObj = new URL(location.href);
        const params = new URLSearchParams(urlObj.search);

        props.forEach(({key, value}) => {
            if (value === '1' || !value) {
                params.delete(key);
            } else if (params.has(key)) {
                params.set(key, value);
            } else {
                params.append(key, value);
            }
        })

        urlObj.search = params.toString();
        return urlObj.toString().replace(location.origin, '')
    }


    const getEvent = async (init?: boolean, search?: string) => {
        if (!eventGroup?.id) {
            return []
        }
        const unload = showLoading()
        setLoading(true)
        pageRef.current = init ? pageRef.current : pageRef.current + 1
        try {
            if (tab2IndexRef.current == 'coming') {

                const res = await queryComing(
                    init ? 1 : pageRef.current,
                    init ? pageRef.current * 10 : 10,
                    selectVenueIdRef.current,
                    search,
                    trackIdRef.current
                )

                const unique = res.filter((item) => !list.find((i) => i.id === item.id))
                setList(init ? res : [...list, ...unique])
                setLoading(false)
                setIsLoadAll(res.length < 10)
                if (unique.length === 0 && checkedComingEmpty.current) {
                    await changeTab('past')
                    return
                }
            } else if (tab2IndexRef.current == 'past') {
                const res = await queryPass(
                    init ? 1 : pageRef.current,
                    init ? pageRef.current * 10 : 10,
                    selectVenueIdRef.current,
                    search,
                    trackIdRef.current
                )
                const unique = res.filter((item) => !list.find((i) => i.id === item.id))
                setList(init ? res : [...list, ...unique])
                setIsLoadAll(res.length < 10)
                setLoading(false)
            } else if (tab2IndexRef.current == 'private') {
                const res = await queryPrivate(
                    init ? 1 : pageRef.current,
                    init ? pageRef.current * 10 : 10,
                    selectVenueIdRef.current,
                    search,
                    trackIdRef.current
                )
                const unique = res.filter((item) => !list.find((i) => i.id === item.id))
                setList(init ? res : [...list, ...unique])
                setIsLoadAll(res.length < 10)
                setLoading(false)
            }
            const path = updatePageParam('page', pageRef.current + '')
            history.replaceState(null, '', path)
            // else if (tab2IndexRef.current == 'today') {
            //     const res = await queryToday()
            //     setList(res)
            //     setIsLoadAll(true)
            //     setLoading(false)
            // } else if (tab2IndexRef.current == 'week') {
            //     const res = await queryWeek()
            //     setList(res)
            //     setIsLoadAll(true)
            //     setLoading(false)
            // } else if (tab2IndexRef.current == 'month') {
            //     const res = await queryMonth()
            //     setList(res)
            //     setIsLoadAll(true)
            //     setLoading(false)
            // }
        } catch (e: any) {
            console.error(e)
            // showToast(e.message)
            setLoading(false)
            return []
        } finally {
            unload()
            checkedComingEmpty.current = false
        }
    }

    useEffect(() => {
        console.log('list =>', list)
        setListToShow(list)
    }, [list])

    useEffect(() => {
        if (needUpdate) {
            getEvent(true)
        }
    }, [needUpdate])

    const changeTab = async (tab: 'past' | 'coming' | 'private', notRedirect?: boolean) => {
        setTab2Index(tab)
        tab2IndexRef.current = tab
        pageRef.current = 1
        await getEvent(true)
        if (!notRedirect) {
            const href = updatePageParam('tab', tab)
            window?.history.replaceState({}, '', href)
        }
    }

    const changeTag = (tag?: string) => {
        setSelectTag(tag ? [tag] : [])
        tagRef.current = tag || ''
        pageRef.current = 1
        const href = updatePageParam('tag', tag || '')
        window?.history.replaceState({}, '', href)
        getEvent(true)
    }

    useEffect(() => {
        if (listToShow.length) {
            scrollInterval = setInterval(() => {

                const a = document.querySelectorAll('.event-card')
                if (a.length >= listToShow.length) {
                    applyScroll()
                    clearInterval(scrollInterval)
                }
            }, 100)

            return () => {
                clearInterval(scrollInterval)
            }
        }
    }, [applyScroll, listToShow])

    useEffect(() => {
        if (!!eventGroup) {
            (async () => {
                await getEvent(true)
                const venues = await getEventSide(eventGroup.id)
                setVenues(venues)
                setReady(true)
            })()
        }
    }, [eventGroup])

    useEffect(() => {
        if (!user.id && tab2IndexRef.current === 'private') {
            changeTab('coming')
        } else if (!!user.id) {
            changeTab(tab2IndexRef.current)
        }
    }, [user.id]);

    const [filtered, setFiltered] = useState(filter.current || selectVenueIdRef.current.length > 0)

    const handleOpenEventFilter = async () => {
        const unload = showLoading()
        const tracks = await getTracks({groupId: eventGroup.id})
        unload()
        openDialog({
            content: (close: any) => {
                return <EventFilter
                    close={close}
                    tracks={tracks}
                    time={filter.current}
                    venues={venues}
                    onConfirm={(res) => {
                        selectVenueIdRef.current = res.venueIds
                        filter.current = res.time
                        trackIdRef.current = res.trackId
                        const patch = updatePageParams([
                            {key: 'filter', value: res.time},
                            {key: 'venue', value: res.venueIds.join(',')},
                            {key: 'track', value: res.trackId ? res.trackId + '' : ''}
                        ])
                        setFiltered(res.time || res.venueIds.length > 0 || !!res.trackId)
                        history.replaceState(null, '', patch)
                        setTimeout(() => {
                            changeTab(tab2Index, true);
                        }, 100)
                    }}
                    currTrackId={trackIdRef.current}
                    currVenueIds={selectVenueIdRef.current}/>
            },
            size: ['370px', 'auto'],
            position: 'bottom'
        })
    }

    const handleShowCalendarLink = () => {
        openDialog({
            content: (close: any) => {
                return <DialogCalendarLinks groupname={eventGroup.username}/>
            },
            size: ['316px', 'auto'],
            position: 'bottom'
        })
    }

    return (
        <div className={'module-tabs'}>
            <div className={'tab-titles'}>
                <div className={'center'}>
                    <Link href={props.patch ?
                        `${props.patch}?tab=coming`
                        : params?.groupname ?
                            `/event/${eventGroup?.username}?tab=coming`
                            : `/?tab=coming`} shallow
                          onClick={e => {
                              e.preventDefault()
                              changeTab('coming')
                          }}
                          className={tab2Index === 'coming' ? 'module-title' : 'tab-title'}>
                        {lang['Activity_Coming']}
                    </Link>
                    <Link href={props.patch ?
                        `${props.patch}?tab=coming`
                        : params?.groupname ?
                            `/event/${eventGroup?.username}?tab=past`
                            : `/?tab=past`} shallow
                          onClick={e => {
                              e.preventDefault()
                              changeTab('past')
                          }}
                          className={tab2Index === 'past' ? 'module-title' : 'tab-title'}>
                        {lang['Activity_Past']}
                    </Link>
                    {
                        (isGroupOwner || props.isManager) &&
                        <Link href={props.patch ?
                            `${props.patch}?tab=private`
                            : params?.groupname ?
                                `/event/${eventGroup?.username}?tab=past`
                                : `/?tab=past`} shallow
                              onClick={e => {
                                  e.preventDefault()
                                  changeTab('private')
                              }}
                              className={tab2Index === 'private' ? 'module-title' : 'tab-title'}>
                            {lang['Private']}
                        </Link>
                    }
                </div>
            </div>

            <div className={'tag-list search-input'} style={{marginRight: '20px'}}>
                <AppInput value={searchKeyword}
                          clearable={true}
                          onChange={e => {
                              pageRef.current = 0
                              setSearchKeyword(e.target.value)
                              clearTimeout(searchRef.current)
                              searchRef.current = setTimeout(() => {
                                  getEvent(true, e.target.value)
                              }, 300)
                          }}
                          startEnhancer={() => <i className="icon-search"/>}
                          placeholder={'Search events...'}/>

                <div className={'calendar-btn-compact'} onClick={handleOpenEventFilter}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                            d="M12.6667 1.3335H3.33337C2.80294 1.3335 2.29423 1.54421 1.91916 1.91928C1.54409 2.29436 1.33337 2.80306 1.33337 3.3335V4.1135C1.33328 4.38879 1.39002 4.66114 1.50004 4.9135V4.9535C1.59423 5.16748 1.72764 5.36194 1.89337 5.52683L6.00004 9.60683V14.0002C5.99981 14.1135 6.02846 14.2249 6.08329 14.3241C6.13811 14.4232 6.2173 14.5068 6.31337 14.5668C6.41947 14.6326 6.54189 14.6672 6.66671 14.6668C6.77107 14.6662 6.87383 14.6411 6.96671 14.5935L9.63337 13.2602C9.74332 13.2048 9.83577 13.12 9.90049 13.0153C9.96521 12.9105 9.99967 12.7899 10 12.6668V9.60683L14.08 5.52683C14.2458 5.36194 14.3792 5.16748 14.4734 4.9535V4.9135C14.5926 4.66312 14.6584 4.39068 14.6667 4.1135V3.3335C14.6667 2.80306 14.456 2.29436 14.0809 1.91928C13.7058 1.54421 13.1971 1.3335 12.6667 1.3335ZM8.86004 8.86016C8.79825 8.92246 8.74937 8.99633 8.71619 9.07756C8.68302 9.15878 8.6662 9.24576 8.66671 9.3335V12.2535L7.33337 12.9202V9.3335C7.33388 9.24576 7.31706 9.15878 7.28389 9.07756C7.25071 8.99633 7.20183 8.92246 7.14004 8.86016L3.60671 5.3335H12.3934L8.86004 8.86016ZM13.3334 4.00016H2.66671V3.3335C2.66671 3.15669 2.73695 2.98712 2.86197 2.86209C2.98699 2.73707 3.15656 2.66683 3.33337 2.66683H12.6667C12.8435 2.66683 13.0131 2.73707 13.1381 2.86209C13.2631 2.98712 13.3334 3.15669 13.3334 3.3335V4.00016Z"
                            fill="#272928"/>
                    </svg>
                    {
                        !!filtered &&
                        <div className={'dot'}/>
                    }
                </div>

                <Link href={`/event/${eventGroup?.username}/schedule`} className={'calendar-btn-compact'}
                      title={"Event Schedule"}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M16 14H8C7.73478 14 7.48043 14.1054 7.29289 14.2929C7.10536 14.4804 7 14.7348 7 15C7 15.2652 7.10536 15.5196 7.29289 15.7071C7.48043 15.8946 7.73478 16 8 16H16C16.2652 16 16.5196 15.8946 16.7071 15.7071C16.8946 15.5196 17 15.2652 17 15C17 14.7348 16.8946 14.4804 16.7071 14.2929C16.5196 14.1054 16.2652 14 16 14ZM16 10H10C9.73478 10 9.48043 10.1054 9.29289 10.2929C9.10536 10.4804 9 10.7348 9 11C9 11.2652 9.10536 11.5196 9.29289 11.7071C9.48043 11.8946 9.73478 12 10 12H16C16.2652 12 16.5196 11.8946 16.7071 11.7071C16.8946 11.5196 17 11.2652 17 11C17 10.7348 16.8946 10.4804 16.7071 10.2929C16.5196 10.1054 16.2652 10 16 10ZM20 4H17V3C17 2.73478 16.8946 2.48043 16.7071 2.29289C16.5196 2.10536 16.2652 2 16 2C15.7348 2 15.4804 2.10536 15.2929 2.29289C15.1054 2.48043 15 2.73478 15 3V4H13V3C13 2.73478 12.8946 2.48043 12.7071 2.29289C12.5196 2.10536 12.2652 2 12 2C11.7348 2 11.4804 2.10536 11.2929 2.29289C11.1054 2.48043 11 2.73478 11 3V4H9V3C9 2.73478 8.89464 2.48043 8.70711 2.29289C8.51957 2.10536 8.26522 2 8 2C7.73478 2 7.48043 2.10536 7.29289 2.29289C7.10536 2.48043 7 2.73478 7 3V4H4C3.73478 4 3.48043 4.10536 3.29289 4.29289C3.10536 4.48043 3 4.73478 3 5V19C3 19.7956 3.31607 20.5587 3.87868 21.1213C4.44129 21.6839 5.20435 22 6 22H18C18.7956 22 19.5587 21.6839 20.1213 21.1213C20.6839 20.5587 21 19.7956 21 19V5C21 4.73478 20.8946 4.48043 20.7071 4.29289C20.5196 4.10536 20.2652 4 20 4ZM19 19C19 19.2652 18.8946 19.5196 18.7071 19.7071C18.5196 19.8946 18.2652 20 18 20H6C5.73478 20 5.48043 19.8946 5.29289 19.7071C5.10536 19.5196 5 19.2652 5 19V6H7V7C7 7.26522 7.10536 7.51957 7.29289 7.70711C7.48043 7.89464 7.73478 8 8 8C8.26522 8 8.51957 7.89464 8.70711 7.70711C8.89464 7.51957 9 7.26522 9 7V6H11V7C11 7.26522 11.1054 7.51957 11.2929 7.70711C11.4804 7.89464 11.7348 8 12 8C12.2652 8 12.5196 7.89464 12.7071 7.70711C12.8946 7.51957 13 7.26522 13 7V6H15V7C15 7.26522 15.1054 7.51957 15.2929 7.70711C15.4804 7.89464 15.7348 8 16 8C16.2652 8 16.5196 7.89464 16.7071 7.70711C16.8946 7.51957 17 7.26522 17 7V6H19V19Z"
                            fill="#272928"/>
                    </svg>
                </Link>

                <div className={'calendar-btn-compact'} onClick={handleShowCalendarLink}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path
                            d="M0.91999 9.25317C0.545455 9.62817 0.335083 10.1365 0.335083 10.6665C0.335083 11.1965 0.545455 11.7048 0.91999 12.0798C1.29499 12.4544 1.80332 12.6647 2.33332 12.6647C2.86332 12.6647 3.37166 12.4544 3.74666 12.0798C4.09994 11.7007 4.29226 11.1992 4.28312 10.6811C4.27398 10.163 4.06408 9.66861 3.69765 9.30218C3.33121 8.93574 2.83685 8.72585 2.31872 8.7167C1.80058 8.70756 1.29912 8.89989 0.91999 9.25317V9.25317ZM2.80666 11.1398C2.68112 11.2654 2.51086 11.3359 2.33332 11.3359C2.15579 11.3359 1.98553 11.2654 1.85999 11.1398C1.73445 11.0143 1.66393 10.844 1.66393 10.6665C1.66393 10.489 1.73445 10.3187 1.85999 10.1932C1.92197 10.1307 1.9957 10.0811 2.07694 10.0472C2.15818 10.0134 2.24532 9.99597 2.33332 9.99597C2.42133 9.99597 2.50847 10.0134 2.58971 10.0472C2.67095 10.0811 2.74468 10.1307 2.80666 10.1932C2.86914 10.2551 2.91874 10.3289 2.95258 10.4101C2.98643 10.4914 3.00386 10.5785 3.00386 10.6665C3.00386 10.7545 2.98643 10.8416 2.95258 10.9229C2.91874 11.0041 2.86914 11.0779 2.80666 11.1398ZM2.33332 5.99984C2.15651 5.99984 1.98694 6.07007 1.86192 6.1951C1.73689 6.32012 1.66666 6.48969 1.66666 6.6665C1.66666 6.84331 1.73689 7.01288 1.86192 7.13791C1.98694 7.26293 2.15651 7.33317 2.33332 7.33317C3.21738 7.33317 4.06522 7.68436 4.69035 8.30948C5.31547 8.9346 5.66666 9.78245 5.66666 10.6665C5.66666 10.8433 5.73689 11.0129 5.86192 11.1379C5.98694 11.2629 6.15651 11.3332 6.33332 11.3332C6.51013 11.3332 6.6797 11.2629 6.80473 11.1379C6.92975 11.0129 6.99999 10.8433 6.99999 10.6665C6.99999 9.42883 6.50832 8.24184 5.63315 7.36667C4.75798 6.4915 3.571 5.99984 2.33332 5.99984ZM2.33332 3.33317C2.15651 3.33317 1.98694 3.40341 1.86192 3.52843C1.73689 3.65346 1.66666 3.82303 1.66666 3.99984C1.66666 4.17665 1.73689 4.34622 1.86192 4.47124C1.98694 4.59627 2.15651 4.6665 2.33332 4.6665C3.92462 4.6665 5.45075 5.29864 6.57596 6.42386C7.70118 7.54908 8.33332 9.0752 8.33332 10.6665C8.33332 10.8433 8.40356 11.0129 8.52858 11.1379C8.65361 11.2629 8.82318 11.3332 8.99999 11.3332C9.1768 11.3332 9.34637 11.2629 9.47139 11.1379C9.59642 11.0129 9.66666 10.8433 9.66666 10.6665C9.66149 8.72249 8.89018 6.85889 7.51999 5.47984C6.14094 4.10965 4.27733 3.33834 2.33332 3.33317V3.33317ZM9.40666 3.59317C7.52585 1.72486 4.98436 0.673293 2.33332 0.666504C2.15651 0.666504 1.98694 0.736742 1.86192 0.861766C1.73689 0.98679 1.66666 1.15636 1.66666 1.33317C1.66666 1.50998 1.73689 1.67955 1.86192 1.80457C1.98694 1.9296 2.15651 1.99984 2.33332 1.99984C4.63187 1.99984 6.83627 2.91293 8.46158 4.53824C10.0869 6.16356 11 8.36796 11 10.6665C11 10.8433 11.0702 11.0129 11.1953 11.1379C11.3203 11.2629 11.4898 11.3332 11.6667 11.3332C11.8435 11.3332 12.013 11.2629 12.1381 11.1379C12.2631 11.0129 12.3333 10.8433 12.3333 10.6665C12.3265 8.01547 11.275 5.47398 9.40666 3.59317Z"
                            fill="#272928"/>
                    </svg>
                </div>
            </div>

            {!!eventGroup && (eventGroup as Group).event_tags &&
                <div className={'tag-list'}>
                    <EventLabels
                        showAll={true}
                        single
                        onChange={(value) => {
                            if (value.length === 0 && selectTag.length === 0) {
                                return
                            } else if (selectTag[0] === value[0]) {
                                changeTag()
                            } else {
                                changeTag(value[0])
                            }
                        }}
                        data={(eventGroup as Group).event_tags || []}
                        value={selectTag}/>
                </div>
            }

            {!!tracks.length &&
            <div className={'tag-list'}>
                <TrackSelect tracks={tracks}
                             showAll={true}
                             value={trackIdRef.current ? [trackIdRef.current] : []}
                             multi={false}
                             onChange={trackIds => {
                                 trackIdRef.current = trackIds[0]
                                 const patch = updatePageParams([
                                     {key: 'track', value: trackIds[0] ? trackIds[0].toString() : ''}
                                 ])
                                 setFiltered(!!trackIds[0])
                                 history.replaceState(null, '', patch)
                                 setTimeout(() => {
                                     changeTab(tab2Index, true);
                                 }, 100)
                             }}/>
            </div>
            }


            <div className={'tab-contains'}>
                {!listToShow.length && ready ? <Empty/> :
                    <div className={'list'}>
                        {
                            listToShow.map((item, index) => {
                                return <CardEvent
                                    timezone={eventGroup.timezone || undefined}
                                    fixed={false} key={item.id}
                                    event={item}/>
                            })
                        }
                    </div>
                }

                {!loadAll && false &&
                    <AppButton
                        disabled={loading}
                        onClick={e => {
                            getEvent()
                        }} style={{width: '200px', margin: '0 auto'}}>
                        Load more
                    </AppButton>
                }
            </div>
        </div>
    )
}

export default ListEventVertical
