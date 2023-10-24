import {useRouter} from "next/navigation";
import {useContext, useEffect, useState} from 'react'
import {Event, joinEvent, Participants, queryEventDetail} from "@/service/solas";
import useTime from "../../../../hooks/formatTime";
import langContext from "../../../provider/LangProvider/LangContext";
import userContext from "../../../provider/UserProvider/UserContext";
import DialogsContext from "../../../provider/DialogProvider/DialogsContext";

export interface CardEventProps {
    event: Event,
    fixed?: boolean,
    participants?: Participants[]
    attend?: boolean
}

function CardEvent({fixed=true, ...props}: CardEventProps) {
    const router = useRouter()
    const [eventDetail, setEventDetail] = useState(props.event)
    const formatTime = useTime()
    const {lang} = useContext(langContext)
    const [isCreated, setIsCreated] = useState(false)
    const {user} = useContext(userContext)
    const {showToast, showLoading} = useContext(DialogsContext)
    const [hasRegistered, setHasRegistered] = useState(props.participants?.some(item => item.event.id === props.event.id))

    const now = new Date().getTime()
    const endTime = new Date(eventDetail.ending_time!).getTime()
    const isExpired = endTime < now

    useEffect(() => {
        if (user.id) {
            setIsCreated(props.event.owner_id === user.id)
        } else {
            setHasRegistered(false)
            setIsCreated(false)
        }
    }, [user.id])

    useEffect(() => {
        setEventDetail(props.event)
    }, [props.event])

    useEffect(() => {
        if (props.participants) {
            setHasRegistered(props.participants?.some(item => item.event.id === props.event.id))
        } else {
            setHasRegistered(false)
        }
    }, [props.participants])

    const handleJoin = async (e: any) => {
        e.stopPropagation()
        const eventDetail = await queryEventDetail({id: props.event.id})
        const participantsAll = eventDetail.participants || []
        const participants = participantsAll.filter(item => item.status !== 'cancel')

        if (props.event?.max_participant !== null && props.event?.max_participant <= participants.length) {
            showToast('The event at full strength')
            return
        }

        const unload = showLoading()
        try {
            const join = await joinEvent({id: Number(props.event.id), auth_token: user.authToken || ''})
            unload()
            showToast('Apply success')
            setHasRegistered(true)
        } catch (e: any) {
            console.error(e)
            unload()
            showToast(e.message)
        }
    }

    const gotoDetail = () => {
        router.push(`/event/detail/${props.event.id}`)
    }

    const hasMarker = isExpired || !!hasRegistered || isCreated

    const largeCard = fixed || (hasMarker && !fixed)

    return (<div className={largeCard ? 'event-card large': 'event-card'} onClick={e => {
        gotoDetail()
    }}>
        {largeCard &&
            <div className={'markers'}>
                {isExpired && <div className={'marker expired'}>{lang['Activity_Detail_Expired']}</div>}
                {(hasRegistered || props.attend) && <div className={'marker registered'}>{lang['Activity_State_Registered']}</div>}
                {isCreated && <div className={'marker created'}>{lang['Activity_Detail_Created']}</div>}
            </div>
        }

        <div className={(fixed || hasMarker && !fixed) ? 'info marker': 'info'}>
            <div className={'left'}>
                <div className={'details'}>
                    <div className={'title'}>{eventDetail.title}</div>

                    {!!eventDetail.start_time &&
                        <div className={'detail'}>
                            <i className={'icon-calendar'}/>
                            <span>{formatTime(eventDetail.start_time)}</span>
                        </div>
                    }

                    {!!eventDetail.location &&
                        <div className={'detail'}>
                            <i className={'icon-Outline'}/>
                            <span>{eventDetail.location}</span>
                        </div>
                    }

                    {!!eventDetail.event_site &&
                        <div className={'detail'}>
                            <i className={'icon-Outline'}/>
                            <span>{eventDetail.event_site.title}</span>
                        </div>
                    }

                    {!!eventDetail.online_location &&
                        <div className={'detail'}>
                            <i className={'icon-link'}/>
                            <span>{eventDetail.online_location}</span>
                        </div>
                    }
                </div>

                { !!user.id && !hasRegistered && !isExpired && !fixed &&
                    <div className={'card-apply-btn'} onClick={handleJoin}>{lang['Event_Card_Apply_Btn']}</div>
                }
            </div>
            <div className={(fixed || hasMarker && !fixed) ? 'post marker': 'post'}>
                <img src={props.event.cover} alt=""/>
            </div>
        </div>
    </div>)
}

export default CardEvent
