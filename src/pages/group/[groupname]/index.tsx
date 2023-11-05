import {useRouter, useParams, useSearchParams} from 'next/navigation'
import PageBack from '@/components/base/PageBack'
import {useContext, useEffect, useState} from 'react'
import solas, {Profile} from '@/service/solas'
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
import {Tab, Tabs} from "baseui/tabs";
import ListUserRecognition from "@/components/compose/ListUserRecognition/ListUserRecognition";
import ListUserPresend from "@/components/compose/ListUserPresend";
import ListUserNftpass from "@/components/compose/ListUserNftpass/ListUserNftpass";
import AppSubTabs from "@/components/base/AppSubTabs";
import ListGroupInvite from "@/components/compose/ListGroupInvite";
import ListUserPoint from "@/components/compose/ListUserPoint/ListUserPoint";
import ListUserGift from "@/components/compose/ListUserGift/ListUserGift";
import ListUserVote from "@/components/compose/ListUserVote";

function GroupPage(props: any) {
    const params = useParams()
    const groupname = props.groupname || params?.groupname
    const [profile, setProfile] = useState<Profile | null>(null)
    const {showLoading, openConnectWalletDialog} = useContext(DialogsContext)
    const {lang} = useContext(LangContext)
    const {user, logOut} = useContext(UserContext)
    const searchParams = useSearchParams()
    const [selectedTab, setSelectedTab] = useState(searchParams.get('tab') || '0')
    const [selectedSubtab, setSelectedSubtab] = useState(searchParams.get('subtab') || '0')
    const [isGroupManager, setIsGroupManager] = useState(false)
    const startIssue = useIssueBadge({groupName: groupname as string})
    const {copyWithDialog} = useCopy()
    const router = useRouter()

    const isGroupOwner = user.id === profile?.group_owner_id

    // 为了实现切换tab时，url也跟着变化，而且浏览器的前进后退按钮也能切换tab
    useEffect(() => {
        if (!searchParams.get('tab')) {
            setSelectedTab('0')
        }

        if (searchParams.get('tab')) {
            setSelectedTab(searchParams.get('tab') || '0')
        }

        if (searchParams.get('subtab')) {
            setSelectedSubtab(searchParams.get('subtab') || '0')
        }
    }, [searchParams])

    useEffect(() => {
        const getProfile = async function () {
            if (!groupname) return
            const unload = showLoading()
            try {
                const profile = await solas.getProfile({username: groupname as string})
                setProfile(profile)
            } catch (e) {
                console.log('[getProfile]: ', e)
            } finally {
                unload()
            }
        }
        getProfile()
    }, [groupname])


    useEffect(() => {
        const check = async () => {
            if (profile && user.id) {
                const isGroupManager = await solas.checkIsManager({
                        group_id: profile.id!,
                        profile_id: user.id
                    }
                )
                setIsGroupManager(isGroupManager)
            }
        }
        check()
    }, [user.id, profile])

    const handleMintOrIssue = async () => {
        if (!user.id) {
            openConnectWalletDialog()
            return
        }

        // 处理用户登录后但是未注册域名的情况，即有authToken和钱包地址,但是没有domain和username的情况
        if (user.wallet && user.authToken && !user.domain) {
            router.push('/regist')
            return
        }

        const unload = showLoading()
        const badgeProps = isGroupOwner ?
            {group_id: profile?.id || undefined, page: 1} :
            {sender_id: user?.id || undefined, page: 1}

        const badges = await solas.queryBadge(badgeProps)
        unload()

        user.id === profile?.group_owner_id
            ? startIssue({badges})
            : startIssue({badges, to: profile?.domain || ''})
    }

    const ShowDomain = styled('div', ({$theme} : any) => {
        return {
            color: 'var(--color-text-main)'
        }
    })

    const goToEditGroup = () => {
        router.push(`/group-edit/${profile?.username}`)
    }

    const ProfileMenu = () => <div className='profile-setting'>
        <ShowDomain onClick={() => {
            copyWithDialog(profile?.domain || '', lang['Dialog_Copy_Message'])
        }}>{profile?.domain}</ShowDomain>
        {(isGroupOwner || isGroupManager) &&
            <div className='profile-setting-btn' onClick={() => {
                goToEditGroup()
            }}><i className='icon-setting'></i></div>
        }
    </div>

    return <>
        {!!profile &&
            <div className='profile-page'>
                <div className='up-side'>
                    <BgProfile profile={profile}/>
                    <div className='center'>
                        <div className='top-side'>
                            <PageBack menu={ProfileMenu}/>
                        </div>
                        <div className='slot_1'>
                            <GroupPanel group={profile}/>
                        </div>
                        <div className='slot_2'>
                            <AppButton special size={BTN_SIZE.compact} onClick={handleMintOrIssue}>
                                <span className='icon-sendfasong'></span>
                                {user.id === profile.group_owner_id
                                    ? lang['Follow_detail_btn_mint']
                                    : lang['Profile_User_IssueBadge'] + profile.username
                                }
                            </AppButton>
                        </div>
                    </div>
                </div>
                <div className='down-side'>
                    <div className={'profile-tab'}>
                        <Tabs
                            renderAll
                            activeKey={selectedTab}
                            onChange={({activeKey}) => {
                                setSelectedTab(activeKey as any);
                                router.push(`/group/${groupname}?tab=${activeKey}`, {scroll: false})
                            }}>

                            <Tab title={lang['Profile_Tab_Received']}>
                                <AppSubTabs
                                    activeKey={selectedSubtab}
                                    onChange={({activeKey}) => {
                                        router.push(`/group/${groupname}?tab=${selectedTab}&subtab=${activeKey}`, {scroll: false})
                                        setSelectedSubtab(activeKey as any)
                                    }}
                                    renderAll>
                                    <Tab title={lang['Profile_Tab_Basic']}>
                                        <ListUserRecognition profile={profile}/>
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
                            </Tab>
                            {isGroupOwner || isGroupManager ?
                                <Tab title={lang['Profile_Tab_Presend']}>
                                    <ListUserPresend profile={profile}/>
                                </Tab>
                                : <></>
                            }
                            {
                                !!profile?.permissions.includes('gift') ?
                                    <Tab title={lang['Profile_Tab_Point']}>
                                        <ListUserPoint profile={profile}/>
                                    </Tab> : <></>
                            }

                            <Tab title={lang['Group_detail_tabs_Vote']}>
                                <div className={'list-vote'}>
                                    <ListUserVote profile={profile}/>
                                </div>
                            </Tab>

                            <Tab title={lang['Group_detail_tabs_member']}>
                                <div>
                                    <ListGroupMember group={profile}/>
                                </div>
                            </Tab>
                        </Tabs>
                    </div>
                </div>
            </div>
        }
    </>
}

export default GroupPage
