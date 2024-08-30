import {useParams} from "next/navigation"
import {useContext, useEffect, useState, useRef} from 'react'
import PageBack from "@/components/base/PageBack";
import {
    Group,
    createEventSite,
    EventSites,
    getEventSide,
    updateEventSite,
    updateGroup,
    removeEventSite,
    queryGroupDetail, getGroupMembers, getGroupMembership
} from "@/service/solas";
import LangContext from "@/components/provider/LangProvider/LangContext";
import AppButton from "@/components/base/AppButton/AppButton";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import UserContext from "@/components/provider/UserProvider/UserContext";
import DashboardInfo from "@/components/base/DashboardInfo/DashboardInfo";
import UploadImage from "@/components/compose/UploadImage/UploadImage";
import AppInput from "@/components/base/AppInput";
import EventTagInput from "@/components/compose/EventTagInput/EventTagInput";
import AppRadio from "@/components/base/AppRadio/AppRadio";
import Timezone from "@/utils/timezone";
import {Select} from "baseui/select";
import DialogEventSiteInput from "@/components/base/Dialog/DialogEventSiteInput/DialogEventSiteInput";

function Dashboard() {
    const params = useParams()
    const {lang} = useContext(LangContext)
    const {showToast, showLoading, openConfirmDialog} = useContext(DialogsContext)
    const {user} = useContext(UserContext)

    const oldEventSite = useRef<EventSites[]>([])
    const [eventSite, setEventSite] = useState<EventSites[]>([])
    const [showEventSiteList, setShowEventSiteList] = useState(false)
    const [errorInputItem, setErrorInputSiteItem] = useState<number[]>([])
    const [titleError, setTitleError] = useState<number[]>([])

    const [banner, setBanner] = useState('')
    const [bannerUrl, setBannerUrl] = useState('')
    const [showSetBanner, setShowSetBanner] = useState(false)
    const [eventGroup, setEventGroup] = useState<Group | null>(null)
    const [isManager, setIsManager] = useState<boolean>(false)

    const [permissionCanJoin, setPermissionCanJoin] = useState<'everyone' | 'member'>('everyone')
    const [permissionCanCreate, setPermissionCanCreate] = useState<'everyone' | 'member' | 'manager'>('everyone')
    const [showPermission, setShowPermission] = useState(false)


    const [tags, setTags] = useState<string[]>([])
    const [showEditTag, setShowEditTag] = useState(false)

    const [timezone, setTimezone] = useState<string | null>(null)
    const [showTimezone, setShowTimezone] = useState(false)

    const [editingVenueIndex, setEditingVenueIndex] = useState<number>(0)
    const [showEditingVenue, setShowEditingVenue] = useState(false)

    const [hasTimeSlotError, setHasTimeSlotError] = useState(false)

    const [ready, setReady] = useState(false)

    const switchOverflow = (hidden: boolean) => {
        if (hidden) {
            (document.querySelector('#PageContent') as any).style.overflow = 'hidden'
        } else {
            (document.querySelector('#PageContent') as any).style.overflow = 'auto'
        }
    }

    const saveTimezone = async () => {
        const unload = showLoading()
        const update = await updateGroup({
            ...eventGroup,
            auth_token: user.authToken || '',
            id: eventGroup?.id || 1516,
            timezone,
        } as any)
        const newGroup = await queryGroupDetail(eventGroup!.id)
        setEventGroup(newGroup)
        unload()
        showToast('Update timezone success')
    }

    useEffect(() => {
        if (params?.groupname) {
         queryGroupDetail(undefined, params.groupname as string).then(res => {
                setEventGroup(res!)
                setTags((res as Group).event_tags || [])
             getGroupMembers({group_id: res!.id, role: 'all'}).then(m => {

             })
         })
        }
    }, [params])

    useEffect(() => {
        if (!!eventGroup && user.id) {
            getGroupMembership({group_id: eventGroup!.id, role: 'all'}).then(m => {
                const target = m.find(i => {
                    return i.profile.id === user.id && (i.role === 'owner' || i.role === 'manager')
                })
                setIsManager(!!target)
            })
        }
    }, [eventGroup, user])

    useEffect(() => {
        document.querySelector('body')!.classList.add('dash-board-popover')

        return () => {
            switchOverflow(false)
            document.querySelector('body')!.classList.remove('dash-board-popover')
        }
    }, [])

    useEffect(() => {
        if (eventGroup) {
            getEventSideBar(eventGroup.id)
            setBanner(eventGroup.banner_image_url || '')
            setBannerUrl(eventGroup.banner_link_url || '')
            setPermissionCanJoin((eventGroup as Group)!.can_join_event as any || 'everyone')
            setPermissionCanCreate((eventGroup as Group)!.can_publish_event as any || 'everyone')
            setTimezone(eventGroup.timezone || null)
            setReady(true)
        }
    }, [eventGroup])

    const getEventSideBar = async (id: number) => {
        const eventSite = await getEventSide(id)
        setEventSite(eventSite.sort((e1, e2) => {
            return e1.id - e2.id
        }))
        oldEventSite.current = JSON.parse(JSON.stringify(eventSite))
    }

    const saveEventSite = async function () {
        if (hasTimeSlotError) return

        const checkLocation = eventSite.filter(e => !e.formatted_address)
        const _checkLocation =  checkLocation.map(e => eventSite.indexOf(e))

        setErrorInputSiteItem(_checkLocation)

        const checkTitle = eventSite.filter(e => !e.title)
        const _checkTitle =  checkTitle.map(e => eventSite.indexOf(e))

        setTitleError(_checkTitle)

        if (!_checkLocation.length && !_checkTitle.length) {
            const unload = showLoading()
            try {
                const target = eventSite[editingVenueIndex]
                if (target.id) {
                    await updateEventSite({...target,
                        auth_token: user.authToken || '',
                        venue_id: target.id,
                    })
                } else {
                    await createEventSite({...target,
                        auth_token: user.authToken || '',
                        owner_id: user.id || 0,
                        group_id: eventGroup?.id || 0,
                    })
                }

                const newGroup = await queryGroupDetail(eventGroup!.id)
                setEventGroup(newGroup)
                unload()
                showToast('Save venues success')
                setShowEditingVenue(false)
            } catch (e) {
                unload()
                console.error(e)
                showToast('Save venues failed')
            }
        }
    }

    const addEmptyEventSite = async function () {
        const _eventSite = [...eventSite]
        _eventSite.push({
            title: '',
            formatted_address: '',
            location: '',
            id: 0,
            group_id: eventGroup?.id || 0,
            owner_id: 0,
            created_at: '',
            about: '',
            geo_lat: '',
            geo_lng: '',
            start_date: null,
            end_date: null,
            timeslots: null ,
            link: null,
            capacity: null,
            overrides: null,
            visibility: null,
            venue_timeslots: [],
            venue_overrides: []
        })
        setEventSite(_eventSite)
        setEditingVenueIndex(_eventSite.length - 1)
        setShowEditingVenue(true)
    }

    const setBannerImage = async function () {
        const unload = showLoading()
        const update = await updateGroup({
            ...eventGroup,
            auth_token: user.authToken || '',
            id: eventGroup?.id || 1516,
            banner_image_url: banner,
            banner_link_url: bannerUrl,
        } as any)
        const newGroup = await queryGroupDetail(eventGroup!.id)
        setEventGroup(newGroup)
        unload()
        showToast('Update banner success')
    }

    const setPermission = async function () {
        const unload = showLoading()
        const update = await updateGroup({
            ...eventGroup,
            auth_token: user.authToken || '',
            id: eventGroup?.id || 1516,
            can_publish_event: permissionCanCreate ,
            can_join_event: permissionCanJoin,
        } as any)
        const newGroup = await queryGroupDetail(eventGroup!.id)
        setEventGroup(newGroup)
        unload()
        showToast('Update permission success')
    }

    const setTag = async function () {
        const unload = showLoading()
        const update = await updateGroup({
            ...eventGroup,
            auth_token: user.authToken || '',
            id: eventGroup?.id || 1516,
            event_tags: tags.filter(e => !!e),
        } as any)
        const newGroup = await queryGroupDetail(eventGroup!.id)
        setEventGroup(newGroup)
        unload()
        showToast('Update success')
    }

    const handleRemoveEventSite = async (id: number) => {
        const target = eventSite.find(e => e.id === id)

        openConfirmDialog({
            confirmLabel: 'Remove',
            confirmBtnColor: '#F64F4F',
            confirmTextColor: '#fff',
            title: `Remove venue`,
            content: `Are you sure you want to remove this venue? [${target?.title}]`,
            onConfirm: async (close: any) => {
                const unload = showLoading()
                try {
                    await removeEventSite({
                        auth_token: user.authToken || '',
                        id: id,
                    })
                    const newGroup = await queryGroupDetail(eventGroup!.id)
                    setEventGroup(newGroup)
                    unload()
                    showToast('Remove venue success')
                } catch (e) {
                    unload()
                    console.error(e)
                    showToast('Remove venue failed')
                }
                close()
            }
        })
    }

    return (<>
        <div className={'dashboard-page'}>
            <div className={'center'}>
                <PageBack title={lang['Setting_Title']}/>
                <div className={'setting-form'}>
                    <div className={'setting-form-item'} onClick={e => {
                        setShowEventSiteList(true)
                        switchOverflow(true)
                    }}>
                        <div className={'label'}>{lang['Setting_Event_site']}</div>
                        <div className={'value'}>
                            <span>{oldEventSite.current.length}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                 fill="none">
                                <path
                                    d="M17.92 11.62C17.8724 11.4973 17.801 11.3851 17.71 11.29L12.71 6.29C12.6168 6.19676 12.5061 6.1228 12.3842 6.07234C12.2624 6.02188 12.1319 5.99591 12 5.99591C11.7337 5.99591 11.4783 6.1017 11.29 6.29C11.1968 6.38324 11.1228 6.49393 11.0723 6.61575C11.0219 6.73758 10.9959 6.86814 10.9959 7C10.9959 7.2663 11.1017 7.5217 11.29 7.71L14.59 11H7C6.73478 11 6.48043 11.1054 6.29289 11.2929C6.10536 11.4804 6 11.7348 6 12C6 12.2652 6.10536 12.5196 6.29289 12.7071C6.48043 12.8946 6.73478 13 7 13H14.59L11.29 16.29C11.1963 16.383 11.1219 16.4936 11.0711 16.6154C11.0203 16.7373 10.9942 16.868 10.9942 17C10.9942 17.132 11.0203 17.2627 11.0711 17.3846C11.1219 17.5064 11.1963 17.617 11.29 17.71C11.383 17.8037 11.4936 17.8781 11.6154 17.9289C11.7373 17.9797 11.868 18.0058 12 18.0058C12.132 18.0058 12.2627 17.9797 12.3846 17.9289C12.5064 17.8781 12.617 17.8037 12.71 17.71L17.71 12.71C17.801 12.6149 17.8724 12.5028 17.92 12.38C18.02 12.1365 18.02 11.8635 17.92 11.62Z"
                                    fill="#272928"/>
                            </svg>
                        </div>
                    </div>

                    <div className={'setting-form-item'} onClick={e => {
                        setShowEditTag(true)
                        switchOverflow(true)
                    }}>
                        <div className={'label'}>{lang['Event_Tag']}</div>
                        <div className={'value'}>
                            {(eventGroup as Group)?.event_tags?.length || 0}
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                 fill="none">
                                <path
                                    d="M17.92 11.62C17.8724 11.4973 17.801 11.3851 17.71 11.29L12.71 6.29C12.6168 6.19676 12.5061 6.1228 12.3842 6.07234C12.2624 6.02188 12.1319 5.99591 12 5.99591C11.7337 5.99591 11.4783 6.1017 11.29 6.29C11.1968 6.38324 11.1228 6.49393 11.0723 6.61575C11.0219 6.73758 10.9959 6.86814 10.9959 7C10.9959 7.2663 11.1017 7.5217 11.29 7.71L14.59 11H7C6.73478 11 6.48043 11.1054 6.29289 11.2929C6.10536 11.4804 6 11.7348 6 12C6 12.2652 6.10536 12.5196 6.29289 12.7071C6.48043 12.8946 6.73478 13 7 13H14.59L11.29 16.29C11.1963 16.383 11.1219 16.4936 11.0711 16.6154C11.0203 16.7373 10.9942 16.868 10.9942 17C10.9942 17.132 11.0203 17.2627 11.0711 17.3846C11.1219 17.5064 11.1963 17.617 11.29 17.71C11.383 17.8037 11.4936 17.8781 11.6154 17.9289C11.7373 17.9797 11.868 18.0058 12 18.0058C12.132 18.0058 12.2627 17.9797 12.3846 17.9289C12.5064 17.8781 12.617 17.8037 12.71 17.71L17.71 12.71C17.801 12.6149 17.8724 12.5028 17.92 12.38C18.02 12.1365 18.02 11.8635 17.92 11.62Z"
                                    fill="#272928"/>
                            </svg>
                        </div>
                    </div>

                    <div className={'setting-form-item'} onClick={e => {
                        setShowTimezone(true)
                        switchOverflow(true)
                    }}>
                        <div className={'label'}>{lang['Timezone']}</div>
                        <div className={'value'}>
                            <div>{timezone}</div>
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
                        switchOverflow(true)
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


                    { isManager &&
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

            { showTimezone &&
                <div className={'dashboard-dialog dashboard-event-site-list'}>
                    <div className={'center'}>
                        <div className={'dashboard-dialog-head'}>
                            <PageBack title={lang['Timezone']} onClose={() => {
                                setShowTimezone(false)
                                switchOverflow(false)
                            }}/>
                        </div>
                        <div className={'dialog-inner'}>
                            <div className='create-badge-page-form'>
                                <div className={'dialog-des'}>
                                    Default time zone for group event, but you can still change it when creating the event. If keep it blank, the default time zone will follow the operating system.</div>
                                <div className='input-area'>
                                    <Select
                                        value={timezone ? [{id: timezone, label: timezone}] : []}
                                        clearable={false}
                                        searchable={false}
                                        options={[{id: 'auto', label: 'Not set'}, ...Timezone]}
                                        onChange={({value}) => {
                                            if (value[0].id === 'auto') {
                                                setTimezone(null)
                                            } else {
                                                setTimezone((value[0] as any).id)
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={'action-bar'}>
                            <AppButton special onClick={saveTimezone}>Save</AppButton>
                        </div>
                    </div>
                </div>
            }

            {showEditTag &&
                <div className={'dashboard-dialog dashboard-event-site-list'}>
                    <div className={'center'}>
                        <div className={'dashboard-dialog-head'}>
                            <PageBack title={lang['Event_Tag']} onClose={() => {
                                setShowEditTag(false)
                                switchOverflow(false)
                            }}/>
                        </div>
                        <div className={'dialog-inner'}>
                            <div className={'dialog-des'}>
                                Event tags that creators can choose for their events.
                            </div>
                            <EventTagInput value={tags.length ? tags : ['']} onChange={value => {
                                setTags(value)
                            }} placeholder={'Input tag'}/>

                        </div>
                        <div className={'action-bar'}>
                            <AppButton special onClick={setTag}>Save</AppButton>
                        </div>
                    </div>
                </div>
            }

            {showEventSiteList &&
                <div className={'dashboard-dialog dashboard-event-site-list'}>
                    <div className={'center'}>
                        <div className={'dashboard-dialog-head'}>
                            <PageBack title={lang['Event_Site_Title']} onClose={() => {
                                setShowEventSiteList(false)
                                switchOverflow(false)
                            }}/>
                        </div>
                        <div className={'dialog-inner'}>
                            <div className={'dialog-des'}>
                                venues are the default locations that creators can choose for their events.
                            </div>

                            {
                                eventSite.map((item, index) => {
                                    return <div key={item.id} className={'venue-list-item'}>
                                        <div className={'info'} onClick={(e) => {
                                            setEditingVenueIndex(index)
                                            setShowEditingVenue(true)
                                        }}>
                                            <div>
                                                <div>{item.title}</div>
                                            </div>
                                            <i className={'icon-edit'}/>
                                        </div>
                                        <svg onClick={e => {
                                            handleRemoveEventSite(item.id)
                                        }}
                                             width="32" height="32" viewBox="0 0 32 32" fill="none"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <rect x="0.5" y="0.5" width="31" height="31" rx="15.5" fill="white"/>
                                            <rect x="0.5" y="0.5" width="31" height="31" rx="15.5" stroke="#7B7C7B"/>
                                            <path fillRule="evenodd" clipRule="evenodd"
                                                  d="M19.5 15C19.7761 15 20 15.2239 20 15.5V16.5C20 16.7761 19.7761 17 19.5 17H12.5C12.2239 17 12 16.7761 12 16.5V15.5C12 15.2239 12.2239 15 12.5 15H19.5Z"
                                                  fill="#7B7C7B"/>
                                        </svg>
                                    </div>
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
                                Add an event venue
                            </div>

                        </div>
                    </div>
                </div>
            }

            {showEditingVenue &&
                <div className={'dashboard-dialog dashboard-event-site-list'}>
                    <div className={'center'}>
                        <div className={'dashboard-dialog-head'}>
                            <PageBack title={'Edit venue'} onClose={() => {
                                if (eventSite.find(c => !c.id)) {
                                    const newEventSite = eventSite.filter(c => c.id)
                                    setEventSite(newEventSite)
                                } else {
                                    const newEventSite = [...eventSite]
                                    newEventSite[editingVenueIndex] = JSON.parse(JSON.stringify(oldEventSite.current[editingVenueIndex]))
                                    console.log('newEventSite[editingVenueIndex]', newEventSite[editingVenueIndex])
                                    setEventSite(newEventSite)
                                }
                                setShowEditingVenue(false)
                            }}/>
                        </div>
                        <div className={'dialog-inner'}>
                            <DialogEventSiteInput
                                initValue={eventSite[editingVenueIndex]}
                                locationError={errorInputItem.includes(editingVenueIndex)}
                                titleError={titleError.includes(editingVenueIndex)}
                                onChange={newEventSite => {
                                    const newEventSiteList = [...eventSite]
                                    newEventSiteList[editingVenueIndex] = newEventSite
                                    setEventSite(newEventSiteList)
                                }}
                                hasTimeSlotError={(hasError) => {setHasTimeSlotError(hasError)}}
                            />
                        </div>
                        <div className={'action-bar'}>
                            <AppButton style={{marginRight: '12px'}} onClick={
                                e => {
                                    if (eventSite.find(c => !c.id)) {
                                        const newEventSite = eventSite.filter(c => c.id)
                                        setEventSite(newEventSite)
                                    } else {
                                        const newEventSite = [...eventSite]
                                        newEventSite[editingVenueIndex] = JSON.parse(JSON.stringify(oldEventSite.current[editingVenueIndex]))
                                        console.log('newEventSite[editingVenueIndex]', newEventSite[editingVenueIndex])
                                        setEventSite(newEventSite)
                                    }
                                    setShowEditingVenue(false)
                                }
                            }>Cancel</AppButton>
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
                                switchOverflow(false)
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
                            <PageBack title={lang['Permission']} onClose={() => {
                                setShowPermission(false)
                                switchOverflow(false)
                            }}/>
                        </div>
                        <div className={'dialog-inner'}>
                            <div className={'permission-title'}>Create Events on Calendar</div>
                            <div className={'permission-item'} onClick={e => {setPermissionCanCreate('everyone')}}>
                                <AppRadio checked={permissionCanCreate === 'everyone'} /> Everyone
                            </div>
                            <div className={'permission-item'} data-test-id="member" onClick={e => {setPermissionCanCreate('member')}}>
                                <AppRadio checked={permissionCanCreate === 'member'} /> Member, Manager, Owner
                            </div>
                            <div className={'permission-item'} data-test-id="manager" onClick={e => {setPermissionCanCreate('manager')}}>
                                <AppRadio checked={permissionCanCreate === 'manager'} /> Manager, Owner
                            </div>

                            <div className={'permission-title'}>RSVP to Events</div>
                            <div className={'permission-item'} onClick={e => {setPermissionCanJoin('everyone')}}>
                                <AppRadio checked={permissionCanJoin === 'everyone'} /> Everyone
                            </div>
                            <div className={'permission-item'} onClick={e => {setPermissionCanJoin('member')}}>
                                <AppRadio checked={permissionCanJoin === 'member'} /> Member
                            </div>
                        </div>
                        <div className={'action-bar'}>
                            <AppButton special onClick={setPermission}>Save</AppButton>
                        </div>
                    </div>
                </div>
            }

        </div>
    </>)
}

export default Dashboard
