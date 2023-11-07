import PageBack from '@/components/base/PageBack'
import React, {useContext, useEffect, useState} from 'react'
import {getProfile as getProfileDetail, Profile, queryBadge} from '@/service/solas'
import DialogsContext from '@/components/provider/DialogProvider/DialogsContext'
import ProfilePanel from '@/components/base/ProfilePanel/ProfilePanel'
import AppButton from '@/components/base/AppButton/AppButton'
import LangContext from '@/components/provider/LangProvider/LangContext'
import UserContext from '@/components/provider/UserProvider/UserContext'
import useIssueBadge from '@/hooks/useIssueBadge'
import BgProfile from '@/components/base/BgProfile/BgProfile'
import {styled} from 'baseui'
import useCopy from '@/hooks/copy'
import {useParams, useRouter} from "next/navigation";
import ListNftAsset from "@/components/compose/ListNftAsset/ListNftAsset";
import Alchemy from "@/service/alchemy/alchemy";
import fetch from "@/utils/fetch";
import {toChecksumAddress} from 'web3-utils'
import MaodaoMyEvent from "@/components/maodao/MaodaoMyEvent/MaodaoMyEvent";

function Page(props: any) {
    const params = useParams()
    const [tokenId, setTokenId] = useState<string>(props.tokenId || params?.tokenId)
    const [profile, setProfile] = useState<Profile | null>(props.profile || null)
    const [maodaoprofile, setMaodaoprofile] = useState<{
        cat: string,
        company: string,
        industry: string,
        owner: string,
        position: string,
        tag: string,
    } | null>(null)
    const {showLoading, openConnectWalletDialog} = useContext(DialogsContext)
    const {lang} = useContext(LangContext)
    const {user} = useContext(UserContext)
    const router = useRouter()
    const startIssue = useIssueBadge()
    const {copyWithDialog} = useCopy()


    useEffect(() => {
        setTimeout(() => {
            if (typeof window !== 'undefined') {
                document!.getElementById('PageContent')?.scroll(0, 0)
            }
        }, 100)
    })


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
                about: null,
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
                banner_image_url: null,
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
                }).catch(e => {
                    console.log(e)
                })

                if (maodaoProfile) {
                    setMaodaoprofile(maodaoProfile.data.info)
                }

                const walletAddress = await Alchemy.getMaodaoOwner(tokenId)
                if (walletAddress) {
                    const solaProfile = await getProfileDetail({address: toChecksumAddress(walletAddress)})
                    if (solaProfile) {
                        setProfile(solaProfile)
                    } else if (maodaoProfile) {
                        emptyProfile.nickname = maodaoProfile.data.info.owner
                        emptyProfile.image_url = maodaoProfile.data.image
                        emptyProfile.address = walletAddress
                        setProfile(emptyProfile)
                    } else {
                        emptyProfile.nickname = '#' + tokenId
                        emptyProfile.image_url = `https://asset.maonft.com/rpc/${tokenId}.png`
                        setProfile(emptyProfile)
                    }
                } else {
                    const zeroPad = (num: string) => {
                        const numStr = num.split('（')[0]
                        return String(numStr).padStart(4, '0')
                    }
                    emptyProfile.nickname = '#' + tokenId
                    emptyProfile.image_url = `https://asset.maonft.com/rpc/${zeroPad(tokenId)}.png`
                    setProfile(emptyProfile)
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
                            {!!maodaoprofile && maodaoprofile.company &&
                                <div className={'maodao-tag'}>{maodaoprofile.company}</div>
                            }
                            {!!maodaoprofile && maodaoprofile.tag &&
                                <div className={'maodao-tag'}>{maodaoprofile.tag}</div>
                            }
                        </div>
                    </div>
                </div>
                <div className='down-side' style={{margin: '0 0 30px 0'}}>
                    <div className='maodao-nft'>
                        <ListNftAsset profile={profile} type={'maodao'} title={'RPC'}/>
                    </div>
                    {!profile?.id && profile?.id === user.id &&
                        <MaodaoMyEvent profile={profile}/>
                    }

                    {!user.authToken &&
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
        }
    </>
}

export default Page
