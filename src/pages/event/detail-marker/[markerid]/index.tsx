import {useParams, useRouter} from 'next/navigation'
import {useContext, useEffect, useState} from 'react'
import {
    Badge,
    getProfile,
    Group,
    Marker,
    MarkerCheckinDetail,
    markerDetail,
    markersCheckinList,
    Profile,
    ProfileSimple,
    queryUserGroup
} from "@/service/solas";
import LangContext from "@/components/provider/LangProvider/LangContext";
import useTime from "@/hooks/formatTime";
import usePicture from "@/hooks/pictrue";
import ReasonText from "@/components/base/EventDes/ReasonText";
import AppButton from "@/components/base/AppButton/AppButton";
import userContext from "@/components/provider/UserProvider/UserContext";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import PageBack from "@/components/base/PageBack";
import useCopy from "@/hooks/copy";
import EventHomeContext from "@/components/provider/EventHomeProvider/EventHomeContext";
import useMarkerCheckIn from "@/hooks/markerCheckIn";
import Empty from "@/components/base/Empty";

function EventDetail() {
    const router = useRouter()
    const [marker, setMarker] = useState<Marker | null>(null)
    const [hoster, setHoster] = useState<Profile | null>(null)
    const params = useParams()
    const {lang} = useContext(LangContext)
    const formatTime = useTime()
    const {defaultAvatar} = usePicture()
    const {user} = useContext(userContext)
    const {showLoading, showToast, showEventCheckIn} = useContext(DialogsContext)
    const {copy} = useCopy()
    const {eventGroups, setEventGroup, eventGroup, ready, isManager} = useContext(EventHomeContext)
    const {scanQrcode} = useMarkerCheckIn()


    const [tab, setTab] = useState(1)
    const [isHoster, setIsHoster] = useState(false)
    const [isJoined, setIsJoined] = useState(false)
    const [canceled, setCanceled] = useState(false)
    const [outOfDate, setOutOfDate] = useState(false)
    const [inProgress, setInProgress] = useState(false)
    const [inCheckinTime, setIsCheckTime] = useState(false)
    const [notStart, setNotStart] = useState(false)
    const [checkins, setCheckins] = useState<MarkerCheckinDetail[]>([])
    const [guests, setGuests] = useState<ProfileSimple[]>([])
    const [badge, setBadge] = useState<Badge | null>(null)
    const [canAccess, setCanAccess] = useState(false)

    async function fetchData() {
        if (params?.markerid) {
            const marker = await markerDetail(Number(params?.markerid))
            if (!marker) {
                router.push('/error')
                return
            }

            setMarker(marker)
            setCanceled(marker.status === 'cancel')

            const records = await markersCheckinList({marker_id: Number(params?.markerid)})
            setCheckins(records)
            const checkin = records.find(item => item.profile.id === user.id)
            setIsJoined(!!checkin)

            const now = new Date().getTime()
            if (marker.start_time && marker.end_time) {
                const start = new Date(marker.start_time).getTime()
                const end = new Date(marker.end_time).getTime()
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
                const startDate = new Date(marker.start_time).setHours(0, 0, 0, 0)
                if (now >= new Date(startDate).getTime()) {
                    setIsCheckTime(true)
                }
            }

            if (marker.start_time && !marker.end_time) {
                const start = new Date(marker.start_time).getTime()
                if (now < start) {
                    setNotStart(true)
                }
                if (now > start) {
                    setInProgress(true)
                }
            }

            const profile = await getProfile({id: Number(marker.owner?.id || marker.owner_id)})
            setHoster(profile)
        } else {
            router.push('/error')
        }
    }

    async function checkHasCheckin() {
        if (!user.id) return false
        const target = checkins.find(item => item.profile.id === user.id)
        setIsJoined(!!target)
    }

    useEffect(() => {
        if (params?.markerid) {
            fetchData()
        }
    }, [params])

    useEffect(() => {
        if (marker && marker.group_id && ready) {
            const group: any = eventGroups.find(item => item.id === marker.group_id)
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

    }, [marker, ready, user.id])

    useEffect(() => {
        setIsHoster(hoster?.id === user.id)
        checkHasCheckin()
    }, [hoster, user.id, checkins.length])

    const gotoModify = () => {
        router.push(`/event/${eventGroup?.username}/edit-marker/${marker?.id}`)
    }

    const goToProfile = (username: string, isGroup?: boolean) => {
        router.push(`/${isGroup ? 'group' : 'profile'}/${username}`)
    }

    const handleHostCheckIn = async () => {
        router.push(`/event/checkin-marker/${marker!.id}`)
    }

    const handleUserCheckIn = async () => {
        scanQrcode(marker!.id, (ifSuccess: boolean) => {
            if (ifSuccess) {
                // refresh data
                fetchData()
            }
        })
    }

    const copyLink = () => {
        copy(`${location.href}`)
        showToast('Copied', 400)
    }

    return (<>
        {
            !!marker &&
            <div className={'event-detail'}>
                <PageBack
                    menu={() => <div className={'event-share-btn'} onClick={e => {
                        copyLink()
                    }}><img src="/images/icon_share.svg" alt=""/></div>}/>

                <div className={'cover'}>
                    {!!marker.cover_url &&
                        <img src={marker.cover_url} alt=""/>
                    }
                </div>

                <div className={'detail'}>
                    <div className={'center'}>
                        <div className={'name'}>{marker.title}</div>
                        {marker.start_time &&
                            <div className={'detail-item'}>
                                <i className={'icon-calendar'}/>
                                <div>{formatTime(marker.start_time)}</div>
                                {
                                    !!marker.end_time && <>
                                        <span>--</span>
                                        <div>{formatTime(marker.end_time)}</div>
                                    </>
                                }
                            </div>
                        }

                        {marker.location &&
                            <div className={'detail-item'}>
                                <i className={'icon-Outline'}/>
                                <div>{
                                    marker.location_detail ? marker.location + `(${JSON.parse(marker.location_detail).name})` : ''
                                }</div>
                            </div>
                        }
                    </div>

                    {!!hoster &&
                        <div className={'hoster'}>
                            <div className={'center'}>
                                <div className={'host-item'}
                                     onClick={e => {
                                         !!hoster.username && goToProfile(hoster.username, hoster.is_group || undefined)
                                     }}>
                                    <img src={hoster.image_url || defaultAvatar(hoster.id)} alt=""/>
                                    <div>
                                        <div className={'host-name'}>{hoster.nickname || hoster.username}</div>
                                        <div>{'Creator'}</div>
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
                                <div className={tab === 2 ? 'tab-title active' : 'tab-title'}
                                     onClick={e => {
                                         setTab(2)
                                     }}>{lang['Marker_Detail_Records']}({checkins.length})
                                </div>
                            </div>
                        </div>


                        <div className={'tab-contains'}>
                            {tab === 1 &&
                                <div className={'tab-contain'}>
                                    <div className={'center'}>
                                        <ReasonText className={'event-des'} text={marker.message}/>
                                    </div>
                                </div>}
                            {tab === 2 &&
                                <div className={'tab-contain'}>
                                    <div className={'center'}>
                                        <div className={'checkin-user-list'}>
                                            {
                                                checkins.map((item, index) => {
                                                    return <div key={index} className={'user-list-item'}
                                                        onClick={e => {goToProfile(item.profile.domain?.split('.')[0]!)}}>
                                                        <div className={'left'}>
                                                            <img src={item.profile.image_url || defaultAvatar(item.profile.id)} alt=""/>
                                                            {item.profile.domain?.split('.')[0]}
                                                        </div>
                                                        <div className={'right'}>
                                                            {formatTime(item.created_at)}
                                                        </div>
                                                    </div>
                                                })
                                            }
                                            {
                                                checkins.length === 0 &&
                                                <Empty />
                                            }
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>

                        {canAccess && <div className={'event-action'}>
                            <div className={'center'}>
                                {canceled &&
                                    <AppButton disabled>{lang['Activity_Detail_Btn_has_Cancel']}</AppButton>
                                }

                                {(isHoster || isManager) && !canceled &&
                                    <>
                                        <AppButton onClick={gotoModify}>{lang['Activity_Detail_Btn_Modify']}</AppButton>
                                        <AppButton onClick={gotoModify}>{'Cancel'}</AppButton>
                                    </>
                                }

                                {!isJoined && !canceled &&
                                    <AppButton special onClick={e => {
                                        if (isHoster) {
                                            handleHostCheckIn()
                                        } else {
                                            handleUserCheckIn()
                                        }
                                    }}>{lang['Activity_Detail_Btn_Checkin']}</AppButton>
                                }

                                {
                                    isJoined && <AppButton disabled>{'Checked'}</AppButton>
                                }
                            </div>
                        </div>
                        }

                        {!canAccess &&
                            <div className={'event-action'}>
                                <div className={'can-not-access'}>Only open to members of the group</div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        }
    </>)
}

export default EventDetail
