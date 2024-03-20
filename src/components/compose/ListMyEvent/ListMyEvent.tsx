import {useContext, useEffect, useRef, useState} from 'react'
import LangContext from "../../provider/LangProvider/LangContext";
import Empty from "../../base/Empty";
import CardEvent from "../../base/Cards/CardEvent/CardEvent";
import {Event, Participants, queryEvent, queryMyEvent} from "@/service/solas";
import AppButton from "@/components/base/AppButton/AppButton";
import userContext from "@/components/provider/UserProvider/UserContext";

function ListMyEvent(props: {tab?: 'attended' | 'created' }) {
    const [tab2Index, setTab2Index] = useState<'attended' | 'created'>(props.tab || 'attended')
    const {lang} = useContext(LangContext)
    const {user} = useContext(userContext)

    const [loadAll, setIsLoadAll] = useState(false)
    const [loading, setLoading] = useState(false)

    const pageRef = useRef(0)
    const [list, setList] = useState<Event[]>([])

    const tab2IndexRef = useRef<'attended' | 'created'>(tab2Index)

    const getEvent = async (init?: boolean) => {
        setLoading(true)
        try {
            if (tab2IndexRef.current !== 'attended') {
                pageRef.current = pageRef.current + 1
                const res = await queryEvent({owner_id: user.id!, page: pageRef.current, show_pending_event: true, show_rejected_event: true})
                setList(init ? res : [...list, ...res])
                if (res.length < 10) {
                    setIsLoadAll(true)
                }
                setLoading(false)
            } else {
                pageRef.current = pageRef.current + 1
                let res = (await queryMyEvent({profile_id: user.id!, page: pageRef.current}))
                    .map((e: any) => e.event)
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

    const changeTab = (tab: 'attended' | 'created') => {
        setTab2Index(tab)
        tab2IndexRef.current = tab
        pageRef.current = 0
        setIsLoadAll(false)
        getEvent(true)
    }

    useEffect(() => {
        if (user.id) {
            getEvent(true)
        } else {
            setList([])
            setIsLoadAll(true)
            pageRef.current = 0
        }
    }, [user.id])

    useEffect(() => {
        if (props.tab && (props.tab === 'attended' || props.tab === 'created') && props.tab !== tab2Index) {
            changeTab(props.tab)
        }
    }, [props.tab])

    return (
        <div className={'module-tabs'}>
            { !props.tab &&
                <div className={'tab-titles'}>
                    <div className={'center'}>
                        <div onClick={e => {
                            e.preventDefault()
                            changeTab('attended')
                        }}
                             className={tab2Index === 'attended' ? 'module-title' : 'tab-title'}>
                            {'Attended'}
                        </div>
                        <div onClick={e => {
                            e.preventDefault()
                            changeTab('created')
                        }}
                             className={tab2Index === 'created' ? 'module-title' : 'tab-title'}>
                            {'Created'}
                        </div>
                    </div>
                </div>
            }

            <div className={'tab-contains'}>
                {!list.length ? <Empty/> :
                    <div className={'list'}>
                        {
                            list.map((item, index) => {
                                return <CardEvent
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

export default ListMyEvent
