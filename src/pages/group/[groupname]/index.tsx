import {useParams, useRouter, useSearchParams} from 'next/navigation'
import PageBack from '@/components/base/PageBack'
import React, {useContext, useEffect, useRef, useState} from 'react'
import {getEventStats, getGroupMemberShips, getGroups, Group, Profile, queryBadge} from '@/service/solas'
import DialogsContext from '@/components/provider/DialogProvider/DialogsContext'
import GroupPanel from '@/components/base/GroupPanel/GroupPanel'
import AppButton, {BTN_SIZE} from '@/components/base/AppButton/AppButton'
import LangContext from '@/components/provider/LangProvider/LangContext'
import ListGroupMember from '@/components/compose/ListGroupMember'
import UserContext from '@/components/provider/UserProvider/UserContext'
import useIssueBadge from '@/hooks/useIssueBadge'
import BgProfile from '@/components/base/BgProfile/BgProfile'
import {styled} from "baseui";
import useCopy from '@/hooks/copy'
import {Tab} from "baseui/tabs";
import ListUserRecognition from "@/components/compose/ListUserRecognition/ListUserRecognition";
import AppSubTabs from "@/components/base/AppSubTabs";
import ListGroupInvite from "@/components/compose/ListGroupInvite";
import ListUserGift from "@/components/compose/ListUserGift/ListUserGift";
import GroupComment from "@/components/compose/GroupComment/GroupComment";
import ListGroupEvent from "@/components/compose/ListGroupEvent/ListGroupEvent";
import dynamic from 'next/dynamic'
import {Swiper, SwiperSlide} from 'swiper/react'
import {Mousewheel} from "swiper";
import DialogRequestTobeIssuer from "@/components/base/Dialog/DialogRequestTobeIssuer/DialogRequestTobeIssuer";
import useSafePush from "@/hooks/useSafePush";
import {PageBackContext} from "@/components/provider/PageBackProvider";


const ListUserPresend = dynamic(() => import('@/components/compose/ListUserPresend'), {
    loading: () => <p>Loading...</p>,
})

const ListUserNftpass = dynamic(() => import('@/components/compose/ListUserNftpass/ListUserNftpass'), {
    loading: () => <p>Loading...</p>,
})

const ListUserPoint = dynamic(() => import('@/components/compose/ListUserVote'), {
    loading: () => <p>Loading...</p>,
})

const ListUserVote = dynamic(() => import('@/components/compose/ListUserVote'), {
    loading: () => <p>Loading...</p>,
})

function GroupPage(props: any) {
    const params = useParams()
    const groupname = props.groupname || params?.groupname
    const [profile, setProfile] = useState<Profile | null>(props.group)
    const {showLoading, openConnectWalletDialog, openDialog} = useContext(DialogsContext)
    const {lang} = useContext(LangContext)
    const {user, logOut} = useContext(UserContext)
    const {history} = useContext(PageBackContext)
    const searchParams = useSearchParams()
    const [selectedTab, setSelectedTab] = useState(searchParams?.get('tab') || '0')
    const [selectedSubtab, setSelectedSubtab] = useState(searchParams?.get('subtab') || '0')
    const [isGroupManager, setIsGroupManager] = useState(false)
    const [isIssuer, setIssuer] = useState(false)
    const [isGroupOwner, setIsGroupOwner] = useState(false)
    const [isJoined, setIsJoined] = useState(false)
    const [badgeCount, setBadgeCount] = useState(0)
    const [eventCount, setEventCount] = useState(0)
    const [canCreateEvent, setCanCreateEvent] = useState(false)
    const startIssue = useIssueBadge()
    const {copyWithDialog} = useCopy()
    const router = useRouter()
    const {safePush} = useSafePush()

    const loadedTabRrf = useRef<Set<string>>(new Set())

    // 为了实现切换tab时，url也跟着变化，而且浏览器的前进后退按钮也能切换tab
    useEffect(() => {
        if (!searchParams?.get('tab')) {
            setSelectedTab('0')
            loadedTabRrf.current.add('0')
        }

        if (searchParams?.get('tab')) {
            setSelectedTab(searchParams?.get('tab') || '0')
            loadedTabRrf.current.add(searchParams?.get('tab') || '0')
        }

        if (searchParams?.get('subtab')) {
            setSelectedSubtab(searchParams?.get('subtab') || '0')
        }
    }, [searchParams])

    useEffect(() => {
        if (groupname === 'readyplayerclub' && process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'maodao') {
            router.replace('/rpc')
            return
        }
    }, [groupname])


    useEffect(() => {
        const check = async () => {
            if (profile && user.id) {
                const memberships = await getGroupMemberShips({
                        group_id: profile.id!,
                    }
                )

                const target = memberships.find((item) => item.profile.id === user.id)
                setIsJoined(!!target)

                if (target && target.role === 'manager') {
                    setIsGroupManager(true)
                }

                if (target && target.role === 'issuer') {
                    setIssuer(true)
                }

                setIsGroupOwner(user.id === (profile as Group)?.creator.id)
            } else {
                setIssuer(false)
                setIsGroupManager(false)
                setIsGroupOwner(false)
                setIsJoined(false)
            }
        }

        const getStatus = async () => {
            if (profile) {
                getEventStats({group_id: profile.id, days: 365}).then((res) => {
                    setEventCount(res.total_events)
                })
            }
        }

        check()
        getStatus()
    }, [user.id, profile])


    useEffect(() => {
        if (profile) {
            setCanCreateEvent(
                (isJoined && (profile as Group).can_publish_event === 'member')
                || ((profile as Group).can_publish_event === 'everyone' && !!user.userName)
                || isGroupManager
                || user.id === (profile as Group).creator.id
            )
        } else {
            setCanCreateEvent(false)
        }
    }, [isJoined, isGroupManager, isGroupOwner, profile, user.userName])

    const handleMintOrIssue = async () => {
        if (!user.id) {
            openConnectWalletDialog()
            return
        }

        // 处理用户登录后但是未注册域名的情况，即有authToken和钱包地址,但是没有domain和username的情况
        if (!user.userName) {
            safePush('/regist')
            return
        }

        const unload = showLoading()
        const badgeProps = isGroupOwner ?
            {group_id: profile?.id || undefined, page: 1} :
            {sender_id: user?.id || undefined, page: 1}

        const badges = (await queryBadge(badgeProps)).data
        unload()

        if (process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'seedao') {
            router.push('/seedao/create-badge')
        } else {
            startIssue({badges, group_id: profile?.id})
        }
    }

    const ShowDomain = styled('div', ({$theme}: any) => {
        return {
            color: 'var(--color-text-main)'
        }
    })

    const goToEditGroup = () => {
        if (process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'seedao') {
            router.push(`/seedao/setting`)
        } else {
            router.push(`/group-edit/${profile?.username}`)
        }
    }

    const ProfileMenu = () => <div className='profile-setting'>
        <ShowDomain onClick={() => {
            copyWithDialog(profile?.domain || '', lang['Dialog_Copy_Message'])
        }}>{profile?.domain}</ShowDomain>
        {(isGroupOwner || isGroupManager)
            && <div className='profile-setting-btn' onClick={() => {
                goToEditGroup()
            }}><i className='icon-setting'></i></div>
        }
    </div>

    const setTab = (tab: string) => {
        loadedTabRrf.current.add(tab)
        setSelectedTab(tab as any);
        history.push(`/group/${groupname}?tab=${tab}`)
        window.history.pushState(null, '', `/group/${groupname}?tab=${tab}`)
    }

    const requestToBeIssuer = () => {
        openDialog({
            content: (close: any) => <DialogRequestTobeIssuer close={close} group_id={profile!.id}/>,
            size: [360, 'auto'],
        })
    }

    return <>
        {!!profile &&
            <div className='group-page'>
                <div className='up-side'>
                    <div className='center'>
                        <BgProfile profile={profile}/>
                        <div className='top-side'>
                            <PageBack menu={ProfileMenu}/>
                        </div>
                        <div className='slot_1'>
                            <GroupPanel group={profile}/>
                        </div>
                        <div className='slot_2'>
                            {(isGroupOwner || isGroupManager || isIssuer) &&
                                <AppButton special size={BTN_SIZE.compact} onClick={handleMintOrIssue}>
                                    <span className='icon-sendfasong'></span>
                                    {process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'seedao' ?
                                        lang['Send_SeeDAO_Badge']
                                        : lang['Follow_detail_btn_mint']}
                                </AppButton>
                            }
                        </div>
                    </div>
                </div>
                <div className='down-side'>
                    <div className={'center'}>
                        <div className={'profile-tab'}>
                            <div className={'tabs'}>
                                <Swiper
                                    modules={[Mousewheel]}
                                    mousewheel={true}
                                    spaceBetween={12}
                                    slidesPerView={'auto'}>
                                    <SwiperSlide className={'tabs-wrapper'}>
                                        <div className={selectedTab === '0' ? 'tabs-title active' : 'tabs-title'}
                                             key={0}
                                             onClick={e => {
                                                 setTab('0')
                                             }}>{lang['IssueBadge_Eventbtn']}</div>
                                    </SwiperSlide>
                                    <SwiperSlide className={'tabs-wrapper'}>
                                        <div className={selectedTab === '1' ? 'tabs-title active' : 'tabs-title'}
                                             key={1}
                                             onClick={e => {
                                                 setTab('1')
                                             }}>{lang['Profile_Tab_Received']}</div>
                                    </SwiperSlide>
                                    <SwiperSlide className={'tabs-wrapper'}>
                                        <div className={selectedTab === '3' ? 'tabs-title active' : 'tabs-title'}
                                             key={3}
                                             onClick={e => {
                                                 setTab('3')
                                             }}>{lang['Chat']}</div>
                                    </SwiperSlide>
                                    {(isGroupOwner || isGroupManager || isIssuer) &&
                                        <SwiperSlide className={'tabs-wrapper'}>
                                            <div className={selectedTab === '2' ? 'tabs-title active' : 'tabs-title'}
                                                 key={2}
                                                 onClick={e => {
                                                     setTab('2')
                                                 }}>{lang['Profile_Tab_Presend']}</div>
                                        </SwiperSlide>
                                    }
                                    {
                                        process.env.NEXT_PUBLIC_SPECIAL_VERSION !== 'seedao' && !!profile?.permissions.includes('point') &&
                                        <SwiperSlide className={'tabs-wrapper'}>
                                            <div className={selectedTab === '4' ? 'tabs-title active' : 'tabs-title'}
                                                 key={4}
                                                 onClick={e => {
                                                     setTab('4')
                                                 }}>{lang['Profile_Tab_Point']}</div>
                                        </SwiperSlide>
                                    }
                                    {process.env.NEXT_PUBLIC_SPECIAL_VERSION !== 'seedao' &&
                                        <SwiperSlide className={'tabs-wrapper'}>
                                            <div className={selectedTab === '5' ? 'tabs-title active' : 'tabs-title'}
                                                 key={5}
                                                 onClick={e => {
                                                     setTab('5')
                                                 }}>{lang['Group_detail_tabs_Vote']}</div>
                                        </SwiperSlide>
                                    }
                                    <SwiperSlide className={'tabs-wrapper'}>
                                        <div className={selectedTab === '6' ? 'tabs-title active' : 'tabs-title'}
                                             key={6}
                                             onClick={e => {
                                                 setTab('6')
                                             }}>{lang['Group_detail_tabs_member']}</div>
                                    </SwiperSlide>
                                </Swiper>
                            </div>
                            {(selectedTab === '0' || loadedTabRrf.current.has('0')) &&
                                <div className={`group-event ${selectedTab === '0' ? '' : 'hide'}`}>
                                    <div className={'tab-action'}>
                                        <div className={'left'}><b>{eventCount}</b> {lang['Setting_Events']}</div>
                                        <div className={'right'}>
                                            {user.userName &&
                                                <AppButton size={BTN_SIZE.compact} onClick={() => {
                                                    location.href = `https://prod.sociallayer.im/gcalendar/auth_url?auth_token=${user?.authToken}`
                                                }} style={{
                                                    backgroundColor: '#fff!important',
                                                    border: '1px solid #F1F1F1'
                                                }}>
                                                    <i className="icon-calendar"
                                                       style={{marginRight: '8px', fontSize: '18px'}}/>
                                                    {lang['Activity_Detail_Btn_add_Calender']}
                                                </AppButton>
                                            }
                                            {canCreateEvent &&
                                                <AppButton special size={BTN_SIZE.compact} onClick={e => {
                                                    router.push(`/event/${profile?.username}/create`)
                                                }}>
                                                    {`+ ${lang['Activity_Create_title']}`}
                                                </AppButton>
                                            }
                                        </div>
                                    </div>
                                    <ListGroupEvent isGroup={true} profile={profile}/>
                                </div>
                            }
                            {
                                (selectedTab === '1' || loadedTabRrf.current.has('1')) &&
                                <div className={`profile-badge ${selectedTab === '1' ? '' : 'hide'}`}>
                                    {!!user.userName &&
                                        <div className={'tab-action'}>
                                            <div className={'left'}><b>{badgeCount}</b> {lang['Badgelet_List_Unit']}
                                            </div>
                                            {(isGroupOwner || isGroupManager || isIssuer) &&
                                                <div className={'right'}>
                                                    <AppButton special size={BTN_SIZE.compact}
                                                               onClick={handleMintOrIssue}>
                                                        <span className='icon-sendfasong'></span>
                                                        {process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'seedao' ?
                                                            lang['Send_SeeDAO_Badge']
                                                            : lang['Follow_detail_btn_mint']}
                                                    </AppButton>
                                                </div>
                                            }
                                            {isJoined && !isGroupOwner && !isGroupManager && !isIssuer &&
                                                <div className={'right'}>
                                                    <AppButton size={BTN_SIZE.compact} onClick={requestToBeIssuer}>
                                                        <div>{lang['Request_To_Be_Issuer']}</div>
                                                    </AppButton>
                                                </div>
                                            }
                                        </div>
                                    }
                                    <AppSubTabs
                                        activeKey={selectedSubtab}
                                        onChange={({activeKey}) => {
                                            window.history.pushState(null, '', `/group/${groupname}?tab=${selectedTab}&subtab=${activeKey}`)
                                            setSelectedSubtab(activeKey as any)
                                        }}
                                        renderAll>
                                        <Tab title={lang['Profile_Tab_Basic']}>
                                            <ListUserRecognition onBadgeCount={(badgeCount) => {
                                                setBadgeCount(badgeCount)
                                            }
                                            } profile={profile}/>
                                        </Tab>
                                        {
                                            !!profile?.permissions.includes('nftpass') ?
                                                <Tab title={lang['Profile_Tab_NFTPASS']}>
                                                    <ListUserNftpass profile={profile}/>
                                                </Tab> : <></>
                                        }
                                        {
                                            !!profile?.permissions.includes('gift') ?
                                                <Tab title={lang['Badgebook_Dialog_Gift']}>
                                                    <ListUserGift profile={profile}/>
                                                </Tab> : <></>
                                        }


                                        {isGroupOwner || isGroupManager ?
                                            <Tab title={lang['Group_detail_tabs_Invite']}>
                                                <ListGroupInvite group={profile}/>
                                            </Tab>
                                            : <></>
                                        }
                                    </AppSubTabs>
                                </div>
                            }
                            {
                                (selectedTab === '2' || loadedTabRrf.current.has('2')) &&
                                <div className={`${selectedTab === '2' ? '' : 'hide'}`}>
                                    <ListUserPresend profile={profile}/>
                                </div>
                            }
                            {
                                (selectedTab === '3' || loadedTabRrf.current.has('3')) &&
                                <div className={`${selectedTab === '3' ? '' : 'hide'}`}>
                                    <div className={'tab-action'}>
                                        {!user.userName &&
                                            <AppButton size={BTN_SIZE.compact} onClick={() => {
                                                openConnectWalletDialog()
                                            }} style={{backgroundColor: '#fff!important', border: '1px solid #272928'}}>
                                                {lang['Sign_To_Comment']}
                                            </AppButton>
                                        }
                                    </div>
                                    <GroupComment group={profile as Group}/>
                                </div>
                            }
                            {
                                selectedTab === '4' &&
                                <ListUserPoint profile={profile}/>
                            }
                            {
                                (selectedTab === '5' || loadedTabRrf.current.has('5')) &&
                                <div className={`${selectedTab === '5' ? '' : 'hide'}`}>
                                    <ListUserVote profile={profile}/>
                                </div>
                            }
                            {(selectedTab === '6' || loadedTabRrf.current.has('6')) &&
                                <div className={`${selectedTab === '6' ? '' : 'hide'}`}>
                                    <ListGroupMember group={profile}/>
                                </div>
                            }
                        </div>
                        <div className={'profile-side'}>
                            <ListGroupMember group={profile} isSidebar={true}/>
                        </div>
                    </div>
                </div>
            </div>
        }
    </>
}

export default GroupPage

export const getServerSideProps: any = (async (context: any) => {
    const groupname = context.params?.groupname

    console.time('Group page fetch data')
    const group = await getGroups({username: groupname as string})
    console.timeEnd('Group page fetch data')

    return {props: {group: group[0], groupname: group[0].username}}
})
