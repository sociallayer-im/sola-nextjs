import PageBack from '@/components/base/PageBack'
import React, {useContext, useEffect, useState} from 'react'
import solas, {Profile} from '@/service/solas'
import DialogsContext from '@/components/provider/DialogProvider/DialogsContext'
import ProfilePanel from '@/components/base/ProfilePanel/ProfilePanel'
import AppButton, {BTN_KIND, BTN_SIZE} from '@/components/base/AppButton/AppButton'
import LangContext from '@/components/provider/LangProvider/LangContext'
import UserContext from '@/components/provider/UserProvider/UserContext'
import useIssueBadge from '@/hooks/useIssueBadge'
import BgProfile from '@/components/base/BgProfile/BgProfile'
import useEvent, {EVENT} from '@/hooks/globalEvent'
import {styled} from 'baseui'
import useCopy from '@/hooks/copy'
import {useParams, useRouter} from "next/navigation";
import dynamic from 'next/dynamic'
import MaodaoUserTab from "@/components/maodao/MaodaoUserTab/MaodaoUserTab";
import fetch from "@/utils/fetch";
import alchemy from "@/service/alchemy/alchemy";
import useSafePush from "@/hooks/useSafePush";

const UserTabs = dynamic(() => import('@/components/compose/ProfileTabs/ProfileTabs'), {
    loading: () => <p>Loading...</p>,
})

const SeedaoUserTabs = dynamic(() => import('@/components/seedao/ProfileTabs/ProfileTabs'), {
    loading: () => <p>Loading...</p>,
})

const isMaodao = process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'maodao'

function Page(props: any) {
    const params = useParams()
    const [username, setUsername] = useState<string>(props?.username || params?.username)
    const [profile, setProfile] = useState<Profile | null>(props.profile || null)
    const {showLoading, openConnectWalletDialog} = useContext(DialogsContext)
    const {lang} = useContext(LangContext)
    const {user} = useContext(UserContext)
    const router = useRouter()
    const startIssue = useIssueBadge()
    const [newProfile, _] = useEvent(EVENT.profileUpdate)
    const {copyWithDialog} = useCopy()
    const [maodaoprofile, setMaodaoprofile] = useState<{
        cat: string,
        company: string,
        industry: string,
        owner: string,
        position: string,
        tag: string,
    } | null>(null)
    const {safePush} = useSafePush()

    useEffect(() => {
        if (newProfile && newProfile.id === profile?.id) {
            setProfile(newProfile)
        }
    }, [newProfile])


    useEffect(() => {
        const getProfile = async function () {
            if (!username) return
            const unload = showLoading()
            try {
                const newPofile = await solas.getProfile({username})
                if (newPofile?.id === profile?.id) return
                setProfile(newPofile)
            } catch (e) {
                console.log('[getProfile]: ', e)
            } finally {
                unload()
            }
        }

        getProfile()
    }, [username])

    useEffect(() => {
        async function getMaodaoProfile () {
            if (profile?.address) {
                const maodaonft = await alchemy.getMaodaoNft(profile?.address)
                if (maodaonft.length) {
                    try {
                        const maodaoProfile = await fetch.get({
                            url: `https://metadata.readyplayerclub.com/api/rpc-fam/${maodaonft[0].id}`,
                            data: {}
                        })
                        setMaodaoprofile(maodaoProfile.data.info)
                    } catch (e){}
                }
            }
        }

        if (!profile) {
            router.push('/error')
            return
        } else {
            getMaodaoProfile()

        }
    }, [profile])

    useEffect(() => {
        if (params?.username) {
            setUsername(params?.username as string)
        }
    }, [params])

    const handleMintOrIssue = async () => {
        if (!user.id) {
            openConnectWalletDialog()
            return
        }

        // 处理用户登录后但是未注册域名的情况，即有authToken和钱包地址,但是没有domain和username的情况
        if (user.wallet && user.authToken && !user.domain) {
            safePush('/regist')
            return
        }

        const unload = showLoading()
        const badges = (await solas.queryBadge({sender_id: user.id!, page: 1})).data

        unload()

        user.userName === profile?.username
            ? startIssue({badges})
            : startIssue({badges, to: profile?.domain || ''})
    }

    const ShowDomain = styled('div', ({$theme}: any) => {
        return {
            color: 'var(--color-text-main)'
        }
    })

    const goToEditProfile = () => {
        router.push(`/profile-edit/${profile?.username}`)
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

    return <>
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
                            {!!maodaoprofile && maodaoprofile.company && isMaodao &&
                                <div className={'maodao-tag'}>{maodaoprofile.company}</div>
                            }
                            {!!maodaoprofile && maodaoprofile.tag && isMaodao &&
                                <div className={'maodao-tag'}>{maodaoprofile.tag}</div>
                            }
                        </div>
                        {!isMaodao &&
                            <div className='slot_2'>
                                <AppButton
                                    special kind={BTN_KIND.primary}
                                    size={BTN_SIZE.compact}
                                    onClick={handleMintOrIssue}>
                                    <span className='icon-sendfasong'></span>
                                    <span className='name'>{user.id === profile.id
                                        ? lang['Profile_User_MindBadge']
                                        : lang['Profile_User_IssueBadge'] + (profile.nickname || profile.username)
                                    }</span>
                                </AppButton>
                            </div>
                        }
                    </div>
                </div>
                { process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'maodao' ?
                        <div className='down-side' style={{margin: '0 0 30px 0'}}>
                            <MaodaoUserTab profile={profile}/>
                        </div> : process.env.NEXT_PUBLIC_SPECIAL_VERSION == 'seedao' ?
                        <div className='down-side' style={{margin: '0 12px 30px 12px'}}>
                            <SeedaoUserTabs profile={profile} />
                        </div>
                        : <div className='down-side'>
                            <UserTabs profile={profile}/>
                        </div>
                }
            </div>
        }
    </>
}

export default Page
