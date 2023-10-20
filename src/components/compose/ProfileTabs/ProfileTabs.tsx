import {useState, useContext, useEffect} from 'react'
import AppSubTabs from "@/components/base/AppSubTabs";
import {Tab, Tabs} from "baseui/tabs";
import {useSearchParams, useRouter} from "next/navigation";
import {Profile} from "@/service/solas";
import LangContext from "@/components/provider/LangProvider/LangContext";
import UserContext from "@/components/provider/UserProvider/UserContext";
import dynamic from 'next/dynamic'
import ListUserCurrency from "@/components/compose/ListUserCurrency/ListUserCurrency";
import ListNftAsset from "@/components/compose/ListNftAsset/ListNftAsset";

const UserRecognition = dynamic(() => import('@/components/compose/ListUserRecognition/ListUserRecognition'), {
    loading: () => <p>Loading...</p>,
})

const UserNftpass = dynamic(() => import('@/components/compose/ListUserNftpass/ListUserNftpass'), {
    loading: () => <p>Loading...</p>,
})

const UserGift = dynamic(() => import('@/components/compose/ListUserGift/ListUserGift'), {
    loading: () => <p>Loading...</p>,
})

const UserPresend = dynamic(() => import('@/components/compose/ListUserPresend'), {
    loading: () => <p>Loading...</p>,
})

const UserPoint = dynamic(() => import('@/components/compose/ListUserPoint/ListUserPoint'), {
    loading: () => <p>Loading...</p>,
})

const UserGroup = dynamic(() => import('@/components/compose/ListUserGroup'), {
    loading: () => <p>Loading...</p>,
})



function ComponentName({profile}: {profile: Profile}) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const {user} = useContext(UserContext)
    const {lang} = useContext(LangContext)
    const [selectedTab, setSelectedTab] = useState(searchParams.get('tab') || '0')
    const [selectedSubtab, setSelectedSubtab] = useState(searchParams.get('subtab') || '0')

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

    return ( <div className={'profile-tab'}>
        <Tabs
            renderAll
            activeKey={selectedTab}
            onChange={({activeKey}) => {
                setSelectedTab(activeKey as any);
                router.push(`/profile/${profile!.username}?tab=${activeKey}`, {scroll: false})
            }}>
            <Tab title={lang['Profile_Tab_Received']}>
                <AppSubTabs
                    renderAll
                    activeKey={selectedSubtab}
                    onChange={({activeKey}) => {
                        setSelectedSubtab(activeKey as any);
                        router.push(`/profile/${profile!.username}?tab=${selectedTab}&subtab=${activeKey}`, {scroll: false})
                    }}>
                    <Tab title={lang['Profile_Tab_Basic']}>
                        <UserRecognition profile={profile}/>
                    </Tab>
                    {
                        !!profile?.permissions.includes('nftpass') ?
                            <Tab title={lang['Profile_Tab_NFTPASS']}>
                                <UserNftpass profile={profile}/>
                            </Tab> : <></>
                    }
                    {
                        !!profile?.permissions.includes('gift') ?
                            <Tab title={lang['Badgebook_Dialog_Gift']}>
                                <UserGift profile={profile}/>
                            </Tab> : <></>
                    }
                </AppSubTabs>
            </Tab>
            {user.id === profile.id ?
                <Tab title={lang['Profile_Tab_Presend']}>
                    <UserPresend profile={profile}/>
                </Tab>
                : <></>
            }
            {
                !!profile?.permissions.includes('point') ?
                    <Tab title={lang['Profile_Tab_Point']}>
                        <UserPoint profile={profile}/>
                    </Tab>
                    : <></>
            }

            <Tab title={lang['Profile_Tab_Groups']}>
                <UserGroup profile={profile}/>
            </Tab>

            <Tab title={lang['Profile_Tab_Asset']}>
                <AppSubTabs
                    activeKey={selectedSubtab}
                    onChange={({activeKey}) => {
                        setSelectedSubtab(activeKey as any);
                        router.push(`/profile/${profile!.username}?tab=${selectedTab}&subtab=${activeKey}`, {scroll: false})
                    }}>
                    <Tab title={lang['Profile_Tab_Token']}>
                        <ListUserCurrency profile={profile}/>
                    </Tab>
                    <Tab title={'ENS'}>
                        <ListNftAsset profile={profile} type={'ens'}/>
                    </Tab>
                    <Tab title={'PNS'}>
                        <ListNftAsset profile={profile} type={'pns'}/>
                    </Tab>
                    <Tab title={'.bit'}>
                        <ListNftAsset profile={profile} type={'dotbit'}/>
                    </Tab>
                    <Tab title={'SeeDAO'}>
                        <ListNftAsset profile={profile} type={'seedao'}/>
                    </Tab>
                </AppSubTabs>
            </Tab>

            {/*{ profile.address ?*/}
            {/*    <Tab title={lang['Profile_Tab_Lens']}>*/}
            {/*        <LensList profile={profile} />*/}
            {/*    </Tab>*/}
            {/*    : <></>*/}
            {/*}*/}
        </Tabs>
    </div>)
}

export default ComponentName
