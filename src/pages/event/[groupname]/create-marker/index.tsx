import {useContext, useEffect, useRef, useState} from 'react'
import PageBack from "@/components/base/PageBack";
import LangContext from "@/components/provider/LangProvider/LangContext";
import SelectorMarkerType, {markerTypeList} from "@/components/base/SelectorMarkerType/SelectorMarkerType";
import {useParams, useSearchParams} from "next/navigation";
import AppInput from "@/components/base/AppInput";
import UploadImage from "@/components/compose/UploadImage/UploadImage";
import ReasonInput from "@/components/base/ReasonInput/ReasonInput";
import SelectCreator from "@/components/compose/SelectCreator/SelectCreator";
import {
    Badge,
    createMarker,
    createPresend,
    getProfile,
    Marker,
    markerDetail,
    Profile,
    queryBadge,
    queryBadgeDetail,
    queryPresendDetail,
    saveMarker
} from "@/service/solas";
import DialogIssuePrefill from "@/components/eventSpecial/DialogIssuePrefill/DialogIssuePrefill";
import {OpenDialogProps} from "@/components/provider/DialogProvider/DialogProvider";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import userContext from "@/components/provider/UserProvider/UserContext";
import AppButton, {BTN_KIND} from "@/components/base/AppButton/AppButton";
import LocationInput from "@/components/compose/LocationInput/LocationInput";
import EventHomeContext from "@/components/provider/EventHomeProvider/EventHomeContext";
import AppFlexTextArea from "@/components/base/AppFlexTextArea/AppFlexTextArea";
import {Delete} from "baseui/icon";

function ComponentName() {
    const {lang} = useContext(LangContext)
    const {showLoading, openDialog, showToast} = useContext(DialogsContext)
    const searchParams = useSearchParams()
    const params = useParams()
    const {user} = useContext(userContext)
    const {eventGroup} = useContext(EventHomeContext)

    const [creating, setCreating] = useState(false)

    const [title, setTitle] = useState('')
    const [titleError, setTitleError] = useState('')
    const [link, setLink] = useState('')
    const [cover, setCover] = useState('')
    const [icon, setIcon] = useState<string | null>((markerTypeList as any)[Object.keys(markerTypeList)[0]])
    const [category, setCategory] = useState<string>(Object.keys(markerTypeList)[0])
    const [content, setContent] = useState('')
    const [creator, setCreator] = useState<Profile | null>(null)
    const [badgeId, setBadgeId] = useState<number | null>(null)
    const [location, setLocation] = useState<string>('')
    const [locationError, setLocationError] = useState<string>('')
    const [badgeDetail, setBadgeDetail] = useState<Badge | null>(null)

    const [markerId, setMarkerId] = useState<number | null>(null)

    const badgeIdRef = useRef<number | null>(null)
    const markerInfoRef = useRef<Marker | null>(null)

    const showBadges = async () => {
        const props = creator?.is_group ? {
                group_id: creator!.id,
                page: 1
            } :
            {
                sender_id: creator!.id,
                page: 1
            }

        const unload = showLoading()
        const badges = await queryBadge(props)
        unload()

        openDialog({
            content: (close: any) => <DialogIssuePrefill
                badges={badges}
                profileId={user.id!}
                onSelect={(res) => {
                    if (res.badgeId) {
                        setBadgeId(res.badgeId)
                    }
                }}
                handleClose={close}/>,
            position: 'bottom',
            size: [360, 'auto']
        } as OpenDialogProps)
    }

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
        try {
            const voucher = await createPresend({
                message: badgeDetail?.content || '',
                auth_token: user.authToken || '',
                badge_id: badgeId || 990,
                counter: null
            })


            const create = await createMarker({
                auth_token: user.authToken || '',
                group_id: eventGroup?.id,
                owner_id: creator?.id,
                icon_url: icon!,
                cover_url: cover,
                title,
                category,
                message: content,
                link,
                location: JSON.parse(location).name,
                location_detail: location,
                lat: location ? JSON.parse(location).geometry.location.lat : null,
                lng: location ? JSON.parse(location).geometry.location.lng : null,
                marker_type: 'site',
                voucher_id: voucher.id
            })
            unload()
            showToast('Create Success', 500)
        } catch (e: any) {
            console.error(e)
            unload()
            showToast('Create fail', 500)
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
        try {
            let newVoucherId: number = 0
            if (badgeId !== badgeIdRef.current) {
                const voucher = await createPresend({
                    message: badgeDetail?.content || '',
                    auth_token: user.authToken || '',
                    badge_id: badgeId || 990,
                    counter: null
                })
                newVoucherId = voucher.id
            }

            const save = await saveMarker({
                auth_token: user.authToken || '',
                group_id: eventGroup?.id,
                owner_id: creator?.id,
                icon_url: icon!,
                cover_url: cover,
                title,
                category,
                message: content,
                link,
                location: JSON.parse(location).name,
                location_detail: location,
                lat: location ? JSON.parse(location).geometry.location.lat : null,
                lng: location ? JSON.parse(location).geometry.location.lng : null,
                marker_type: 'site',
                id: markerId!,
                voucher_id: newVoucherId || markerInfoRef.current?.voucher_id
            })
            unload()
            showToast('Save Success', 500)
        } catch (e: any) {
            console.error(e)
            unload()
            showToast('Save fail', 500)
        }
    }

    useEffect(() => {
        async function fetchBadgeDetail() {
            if (badgeId) {
                const badge = await queryBadgeDetail({id: badgeId})
                setBadgeDetail(badge)
            }
        }

        fetchBadgeDetail()
    }, [badgeId])

    const prefill = async (markerid: string, merkerDetail?: Marker) => {
        const detail = merkerDetail || await markerDetail(Number(markerid))
        setMarkerId(Number(markerid))
        setTitle(detail.title)
        setLink(detail.link || '')
        setCover(detail.cover_url || '')
        setIcon(detail.icon_url)
        setCategory(detail.category)
        setContent(detail.message || '')
        markerInfoRef.current = detail

        const creator = await getProfile({id: detail.owner_id})
        setCreator(creator!)

        if (detail.voucher_id) {
            const voucher = await queryPresendDetail({
                id: detail.voucher_id,
                auth_token: user.authToken || ''
            })
            setBadgeId(voucher.badge_id)
            badgeIdRef.current = voucher.badge_id
        } else {
            setBadgeId(990)
        }


        setLocation(detail.location_detail)
    }

    useEffect(() => {
        if (params?.markerid) {
            prefill(params?.markerid as string)
        } else {
            setBadgeId(990)
            if (searchParams?.get('type')) {
                const key = searchParams.get('type') as string
                if ((markerTypeList as any)[key]) {
                    setIcon((markerTypeList as any)[key])
                    setCategory(key)
                }
            } else {
                setIcon((markerTypeList as any)[Object.keys(markerTypeList)[0]])
                setCategory(Object.keys(markerTypeList)[0])
            }
        }
    }, [searchParams, params])

    useEffect(() => {
        async function fetchBadgeDetail() {
            if (badgeId) {
                const badge = await queryBadgeDetail({id: badgeId})
                setBadgeDetail(badge)
            }
        }

        fetchBadgeDetail()
    }, [badgeId])

    return (<div className='create-event-page'>
            <div className='create-badge-page-wrapper'>
                <PageBack title={lang['Form_Marker_Title']}/>

                <div className='create-badge-page-form'>
                    {!markerId &&
                        <SelectorMarkerType
                            onChange={(typeInfo) => {
                                setIcon(typeInfo[1])
                                setCategory(typeInfo[0])
                            }}
                            value={category}/>
                    }

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
                        <div className='input-area-title'>{lang['Form_Marker_Image_Label']}</div>
                        <UploadImage
                            cropper={false}
                            imageSelect={cover}
                            confirm={(coverUrl) => {
                                setCover(coverUrl)
                            }}/>
                    </div>

                    <div className='input-area'>
                        <div className='input-area-title'>{lang['Form_Marker_Des_Label']}</div>
                        <ReasonInput unlimited value={content} onChange={(value) => {
                            setContent(value)
                        }}/>
                    </div>

                    <div className='input-area'>
                        <div className='input-area-title'>{lang['Form_Marker_Link_Label']}</div>
                        <AppFlexTextArea
                            icon={<i className={'icon-link'}/>}
                            value={link}
                            maxHeight={80}
                            onChange={(value) => {
                                setLink(value)
                            }}
                            placeholder={'Url...'}/>
                    </div>

                    {!!eventGroup && (!markerId || (markerId && location)) &&
                        <div className='input-area'>
                            <div className='input-area-title'>{lang['Form_Marker_Location']}</div>
                            <LocationInput
                                cleanable={false}
                                errorMsg={locationError}
                                initValue={{
                                    customLocation: '',
                                    eventSite: null,
                                    metaData: location || ''
                                }}
                                arrowAlias={false}
                                eventGroup={eventGroup} onChange={e => {
                                console.log('======e.metaData', e.metaData)
                                console.log('======location', location)
                                if (e.metaData !== location) {
                                    setLocation(e.metaData!)
                                }
                            }}/>
                        </div>
                    }

                    <div className={'input-area'}>
                        <div className={'input-area-title'}>{lang['Form_Marker_Badge_Label']}</div>
                        <div className={'input-area-des'}>{lang['Form_Marker_Badge_Des']}</div>

                        {!!badgeDetail &&
                            <div className={'banded-badge'}>
                                <Delete size={22} onClick={e => {
                                    setBadgeId(badgeIdRef.current || 990)
                                }
                                }/>
                                <img src={badgeDetail.image_url} alt=""/>
                                <div>{badgeDetail.title}</div>
                            </div>
                        }

                        <div className={'add-badge'} onClick={async () => {
                            await showBadges()
                        }}>{lang['Activity_Form_Badge_Select']}</div>

                        <div className='input-area'></div>

                        {!markerId ?
                            <>
                                <AppButton kind={BTN_KIND.primary}
                                           disabled={creating}
                                           special
                                           onClick={() => {
                                               handleCreate()
                                           }}>
                                    {lang['Form_Marker_Create_Btn']}
                                </AppButton>
                            </>
                            : <>
                                <AppButton kind={BTN_KIND.primary}
                                           disabled={creating}
                                           special
                                           onClick={() => {
                                               handleSave()
                                           }}>
                                    {lang['Profile_Edit_Save']}
                                </AppButton>
                            </>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ComponentName
