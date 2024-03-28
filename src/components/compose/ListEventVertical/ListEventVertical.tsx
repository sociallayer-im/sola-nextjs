import {useParams, usePathname, useRouter, useSearchParams} from "next/navigation";
import {useContext, useEffect, useRef, useState} from 'react'
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

function ListEventVertical(props: { initData?: Event[], patch?: string }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const params = useParams()
    const pathname = usePathname()
    const [tab2Index, setTab2Index] = useState<'latest' | 'coming' | 'past'>(searchParams?.get('tab') as any || 'coming')
    const {lang} = useContext(LangContext)
    const {showLoading} = useContext(DialogsContext)
    const {eventGroup, availableList, setEventGroup} = useContext(EventHomeContext)
    const [needUpdate, _] = useEvent(EVENT.setEventStatus)

    const [selectTag, setSelectTag] = useState<string[]>([])
    const [loadAll, setIsLoadAll] = useState(false)
    const [loading, setLoading] = useState(false)

    const pageRef = useRef(props.initData?.length ? 1 : 0)
    const [list, setList] = useState<Event[]>(props.initData || [])
    const [listToShow, setListToShow] = useState<Event[]>(props.initData || [])

    const tagRef = useRef<string>('')
    const tab2IndexRef = useRef<'latest' | 'coming' | 'past'>(tab2Index)

    const getEvent = async (init?: boolean) => {
        if (!eventGroup?.id) {
            return []
        }

        setLoading(true)
        try {
            if (tab2IndexRef.current !== 'past') {
                pageRef.current = init ? 1 : pageRef.current + 1
                let res = await queryEvent({
                    page: pageRef.current,
                    end_time_gte: new Date().toISOString(),
                    event_order: 'asc',
                    group_id: eventGroup?.id || undefined,
                    tag: tagRef.current || undefined
                })

                setList(init ? res : [...list, ...res])
                setLoading(false)
                if (res.length < 10) {
                    setIsLoadAll(true)
                }
            } else {
                pageRef.current = init ? 1 : pageRef.current + 1
                let res = await queryEvent({
                    page: pageRef.current,
                    end_time_lte: new Date().toISOString(),
                    event_order: 'desc',
                    group_id: eventGroup?.id || undefined,
                    tag: tagRef.current || undefined
                })

                setList(init ? res : [...list, ...res])
                if (res.length < 10) {
                    setIsLoadAll(true)
                }
                setLoading(false)
            }
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

    const changeTab = (tab: 'latest' | 'coming' | 'past') => {
        setTab2Index(tab)
        tab2IndexRef.current = tab
        pageRef.current = 0
        setIsLoadAll(false)
        getEvent(true)
        const href = props.patch ?
            `${props.patch}?tab=${tab}`
            : params?.groupname ?
                `/event/${eventGroup?.username}?tab=${tab}`
                : `/?tab=${tab}`
        window?.history.pushState({}, '', href)
    }

    const changeTag = (tag?: string) => {
        setSelectTag(tag ? [tag] : [])
        tagRef.current = tag || ''
        pageRef.current = 0
        setIsLoadAll(false)
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
