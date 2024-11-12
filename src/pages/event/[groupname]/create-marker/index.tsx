import {useContext, useEffect, useMemo, useRef, useState} from 'react'
import PageBack from "@/components/base/PageBack";
import LangContext from "@/components/provider/LangProvider/LangContext";
import SelectorMarkerType, {markerTypeList2} from "@/components/base/SelectorMarkerType/SelectorMarkerType";
import {useParams, useRouter, useSearchParams} from "next/navigation";
import AppInput from "@/components/base/AppInput";
import UploadImage from "@/components/compose/UploadImage/UploadImage";
import ReasonInput from "@/components/base/ReasonInput/ReasonInput";
import {
    Badge,
    createMarker,
    createPresend,
    getGroupMembership,
    getProfile,
    Group,
    Marker,
    markerDetail,
    Presend,
    Profile,
    queryBadge,
    queryBadgeDetail,
    queryGroupDetail,
    queryVoucherDetail,
    removeMarker,
    saveMarker
} from "@/service/solas";
import DialogIssuePrefill from "@/components/eventSpecial/DialogIssuePrefill/DialogIssuePrefill";
import {OpenDialogProps} from "@/components/provider/DialogProvider/DialogProvider";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import userContext from "@/components/provider/UserProvider/UserContext";
import AppButton, {BTN_KIND} from "@/components/base/AppButton/AppButton";
import LocationInput from "@/components/compose/LocationInput/LocationInputNewMarker";
import AppFlexTextArea from "@/components/base/AppFlexTextArea/AppFlexTextArea";
import {Delete} from "baseui/icon";

function ComponentName() {
    const {lang} = useContext(LangContext)
    const {showLoading, openDialog, showToast, openConfirmDialog} = useContext(DialogsContext)
    const searchParams = useSearchParams()
    const params = useParams()
    const {user} = useContext(userContext)
    const router = useRouter()

    const [eventGroup, setEventGroup] = useState<Group | null>(null)
    const [busy, setBusy] = useState(false)

    const [titleError, setTitleError] = useState('')
    const [creator, setCreator] = useState<Profile | null>(null)
    const [badgeId, setBadgeId] = useState<number | null>(null)
    const [locationError, setLocationError] = useState<string>('')
    const [badgeDetail, setBadgeDetail] = useState<Badge | null>(null)


    const badgeIdRef = useRef<number | null>(null)

    const [isManager, setIsManager] = useState(false)
    const [isOwner, setIsOwner] = useState(false)
    const [isIssuer, setIsIssuer] = useState(false)
    const [ready, setReady] = useState(false)
    const [marker, setMarker] = useState<Partial<Marker>>({
        pin_image_url: markerTypeList2[2].pin,
        cover_image_url: '',
        title: '',
        category: markerTypeList2[2].category,
        about: null,
        link: null,
        location: '',
        formatted_address: '',
        geo_lat: 0,
        geo_lng: 0,
        marker_type: 'site',
        voucher_id: null,
        location_data: null
    })


    useEffect(() => {
        (async () => {
            if (params?.groupname) {
                const group = await queryGroupDetail(undefined, params.groupname as string)
                setEventGroup(group)
            }
        })()
    }, [params])


    useEffect(() => {
        // owner 和 manager 可以使用 group badge
        // 1516 playgroup2
        // 1984 istanbul2023
        if (eventGroup && user?.id) {
            getGroupMembership({group_id: eventGroup.id})
                .then(res => {
                    const tagetUser = res.find(membership => membership.profile.id === user?.id)
                    if (!tagetUser) {
                        setIsManager(false)
                        setIsOwner(false)
                        setIsIssuer(false)
                    } else {
                        setIsManager(tagetUser.role === 'manager')
                        setIsOwner(tagetUser.role === 'owner')
                        setIsIssuer(tagetUser.role === 'issuer')
                    }
                })
        } else {
            setIsManager(false)
            setIsOwner(false)
            setIsIssuer(false)
        }


    }, [eventGroup, user?.id])

    const showBadges = async (withGroup?: Group[]) => {
        const props = !!(creator as Group)?.creator ? {
                group_id: creator!.id,
                page: 1
            } :
            {
                sender_id: creator!.id,
                page: 1
            }

        const unload = showLoading()
        const badges = (await queryBadge(props)).data
        let groupBadges: any[] = []
        if (withGroup) {
            const tasks = withGroup.map(group => queryBadge({group_id: group.id, page: 1}))
            const groupBadgesList = await Promise.all(tasks)
            groupBadges = groupBadgesList.map((badges, index) => {
                return {
                    groupName: (withGroup as any)[index].nickname || (withGroup as any)[index].username,
                    badges: badges.data
                }
            })
        }

        unload()
        openDialog({
            content: (close: any) => <DialogIssuePrefill
                groupBadges={groupBadges.length ? groupBadges : undefined}
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

        if (!marker.title) {
            setTitleError(lang['Form_Marker_Title_Error'])
            showToast(lang['Form_Marker_Title_Error'], 500)
            return
        }

        if (!marker.location) {
            setLocationError(lang['Form_Marker_Location_Error'])
            showToast(lang['Form_Marker_Location_Error'], 500)
            return
        }

        const unload = showLoading()
        setBusy(true)
        try {
            let voucher: null | Presend = null
            if (badgeId) {
                voucher = await createPresend({
                    message: badgeDetail?.content || '',
                    auth_token: user.authToken || '',
                    badge_class_id: badgeId || 990,
                    counter: null
                })
            }

            await createMarker({
                ...marker,
                voucher_id: voucher ? voucher.id : null,
                auth_token: user.authToken || '',
                group_id: eventGroup?.id,
                owner_id: creator?.id,
            })
            unload()
            showToast('Create Success', 500)
            router.push(`/event/${eventGroup?.username}/map?type=${marker.category}`)
        } catch (e: any) {
            setBusy(false)
            console.error(e)
            unload()
            showToast('fail to create', 1000)
        }
    }

    const handleSave = async () => {
        setTitleError('')
        setLocationError('')

        if (!marker.title) {
            setTitleError(lang['Form_Marker_Title_Error'])
            showToast(lang['Form_Marker_Title_Error'], 500)
            return
        }

        if (!marker.location) {
            setLocationError(lang['Form_Marker_Location_Error'])
            showToast(lang['Form_Marker_Location_Error'], 500)
            return
        }

        const unload = showLoading()
        setBusy(true)
        try {
            let newVoucherId: number = 0
            if (badgeId && badgeId !== badgeIdRef.current) {
                const voucher = await createPresend({
                    message: badgeDetail?.content || '',
                    auth_token: user.authToken || '',
                    badge_class_id: badgeId || 990,
                    counter: null
                })
                newVoucherId = voucher.id
            }


            await saveMarker({
                ...marker,
                auth_token: user.authToken || '',
                group_id: eventGroup?.id,
                owner_id: creator?.id,
                voucher_id: newVoucherId || marker.voucher_id || null
            })
            unload()
            showToast('Save Success', 500)
            router.push(`/event/detail-marker/${marker.id}`)
        } catch (e: any) {
            console.error(e)
            unload()
            showToast('fail to save', 1000)
            setBusy(false)
        }
    }

    const handleRemove = () => {
        const dialog = openConfirmDialog({
            confirmLabel: 'Remove',
            cancelLabel: 'Cancel',
            title: `Do you want to remove marker 「${marker.title}」`,
            onConfirm: async (close: any) => {
                const unload = showLoading()
                try {
                    await removeMarker({
                        auth_token: user.authToken || '',
                        id: marker!.id
                    })
                    unload()
                    showToast('Remove Success', 500)
                    close()
                    router.push(`/event/${eventGroup?.username}/map?type=${marker.category}`)
                } catch (e: any) {
                    console.error(e)
                    unload()
                    showToast('fail to remove', 500)
                }
            }
        })
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

    useEffect(() => {
        if (user?.id && !marker.id) {
            getProfile({id: user.id}).then(res => {
                setCreator(res!)
            })
        }
    }, [user.id])


    useEffect(() => {
        (async () => {
            if (params?.markerid) {
                const detail = await markerDetail(Number(params.markerid))
                setMarker(detail!)
                const creator = await getProfile({id: detail!.owner.id})
                setCreator(creator!)
                if (detail!.voucher_id) {
                    const voucher = await queryVoucherDetail(detail!.voucher_id!)
                    setBadgeId(voucher!.badge_class_id)
                    badgeIdRef.current = voucher!.badge_class_id
                }
                setReady(true)
            } else {
                setReady(true)
                if (searchParams?.get('type')) {
                    const key = searchParams?.get('type') as string
                    const target = markerTypeList2.find((item) => item.category === key)
                    if (target) {
                        setMarker({
                            ...marker,
                            pin_image_url: target.pin,
                            category: target.category
                        })
                    }
                }
            }
        })()
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
                    {!!eventGroup && ready &&
                        <div className='input-area'>
                            <div className='input-area-title'>{lang['Form_Marker_Location']}</div>
                            <LocationInput
                                initValue={{
                                    geo_lat: marker?.geo_lat || null,
                                    geo_lng: marker?.geo_lng || null,
                                    location: marker?.location || null,
                                    formatted_address: marker?.formatted_address || null,
                                }}
                                eventGroup={eventGroup}
                                onChange={values => {
                                    console.log('values', values)
                                    setMarker({
                                        ...marker,
                                        geo_lat: values.geo_lat,
                                        geo_lng: values.geo_lng,
                                        location: values.location,
                                        formatted_address: values.formatted_address,
                                        location_data: values.place_id
                                    } as Partial<Marker>)
                                }}/>
                        </div>
                    }

                    <div className='input-area'>
                        <div className='input-area-title'>{lang['Form_Marker_Title_Label']}</div>
                        <AppInput
                            clearable
                            maxLength={30}
                            value={marker.title || ''}
                            errorMsg={titleError}
                            placeholder={lang['Form_Marker_Title_Label']}
                            onChange={(e) => {
                                setMarker({
                                    ...marker,
                                    title: e.target.value
                                })
                            }}/>
                    </div>

                    {true &&
                        <SelectorMarkerType
                            exclude={['share']}
                            onChange={(markerType) => {
                                setMarker({
                                    ...marker,
                                    pin_image_url: markerType.pin,
                                    category: markerType.category
                                })
                            }}
                            value={marker.category!}/>
                    }

                    <div className='input-area'>
                        <div className='input-area-title'>{lang['Form_Marker_Image_Label']}</div>
                        <UploadImage
                            cropper={false}
                            imageSelect={marker.cover_image_url || ''}
                            confirm={(coverUrl) => {
                                setMarker({
                                    ...marker,
                                    cover_image_url: coverUrl
                                })
                            }}/>
                    </div>

                    <div className='input-area'>
                        <div className='input-area-title'>{lang['Form_Marker_Des_Label']}</div>
                        <ReasonInput unlimited value={marker.about || ""} onChange={(value) => {
                            setMarker({
                                ...marker,
                                about: value
                            })
                        }}/>
                    </div>

                    <div className='input-area'>
                        <div className='input-area-title'>{lang['Form_Marker_Link_Label']}</div>
                        <AppFlexTextArea
                            icon={<i className={'icon-link'}/>}
                            value={marker.link || ''}
                            maxHeight={80}
                            onChange={(value) => {
                                setMarker({
                                    ...marker,
                                    link: value
                                })
                            }}
                            placeholder={'Url...'}/>
                    </div>


                    {!!user?.id &&
                        <div className={'input-area'}>
                            <div className={'input-area-title'}>{lang['Form_Marker_Badge_Label']}</div>
                            <div className={'input-area-des'}>{lang['Form_Marker_Badge_Des']}</div>

                            {!!badgeDetail &&
                                <div className={'banded-badge'}>
                                    <Delete size={22} onClick={e => {
                                        setBadgeId(null)
                                        setBadgeDetail(null)
                                    }
                                    }/>
                                    <img src={badgeDetail.image_url} alt=""/>
                                    <div>{badgeDetail.title}</div>
                                </div>
                            }

                            <div className={'add-badge'} onClick={async () => {
                                await showBadges((eventGroup && (isOwner || isIssuer || isManager)) ? [eventGroup as any] : undefined)
                            }}>{lang['Activity_Form_Badge_Select']}</div>
                        </div>}

                    <div className='input-area'></div>

                    {!marker.id ?
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
