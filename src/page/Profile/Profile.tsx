import Layout from '../../components/Layout/Layout'
import {useNavigate, useParams, useSearchParams} from 'react-router-dom'
import PageBack from '../../components/base/PageBack'
import './Profile.less'
import {useContext, useEffect, useState} from 'react'
import solas, {Profile} from '../../service/solas'
import DialogsContext from '../../components/provider/DialogProvider/DialogsContext'
import ProfilePanel from '../../components/base/ProfilePanel/ProfilePanel'
import AppButton, {BTN_KIND, BTN_SIZE} from '../../components/base/AppButton/AppButton'
import LangContext from '../../components/provider/LangProvider/LangContext'
import ListUserGroup from '../../components/compose/ListUserGroup'
import ListUserPresend from '../../components/compose/ListUserPresend'
import UserContext from '../../components/provider/UserProvider/UserContext'
import useIssueBadge from '../../hooks/useIssueBadge'
import BgProfile from '../../components/base/BgProfile/BgProfile'
import useEvent, {EVENT} from '../../hooks/globalEvent'
import {styled} from 'baseui'
import useCopy from '../../hooks/copy'
import {Tab, Tabs} from "baseui/tabs";
import ListUserRecognition from "../../components/compose/ListUserRecognition/ListUserRecognition";
import AppSubTabs from "../../components/base/AppSubTabs";
import ListUserNftpass from "../../components/compose/ListUserNftpass/ListUserNftpass";
import ListUserPoint from "../../components/compose/ListUserPoint/ListUserPoint";
import ListUserGift from "../../components/compose/ListUserGift/ListUserGift";
import LensList from "../../components/compose/Lens/LensList/LensList";

function ProfilePage() {
    const {username} = useParams()
    const [profile, setProfile] = useState<Profile | null>(null)
    const {showLoading, openConnectWalletDialog} = useContext(DialogsContext)
    const {lang} = useContext(LangContext)
    const {user} = useContext(UserContext)
    const [searchParams,] = useSearchParams()
    const [selectedTab, setSelectedTab] = useState(searchParams.get('tab') || '0')
    const [selectedSubtab, setSelectedSubtab] = useState(searchParams.get('subtab') || '0')
    const navigate = useNavigate()
    const startIssue = useIssueBadge()
    const [newProfile, _] = useEvent(EVENT.profileUpdate)
    const {copyWithDialog} = useCopy()

    useEffect(() => {
        if (newProfile && newProfile.id === profile?.id) {
            setProfile(newProfile)
        }
    }, [newProfile])

    // 为了实现切换tab时，url也跟着变化，而且浏览器的前进后退按钮也能切换tab
    useEffect(() => {
        if (!searchParams.get('tab')) {
            navigate(`/profile/${username}?tab=0`, {replace: true})
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
            if (!username) return
            const unload = showLoading()
            try {
                const profile = await solas.getProfile({username})
                setProfile(profile)
            } catch (e) {
                console.log('[getProfile]: ', e)
            } finally {
                unload()
            }
        }
        getProfile()
    }, [username])

    const handleMintOrIssue = async () => {
        if (!user.id) {
            openConnectWalletDialog()
            return
        }

        // 处理用户登录后但是未注册域名的情况，即有authToken和钱包地址,但是没有domain和username的情况
        if (user.wallet && user.authToken && !user.domain) {
            navigate('/regist')
            return
        }

        const unload = showLoading()
        const badges = await solas.queryBadge({sender_id: user.id!, page: 1})
        unload()

        user.userName === profile?.username
            ? startIssue({badges})
            : startIssue({badges, to: profile?.domain || ''})
    }

    const ShowDomain = styled('div', ({$theme}) => {
        return {
            color: '#272928'
        }
    })

    const goToEditProfile = () => {
        navigate(`/profile-edit/${profile?.username}`)
    }

    const ProfileMenu = () => <div className='profile-setting'>
        <ShowDomain onClick={() => {
            copyWithDialog(profile?.domain || '', lang['Dialog_Copy_Message'])
        }}>{profile?.domain}</ShowDomain>
        {user.id === profile?.id &&
            <div className='profile-setting-btn' onClick={() => {
                goToEditProfile()
            }}><i className='icon-setting'></i></div>
        }
    </div>

    return <Layout>
        {!!profile &&
            <div className='profile-page'>
                <div className='up-side'>
                    <BgProfile profile={profile}/>
                    <div className='center'>
                        <div className='top-side'>
                            <PageBack menu={() => ProfileMenu()}/>
                        </div>
                        <div className='slot_1'>
                            <ProfilePanel profile={profile}/>
                        </div>
                        <div className='slot_2'>
                            <AppButton
                                special kind={BTN_KIND.primary}
                                size={BTN_SIZE.compact}
                                onClick={handleMintOrIssue}>
                                <span className='icon-sendfasong'></span>
                                {user.id === profile.id
                                    ? lang['Profile_User_MindBadge']
                                    : lang['Profile_User_IssueBadge'] + (profile.nickname || profile.username)
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
                                navigate(`/profile/${username}?tab=${activeKey}`)
                            }}>
                            <Tab title={lang['Profile_Tab_Received']}>
                                <AppSubTabs
                                    renderAll
                                    activeKey={selectedSubtab}
                                    onChange={({activeKey}) => {
                                        navigate(`/profile/${username}?tab=${selectedTab}&subtab=${activeKey}`)
                                        setSelectedSubtab(activeKey as any);
                                    }}>
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
                                </AppSubTabs>
                            </Tab>
                            {user.id === profile.id ?
                                <Tab title={lang['Profile_Tab_Presend']}>
                                    <ListUserPresend profile={profile}/>
                                </Tab>
                                : <></>
                            }
                            {
                                !!profile?.permissions.includes('point') ?
                                    <Tab title={lang['Profile_Tab_Point']}>
                                        <ListUserPoint profile={profile}/>
                                    </Tab>
                                    : <></>
                            }

                            <Tab title={lang['Profile_Tab_Groups']}>
                                <ListUserGroup profile={profile}/>
                            </Tab>

                            {/*{ profile.address ?*/}
                            {/*    <Tab title={lang['Profile_Tab_Lens']}>*/}
                            {/*        <LensList profile={profile} />*/}
                            {/*    </Tab>*/}
                            {/*    : <></>*/}
                            {/*}*/}
                        </Tabs>
                    </div>
                    <div className='profile-user-name' style={{display: 'none'}}>{profile.username}</div>
                </div>
            </div>
        }
    </Layout>
}

export default ProfilePage
