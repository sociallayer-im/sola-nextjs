import {useRouter, useSearchParams} from 'next/navigation'
import PageBack from '@/components/base/PageBack'
import React, {useContext, useEffect, useRef, useState} from 'react'
import solas, {Profile} from '@/service/solas'
import DialogsContext from '@/components/provider/DialogProvider/DialogsContext'
import GroupPanel from '@/components/maodao/MaodaoGroupPanel/GroupPanel'
import AppButton from '@/components/base/AppButton/AppButton'
import LangContext from '@/components/provider/LangProvider/LangContext'
import UserContext from '@/components/provider/UserProvider/UserContext'
import useIssueBadge from '@/hooks/useIssueBadge'
import BgProfile from '@/components/base/BgProfile/BgProfile'
import {styled} from "baseui";
import useCopy from '@/hooks/copy'
import {Spinner} from "baseui/spinner";
import ListNftAsset from "@/components/compose/ListNftAsset/ListNftAsset";
import MaodaoMyEvent from "@/components/maodao/MaodaoMyEvent/MaodaoMyEvent";
import ListUserAssets from "@/components/base/ListUserAssets/ListUserAssets";
import {DotBitAccount} from "@/service/dotbit";
import CardDotBit from "@/components/base/Cards/CardDotBit/CardDotBit";
import Alchemy, {NftDetail} from "@/service/alchemy/alchemy";
import CardNft from "@/components/base/Cards/CardNft/CardNft";
import MaodaoCardMembers from "@/components/maodao/MaodaoCardMembers/MaodaoCardMembers";
import fetch from '@/utils/fetch'

function GroupPage(props: any) {
    const groupname = 'maodao'
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
    const listRef = useRef<any>()
    const pageKeyRef = useRef<string>('')
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

    const ShowDomain = styled('div', ({$theme}: any) => {
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

    const getRpc = async () => {
        const info = await Alchemy.getAllMaodaoNft(pageKeyRef.current)
        if (info.nfts.length) {
            pageKeyRef.current = info.pageKey || ''
            return info.nfts
        } else {
            return []
        }
    }

    const getMaodaoMember = async (page: number) => {
        const res = await fetch.get({
            url: `https://metadata.readyplayerclub.com/api/rpc-fam/fam?page=${page || 1}&pageSize=20`
        })

        let resArr:{
            "cat_id": string,
            "cat_name": string,
            "owner": string,
            "tag1": string,
            "tag2": string,
            "project": string,
            "position": string
        }[] = []



        return Object.values(res.data.family)
    }

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
                    </div>
                </div>
                <div className='down-side'>
                    <div className='down-side' style={{margin: '0 0 30px 0'}}>
                        <div className='maodao-nft'>
                            <div className={'list-title'} style={{
                                fontWeight: 600,
                                fontSize: '16px',
                                lineHeight: '24px',
                                color: 'var(--color-text-main)',
                                marginTop: '15px',
                                marginBottom: '15px'
                            }}>{'RPC'}</div>
                            <div style={{'minHeight': '202px'}}>
                                <ListUserAssets
                                    immediate={true}
                                    queryFcn={getRpc}
                                    onRef={listRef}
                                    child={(item: NftDetail, key) => <CardNft key={key}
                                                                                  type={'badge'}
                                                                                  detail={item}/>}/>
                            </div>
                        </div>

                        <div className='maodao-nft'>
                            <div className={'list-title'} style={{
                                fontWeight: 600,
                                fontSize: '16px',
                                lineHeight: '24px',
                                color: 'var(--color-text-main)',
                                marginTop: '15px',
                                marginBottom: '15px'
                            }}>{'Members'}</div>
                            <div style={{'minHeight': '202px'}}>
                                <ListUserAssets
                                    immediate={true}
                                    queryFcn={getMaodaoMember}
                                    onRef={listRef}
                                    child={(item: any, key) => <MaodaoCardMembers key={key}
                                                                              type={'badge'}
                                                                              detail={item}/>}/>
                            </div>
                        </div>

                        <div className={'maodao-event'}><MaodaoMyEvent profile={profile} isGroup={true} /></div>

                        <div className={'maodao-event'}>
                            {user.authToken &&
                                <div className={'home-login-panel'} style={{margin: '0 12px'}}>
                                    <img src="/images/balloon.png" alt=""/>
                                    <div className={'text'}>{lang['Activity_login_des']}</div>
                                    <AppButton onClick={e => {
                                        openConnectWalletDialog()
                                    }} special size={'compact'}>{lang['Activity_login_btn']}</AppButton>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        }
    </>
}

export default GroupPage
