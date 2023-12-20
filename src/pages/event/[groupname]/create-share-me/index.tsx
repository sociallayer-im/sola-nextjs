import {useContext, useEffect, useRef, useState} from 'react'
import PageBack from "@/components/base/PageBack";
import LangContext from "@/components/provider/LangProvider/LangContext";
import {markerTypeList} from "@/components/base/SelectorMarkerType/SelectorMarkerType";
import {useParams, useRouter, useSearchParams} from "next/navigation";
import AppInput from "@/components/base/AppInput";
import ReasonInput from "@/components/base/ReasonInput/ReasonInput";
import {
    Badge,
    createMarker,
    getProfile,
    Group,
    Marker,
    Profile,
    queryBadgeDetail,
    queryMarkers,
    removeMarker,
    saveMarker
} from "@/service/solas";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import userContext from "@/components/provider/UserProvider/UserContext";
import AppButton, {BTN_KIND} from "@/components/base/AppButton/AppButton";
import EventHomeContext from "@/components/provider/EventHomeProvider/EventHomeContext";
import Link from "next/link";

function ComponentName() {
    const {lang} = useContext(LangContext)
    const {showLoading, openDialog, showToast, openConfirmDialog} = useContext(DialogsContext)
    const searchParams = useSearchParams()
    const params = useParams()
    const {user} = useContext(userContext)
    const router = useRouter()
    const {eventGroup, isManager} = useContext(EventHomeContext)

    const [busy, setBusy] = useState(false)

    const [title, setTitle] = useState('')
    const [titleError, setTitleError] = useState('')
    const [link, setLink] = useState('')
    const [cover, setCover] = useState('')
    const [icon, setIcon] = useState<string | null>((markerTypeList as any)[Object.keys(markerTypeList)[1]])
    const [category, setCategory] = useState<string>(Object.keys(markerTypeList)[1])
    const [content, setContent] = useState('')
    const [creator, setCreator] = useState<Profile | null>(null)
    const [badgeId, setBadgeId] = useState<number | null>(null)
    const [location, setLocation] = useState<string>('')
    const [locationError, setLocationError] = useState<string>('')
    const [badgeDetail, setBadgeDetail] = useState<Badge | null>(null)

    const [markerId, setMarkerId] = useState<number | null>(null)

    const badgeIdRef = useRef<number | null>(null)
    const markerInfoRef = useRef<Marker | null>(null)

    const [canUserGroupBadge, setCanUserGroupBadge] = useState(false)

    useEffect(() => {
        // owner 和 manager 可以使用 group badge
        // 1516 playgroup2
        // 1984 istanbul2023
        setCanUserGroupBadge((isManager || (eventGroup as Group)?.creator.id == user?.id)
            && (eventGroup?.id === 1516 || eventGroup?.id === 1984))
    }, [isManager, eventGroup, user?.id])

    const handleCreate = async () => {
        setTitleError('')
        setLocationError('')

        if (!title) {
            setTitleError(lang['Form_Marker_Title_Error'])
            showToast(lang['Form_Marker_Title_Error'], 500)
            return
        }

        if (!location) {
            setLocationError(lang['Form_Marker_Location_Error'])
            showToast(lang['Form_Marker_Location_Error'], 500)
            return
        }

        const unload = showLoading()
        setBusy(true)
        try {
            const create = await createMarker({
                auth_token: user.authToken || '',
                group_id: eventGroup?.id,
                owner_id: creator?.id,
                pin_image_url: icon!,
                cover_image_url: cover,
                title,
                category: 'share',
                about: content,
                link,
                location: 'Custom location',
                formatted_address: '',
                geo_lat: location ? JSON.parse(location).geometry.location.lat : null,
                geo_lng: location ? JSON.parse(location).geometry.location.lng : null,
                marker_type: 'zugame',
            })
            unload()
            showToast('Create Success', 500)
            router.push(`/event/${eventGroup?.username}/map?type=share`)
        } catch (e: any) {
            setBusy(false)
            console.error(e)
            unload()
            showToast('Create fail', 1000)
        }
    }

    const handleSave = async () => {
        setTitleError('')
        setLocationError('')

        if (!title) {
            setTitleError(lang['Form_Marker_Title_Error'])
            showToast(lang['Form_Marker_Title_Error'], 500)
            return
        }

        if (!location) {
            setLocationError(lang['Form_Marker_Location_Error'])
            showToast(lang['Form_Marker_Location_Error'], 500)
            return
        }

        const unload = showLoading()
        setBusy(true)
        try {
            const save = await saveMarker({
                ...markerInfoRef.current,
                title,
                about: content,
                auth_token: user.authToken || '',
                geo_lat: location ? JSON.parse(location).geometry.location.lat : null,
                geo_lng: location ? JSON.parse(location).geometry.location.lng : null,
                marker_type: 'site',
                id: markerId!,
            })
            unload()
            showToast('Save Success', 500)
            router.push(`/event/${eventGroup?.username}/map?type=share`)
        } catch (e: any) {
            console.error(e)
            unload()
            showToast('Save fail', 1000)
            setBusy(false)
        }
    }

    const handleRemove = () => {
        const dialog = openConfirmDialog({
            confirmLabel: 'Remove',
            cancelLabel: 'Cancel',
            title: `Do you want to remove marker 「${markerInfoRef.current!.title}」`,
            onConfirm: async (close: any) => {
                const unload = showLoading()
                try {
                    await removeMarker({
                        auth_token: user.authToken || '',
                        id: markerId!
                    })
                    unload()
                    showToast('Remove Success', 500)
                    close()
                    router.push(`/event/${eventGroup?.username}/map?type=${markerInfoRef.current!.category}`)
                } catch (e: any) {
                    console.error(e)
                    unload()
                    showToast('Remove fail', 500)
                }
            }
        })
    }

    const getLocation = () => {
        if (typeof navigator !== 'undefined') {
            navigator.geolocation.getCurrentPosition((data) => {
                const location = {
                    geometry: {
                        location: {
                            lat: data.coords.latitude,
                            lng: data.coords.longitude
                        }
                    },
                    formatted_address: 'Custom location',
                    name: 'Custom location'
                }
                setLocation(JSON.stringify(location))
                showToast('Get location success', 1000)
            })
        }
    }

    useEffect(() => {
        if (!markerId) {
            getLocation()
        }

        if (params?.markerid) {
            setMarkerId(Number(params.markerid))
            queryMarkers({id: Number(params.markerid)}).then(res => {
                const marker = res[0]
                markerInfoRef.current = marker
                setTitle(marker.title)
                setContent(marker.about || '')
                setLocation(JSON.stringify({geometry: {location: {lat: marker.geo_lat, lng: marker.geo_lng}}}))
            })
        }
    }, [params?.markerid])

    useEffect(() => {
        async function fetchBadgeDetail() {
            if (badgeId) {
                const badge = await queryBadgeDetail({id: badgeId})
                setBadgeDetail(badge)
            }
        }

        fetchBadgeDetail()
    }, [badgeId])

    useEffect(() => {
        if (user?.id && !markerId) {
            const profile = getProfile({id: user.id}).then(res => {
                setCreator(res!)
            })
        }
    }, [user.id])

    return (<div className='create-event-page'>
            <div className='create-badge-page-wrapper'>
                <PageBack title={'Share me'}/>

                <div className='create-badge-page-form'>
                    <div className='input-area'>
                        <div className='input-area-title'>{lang['Form_Marker_Title_Label']}</div>
                        <AppInput
                            clearable
                            maxLength={30}
                            value={title}
                            errorMsg={titleError}
                            placeholder={lang['Form_Marker_Title_Label']}
                            onChange={(e) => {
                                setTitle(e.target.value)
                            }}/>
                    </div>

                    <div className='input-area'>
                        <div className='input-area-title'>{lang['Form_Marker_Des_Label']}</div>
                        <ReasonInput unlimited value={content} onChange={(value) => {
                            setContent(value)
                        }}/>
                    </div>

                    <div className='input-area'>
                        <div className='input-area-title'>
                            {'Custom location'}
                            <span className={'get-location-btn'} onClick={getLocation}>Get location</span>
                        </div>
                        <AppInput
                            readOnly
                            value={location ? `lat: ${JSON.parse(location).geometry.location.lat} lng: ${JSON.parse(location).geometry.location.lng}` : ''}/>
                    </div>

                    {location &&
                        <Link
                            href={`https://www.google.com/maps/search/?api=1&query=${JSON.parse(location).geometry.location.lat}%2C${JSON.parse(location).geometry.location.lng}`}
                            target={'_blank'}
                            className={`map-preview full`}>
                            <img
                                src={`https://maps.googleapis.com/maps/api/staticmap?center=${JSON.parse(location).geometry.location.lat},${JSON.parse(location).geometry.location.lng}&zoom=14&size=600x260&key=AIzaSyCNT9TndlC4dSd0oNR_L4vHYWafLDU1gbg`}
                                alt=""/>
                            <div>{title || 'here!'}</div>
                        </Link>
                    }

                    {!markerId ?
                        <>
                            <AppButton kind={BTN_KIND.primary}
                                       disabled={busy}
                                       special
                                       onClick={() => {
                                           handleCreate()
                                       }}>
                                {lang['Form_Marker_Create_Btn']}
                            </AppButton>
                        </>
                        : <>
                            <AppButton kind={BTN_KIND.primary}
                                       disabled={busy}
                                       special
                                       onClick={() => {
                                           handleSave()
                                       }}>
                                {lang['Profile_Edit_Save']}
                            </AppButton>
                            {
                                <div style={{marginTop: '12px'}}>
                                    <AppButton style={{color: 'red'}} onClick={e => {
                                        handleRemove()
                                    }}>{lang['Marker_Edit_Remove']}</AppButton>
                                </div>
                            }
                        </>
                    }
                </div>
            </div>
        </div>
    )
}

export default ComponentName
