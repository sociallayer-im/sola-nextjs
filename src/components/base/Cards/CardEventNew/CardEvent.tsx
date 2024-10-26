import {useRouter} from "next/navigation";
import {useContext, useEffect, useMemo, useState} from 'react'
import {
    Event,
    getGroupMembers,
    Group,
    joinEvent,
    Participants,
    queryTickets,
    queryEventDetail,
    queryGroupDetail,
    setEventStatus
} from "@/service/solas";
import {useTime2} from "@/hooks/formatTime";
import langContext from "../../../provider/LangProvider/LangContext";
import userContext from "../../../provider/UserProvider/UserContext";
import DialogsContext from "../../../provider/DialogProvider/DialogsContext";
import Link from "next/link";
import ImgLazy from "@/components/base/ImgLazy/ImgLazy";
import EventDefaultCover from "@/components/base/EventDefaultCover";
import {getLabelColor} from "@/hooks/labelColor";
import useCalender from "@/hooks/addToCalendar/addToCalendar";
import AppButton from "@/components/base/AppButton/AppButton";
import useEvent, {EVENT} from "@/hooks/globalEvent";
import usePicture from "@/hooks/pictrue";
import dynamic from 'next/dynamic'
import {isHideLocation} from "@/global_config";
import {cancelEventStar, handleEventStar, removeComment} from "@/service/solasv2";

const EventTickets = dynamic(() => import('@/components/compose/EventTickets/EventTickets'), {ssr: false})

export interface CardEventProps {
    event: Event,
    fixed?: boolean,
    participants?: Participants[]
    attend?: boolean,
    canPublish?: boolean,
    onRemove?: (event: Event) => void,
    blank?: boolean,
    timezone?: string,
    showPinnedBg?: boolean
}

const localeTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

function CardEventNew({fixed = true, ...props}: CardEventProps) {
    const router = useRouter()
    const [eventDetail, setEventDetail] = useState(props.event)
    const formatTime = useTime2()
    const {lang} = useContext(langContext)
    const [isCreated, setIsCreated] = useState(false)
    const {user} = useContext(userContext)
    const {showToast, showLoading, openConfirmDialog, openDialog, openConnectWalletDialog} = useContext(DialogsContext)
    const [hasRegistered, setHasRegistered] = useState(false)
    const {addToCalenderDialog} = useCalender()
    const [_, emit] = useEvent(EVENT.setEventStatus)
    const [groupHost, setGroupHost] = useState<Group>()
    const [cohost, setCohost] = useState<any | null>([])
    const [speaker, setSpeaker] = useState<any | null>([])
    const {defaultAvatar} = usePicture()
    const [stared, setStared] = useState((props.event as any).star)

    const now = new Date().getTime()
    const endTime = new Date(eventDetail.end_time!).getTime()
    const startTime = new Date(eventDetail.start_time!).getTime()
    const isExpired = endTime < now
    const onGoing = startTime <= now && endTime >= now

    useEffect(() => {
        if (user.id) {
            setIsCreated(props.event.owner_id === user.id)
            setHasRegistered(!!props.event.participants?.some(item => {
                return (item.profile_id === user.id && item.status === 'applied' && item.ticket_id === null) ||
                    (item.profile_id === user.id && item.status === 'applied' && !!item.ticket_id && item.payment_status === 'success')
            }))
        } else {
            setHasRegistered(false)
            setIsCreated(false)
        }
    }, [user.id])

    useEffect(() => {
        setEventDetail(props.event)
        setStared((props.event as any).star)
        if (props.event?.host_info) {
            const hostInfo:any = props.event.host_info
            hostInfo.group_host?.[0] && setGroupHost(hostInfo.group_host[0])
            hostInfo.speaker?.[0] && setSpeaker(hostInfo.speaker)
            hostInfo.co_host?.[0] && setCohost(hostInfo.co_host)
        }
    }, [props.event])

    const handleExternal = (e: any) => {
        e.preventDefault()
        if (props.event.external_url) {
            location.href = props.event.external_url
            return
        }
        setStared(true)
    }

    const hasMarker = isExpired
        || hasRegistered
        || isCreated
        || props.event.status === 'pending'
        || onGoing
        || !!props.event.external_url
        || props.event.display === 'private'

    const largeCard = fixed || (hasMarker && !fixed)

    const handleReject = (e: any) => {
        e.preventDefault()
        openConfirmDialog({
            title: lang['Are_You_Sure_To_Reject_This_Event'],
            content: `${props.event.title}`,
            confirmLabel: lang['Yes'],
            confirmTextColor: '#fff',
            confirmBtnColor: '#F64F4F',
            cancelLabel: lang['No'],
            onConfirm: async (close: any) => {
                const unload = showLoading()
                try {
                    await setEventStatus({
                        id: props.event.id,
                        status: 'rejected',
                        auth_token: user.authToken || ''
                    })
                    unload()
                    showToast('Reject success')
                    props.onRemove && props.onRemove(props.event)
                    close()
                } catch (e: any) {
                    unload()
                    close()
                    showToast(e.message)
                }
            }
        })
    }

    const handlePublish = (e: any) => {
        e.preventDefault()
        openConfirmDialog({
            title: lang['Are_You_Sure_To_Publish_This_Event'],
            content: `${props.event.title}`,
            confirmLabel: lang['Yes'],
            cancelLabel: lang['No'],
            onConfirm: async (close: any) => {
                const unload = showLoading()
                try {
                    await setEventStatus({
                        id: props.event.id,
                        status: 'open',
                        auth_token: user.authToken || ''
                    })
                    unload()
                    showToast('Publish success')
                    emit(props.event)
                    props.onRemove && props.onRemove(props.event)
                    close()
                } catch (e: any) {
                    unload()
                    close()
                    showToast(e.message)
                }
            }
        })
    }

    const hostInfo = useMemo(() => {
        let str = []
        if (groupHost) {
            str.push(`by ${(groupHost.nickname || groupHost.username)}`)
        } else if (props.event.owner) {
            str.push(`by ${props.event.owner.nickname || props.event.owner.username}`)
        }

        if (cohost.length) {
            cohost.forEach((c: any) => {
                str.push(`${c.nickname || c.username}`)
            })
        }

        if (speaker.length) {
            speaker.forEach((s: any) => {
                str.push(`${s.nickname || s.username}`)
            })
        }

        return str
    }, [groupHost, props.event, cohost, speaker])

    const displayTimezone = useMemo(() => {
        if (props.timezone && props.timezone === 'UTC') {
            return localeTimezone
        } else {
            return eventDetail.timezone || localeTimezone
        }
    }, [props.timezone, eventDetail.timezone])

    const handleStar = async (e: any) => {
        if (!user.authToken) {
            openConnectWalletDialog()
            return
        }

        e.preventDefault()
        e.stopPropagation()
        const unload = showLoading()
        await handleEventStar({event_id: props.event.id, auth_token: user.authToken || ''})
        setStared(true)
        unload()
    }

    const handleCancelStar = async (e: any) => {
        if (!user.authToken) {
            openConnectWalletDialog()
            return
        }

        e.preventDefault()
        e.stopPropagation()
        const unload = showLoading()
        await cancelEventStar({event_id: props.event.id, auth_token: user.authToken || ''})
        setStared(false)
        unload()
    }

    const bgStyle = props.event.pinned && props.showPinnedBg ? {background: '#FFF7E8'} : undefined

    return (<Link href={`/event/detail/${props.event.id}`}
                  style={bgStyle}
                  target={props.blank ? '_blank' : '_self'}
                  className={largeCard ? 'event-card-new large' : 'event-card-new'}>
        {largeCard &&
            <div className={'markers'}>
                {props.event.display === 'private' && <div className={'marker private'}>{'Private'}</div>}
                {props.event.status === 'pending' && <div className={'marker pending'}>{lang['Pending']}</div>}
                {onGoing && <div className={'marker registered'}>{lang['Ongoing']}</div>}
                {props.event.status === 'rejected' && <div className={'marker rejected'}>{lang['Rejected']}</div>}
                {(hasRegistered || props.attend) &&
                    <div className={'marker registered'}>{lang['Activity_State_Registered']}</div>}
                {isCreated && <div className={'marker created'}>{lang['Activity_Detail_Created']}</div>}
                {isExpired && <div className={'marker expired'}>{lang['Activity_Detail_Expired']}</div>}
                {!!props.event.external_url && <div className={'marker external'}>{'External'}</div>}
            </div>
        }

        <div className={largeCard ? 'info marker' : 'info'}>
            <div className={'left'}>
                <div className={'details'}>
                    {
                        props.event.pinned && props.showPinnedBg &&
                        <div className={'highlight'}>Highlight event</div>

                    }
                    <div className={'title'}>
                    {hasMarker &&
                            <div className={'markers'}>
                                {props.event.display === 'private' &&
                                    <div className={'marker private'}>{'Private'}</div>}
                                {props.event.status === 'pending' &&
                                    <div className={'marker pending'}>{lang['Pending']}</div>}
                                {onGoing && <div className={'marker registered'}>{lang['Ongoing']}</div>}
                                {props.event.status === 'rejected' &&
                                    <div className={'marker rejected'}>{lang['Rejected']}</div>}
                                {(hasRegistered || props.attend) &&
                                    <div className={'marker registered'}>{lang['Activity_State_Registered']}</div>}
                                {isCreated && <div className={'marker created'}>{lang['Activity_Detail_Created']}</div>}
                                {isExpired && <div className={'marker expired'}>{lang['Activity_Detail_Expired']}</div>}
                                {!!props.event.external_url && <div className={'marker external'}>{'External'}</div>}
                            </div>
                        }
                        {eventDetail.title}
                    </div>
                    <div className={'tags'}>
                        {
                            eventDetail.tags?.filter(t=> !t.startsWith(':')).map((tag, index) => {
                                return <div key={tag} className={'tag'}>
                                    <i className={'dot'} style={{background: getLabelColor(tag)}}/>
                                    {tag}
                                </div>
                            })
                        }
                        {
                            (eventDetail as any).track
                                ? <div className={'tag'} title={'Event Track'}>
                                    <i className={'dot'} style={{background: getLabelColor((eventDetail as any).track.title)}}/>
                                    {(eventDetail as any).track.tag || (eventDetail as any).track.title}
                                </div>
                                : ''
                        }
                    </div>

                    <div className={'host-info'}>
                        <div className={'wrap'}>
                            <div className={'con'}>
                                {!!hostInfo.length && hostInfo.map((name, index) => {
                                    return <span className={'tag'} key={index}>{index === 0 ? '' : ', '} {name}</span>
                                })
                                }
                            </div>
                        </div>
                    </div>

                    {!!eventDetail.start_time &&
                        <div className={'detail'}>
                            <i className={'icon-calendar'}/>
                            <span>{formatTime(eventDetail.start_time, displayTimezone)}</span>
                        </div>
                    }

                    {!!eventDetail.location && !eventDetail.venue && (!isHideLocation(eventDetail.group_id) || !!user.id) &&
                        <div className={'detail'}>
                            <i className={'icon-Outline'}/>
                            <span>{eventDetail.location}</span>
                        </div>
                    }

                    {!!eventDetail.venue && (!isHideLocation(eventDetail.group_id) || !!user.id) &&
                        <div className={'detail'}>
                            <i className={'icon-Outline'}/>
                            <span>{eventDetail.venue!.title}</span>
                        </div>
                    }

                    {!!eventDetail.meeting_url && (!isHideLocation(eventDetail.group_id) || !!user.id) &&
                        <div className={'detail'}>
                            <i className={'icon-link'}/>
                            <span>{eventDetail.meeting_url}</span>
                        </div>
                    }
                </div>

                {props.event.status === 'pending' && props.canPublish &&
                    <div className={'event-card-action'}>
                        <AppButton special onClick={handlePublish}>{lang['Publish']}</AppButton>
                        <AppButton onClick={handleReject}>{lang['Reject']}</AppButton>
                    </div>
                }
            </div>
            <div className={(fixed || hasMarker && !fixed) ? 'post marker' : 'post'}>
                {stared
                    ? <img onClick={handleCancelStar} className="star" src="/images/favorite_active.png" width={24} height={24} alt="Star" title="Star"/>
                    : <img onClick={handleStar} className="star" src="/images/favorite.png" width={24} height={24} title="Star" alt="Star"/>
                }
                {
                    props.event.cover_url ?
                        <ImgLazy src={props.event.cover_url} width={280} alt=""/>
                        : <EventDefaultCover event={props.event} width={140} height={140}
                                             showLocation={!isHideLocation(props.event.group_id)}/>
                }
            </div>
            <div className={(fixed || hasMarker && !fixed) ? 'post marker mobile' : 'post mobile'}>
                {stared
                    ? <img className="star" src="/images/favorite_active.png" width={24} height={24} alt="Star" title="Star"/>
                    : <img onClick={handleStar} className="star" src="/images/favorite.png" width={24} height={24} title="Star" alt="Star"/>
                }
                {
                    props.event.cover_url ?
                        <ImgLazy src={props.event.cover_url} width={280} alt=""/>
                        : <EventDefaultCover event={props.event} width={100} height={100}
                                             showLocation={!isHideLocation(props.event.group_id)}/>
                }
            </div>
        </div>
    </Link>)
}

export default CardEventNew
