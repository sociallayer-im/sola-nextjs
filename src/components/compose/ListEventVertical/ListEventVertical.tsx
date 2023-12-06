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
    const [compact, setCompact] = useState(true)

    const getEvent = async (page: number) => {
        const unload = showLoading()
        const now = new Date()
        const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).toISOString()
        if (!eventGroup?.id) {
            unload()
            return []
        }

        try {
            if (tab2Index !== 'past') {
                let res = await queryEvent({
                    page,
                    start_time_from: new Date().toISOString(),
                    event_order: 'asc',
                    group_id: eventGroup?.id || undefined
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
                    start_time_to: new Date().toISOString(),
                    event_order: 'desc',
                    group_id: eventGroup?.id || undefined
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
            <div className={'tab-titles'}>
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
            </div>

            {!!eventGroup && eventGroup.group_event_tags &&
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
