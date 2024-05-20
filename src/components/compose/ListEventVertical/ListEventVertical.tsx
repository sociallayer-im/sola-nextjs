import {useParams, usePathname, useRouter, useSearchParams} from "next/navigation";
import React, {useContext, useEffect, useRef, useState} from 'react'
import LangContext from "../../provider/LangProvider/LangContext";
import Empty from "../../base/Empty";
import CardEvent from "../../base/Cards/CardEvent/CardEvent";
import {Event, Group, queryEvent} from "@/service/solas";
import EventLabels from "../../base/EventLabels/EventLabels";
import DialogsContext from "../../provider/DialogProvider/DialogsContext";
import EventHomeContext from "../../provider/EventHomeProvider/EventHomeContext";
import AppButton from "@/components/base/AppButton/AppButton";
import Link from "next/link";
import useEvent, {EVENT} from "@/hooks/globalEvent";
import {StatefulPopover} from "baseui/popover";

import * as dayjsLib from "dayjs";
const dayjs: any = dayjsLib

function ListEventVertical(props: { initData?: Event[], patch?: string }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const params = useParams()
    const pathname = usePathname()
    const [tab2Index, setTab2Index] = useState<'coming' | 'past' >(searchParams?.get('tab') as any || 'coming')
    const {lang} = useContext(LangContext)
    const {showLoading} = useContext(DialogsContext)
    const {eventGroup, availableList, setEventGroup} = useContext(EventHomeContext)
    const [needUpdate, _] = useEvent(EVENT.setEventStatus)

    const [selectTag, setSelectTag] = useState<string[]>([])
    const [loadAll, setIsLoadAll] = useState(true)
    const [loading, setLoading] = useState(false)

    const pageRef = useRef(props.initData?.length ? 1 : 0)
    const [list, setList] = useState<Event[]>(props.initData || [])
    const [listToShow, setListToShow] = useState<Event[]>(props.initData || [])

    const tagRef = useRef<string>('')
    const tab2IndexRef = useRef<'coming' | 'past'>(tab2Index)
    const filter = useRef<'' | 'coming' | 'past' | 'today' | 'week' | 'month'>('')

    const queryPass = async (page: number) => {
        return await queryEvent({
            ...getTimeProps(),
            page: page,
            // end_time_lte: new Date().toISOString(),
            event_order: 'desc',
            group_id: eventGroup?.id || undefined,
            tag: tagRef.current || undefined
        })
    }

    const queryComing = async (page: number) => {
        return await queryEvent({
            ...getTimeProps(),
            page: page,
            // end_time_gte: new Date().toISOString(),
            event_order: 'asc',
            group_id: eventGroup?.id || undefined,
            tag: tagRef.current || undefined
        })
    }

    const queryToday = async () => {
        const start = new Date()
        start.setHours(0, 0, 0, 0)
        const end = new Date()
        end.setHours(23, 59, 59, 999)
        return await queryEvent({
            page: 1,
            page_size: 1000,
            start_time_from: start.toISOString(),
            start_time_to: end.toISOString(),
            event_order: 'asc',
            group_id: eventGroup?.id || undefined,
            tag: tagRef.current || undefined
        })
    }

    const queryWeek = async () => {
        const start = dayjs().startOf('week').toDate()
        const end = dayjs().endOf('week').toDate()

        return await queryEvent({
            page: 1,
            page_size: 1000,
            start_time_from: start.toISOString(),
            start_time_to: end.toISOString(),
            event_order: 'asc',
            group_id: eventGroup?.id || undefined,
            tag: tagRef.current || undefined
        })
    }

    const getTimeProps = () => {
        if (tab2IndexRef.current === 'coming') {
           if (filter.current === 'today') {
                const end = new Date()
                end.setHours(23, 59, 59, 999)
                return {
                    start_time_from: new Date().toISOString(),
                    start_time_to: end.toISOString(),
                }
            } else if (filter.current === 'week') {
                const end = dayjs().endOf('week').toDate()
                return {
                    start_time_from: new Date().toISOString(),
                    start_time_to: end.toISOString(),
                }
            } else if (filter.current === 'month') {
                const end = dayjs().endOf('month').toDate()
                return {
                    start_time_from: new Date().toISOString(),
                    start_time_to: end.toISOString(),
                }
            } else {
                return {
                    end_time_gte: new Date().toISOString(),
                }
            }
        } else {
            if (filter.current === 'today') {
                const start = new Date()
                start.setHours(0, 0, 0, 0)
                return {
                    end_time_gte: start.toISOString(),
                    end_time_lte: new Date().toISOString(),
                }
            } else if (filter.current === 'week') {
                const start = dayjs().startOf('week').toDate()
                return {
                    end_time_gte: start.toISOString(),
                    end_time_lte: new Date().toISOString(),
                }

            } else if (filter.current === 'month') {
                const start = dayjs().startOf('month').toDate()
                return {
                    end_time_gte: start.toISOString(),
                    end_time_lte: new Date().toISOString(),
                }
            } else {
                return {
                    end_time_lte: new Date().toISOString(),
                }
            }
        }
    }

    const queryMonth = async () => {
        const start = dayjs().startOf('month').toDate()
        const end = dayjs().endOf('month').toDate()

        return await queryEvent({
            page: 1,
            page_size: 1000,
            start_time_from: start.toISOString(),
            start_time_to: end.toISOString(),
            event_order: 'asc',
            group_id: eventGroup?.id || undefined,
            tag: tagRef.current || undefined
        })
    }

    const getEvent = async (init?: boolean) => {
        if (!eventGroup?.id) {
            return []
        }

        setLoading(true)
        pageRef.current = init ? 1 : pageRef.current + 1
        try {
            if (tab2IndexRef.current == 'coming') {
                const res = await queryComing(pageRef.current)
                setList(init ? res : [...list, ...res])
                setLoading(false)
                setIsLoadAll(res.length < 10)
            } else if (tab2IndexRef.current == 'past') {
                const res = await queryPass(pageRef.current)

                setList(init ? res : [...list, ...res])
                setIsLoadAll(res.length < 10)
                setLoading(false)
            }
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
        }
    }

    useEffect(() => {
        setListToShow(list)
    }, [list])

    useEffect(() => {
        if (needUpdate) {
            getEvent(true)
        }
    }, [needUpdate])

    const changeTab = (tab: 'past' | 'coming', notRedirect?: boolean) => {
        setTab2Index(tab)
        tab2IndexRef.current = tab
        pageRef.current = 0
        getEvent(true)
        if (!notRedirect) {
            const href = props.patch ?
                `${props.patch}?tab=${tab}`
                : params?.groupname ?
                    `/event/${eventGroup?.username}?tab=${tab}`
                    : `/?tab=${tab}`
            window?.history.pushState({}, '', href)
        }
    }

    const changeTag = (tag?: string) => {
        setSelectTag(tag ? [tag] : [])
        tagRef.current = tag || ''
        pageRef.current = 0
        getEvent(true)
    }

    useEffect(() => {
        if (!props.initData?.length && eventGroup) {
            changeTab('past')
        }

        if (props.initData) {
            setIsLoadAll(props.initData.length < 10)
        }
    }, [props.initData, eventGroup])

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
                          className={tab2Index != 'past' ? 'module-title' : 'tab-title'}>
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
                </div>

                <StatefulPopover
                    content={({ close }) => {
                        return <div className={'schedule-popup'}>
                            <div onClick={e => {filter.current = '';changeTab(tab2Index, true);close()}}>
                               All Time
                            </div>
                            <div onClick={e => {filter.current = 'today'; changeTab(tab2Index, true);close()}}>
                               Today
                            </div>
                            <div onClick={e => {filter.current = 'week'; changeTab(tab2Index, true);close()}}>
                                Week
                            </div>
                            <div onClick={e => {filter.current = 'month';  changeTab(tab2Index, true);close()}}>
                                Month
                            </div>
                        </div>
                    }}
                    placement={'bottom'}
                    returnFocus={false}
                    autoFocus={false}>
                    <div className={'calendar-btn-compact mobile-hide'} >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M12.6667 1.3335H3.33337C2.80294 1.3335 2.29423 1.54421 1.91916 1.91928C1.54409 2.29436 1.33337 2.80306 1.33337 3.3335V4.1135C1.33328 4.38879 1.39002 4.66114 1.50004 4.9135V4.9535C1.59423 5.16748 1.72764 5.36194 1.89337 5.52683L6.00004 9.60683V14.0002C5.99981 14.1135 6.02846 14.2249 6.08329 14.3241C6.13811 14.4232 6.2173 14.5068 6.31337 14.5668C6.41947 14.6326 6.54189 14.6672 6.66671 14.6668C6.77107 14.6662 6.87383 14.6411 6.96671 14.5935L9.63337 13.2602C9.74332 13.2048 9.83577 13.12 9.90049 13.0153C9.96521 12.9105 9.99967 12.7899 10 12.6668V9.60683L14.08 5.52683C14.2458 5.36194 14.3792 5.16748 14.4734 4.9535V4.9135C14.5926 4.66312 14.6584 4.39068 14.6667 4.1135V3.3335C14.6667 2.80306 14.456 2.29436 14.0809 1.91928C13.7058 1.54421 13.1971 1.3335 12.6667 1.3335ZM8.86004 8.86016C8.79825 8.92246 8.74937 8.99633 8.71619 9.07756C8.68302 9.15878 8.6662 9.24576 8.66671 9.3335V12.2535L7.33337 12.9202V9.3335C7.33388 9.24576 7.31706 9.15878 7.28389 9.07756C7.25071 8.99633 7.20183 8.92246 7.14004 8.86016L3.60671 5.3335H12.3934L8.86004 8.86016ZM13.3334 4.00016H2.66671V3.3335C2.66671 3.15669 2.73695 2.98712 2.86197 2.86209C2.98699 2.73707 3.15656 2.66683 3.33337 2.66683H12.6667C12.8435 2.66683 13.0131 2.73707 13.1381 2.86209C13.2631 2.98712 13.3334 3.15669 13.3334 3.3335V4.00016Z" fill="#272928"/>
                        </svg>
                        { !!filter.current &&
                            <div>{filter.current}</div>
                        }
                    </div>
                </StatefulPopover>
                <Link href={`/event/${eventGroup?.username}/schedule`} className={'calendar-btn-compact'} title={"Event Schedule"}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M16 14H8C7.73478 14 7.48043 14.1054 7.29289 14.2929C7.10536 14.4804 7 14.7348 7 15C7 15.2652 7.10536 15.5196 7.29289 15.7071C7.48043 15.8946 7.73478 16 8 16H16C16.2652 16 16.5196 15.8946 16.7071 15.7071C16.8946 15.5196 17 15.2652 17 15C17 14.7348 16.8946 14.4804 16.7071 14.2929C16.5196 14.1054 16.2652 14 16 14ZM16 10H10C9.73478 10 9.48043 10.1054 9.29289 10.2929C9.10536 10.4804 9 10.7348 9 11C9 11.2652 9.10536 11.5196 9.29289 11.7071C9.48043 11.8946 9.73478 12 10 12H16C16.2652 12 16.5196 11.8946 16.7071 11.7071C16.8946 11.5196 17 11.2652 17 11C17 10.7348 16.8946 10.4804 16.7071 10.2929C16.5196 10.1054 16.2652 10 16 10ZM20 4H17V3C17 2.73478 16.8946 2.48043 16.7071 2.29289C16.5196 2.10536 16.2652 2 16 2C15.7348 2 15.4804 2.10536 15.2929 2.29289C15.1054 2.48043 15 2.73478 15 3V4H13V3C13 2.73478 12.8946 2.48043 12.7071 2.29289C12.5196 2.10536 12.2652 2 12 2C11.7348 2 11.4804 2.10536 11.2929 2.29289C11.1054 2.48043 11 2.73478 11 3V4H9V3C9 2.73478 8.89464 2.48043 8.70711 2.29289C8.51957 2.10536 8.26522 2 8 2C7.73478 2 7.48043 2.10536 7.29289 2.29289C7.10536 2.48043 7 2.73478 7 3V4H4C3.73478 4 3.48043 4.10536 3.29289 4.29289C3.10536 4.48043 3 4.73478 3 5V19C3 19.7956 3.31607 20.5587 3.87868 21.1213C4.44129 21.6839 5.20435 22 6 22H18C18.7956 22 19.5587 21.6839 20.1213 21.1213C20.6839 20.5587 21 19.7956 21 19V5C21 4.73478 20.8946 4.48043 20.7071 4.29289C20.5196 4.10536 20.2652 4 20 4ZM19 19C19 19.2652 18.8946 19.5196 18.7071 19.7071C18.5196 19.8946 18.2652 20 18 20H6C5.73478 20 5.48043 19.8946 5.29289 19.7071C5.10536 19.5196 5 19.2652 5 19V6H7V7C7 7.26522 7.10536 7.51957 7.29289 7.70711C7.48043 7.89464 7.73478 8 8 8C8.26522 8 8.51957 7.89464 8.70711 7.70711C8.89464 7.51957 9 7.26522 9 7V6H11V7C11 7.26522 11.1054 7.51957 11.2929 7.70711C11.4804 7.89464 11.7348 8 12 8C12.2652 8 12.5196 7.89464 12.7071 7.70711C12.8946 7.51957 13 7.26522 13 7V6H15V7C15 7.26522 15.1054 7.51957 15.2929 7.70711C15.4804 7.89464 15.7348 8 16 8C16.2652 8 16.5196 7.89464 16.7071 7.70711C16.8946 7.51957 17 7.26522 17 7V6H19V19Z"
                            fill="#272928"/>
                    </svg>
                </Link>
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
            <div className={'tab-contains'}>
                {!listToShow.length ? <Empty/> :
                    <div className={'list'}>
                        {
                            listToShow.map((item, index) => {
                                return <CardEvent fixed={false} key={item.id}
                                                  event={item}/>
                            })
                        }
                    </div>
                }

                {!loadAll &&
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
