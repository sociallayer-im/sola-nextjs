import {useRouter} from "next/navigation";
import {useContext, useEffect, useState} from 'react'
import {Event, getGroupMembers, Group, joinEvent, Participants, queryEventDetail} from "@/service/solas";
import {useTime2} from "@/hooks/formatTime";
import langContext from "../../../provider/LangProvider/LangContext";
import userContext from "../../../provider/UserProvider/UserContext";
import DialogsContext from "../../../provider/DialogProvider/DialogsContext";
import Link from "next/link";
import ImgLazy from "@/components/base/ImgLazy/ImgLazy";
import EventDefaultCover from "@/components/base/EventDefaultCover";
import EventHomeContext from "@/components/provider/EventHomeProvider/EventHomeContext";

export interface CardEventProps {
    event: Event,
    fixed?: boolean,
    participants?: Participants[]
    attend?: boolean
}

function CardEvent({fixed = true, ...props}: CardEventProps) {
    const router = useRouter()
    const [eventDetail, setEventDetail] = useState(props.event)
    const formatTime = useTime2()
    const {lang} = useContext(langContext)
    const [isCreated, setIsCreated] = useState(false)
    const {user} = useContext(userContext)
    const {showToast, showLoading} = useContext(DialogsContext)
    const [hasRegistered, setHasRegistered] = useState(false)
    const {eventGroups} = useContext(EventHomeContext)

    const now = new Date().getTime()
    const endTime = new Date(eventDetail.end_time!).getTime()
    const isExpired = endTime < now

    useEffect(() => {
        if (user.id) {
            setIsCreated(props.event.owner_id === user.id)
            setHasRegistered(!!props.event.participants?.some(item => {
                return item.profile_id === user.id
            }))
        } else {
            setHasRegistered(false)
            setIsCreated(false)
        }
    }, [user.id])

    useEffect(() => {
        setEventDetail(props.event)
    }, [props.event])

    const handleJoin = async (e: any) => {
        e.stopPropagation()
        e.preventDefault()

        const eventDetail = await queryEventDetail({id: props.event.id})
        const participantsAll = eventDetail?.participants || []
        const participants = participantsAll.filter(item => item.status !== 'cancel')

        if (props.event?.max_participant !== null && props.event?.max_participant <= participants.length) {
            showToast('The event at full strength')
            return
        }

        const group = eventGroups.find(item => item.id === props.event.group_id)
        if (!group) {
            showToast('This Group has not yet enabled the event capability.')
            return
        }

        if (hasRegistered) {
            showToast('You have already registered for this event.')
            return
        }

        const unload = showLoading()

        const membership = await getGroupMembers({group_id: props.event.group_id!, role: 'all'})
        const isMember = membership.some(item => item.id === user.id)
        if ((!isMember && (group as Group).can_join_event === 'member') && (group as Group).can_join_event !== 'everyone') {
            unload()
            showToast('Only group members can join this event.')
            return
        }

        try {
            const join = await joinEvent({id: Number(props.event.id), auth_token: user.authToken || ''})
            unload()
            showToast('Join success')
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

    return (<Link href={`/event/detail/${props.event.id}`} className={largeCard ? 'event-card large' : 'event-card'}>
        {largeCard &&
            <div className={'markers'}>
                {isExpired && <div className={'marker expired'}>{lang['Activity_Detail_Expired']}</div>}
                {(hasRegistered || props.attend) &&
                    <div className={'marker registered'}>{lang['Activity_State_Registered']}</div>}
                {isCreated && <div className={'marker created'}>{lang['Activity_Detail_Created']}</div>}
            </div>
        }

        <div className={(fixed || hasMarker && !fixed) ? 'info marker' : 'info'}>
            <div className={'left'}>
                <div className={'details'}>
                    <div className={'title'}>{eventDetail.title}</div>

                    {!!eventDetail.start_time &&
                        <div className={'detail'}>
                            <i className={'icon-calendar'}/>
                            <span>{formatTime(eventDetail.start_time, eventDetail.timezone as any)}</span>
                        </div>
                    }

                    {!!eventDetail.location && !eventDetail.event_site &&
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

                    {!!eventDetail.meeting_url &&
                        <div className={'detail'}>
                            <i className={'icon-link'}/>
                            <span>{eventDetail.meeting_url}</span>
                        </div>
                    }
                </div>


                {!!user.id && !hasRegistered && !isExpired && !fixed &&
                    <div className={'card-apply-btn'} onClick={e => {
                        handleJoin(e)
                    }}>{lang['Event_Card_Apply_Btn']}</div>
                }
            </div>
            <div className={(fixed || hasMarker && !fixed) ? 'post marker' : 'post'}>
                {
                    props.event.cover_url ?
                        <ImgLazy src={props.event.cover_url} width={300} alt=""/>
                        : <EventDefaultCover event={props.event} width={170} height={170}/>
                }
            </div>
        </div>
    </Link>)
}

export default CardEvent
