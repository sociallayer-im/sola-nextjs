import {useParams} from "next/navigation"
import {useContext, useEffect, useState} from 'react'
import PageBack from "@/components/base/PageBack";
import EventHomeContext from "@/components/provider/EventHomeProvider/EventHomeContext";
import {createEventSite, EventSites, getEventSide, updateEventSite, updateGroup} from "@/service/solas";
import LangContext from "@/components/provider/LangProvider/LangContext";
import EventSiteInput from "@/components/compose/SiteEventInput/EventSiteInput";
import AppButton from "@/components/base/AppButton/AppButton";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import UserContext from "@/components/provider/UserProvider/UserContext";
import DashboardInfo from "@/components/base/DashboardInfo/DashboardInfo";
import UploadImage from "@/components/compose/UploadImage/UploadImage";
import AppInput from "@/components/base/AppInput";
import LocationInput from "@/components/compose/LocationInput/LocationInput";

function Dashboard() {
    const {eventGroup, availableList, findGroup, setEventGroup, reload} = useContext(EventHomeContext)
    const params = useParams()
    const {lang} = useContext(LangContext)
    const {showToast, showLoading} = useContext(DialogsContext)
    const {user} = useContext(UserContext)

    const [eventSite, setEventSite] = useState<EventSites[]>([])
    const [showEventSiteList, setShowEventSiteList] = useState(false)
    const [errorInputItem, setErrorInputSiteItem] = useState<number[]>([])

    const [banner, setBanner] = useState('')
    const [bannerUrl, setBannerUrl] = useState('')
    const [showSetBanner, setShowSetBanner] = useState(false)

    const [permission, setPermission] = useState<null | 'public' | 'protected' | 'private'>(null)
    const [showPermission, setShowPermission] = useState(false)

    const [defaultLocation, setDefaultLocation] = useState<string | null>(null)
    const [showDefaultLocation, setShowDefaultLocation] = useState(false)

    const [ready, setReady] = useState(false)


    useEffect(() => {
        if (showEventSiteList || showSetBanner || showPermission || typeof window !== 'undefined') {
            (document.querySelector('#PageContent') as any).style.overflow = 'hidden'
        } else {
            (document.querySelector('#PageContent') as any).style.overflow = 'auto'
        }
    }, [showEventSiteList, showSetBanner, showPermission])

    useEffect(() => {
        if (availableList.length && params?.groupname) {
            const group = findGroup(params?.groupname as string)
            setEventGroup(group)
        }
    }, [availableList, params])

    useEffect(() => {
        if (eventGroup) {
            getEventSideBar(eventGroup.id)
            setBanner(eventGroup.banner_image_url || '')
            setBannerUrl(eventGroup.banner_link_url || '')
            setPermission(eventGroup.group_event_visibility || null)
            setDefaultLocation(eventGroup.group_location_details || null)
            setReady(true)
        }
    }, [eventGroup])

    const getEventSideBar = async (id: number) => {
        const eventSite = await getEventSide(id)
        setEventSite(eventSite)
    }

    const saveEventSite = async function () {
        console.log('saveEventSite', eventSite)
        const check = eventSite
            .filter(e => e.title && !e.location_details)
            .map(e => eventSite.indexOf(e))
        setErrorInputSiteItem(check)

        if (!check.length) {
            const unload = showLoading()
            try {
                const task = eventSite.filter(e => {
                    return e.title && e.location_details
                })
                    .map(e => {
                        if (e.id) {
                            return updateEventSite({...e,
                                auth_token: user.authToken || '',
                                event_site_id: e.id, })
                        } else {
                            return createEventSite({...e, auth_token: user.authToken || '', owner_id: user.id || 0})
                        }
                    })
                await Promise.all(task)
                await reload()
                unload()
                showToast('Save event site success')
            } catch (e) {
                unload()
                console.error(e)
                showToast('Save event site failed')
            }
        }
    }

    const addEmptyEventSite = async function () {
        const _eventSite = [...eventSite]
        _eventSite.push({
            title: '',
            location_details: '',
            location: '',
            id: 0,
            group_id: eventGroup?.id || 0,
            owner_id: 0,
            created_at: '',
            about: '',
        })
        setEventSite(_eventSite)
    }

    const setBannerImage = async function () {
        console.log('eventGroupeventGroupeventGroup', eventGroup)
        const unload = showLoading()
        const update = await updateGroup({
            ...eventGroup,
            auth_token: user.authToken || '',
            id: eventGroup?.id || 1516,
            banner_image_url: banner,
            banner_link_url: bannerUrl,
        })
        await reload()
        unload()
        showToast('Update banner success')
    }

    const setLocation = async function () {
        const unload = showLoading()
        const update = await updateGroup({
            ...eventGroup,
            auth_token: user.authToken || '',
            id: eventGroup?.id || 1516,
            group_location_details: defaultLocation,
        })
        await reload()
        unload()
        showToast('Update success')
    }

    return (<>
        <div className={'dashboard-page'}>
            <div className={'center'}>
                <PageBack title={lang['Setting_Title']}/>
                <div className={'setting-form'}>
                    <div className={'setting-form-item'} onClick={e => {
                        setShowEventSiteList(true)
                    }}>
                        <div className={'label'}>{lang['Setting_Event_site']}</div>
                        <div className={'value'}>
                            <span>{eventSite.length}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                 fill="none">
                                <path
                                    d="M17.92 11.62C17.8724 11.4973 17.801 11.3851 17.71 11.29L12.71 6.29C12.6168 6.19676 12.5061 6.1228 12.3842 6.07234C12.2624 6.02188 12.1319 5.99591 12 5.99591C11.7337 5.99591 11.4783 6.1017 11.29 6.29C11.1968 6.38324 11.1228 6.49393 11.0723 6.61575C11.0219 6.73758 10.9959 6.86814 10.9959 7C10.9959 7.2663 11.1017 7.5217 11.29 7.71L14.59 11H7C6.73478 11 6.48043 11.1054 6.29289 11.2929C6.10536 11.4804 6 11.7348 6 12C6 12.2652 6.10536 12.5196 6.29289 12.7071C6.48043 12.8946 6.73478 13 7 13H14.59L11.29 16.29C11.1963 16.383 11.1219 16.4936 11.0711 16.6154C11.0203 16.7373 10.9942 16.868 10.9942 17C10.9942 17.132 11.0203 17.2627 11.0711 17.3846C11.1219 17.5064 11.1963 17.617 11.29 17.71C11.383 17.8037 11.4936 17.8781 11.6154 17.9289C11.7373 17.9797 11.868 18.0058 12 18.0058C12.132 18.0058 12.2627 17.9797 12.3846 17.9289C12.5064 17.8781 12.617 17.8037 12.71 17.71L17.71 12.71C17.801 12.6149 17.8724 12.5028 17.92 12.38C18.02 12.1365 18.02 11.8635 17.92 11.62Z"
                                    fill="#272928"/>
                            </svg>
                        </div>
                    </div>

                    <div className={'setting-form-item'} onClick={e => {
                        setShowSetBanner(true)
                    }}>
                        <div className={'label'}>{lang['Setting_Banner']}</div>
                        <div className={'value'}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                 fill="none">
                                <path
                                    d="M17.92 11.62C17.8724 11.4973 17.801 11.3851 17.71 11.29L12.71 6.29C12.6168 6.19676 12.5061 6.1228 12.3842 6.07234C12.2624 6.02188 12.1319 5.99591 12 5.99591C11.7337 5.99591 11.4783 6.1017 11.29 6.29C11.1968 6.38324 11.1228 6.49393 11.0723 6.61575C11.0219 6.73758 10.9959 6.86814 10.9959 7C10.9959 7.2663 11.1017 7.5217 11.29 7.71L14.59 11H7C6.73478 11 6.48043 11.1054 6.29289 11.2929C6.10536 11.4804 6 11.7348 6 12C6 12.2652 6.10536 12.5196 6.29289 12.7071C6.48043 12.8946 6.73478 13 7 13H14.59L11.29 16.29C11.1963 16.383 11.1219 16.4936 11.0711 16.6154C11.0203 16.7373 10.9942 16.868 10.9942 17C10.9942 17.132 11.0203 17.2627 11.0711 17.3846C11.1219 17.5064 11.1963 17.617 11.29 17.71C11.383 17.8037 11.4936 17.8781 11.6154 17.9289C11.7373 17.9797 11.868 18.0058 12 18.0058C12.132 18.0058 12.2627 17.9797 12.3846 17.9289C12.5064 17.8781 12.617 17.8037 12.71 17.71L17.71 12.71C17.801 12.6149 17.8724 12.5028 17.92 12.38C18.02 12.1365 18.02 11.8635 17.92 11.62Z"
                                    fill="#272928"/>
                            </svg>
                        </div>
                    </div>

                    <div className={'setting-form-item'} onClick={e => {
                        setShowDefaultLocation(true)
                    }}>
                        <div className={'label'}>{lang['Setting_Location']}</div>
                        <div className={'value'}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                 fill="none">
                                <path
                                    d="M17.92 11.62C17.8724 11.4973 17.801 11.3851 17.71 11.29L12.71 6.29C12.6168 6.19676 12.5061 6.1228 12.3842 6.07234C12.2624 6.02188 12.1319 5.99591 12 5.99591C11.7337 5.99591 11.4783 6.1017 11.29 6.29C11.1968 6.38324 11.1228 6.49393 11.0723 6.61575C11.0219 6.73758 10.9959 6.86814 10.9959 7C10.9959 7.2663 11.1017 7.5217 11.29 7.71L14.59 11H7C6.73478 11 6.48043 11.1054 6.29289 11.2929C6.10536 11.4804 6 11.7348 6 12C6 12.2652 6.10536 12.5196 6.29289 12.7071C6.48043 12.8946 6.73478 13 7 13H14.59L11.29 16.29C11.1963 16.383 11.1219 16.4936 11.0711 16.6154C11.0203 16.7373 10.9942 16.868 10.9942 17C10.9942 17.132 11.0203 17.2627 11.0711 17.3846C11.1219 17.5064 11.1963 17.617 11.29 17.71C11.383 17.8037 11.4936 17.8781 11.6154 17.9289C11.7373 17.9797 11.868 18.0058 12 18.0058C12.132 18.0058 12.2627 17.9797 12.3846 17.9289C12.5064 17.8781 12.617 17.8037 12.71 17.71L17.71 12.71C17.801 12.6149 17.8724 12.5028 17.92 12.38C18.02 12.1365 18.02 11.8635 17.92 11.62Z"
                                    fill="#272928"/>
                            </svg>
                        </div>
                    </div>


                    { false &&
                        <div className={'setting-form-item'} onClick={e => {
                            setShowPermission(true)
                        }}>
                            <div className={'label'}>{lang['Setting_Permission']}</div>
                            <div className={'value'}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                     fill="none">
                                    <path
                                        d="M17.92 11.62C17.8724 11.4973 17.801 11.3851 17.71 11.29L12.71 6.29C12.6168 6.19676 12.5061 6.1228 12.3842 6.07234C12.2624 6.02188 12.1319 5.99591 12 5.99591C11.7337 5.99591 11.4783 6.1017 11.29 6.29C11.1968 6.38324 11.1228 6.49393 11.0723 6.61575C11.0219 6.73758 10.9959 6.86814 10.9959 7C10.9959 7.2663 11.1017 7.5217 11.29 7.71L14.59 11H7C6.73478 11 6.48043 11.1054 6.29289 11.2929C6.10536 11.4804 6 11.7348 6 12C6 12.2652 6.10536 12.5196 6.29289 12.7071C6.48043 12.8946 6.73478 13 7 13H14.59L11.29 16.29C11.1963 16.383 11.1219 16.4936 11.0711 16.6154C11.0203 16.7373 10.9942 16.868 10.9942 17C10.9942 17.132 11.0203 17.2627 11.0711 17.3846C11.1219 17.5064 11.1963 17.617 11.29 17.71C11.383 17.8037 11.4936 17.8781 11.6154 17.9289C11.7373 17.9797 11.868 18.0058 12 18.0058C12.132 18.0058 12.2627 17.9797 12.3846 17.9289C12.5064 17.8781 12.617 17.8037 12.71 17.71L17.71 12.71C17.801 12.6149 17.8724 12.5028 17.92 12.38C18.02 12.1365 18.02 11.8635 17.92 11.62Z"
                                        fill="#272928"/>
                                </svg>
                            </div>
                        </div>
                    }
                </div>

                {!!eventGroup &&
                    <DashboardInfo groupid={eventGroup.id}/>
                }
            </div>

            {showEventSiteList &&
                <div className={'dashboard-dialog dashboard-event-site-list'}>
                    <div className={'center'}>
                        <div className={'dashboard-dialog-head'}>
                            <PageBack title={lang['Event_Site_Title']} onClose={() => {
                                setShowEventSiteList(false)
                            }}/>
                        </div>
                        <div className={'dialog-inner'}>
                            <div className={'dialog-des'}>
                                Event sites are the default locations that creators can choose for their events.
                            </div>

                            {
                                eventSite.map((item, index) => {
                                    return <EventSiteInput
                                        key={index}
                                        index={index + 1}
                                        initValue={item}
                                        error={errorInputItem.includes(index)}
                                        onChange={newEventSite => {
                                            const newEventSiteList = [...eventSite]
                                            newEventSiteList[index] = newEventSite
                                            setEventSite(newEventSiteList)
                                        }}/>
                                })
                            }

                            <div className={'add-event-site-btn'} onClick={addEmptyEventSite}>
                                <svg width="28" height="28" viewBox="0 0 28 28" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="14" cy="14" r="14" fill="#F5F8F6"/>
                                    <path
                                        d="M18.6667 13.3333H14.6667V9.33334C14.6667 9.15653 14.5965 8.98696 14.4715 8.86193C14.3465 8.73691 14.1769 8.66667 14.0001 8.66667C13.8233 8.66667 13.6537 8.73691 13.5287 8.86193C13.4037 8.98696 13.3334 9.15653 13.3334 9.33334V13.3333H9.33341C9.1566 13.3333 8.98703 13.4036 8.86201 13.5286C8.73699 13.6536 8.66675 13.8232 8.66675 14C8.66675 14.1768 8.73699 14.3464 8.86201 14.4714C8.98703 14.5964 9.1566 14.6667 9.33341 14.6667H13.3334V18.6667C13.3334 18.8435 13.4037 19.0131 13.5287 19.1381C13.6537 19.2631 13.8233 19.3333 14.0001 19.3333C14.1769 19.3333 14.3465 19.2631 14.4715 19.1381C14.5965 19.0131 14.6667 18.8435 14.6667 18.6667V14.6667H18.6667C18.8436 14.6667 19.0131 14.5964 19.1382 14.4714C19.2632 14.3464 19.3334 14.1768 19.3334 14C19.3334 13.8232 19.2632 13.6536 19.1382 13.5286C19.0131 13.4036 18.8436 13.3333 18.6667 13.3333Z"
                                        fill="#272928"/>
                                </svg>
                                Add an event site
                            </div>

                        </div>
                        <div className={'action-bar'}>
                            <AppButton special onClick={saveEventSite}>Save</AppButton>
                        </div>
                    </div>
                </div>
            }

            {showSetBanner &&
                <div className={'dashboard-dialog dashboard-event-site-list'}>
                    <div className={'center'}>
                        <div className={'dashboard-dialog-head'}>
                            <PageBack title={lang['Setting_Banner']} onClose={() => {
                                setShowSetBanner(false)
                            }}/>
                        </div>
                        <div className={'dialog-inner'}>
                            <div className='create-badge-page-form'>
                                <div className='input-area'>
                                    <div className='input-area-title'>{lang['Setting_Banner']}</div>
                                    <UploadImage
                                        confirm={url => {setBanner(url)}}
                                        imageSelect={banner}
                                        cropper={false}
                                    />
                                </div>

                                <div className='input-area'>
                                    <div className='input-area-title'>{lang['Setting_Banner_Link']}</div>
                                    <AppInput value={bannerUrl} onChange={(e) => {setBannerUrl(e.target.value)}} />
                                </div>
                            </div>
                        </div>
                        <div className={'action-bar'}>
                            <AppButton special onClick={setBannerImage}>Save</AppButton>
                        </div>
                    </div>
                </div>
            }

            {showPermission &&
                <div className={'dashboard-dialog dashboard-event-site-list'}>
                    <div className={'center'}>
                        <div className={'dashboard-dialog-head'}>
                            <PageBack title={lang['Setting_Permission']} onClose={() => {
                                setShowPermission(false)
                            }}/>
                        </div>
                        <div className={'dialog-inner'}>

                        </div>
                        <div className={'action-bar'}>
                            <AppButton special onClick={setBannerImage}>Save</AppButton>
                        </div>
                    </div>
                </div>
            }

            {showDefaultLocation &&
                <div className={'dashboard-dialog dashboard-event-site-list'}>
                    <div className={'center'}>
                        <div className={'dashboard-dialog-head'}>
                            <PageBack title={lang['Setting_Location']} onClose={() => {
                                setShowDefaultLocation(false)
                            }}/>
                        </div>
                        <div className={'dialog-inner'}>
                            <div className={'dialog-des'}>Default location on the Map</div>
                            {!!eventGroup && ready &&
                                <LocationInput
                                    initValue={{
                                        customLocation:'',
                                        eventSite: null,
                                        metaData: defaultLocation || null
                                    }}
                                    onChange={newLocation => {
                                        if (newLocation.metaData) {
                                            setDefaultLocation(newLocation.metaData)
                                        }
                                    }}
                                    arrowAlias={false}
                                    eventGroup={eventGroup} />
                            }
                        </div>
                        <div className={'action-bar'}>
                            <AppButton special onClick={setLocation}>Save</AppButton>
                        </div>
                    </div>
                </div>
            }
        </div>
    </>)
}

export default Dashboard
