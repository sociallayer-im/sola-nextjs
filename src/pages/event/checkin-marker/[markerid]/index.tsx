import {useParams, useRouter} from 'next/navigation'
import {useContext, useEffect, useRef, useState} from 'react'
import {
    getProfile,
    getVoucherCode,
    Marker,
    MarkerCheckinDetail,
    markerDetail,
    markersCheckinList,
    Profile
} from "@/service/solas";
import userContext from "@/components/provider/UserProvider/UserContext";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import PageBack from "@/components/base/PageBack";
import QRcode from "@/components/base/QRcode";
import langContext from "@/components/provider/LangProvider/LangContext";
import useEvent, {EVENT} from "@/hooks/globalEvent";
import usePicture from "@/hooks/pictrue";
import useformatTime from "@/hooks/formatTime";
import Empty from "@/components/base/Empty";


function MarkerCheckIn() {
    const router = useRouter()
    const params = useParams()
    const [marker, setMarker] = useState<Marker | null>(null)
    const [isHoster, setIsHoster] = useState(false)
    const [isJoin, setIsJoin] = useState(false)
    const [hoster, setHoster] = useState<Profile | null>(null)
    const [checkins, setCheckins] = useState<MarkerCheckinDetail[]>([])
    const [hasCheckin, setHasCheckin] = useState<string[]>([])
    const [isCheckLog, setIsCheckLog] = useState(false)
    const [code, setCode] = useState('')
    const [needUpdate, _] = useEvent(EVENT.eventCheckin)
    const {defaultAvatar} = usePicture()
    const formatTime = useformatTime()

    const {user} = useContext(userContext)
    const {showLoading, showEventCheckIn, showToast} = useContext(DialogsContext)
    const {lang} = useContext(langContext)
    const timeOut = useRef<any>(null)

    async function init(needLoading = true) {
        let unload: any = () => {
        }
        if (params?.markerid) {
            if (needLoading) {
                unload = showLoading()
            }
            try {
                const details = await markerDetail(Number(params?.markerid))
                setMarker(details)
                const profile = await getProfile({id: Number(details.owner_id || details.owner.id)})
                setHoster(profile)
                const records = await markersCheckinList({id: Number(params?.markerid)})
                setCheckins(records)
                const checkin = records.find(item => item.creator.id === user.id)
                setIsJoin(!!checkin)

                unload()
            } catch (e) {
                unload()
                console.error(e)
                router.push('/error')
            }
        } else {
            router.push('/error')
        }
    }

    useEffect(() => {
        if (params?.markerid) {
            init()
        }
    }, [params])


    useEffect(() => {
        if (needUpdate) {
            init()
        }
    }, [needUpdate])

    useEffect(() => {
        if (user.id && marker) {
            setIsHoster(user.id === marker.owner_id || user.id === marker.owner?.id)
            setIsJoin(false)
            if (marker.voucher_id) {
                getVoucherCode({id: marker.voucher_id, auth_token: user.authToken || ''}).then((code) => {
                    setCode(code)
                })
            } else setCode('0')
        }
    }, [user.id, hoster, marker])

    const goToProfile = (username: string, isGroup?: boolean) => {
        router.push(`/${isGroup ? 'group' : 'profile'}/${username}`)
    }

    return (<>
        {!!marker &&
            <div className={'event-checkin-page'}>
                <div className={'center'}>
                    <PageBack/>
                    <div className={'checkin-card'}>
                        <div className={'event-name'}>{marker.title}</div>

                        {!user.id &&
                            <div className={'checkin-checkin-btn'}>
                                <div className={'login-tips'}>{'Login to show Qrcode'}</div>
                            </div>
                        }

                        {isHoster && code &&
                            <div className={'checkin-qrcode'}>
                                <QRcode text={`info=${marker.id}-${code}`} size={[155, 155]}/>
                                <div className={'text'}>{lang['Activity_Scan_checkin']}</div>
                            </div>
                        }
                    </div>
                </div>
                <div className={'center'}>
                    <div className={'checkin-list'}>
                        <div className={'title'}>{
                            lang['Marker_Detail_Records']
                        } <span></span>
                        </div>
                        <div className={'checkin-user-list'}>
                            {
                                checkins.map((item, index) => {
                                    return <div key={index} className={'user-list-item'}
                                                onClick={e => {
                                                    goToProfile(item.creator.domain!.split('.')[0]!)
                                                }}>
                                        <div className={'left'}>
                                            <img src={item.creator.image_url || defaultAvatar(item.creator.id)} alt=""/>
                                            {item.creator.domain!.split('.')[0]}
                                        </div>
                                        <div className={'right'}>
                                            {formatTime(item.created_at)}
                                        </div>
                                    </div>
                                })
                            }
                            {
                                checkins.length === 0 &&
                                <Empty/>
                            }
                        </div>
                    </div>
                </div>
            </div>
        }
    </>)
}

export default MarkerCheckIn
