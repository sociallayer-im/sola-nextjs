import {useContext, useEffect, useRef, useState} from 'react'
import LangContext from "../../provider/LangProvider/LangContext";
import Empty from "../../base/Empty";
import CardEvent from "../../base/Cards/CardEvent/CardEvent";
import {Event, Participants, queryEvent, queryMyEvent, queryPendingEvent} from "@/service/solas";
import AppButton from "@/components/base/AppButton/AppButton";
import userContext from "@/components/provider/UserProvider/UserContext";
import EventHomeContext from "@/components/provider/EventHomeProvider/EventHomeContext";

function ListPendingEvent(props: { onload?: (pendingEvent: Event[]) => any, groupIds?: number[] }) {
    const {lang} = useContext(LangContext)
    const {user} = useContext(userContext)
    const {eventGroup} = useContext(EventHomeContext)

    const [loadAll, setIsLoadAll] = useState(false)
    const [loading, setLoading] = useState(false)

    const pageRef = useRef(0)
    const [list, setList] = useState<Event[]>([])

    const getEvent = async (init?: boolean) => {
        setLoading(true)
        try {
            pageRef.current = init ? 1: pageRef.current + 1
            const opts = {
                group_id: props.groupIds ? undefined : eventGroup!.id,
                page: pageRef.current,
                group_ids: props.groupIds,
            }
            let res = await queryPendingEvent(opts)
            setList(init ? res : [...list, ...res])

            if (res.length < 10) {
                setIsLoadAll(true)
            }
            setLoading(false)
        } catch (e: any) {
            console.error(e)
            setLoading(false)
            return []
        }
    }

    useEffect(() => {
        if (eventGroup || props.groupIds?.length) {
            getEvent(true)
        } else if (!loading) {
            setList([])
            setIsLoadAll(true)
            pageRef.current = 0
        }
    }, [eventGroup, props.groupIds])

    useEffect(() => {
        props.onload && props.onload(list)
    }, [list])

    return (
        <div className={'module-tabs'}>
            <div className={'tab-contains'}>
                {!list.length ? <Empty/> :
                    <div className={'list'}>
                        {
                            list.map((item, index) => {
                                return <CardEvent
                                    onRemove={(e) => {
                                        setList(list.filter(i => i.id !== item.id))
                                    }}
                                    canPublish={true}
                                    fixed={false} key={item.id}
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

export default ListPendingEvent
