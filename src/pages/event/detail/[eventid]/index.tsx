import {useRouter, useParams} from 'next/navigation'
import {useContext, useEffect, useState} from 'react'
import {
    Badge,
    Event,
    getProfile,
    queryGroupDetail,
    Group,
    joinEvent,
    Participants,
    Profile,
    ProfileSimple,
    punchIn,
    queryBadgeDetail,
    queryEventDetail,
    queryUserGroup
} from "@/service/solas";
import LangContext from "@/components/provider/LangProvider/LangContext";
import useTime from "@/hooks/formatTime";
import EventLabels from "@/components/base/EventLabels/EventLabels";
import usePicture from "@/hooks/pictrue";
import ReasonText from "@/components/base/EventDes/ReasonText";
import AppButton from "@/components/base/AppButton/AppButton";
import userContext from "@/components/provider/UserProvider/UserContext";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import PageBack from "@/components/base/PageBack";
import ListCheckLog from "@/components/compose/ListCheckLog/ListCheckLog";
import useCalender from "@/hooks/addToCalender";
import ListCheckinUser from "@/components/compose/ListCheckinUser/ListCheckinUser";
import useShowImage from "@/hooks/showImage/showImage";
import useCopy from "@/hooks/copy";
import EventHomeContext from "@/components/provider/EventHomeProvider/EventHomeContext";
import useGetMeetingName from "@/hooks/getMeetingName";
import Head from "next/head";
import styles from "@/components/base/Cards/CardMarker/CardMarker.module.scss";

function EventDetail(props: {event: Event | null, appName: string, host: string}) {
    const router = useRouter()
    const [event, setEvent] = useState<Event | null>(props.event || null)
    const [hoster, setHoster] = useState<Profile | null>(null)
    const params = useParams()
    const {lang} = useContext(LangContext)
    const formatTime = useTime()
    const {defaultAvatar} = usePicture()
    const {user} = useContext(userContext)
    const {showLoading, showToast, showEventCheckIn} = useContext(DialogsContext)
    const {addToCalender} = useCalender()
    const {showImage} = useShowImage()
    const {copy} = useCopy()
    const {eventGroups, setEventGroup, eventGroup, ready, isManager} = useContext(EventHomeContext)
    const {getMeetingName, getUrl} = useGetMeetingName()


    const [tab, setTab] = useState(1)
    const [isHoster, setIsHoster] = useState(false)
    const [isJoined, setIsJoined] = useState(false)
    const [canceled, setCanceled] = useState(false)
    const [outOfDate, setOutOfDate] = useState(false)
    const [inProgress, setInProgress] = useState(false)
    const [inCheckinTime, setIsCheckTime] = useState(false)
    const [notStart, setNotStart] = useState(false)
    const [participants, setParticipants] = useState<Participants[]>([])
    const [badge, setBadge] = useState<Badge | null>(null)
    const [isChecklog, setIsChecklog] = useState(false)
    const [canAccess, setCanAccess] = useState(false)
    const [eventSite, setEventSite] = useState<any | null>(null)

    async function fetchData() {
        if (params?.eventid) {
            let res: Event | null = null
            try {
                res = await queryEventDetail({id: Number(params?.eventid)})
            } catch (e) {
                router.push('/error')
                return
            }

            if (!res) {
                router.push('/error')
                return
            }

            setEvent(res)
            setEventSite(res.event_site)
            setParticipants(res.participants || [])

            setCanceled(res.status === 'cancel')
            // setCanceled(false)

            const isCheckLogEvent = res.event_type === 'checklog'
            setIsChecklog(isCheckLogEvent)

            const now = new Date().getTime()
            if (res.start_time && res.end_time) {
                const start = new Date(res.start_time).getTime()
                const end = new Date(res.end_time).getTime()
                if (now < start) {
                    setNotStart(true)
                }

                if (now >= start && now <= end) {
                    setInProgress(true)
                }
                if (now > end) {
                    setOutOfDate(true)
                }

                // 活动当天及之后都可以报名和签到
                const startDate = new Date(res.start_time).setHours(0, 0, 0, 0)
                if (now >= new Date(startDate).getTime()) {
                    setIsCheckTime(true)
                }
            }

            if (res.start_time && !res.end_time) {
                const start = new Date(res.start_time).getTime()
                if (now < start) {
                    setNotStart(true)
                }
                if (now > start) {
                    setInProgress(true)
                }
            }

            let profile: Profile | Group | null = null
            if (res.host_info) {
                const isDomain = res.host_info && res.host_info.indexOf('.') > -1

                if(!isDomain) {
                    profile = await queryGroupDetail(Number(res.host_info))
                }

                if (profile) {
                    setHoster(profile)
                }
            } else {
                setHoster(res.owner as Profile)
            }

            if (res?.badge_id) {
                const badge = await queryBadgeDetail({id: res.badge_id})
                setBadge(badge)
            }
        } else {
            router.push('/error')
        }
    }

    async function checkJoined() {
        if (hoster && user.id) {
            const eventParticipants = event?.participants || []
            const joined = eventParticipants.find((item: Participants) => item.profile.id === user.id && item.status !== 'cancel')
            setIsJoined(!!joined)
        }
    }

    useEffect(() => {
        if (params?.eventid) {
            fetchData()
        }
    }, [params])

    useEffect(() => {
        if (event && event.group_id && ready) {
            const group: any = eventGroups.find(item => item.id === event.group_id)
            if (!group) {
                router.push('/error')
                return
            }

            setEventGroup(group as Group)

            const selectedGroup = group as Group
            if (selectedGroup.group_event_visibility === 'public') {
                setCanAccess(true)
                return
            } else if (user.id) {
                const myGroup = queryUserGroup({profile_id: user.id}).then(res => {
                    const joined = res.find(item => item.id === selectedGroup.id)
                    if (!joined && selectedGroup.group_event_visibility === 'private') {
                        router.push('/error')
                    } else {
                        setCanAccess(!!joined)
                    }
                })
            } else {
                setCanAccess(false)
            }
        }

    }, [event, ready, user.id])

    useEffect(() => {
        setIsHoster(hoster?.id === user.id ||
            (!!(hoster as Group)?.creator && (hoster as Group)?.creator.id === user.id))
        checkJoined()
    }, [hoster, user.id])

    const gotoModify = () => {
        router.push(`/event/${eventGroup?.username}/edit/${event?.id}`)
    }

    const goToProfile = (username: string, isGroup?: boolean) => {
        if (process.env.NEXT_PUBLIC_SPECIAL_VERSION=== 'maodao' && username === 'readyplayerclub') {
            router.push(`/rpc/`)
        } else {
            router.push(`/${isGroup ? 'group' : 'profile'}/${username}`)
        }
    }

    const handleJoin = async () => {
        const participantsAll = event?.participants || []
        const participants = participantsAll.filter(item => item.status !== 'cancel')

        if (event?.max_participant !== null && event?.max_participant !== undefined && event?.max_participant <= participants.length) {
            showToast('The event at full strength')
            return
        }

        const unload = showLoading()
        try {
            const join = await joinEvent({id: Number(params?.eventid), auth_token: user.authToken || ''})
            unload()
            showToast('Join success')
            setIsJoined(true)
            fetchData()
        } catch (e: any) {
            console.error(e)
            unload()
            showToast(e.message)
        }
    }

    const handleHostCheckIn = async () => {
        router.push(`/event/checkin/${event!.id}`)
    }

    const handleUserCheckIn = async () => {
        router.push(`/event/checkin/${event!.id}`)
    }

    const copyLink = () => {
        router.push(`/event/success/${event?.id}`)
    }

    const handlePunchIn = async () => {
        const a = await punchIn({
            auth_token: user.authToken || '',
            id: Number(params?.eventid)
        })
    }

    const genGoogleMapUrl = (location_detail: string) => {
        const json = JSON.parse(location_detail)
        return `https://www.google.com/maps/search/?api=1&query=${json.geometry.location.lat}%2C${json.geometry.location.lng}`
    }

    return (<>
        <Head>
            <meta property="og:title"  content={`${event?.title} | ${props.appName}`} />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={`${props.host}/event/detail/${event?.id}`} />
            <meta property="og:image"  content={event?.cover_url} />
            { event?.content &&
                <meta name="description" property="og:description" content={event?.content.slice(0, 300) + '...'} />
            }
            <title>{`${event?.title} | ${props.appName}`}</title>
        </Head>
        {
            !!event &&
            <div className={'event-detail'}>
                <PageBack
                    menu={() => <div className={'event-share-btn'} onClick={e => {
                        copyLink()
                    }}><img src="/images/icon_share.svg" alt=""/></div>}/>

                <div className={'cover'}>
                    <img src={event.cover_url} alt=""/>
                </div>

                <div className={'detail'}>
                    <div className={'center'}>
                        <div className={'name'}>{event.title}</div>
                        {event.start_time &&
                            <div className={'detail-item'}>
                                <i className={'icon-calendar'}/>
                                <div>{formatTime(event.start_time)}</div>
                                {
                                    !!event.end_time && <>
                                        <span>--</span>
                                        <div>{formatTime(event.end_time)}</div>
                                    </>
                                }
                            </div>
                        }

                        {!!eventSite &&
                            <div className={'detail-item'}>
                                <i className={'icon-Outline'}/>
                                {
                                    eventSite.formatted_address ?
                                        <a href={genGoogleMapUrl(eventSite.formatted_address)} target={'_blank'}>
                                            {eventSite.title + `(${JSON.parse(eventSite.formatted_address).name})`}
                                            <svg className={styles['link-icon']} xmlns="http://www.w3.org/2000/svg" width="8" height="8"
                                                 viewBox="0 0 8 8" fill="none">
                                                <path
                                                    d="M7.10418 0.861667C7.04498 0.71913 6.93171 0.60586 6.78918 0.546667C6.71905 0.516776 6.64374 0.500922 6.56751 0.5H0.734177C0.579467 0.5 0.431094 0.561458 0.321698 0.670854C0.212302 0.780251 0.150843 0.928624 0.150843 1.08333C0.150843 1.23804 0.212302 1.38642 0.321698 1.49581C0.431094 1.60521 0.579467 1.66667 0.734177 1.66667H5.16168L0.32001 6.5025C0.265335 6.55673 0.221939 6.62125 0.192323 6.69233C0.162708 6.76342 0.147461 6.83966 0.147461 6.91667C0.147461 6.99367 0.162708 7.06992 0.192323 7.141C0.221939 7.21209 0.265335 7.2766 0.32001 7.33083C0.374238 7.38551 0.438756 7.42891 0.50984 7.45852C0.580925 7.48814 0.65717 7.50338 0.734177 7.50338C0.811184 7.50338 0.887429 7.48814 0.958513 7.45852C1.0296 7.42891 1.09411 7.38551 1.14834 7.33083L5.98418 2.48917V6.91667C5.98418 7.07138 6.04563 7.21975 6.15503 7.32915C6.26443 7.43854 6.4128 7.5 6.56751 7.5C6.72222 7.5 6.87059 7.43854 6.97999 7.32915C7.08939 7.21975 7.15084 7.07138 7.15084 6.91667V1.08333C7.14992 1.0071 7.13407 0.931796 7.10418 0.861667Z"
                                                    fill="#272928"/>
                                            </svg>
                                        </a>
                                        : <div>{eventSite.title + (eventSite.location ? `(${eventSite.location})` : '')}</div>
                                }
                            </div>
                        }

                        {event.location && !eventSite &&
                            <div className={'detail-item'}>
                                <i className={'icon-Outline'}/>
                                {
                                    event.formatted_address ?
                                        <a href={genGoogleMapUrl(event.formatted_address)} target={'_blank'}>
                                            {event.location === JSON.parse(event.formatted_address).name ? event.location:  event.location + `(${JSON.parse(event.formatted_address).name})`}
                                            <svg className={styles['link-icon']} xmlns="http://www.w3.org/2000/svg" width="8" height="8"
                                                 viewBox="0 0 8 8" fill="none">
                                                <path
                                                    d="M7.10418 0.861667C7.04498 0.71913 6.93171 0.60586 6.78918 0.546667C6.71905 0.516776 6.64374 0.500922 6.56751 0.5H0.734177C0.579467 0.5 0.431094 0.561458 0.321698 0.670854C0.212302 0.780251 0.150843 0.928624 0.150843 1.08333C0.150843 1.23804 0.212302 1.38642 0.321698 1.49581C0.431094 1.60521 0.579467 1.66667 0.734177 1.66667H5.16168L0.32001 6.5025C0.265335 6.55673 0.221939 6.62125 0.192323 6.69233C0.162708 6.76342 0.147461 6.83966 0.147461 6.91667C0.147461 6.99367 0.162708 7.06992 0.192323 7.141C0.221939 7.21209 0.265335 7.2766 0.32001 7.33083C0.374238 7.38551 0.438756 7.42891 0.50984 7.45852C0.580925 7.48814 0.65717 7.50338 0.734177 7.50338C0.811184 7.50338 0.887429 7.48814 0.958513 7.45852C1.0296 7.42891 1.09411 7.38551 1.14834 7.33083L5.98418 2.48917V6.91667C5.98418 7.07138 6.04563 7.21975 6.15503 7.32915C6.26443 7.43854 6.4128 7.5 6.56751 7.5C6.72222 7.5 6.87059 7.43854 6.97999 7.32915C7.08939 7.21975 7.15084 7.07138 7.15084 6.91667V1.08333C7.14992 1.0071 7.13407 0.931796 7.10418 0.861667Z"
                                                    fill="#272928"/>
                                            </svg>
                                        </a>
                                        : <div>{event.location}</div>
                                }
                            </div>
                        }

                        {event.meeting_url &&
                            <div className={'detail-item'} onClick={e => {
                                if (isJoined) {
                                    copy(event!.meeting_url!)
                                    showToast('Online location has been copied!')
                                }
                            }}>
                                <i className={'icon-link'}/>
                                <div>{isJoined ? event.meeting_url : getMeetingName(event.meeting_url)}</div>
                            </div>
                        }

                        {event.tags && !!event.tags.length &&
                            <div className={'label'}>
                                <EventLabels data={event.tags} value={event.tags} disabled/>
                            </div>
                        }
                    </div>

                    {!!hoster &&
                        <div className={'hoster'}>
                            <div className={'center'}>
                                <div className={'host-item'}
                                     onClick={e => {
                                         !!hoster?.username && goToProfile(hoster.username, !!(hoster as Group).creator || undefined)
                                     }}>
                                    <img src={hoster.image_url || defaultAvatar(hoster.id)} alt=""/>
                                    <div>
                                        <div className={'host-name'}>{hoster.nickname || hoster.username}</div>
                                        <div>{lang['Activity_Form_Hoster']}</div>
                                    </div>
                                </div>
                            </div>
                            {
                                !!badge && <div className={'center'}>
                                    <div className={'event-badge'}>
                                        <div>{lang['Activity_Detail_Badge']}</div>
                                        <img src={badge.image_url} alt=""/>
                                    </div>
                                </div>
                            }

                        </div>
                    }

                    <div className={'event-tab'}>
                        <div className={'tab-titles'}>
                            <div className={'center'}>
                                <div className={tab === 1 ? 'tab-title active' : 'tab-title'}
                                     onClick={e => {
                                         setTab(1)
                                     }}>{lang['Activity_Des']}</div>
                                {event.event_type !== 'checklog' ?
                                    <div className={tab === 2 ? 'tab-title active' : 'tab-title'}
                                         onClick={e => {
                                             setTab(2)
                                         }}>{lang['Activity_Participants']}({participants.length})
                                    </div> :

                                    <div className={tab === 3 ? 'tab-title active' : 'tab-title'}
                                         onClick={e => {
                                             setTab(3)
                                         }}>{lang['Activity_Punch_Log']}
                                    </div>
                                }
                            </div>
                        </div>


                        <div className={'tab-contains'}>
                            {tab === 1 &&
                                <div className={'tab-contain'}>
                                    <div className={'center'}>
                                        {!!event.wechat_contact_group &&
                                            <>
                                                <div className={'wechat-title'}>{lang['Activity_Detail_Wechat']}</div>
                                                {
                                                    !!event.wechat_contact_person &&
                                                    <div className={'wechat-account'}>{lang['Activity_Detail_Account']}
                                                        <span onClick={e => {
                                                            copy(event?.wechat_contact_person!);
                                                            showToast('Copied!')
                                                        }}>
                                                        {event.wechat_contact_person}
                                                        </span>
                                                    </div>
                                                }
                                                <div className={'wechat-contact-group'} onClick={e => {
                                                    showImage(event?.wechat_contact_group!)
                                                }}>
                                                    <img src={event.wechat_contact_group} alt=""/>
                                                </div>
                                            </>
                                        }
                                        {!!event.telegram_contact_group &&
                                            <div className={'wechat-account'}>
                                                <div className={'wechat-title'}>Join the Telegram group</div>
                                                <a href={event.telegram_contact_group} target={'_blank'}>
                                                    {event.telegram_contact_group}
                                                </a>
                                            </div>
                                        }
                                        <ReasonText className={'event-des'} text={event.content}/>
                                    </div>
                                </div>}
                            {tab === 2 &&
                                <div className={'tab-contain'}>
                                    <div className={'center'}>
                                        {!!event.min_participant &&
                                            <div
                                                className={'min-participants-alert'}>{lang['Activity_Detail_min_participants_Alert']([event.min_participant])}</div>
                                        }
                                        {!!hoster &&
                                            <ListCheckinUser
                                                onChange={e=> {fetchData()}}
                                                editable={false}
                                                participants={participants}
                                                isHost={isHoster}
                                                eventId={Number(params?.eventid)}
                                            />
                                        }
                                    </div>
                                </div>
                            }
                            {tab === 3 &&
                                <div className={'tab-contain'}>
                                    <div className={'center'}>
                                        <ListCheckLog eventId={Number(params?.eventid)}/>
                                    </div>
                                </div>}
                        </div>

                        {canAccess && <div className={'event-action'}>
                            {isChecklog
                                ? <div className={'center'}>
                                    {isHoster && !canceled &&
                                        <AppButton onClick={gotoModify}>{lang['Activity_Detail_Btn_Modify']}</AppButton>
                                    }
                                    {isHoster && !canceled &&
                                        <AppButton
                                            special
                                            onClick={e => {
                                                handleHostCheckIn()
                                            }}>{
                                            lang['Activity_Punch_in_BTN']
                                        }</AppButton>
                                    }
                                    {inCheckinTime && !canceled && !isHoster &&
                                        <AppButton
                                            special
                                            onClick={e => {
                                                showEventCheckIn(Number(params?.eventid), true)
                                            }}>{
                                            lang['Activity_Punch_in_BTN']
                                        } </AppButton>
                                    }
                                    {canceled &&
                                        <AppButton disabled>{lang['Activity_Detail_Btn_has_Cancel']}</AppButton>
                                    }
                                </div>
                                :
                                <div className={'center'}>
                                    {canceled &&
                                        <AppButton disabled>{lang['Activity_Detail_Btn_has_Cancel']}</AppButton>
                                    }

                                    {!canceled && isJoined && !outOfDate && !isHoster &&
                                        <AppButton
                                            onClick={e => {
                                                addToCalender({
                                                    name: event!.title,
                                                    startTime: event!.start_time!,
                                                    endTime: event!.end_time!,
                                                    location: eventSite?.title || event!.location || '',
                                                    details: event!.content,
                                                    url: window.location.href
                                                })
                                            }}>
                                            <i className="icon-calendar" style={{marginRight: '8px'}}/>
                                            {lang['Activity_Detail_Btn_add_Calender']}</AppButton>
                                    }

                                    {(isHoster || isManager) && !canceled &&
                                        <AppButton onClick={gotoModify}>{lang['Activity_Detail_Btn_Modify']}</AppButton>
                                    }

                                    {!isJoined && !canceled && (inCheckinTime || notStart) && !isHoster &&
                                        <AppButton special onClick={e => {
                                            handleJoin()
                                        }}>{lang['Activity_Detail_Btn_Attend']}</AppButton>
                                    }

                                    {false &&
                                        <AppButton disabled>{lang['Activity_Detail_Btn_End']}</AppButton>
                                    }

                                    {(isHoster || isManager) && !canceled &&
                                        <AppButton
                                            special
                                            onClick={e => {
                                                handleHostCheckIn()
                                            }}>{
                                            event.badge_id
                                                ? lang['Activity_Host_Check_And_Send']
                                                : lang['Activity_Detail_Btn_Checkin']
                                        }</AppButton>
                                    }

                                    {!canceled && isJoined && !isHoster && !isManager && inCheckinTime &&
                                        <AppButton
                                            special
                                            onClick={e => {
                                                handleUserCheckIn()
                                            }}>{lang['Activity_Detail_Btn_Checkin']}</AppButton>
                                    }

                                    {!canceled && isJoined && inProgress && !!event.meeting_url &&
                                        <AppButton
                                            onClick={e => {
                                                copy(event!.meeting_url!);
                                                showToast('Online location has been copied!')
                                                // window.open(getUrl(event!.online_location!) || '#', '_blank')
                                            }}
                                            special>{lang['Activity_Detail_Btn_AttendOnline']}</AppButton>
                                    }
                                </div>
                            }
                        </div>
                        }

                        {!canAccess &&
                            <div className={'event-action'}>
                                <div className={'can-not-access'}> Event only open to members of the group</div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        }
    </>)
}

export default EventDetail

export const getServerSideProps: any = (async (context: any) => {
    const eventid = context.params?.eventid
    if (eventid) {
        const detail = await queryEventDetail({id: eventid})
        return { props: { event:  detail || null, host: process.env.NEXT_PUBLIC_HOST, appName:  process.env.NEXT_PUBLIC_APP_NAME},  }
    } else {
        return { props: { event: null, host: process.env.NEXT_PUBLIC_HOST, appName:  process.env.NEXT_PUBLIC_APP_NAME}}
    }
})
