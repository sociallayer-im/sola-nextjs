import {useSearchParams} from "next/navigation";
import {useContext, useEffect, useState} from 'react'
import LangContext from "../../provider/LangProvider/LangContext";
import Empty from "../../base/Empty";
import CardEvent from "../../base/Cards/CardEvent/CardEvent";
import {Participants, Profile, queryEvent} from "@/service/solas";
import DialogsContext from "../../provider/DialogProvider/DialogsContext";
import scrollToLoad from "../../../hooks/scrollToLoad";
import EventHomeContext from "../../provider/EventHomeProvider/EventHomeContext";
import MaodaoSelectGroup from "@/components/maodao/MaodaoSelectGroup/MaodaoSelectGroup";
import {useRouter} from "next/navigation";


function ListEventVertical(props: { participants: Participants[] }) {
    const searchParams = useSearchParams()
    const [tab2Index, setTab2Index] = useState<'latest' | 'soon' | 'past'>(searchParams?.get('tab') as any || 'soon')
    const {lang} = useContext(LangContext)
    const {showLoading} = useContext(DialogsContext)
    const {eventGroup} = useContext(EventHomeContext)
    const [currGroup, setCurrGroup] = useState<Profile | null>(null)
    const router = useRouter()

    const getEvent = async (page: number) => {
        const unload = showLoading()
        const now = new Date()
        const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime() / 1000
        if (!eventGroup?.id) {
            return []
        }

        try {
            if (tab2Index !== 'past') {
                let res = await queryEvent({
                    page,
                    start_time_from: todayZero,
                    event_order: 'start_time_asc',
                    group_id: eventGroup?.id || undefined
                })

                res = res.filter(item => {
                    const endTime = new Date(item.ending_time!).getTime()
                    return endTime >= new Date().getTime()
                })
                return res
            } else {
                let res = await queryEvent({
                    page,
                    start_time_to: todayZero,
                    event_order: 'start_time_desc',
                    group_id: eventGroup?.id || undefined
                })

                res = res.filter(item => {
                    const endTime = new Date(item.ending_time!).getTime()
                    return endTime < new Date().getTime()
                })

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
        queryFunction: getEvent
    })

    useEffect(() => {
        if (searchParams?.get('tab')) {
            setTab2Index(searchParams.get('tab') as any)
        }
    }, [searchParams])

    useEffect(() => {
        if (eventGroup) {
            if (!currGroup) {
                setCurrGroup(eventGroup)
            }

            refresh()
        }
    }, [eventGroup, tab2Index])

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

    const gotoGroupEventHome = () => {
        router.push(`/event-home/${currGroup?.username}`)
    }

    return (
        <div className={'module-tabs'}>
            <div className={'tab-titles'}>
                <div className={'center'}>
                    <div onClick={() => {
                        setTab2Index('soon')
                    }}
                         className={tab2Index === 'soon' ? 'module-title' : 'tab-title'}>
                        {lang['Activity_Coming']}
                    </div>
                    <div onClick={() => {
                        setTab2Index('past')
                    }}
                         className={tab2Index === 'past' ? 'module-title' : 'tab-title'}>
                        {lang['Activity_Past']}
                    </div>
                </div>
            </div>

            <MaodaoSelectGroup onChange={e => {
                setCurrGroup(e)
            }}/>
            <div className={'tab-contains'} style={{display: currGroup?.id === eventGroup?.id ? 'block': 'none'} }>
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
            <div className={'tab-contains'} style={{display: currGroup?.id === eventGroup?.id ? 'none': 'block'} }>
                <div className={'maodao-goto-group-home'}>
                    <div>View more events</div>
                    <div className={'link'} onClick={e=> {gotoGroupEventHome()}}>
                        {currGroup?.nickname || currGroup?.username}
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M17.92 11.6199C17.8724 11.4972 17.801 11.385 17.71 11.2899L12.71 6.28994C12.6168 6.1967 12.5061 6.12274 12.3842 6.07228C12.2624 6.02182 12.1319 5.99585 12 5.99585C11.7337 5.99585 11.4783 6.10164 11.29 6.28994C11.1968 6.38318 11.1228 6.49387 11.0723 6.61569C11.0219 6.73751 10.9959 6.86808 10.9959 6.99994C10.9959 7.26624 11.1017 7.52164 11.29 7.70994L14.59 10.9999H7C6.73478 10.9999 6.48043 11.1053 6.29289 11.2928C6.10536 11.4804 6 11.7347 6 11.9999C6 12.2652 6.10536 12.5195 6.29289 12.707C6.48043 12.8946 6.73478 12.9999 7 12.9999H14.59L11.29 16.2899C11.1963 16.3829 11.1219 16.4935 11.0711 16.6154C11.0203 16.7372 10.9942 16.8679 10.9942 16.9999C10.9942 17.132 11.0203 17.2627 11.0711 17.3845C11.1219 17.5064 11.1963 17.617 11.29 17.7099C11.383 17.8037 11.4936 17.8781 11.6154 17.9288C11.7373 17.9796 11.868 18.0057 12 18.0057C12.132 18.0057 12.2627 17.9796 12.3846 17.9288C12.5064 17.8781 12.617 17.8037 12.71 17.7099L17.71 12.7099C17.801 12.6148 17.8724 12.5027 17.92 12.3799C18.02 12.1365 18.02 11.8634 17.92 11.6199Z" fill="#EEEEEE"/>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ListEventVertical
