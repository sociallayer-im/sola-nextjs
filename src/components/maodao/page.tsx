import PageBack from '@/components/base/PageBack'
import React, {useContext, useEffect, useState} from 'react'
import {Profile, queryBadge, getProfile as getProfileDetail, getProfile} from '@/service/solas'
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
import {useRouter, useParams } from "next/navigation";
import dynamic from 'next/dynamic'
import ListNftAsset from "@/components/compose/ListNftAsset/ListNftAsset";
import Alchemy from "@/service/alchemy/alchemy";
import fetch from "@/utils/fetch";
import { toChecksumAddress } from 'web3-utils'
import fa from "@walletconnect/legacy-modal/dist/cjs/browser/languages/fa";

const UserTabs = dynamic(() => import('@/components/compose/ProfileTabs/ProfileTabs'), {
    loading: () => <p>Loading...</p>,
})

function Page(props: any) {
    const params = useParams()
    const [tokenId, setTokenId] = useState<string>(props.tokenId || params?.tokenId)
    const [profile, setProfile] = useState<Profile | null>(props.profile || null)
    const [maodaoProfile, setMaodaoProfile] = useState<any | null>( null)
    const {showLoading, openConnectWalletDialog} = useContext(DialogsContext)
    const {lang} = useContext(LangContext)
    const {user} = useContext(UserContext)
    const router = useRouter()
    const startIssue = useIssueBadge()
    const [newProfile, _] = useEvent(EVENT.profileUpdate)
    const {copyWithDialog} = useCopy()

    useEffect(() => {
        if (newProfile && newProfile.id !== profile?.id) {
            setProfile(newProfile)
        }
    }, [newProfile])


    useEffect(() => {
        const getProfile = async function () {


            const emptyProfile: Profile = {
                address: null,
                domain: null,
                group_owner_id: null,
                id: 0,
                image_url: null,
                email: null,
                twitter: null,
                telegram: null,
                github: null,
                discord: null,
                ens: null,
                lens: null,
                website: null,
                nostr: null,
                location: null,
                about:null,
                nickname: '--',
                username: '--',
                followers: 0,
                following: 0,
                is_group: false,
                badge_count: 0,
                status: 'active',
                permissions: [],
                group_event_visibility: 'public',
                group_event_tags: null,
                group_map_enabled: false,
                banner_image_url:null,
                banner_link_url: null,
                group_location_details: null
            }
            if (!tokenId) {
                setProfile(emptyProfile)
                return
            }

            const unload = showLoading()
            try {
                const maodaoProfile = await fetch.get({
                    url: `https://metadata.readyplayerclub.com/api/rpc-fam/${tokenId}`,
                    data: {}
                }) as any

                const walletAddress = await Alchemy.getMaodaoOwner(tokenId)
                if (walletAddress) {
                    const solaProfile = await getProfileDetail({address: toChecksumAddress(walletAddress)})

                    if (solaProfile) {
                        solaProfile.nickname = maodaoProfile.data.info.owner
                        solaProfile.image_url = maodaoProfile.data.image
                        setProfile(solaProfile)
                    } else {
                        emptyProfile.nickname = maodaoProfile.data.info.owner
                        emptyProfile.image_url = maodaoProfile.data.image
                        setProfile(emptyProfile)
                    }
                }
            } catch (e) {
                console.log('[getProfile]: ', e)
            } finally {
                unload()
            }
        }
        getProfile()
    }, [tokenId])

    useEffect(() => {
        if (params?.username) {
            setTokenId(params?.username as string)
        }
    }, [params])

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
        const badges = await queryBadge({sender_id: user.id!, page: 1})
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
                    <div className='maodao-nft'>
                        <div className={'list-title'} style={{ fontWeight: 600,
                            fontSize: '16px',
                            lineHeight: '24px',
                            color:' #272928',
                            marginTop: '15px',
                            marginBottom: '15px'}}>Ready Player Cat</div>
                        <ListNftAsset profile={profile} type={'maodao'} />
                    </div>
                </div>
            </div>
        }
    </>
}

export default Page
