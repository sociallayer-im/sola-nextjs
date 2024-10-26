import {useContext, useEffect, useRef, useState} from 'react'
import LangContext from "../../provider/LangProvider/LangContext";
import Empty from "../../base/Empty";
import CardEvent from "../../base/Cards/CardEvent/CardEvent";
import {Event, Participants, queryEvent, queryMyEvent} from "@/service/solas";
import AppButton from "@/components/base/AppButton/AppButton";
import userContext from "@/components/provider/UserProvider/UserContext";
import {getStarEvent} from "@/service/solasv2";
import styles from './ListMyEvent.module.scss'

function ListMyEvent(props: {tab?: 'attended' | 'created' | 'star', profile_id?: number}) {
    const [tab2Index, setTab2Index] = useState<'attended' | 'created' | 'star'>(props.tab || 'attended')
    const {lang} = useContext(LangContext)
    const {user} = useContext(userContext)

    const [loadAll, setIsLoadAll] = useState(false)
    const [loading, setLoading] = useState(false)

    const pageRef = useRef(0)
    const [list, setList] = useState<Event[]>([])

    const tab2IndexRef = useRef<'attended' | 'created' |'star'>(tab2Index)

    const getEvent = async (init?: boolean) => {
        setLoading(true)
        try {
            if (tab2IndexRef.current === 'created') {
                pageRef.current = pageRef.current + 1
                const res = await queryEvent({owner_id: props.profile_id || user.id!,
                    page: pageRef.current,
                    show_pending_event: true,
                    show_rejected_event: true,
                    allow_private: true,
                })
                setList(init ? res : [...list, ...res])
                if (res.length < 10) {
                    setIsLoadAll(true)
                }
                setLoading(false)
            } else if (tab2IndexRef.current === 'attended') {
                pageRef.current = pageRef.current + 1
                let res = (await queryMyEvent({profile_id: props.profile_id || user.id!, page: pageRef.current}))
                    .map((e: any) => e.event)
                setList(init ? res : [...list, ...res])

                if (res.length < 10) {
                    setIsLoadAll(true)
                }
                setLoading(false)
            } else if (tab2IndexRef.current === 'star') {
                if (!user.authToken!) {
                    setList([])
                } else {
                    const res = await getStarEvent({auth_token: user.authToken!})
                    setList(init ? res : [...list, ...res])
                }
                setIsLoadAll(true)
                setLoading(false)
            }
        } catch (e: any) {
            console.error(e)
            // showToast(e.message)
            setLoading(false)
            return []
        }
    }

    const changeTab = (tab: 'attended' | 'created' | 'star') => {
        setTab2Index(tab)
        tab2IndexRef.current = tab
        pageRef.current = 0
        setIsLoadAll(false)
        getEvent(true)
    }

    useEffect(() => {
        if (user.id || props.profile_id) {
            getEvent(true)
        } else {
            setList([])
            setIsLoadAll(true)
            pageRef.current = 0
        }
    }, [user.id])

    useEffect(() => {
        if (props.tab && (props.tab === 'attended' || props.tab === 'created' || props.tab === 'star') && props.tab !== tab2Index) {
            changeTab(props.tab)
        }
    }, [props.tab])

    return (
        <div className={styles['module-tabs']}>
            { !props.tab &&
                <div className={styles['tab-titles']}>
                    <div className={styles['center']}>
                        <div onClick={e => {
                            e.preventDefault()
                            changeTab('attended')
                        }}
                             className={tab2Index === 'attended' ? styles['module-title'] : styles['tab-title']}>
                            {'Attended'}
                        </div>
                        <div onClick={e => {
                            e.preventDefault()
                            changeTab('created')
                        }}
                             className={tab2Index === 'created' ? styles['module-title'] : styles['tab-title']}>
                            {'Created'}
                        </div>
                        <div onClick={e => {
                            e.preventDefault()
                            changeTab('star')
                        }}
                             className={tab2Index === 'star' ? styles['module-title'] : styles['tab-title']}>
                            {'Star'}
                        </div>
                    </div>
                </div>
            }

            <div className={styles['tab-contains']}>
                {!list.length ? <Empty/> :
                    <div className={styles['list']}>
                        {
                            list.map((item, index) => {
                                return <CardEvent
                                    enableStar={tab2Index === 'star'}
                                    fixed={false} key={index}
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
