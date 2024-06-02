import {useContext, useEffect, useRef, useState} from 'react'
import LangContext from "../../provider/LangProvider/LangContext";
import Empty from "../../base/Empty";
import CardEvent from "../../base/Cards/CardEvent/CardEvent";
import {Event, queryCohostingEvent} from "@/service/solas";
import AppButton from "@/components/base/AppButton/AppButton";
import userContext from "@/components/provider/UserProvider/UserContext";

function ListCohostingEvent(props: { onload?: (pendingEvent: Event[]) => any}) {
    const {lang} = useContext(LangContext)
    const {user} = useContext(userContext)

    const [loadAll, setIsLoadAll] = useState(false)
    const [loading, setLoading] = useState(false)

    const pageRef = useRef(0)
    const [list, setList] = useState<Event[]>([])

    const getEvent = async (init?: boolean) => {
        setLoading(true)
        try {
            pageRef.current = 1
            const opts = {
                id: user.id!,
                email: user.email|| undefined
            }
            let res = await queryCohostingEvent(opts)
            setList(init ? res : [...list, ...res])

            setIsLoadAll(true)
            setLoading(false)
        } catch (e: any) {
            console.error(e)
            setLoading(false)
            return []
        }
    }

    useEffect(() => {
        if (user.id) {
            getEvent(true)
        } else if (!loading) {
            setList([])
            setIsLoadAll(true)
            pageRef.current = 0
        }
    }, [user.id])

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
                                    blank={true}
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

export default ListCohostingEvent
