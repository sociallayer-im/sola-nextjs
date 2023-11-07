import {styled} from 'baseui'
import {useContext, useEffect, useState} from 'react'
import solas, {Profile} from '../../../service/solas'
import usePicture from '../../../hooks/pictrue'
import LangContext from '../../provider/LangProvider/LangContext'
import UserContext from '../../provider/UserProvider/UserContext'
import DialogsContext from '../../provider/DialogProvider/DialogsContext'
import DialogProfileQRcode from '../Dialog/DialogProfileQRcode/DialogProfileQRcode'
import DialogFollowInfo from '../Dialog/DialogFollowInfo/DialogFollowInfo'
import {PLACEMENT, StatefulPopover} from 'baseui/popover'
import AppButton, {BTN_KIND, BTN_SIZE} from '../AppButton/AppButton'
import MenuItem from '../MenuItem'
import ProfileBio from '../ProfileBio/ProfileBio'
import ProfileSocialMediaList from '../ProfileSocialMediaList/ProfileSocialMediaList'
import useCopy from "../../../hooks/copy";
import useEvent, {EVENT} from '@/hooks/globalEvent'

interface ProfilePanelProps {
    profile: Profile
}

const isMaodao = process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'maodao'

function ProfilePanel(props: ProfilePanelProps) {
    const { defaultAvatar } = usePicture()
    const { lang } = useContext(LangContext)
    const { user } = useContext(UserContext)
    const { openDomainConfirmDialog, openDialog, showAvatar, showLoading, showToast } = useContext(DialogsContext)
    const [newProfile, _] = useEvent(EVENT.profileUpdate)
    const [profile, setProfile] = useState(props.profile)
    const [showFollowBtn, setShowFollowBtn] = useState(false)
    const [showUnFollowBtn, setShowUnFollowBtn] = useState(false)
    const { copyWithDialog } = useCopy()

    useEffect(() => {
        if (newProfile && newProfile.id === profile.id) {
            setProfile({...profile, ...newProfile})
        }
    }, [newProfile])

    useEffect(() => {
        setProfile(props.profile)
    }, [props.profile])

    useEffect(() => {
        if (!profile.id) return;
        if (!user.id) {
            setShowFollowBtn(false)
            setShowUnFollowBtn(false)
            return
        }

        async function checkFollow () {
            const follower = await solas.getFollowers(props.profile.id)
            const isFollower = follower.find(item => {
                return item.id === user.id
            })

            setShowFollowBtn(!isFollower && user.id !== props.profile.id)
            setShowUnFollowBtn(!!isFollower)
            return !!isFollower
        }

        checkFollow()
    }, [user.id, profile.id])

    const DialogContent= styled('div', () => {
        return {
            textAlign: 'center',
            fontSize: '16px',
            wordBreak: 'break-all'
        }
    })

    const showWallet = () => {
        openDomainConfirmDialog({
            title: lang['Profile_Show_Wallet'],
            confirmLabel: lang['Profile_Show_Copy'],
            cancelLabel: lang['Profile_Show_Close'],
            onConfirm: (close: any) => { copyWithDialog(profile.address!);close(); },
            content: () => <DialogContent>{ profile.address }</DialogContent>
        })
    }

    const showEmail = () => {
        openDomainConfirmDialog({
            title: lang['Profile_Show_Email'],
            confirmLabel: lang['Profile_Show_Copy'],
            cancelLabel: lang['Profile_Show_Close'],
            onConfirm: (close: any) => { copyWithDialog(profile.email!);close(); },
            content: () => <DialogContent>{ profile.email }</DialogContent>
        })
    }

    const showProfileQRcode = () => {
        openDialog({
            size:[316, 486],
            content: (close: any) => <DialogProfileQRcode handleClose={ close } profile={profile} />
        })
    }

    const isProfileOwner = () => {
        return user.id === profile.id
    }

    const editAvatar = () => {
        if (!isProfileOwner()) return
        showAvatar(profile)
    }

    const showFollowInfo = () => {
        openDialog({
            size:['100%', '100%'],
            content: (close: any) => <DialogFollowInfo title={ profile.domain! } profile={profile} handleClose={close} />
        })
    }

    const handleFollow = async () => {
        const unload = showLoading()
        try {
            const res = await solas.follow({
                target_id: props.profile.id,
                auth_token: user.authToken || ''
            })
            unload()
            const newProfile = {...profile, followers: profile.followers + 1}
            setProfile(newProfile)
            setShowUnFollowBtn(true)
            setShowFollowBtn(false)
        } catch (e: any) {
            unload()
            console.log('[handleFollow]: ', e)
            showToast(e.message || 'Follow fail')
        }
    }

    const handleUnFollow = async () => {
        const unload = showLoading()
        try {
            const res = await solas.unfollow({
                target_id: props.profile.id,
                auth_token: user.authToken || ''
            })
            const newProfile = {...profile, followers: profile.followers - 1}
            setProfile(newProfile)
            unload()
            setShowUnFollowBtn(false)
            setShowFollowBtn(true)
        } catch (e: any) {
            unload()
            console.log('[handleUnFollow]: ', e)
            showToast(e.message || 'Unfollow fail')
        }
    }


    return (
        <div className='profile-panel'>
            <div className='left-size'>
                <div className='avatar'>
                    <img onClick={() => { editAvatar() } } src={ profile.image_url || defaultAvatar(profile.id) } alt=""/>
                </div>
                <div className='domain-bar'>
                    <div className='domain'>{ profile.nickname || profile.username }</div>
                    { profile.address &&
                        <div className='show-wallet' onClick={ () => { showWallet() } }>
                            <i className='icon icon-wallet'></i>
                        </div>
                    }
                    { profile.email && isProfileOwner() &&
                        <div className='show-email' onClick={ () => { showEmail() } }>
                            <i className='icon icon-email'></i>
                        </div>
                    }
                    { !isMaodao &&
                        <div className='qrcode-btn' onClick={showProfileQRcode}>
                            <i className='icon icon-qrcode'></i>
                        </div>
                    }
                </div>
                {!isMaodao &&
                        <div className='follow' onClick={ showFollowInfo }>
                        <div><b>{ profile.followers }</b> { lang['Follow_detail_followed'] } </div>
                        <div><b>{ profile.following }</b> { lang['Follow_detail_following'] } </div>
                    </div>
                }
                { !!props.profile.location &&
                    <div className='profile-position'>
                        <i className='icon-Outline' />
                        <span>{props.profile.location}</span>
                    </div>
                }
                { !!props.profile.about &&
                    <ProfileBio text={ props.profile.about }/>
                }
                <ProfileSocialMediaList profile={ props.profile }/>
            </div>
            {!isMaodao &&
                <div className='right-size'>
                    {
                        showUnFollowBtn &&
                        <StatefulPopover
                            placement={ PLACEMENT.bottomRight }
                            popoverMargin={ 0 }
                            content={ ({ close }) => <MenuItem onClick={ () => { handleUnFollow() } }>{ lang['Relation_Ship_Action_Unfollow'] }{ profile.username }</MenuItem> }>
                            <div>
                                <AppButton
                                    size={ BTN_SIZE.mini }
                                    style={{ width: '37px', border: '1px solid #272928', marginRight: '12px'}}>
                                    <i className='icon-user-check'></i>
                                </AppButton>
                            </div>
                        </StatefulPopover>
                    }

                    {
                        showFollowBtn &&
                        <AppButton
                            style={{ backgroundColor: '#272928!important', color: '#fff', width: '94px'}}
                            onClick={ () => { handleFollow() } }
                            kind={ BTN_KIND.primary } size={ BTN_SIZE.mini }>
                            <i className='icon-user-plus'></i>
                            <span>{ lang['Relation_Ship_Action_Follow'] }</span>
                        </AppButton>
                    }
                </div>
            }
        </div>
    )
}

export default ProfilePanel
