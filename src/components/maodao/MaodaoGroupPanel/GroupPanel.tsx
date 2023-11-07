import {useContext, useEffect, useState} from 'react'
import solas, {Profile} from '../../../service/solas'
import usePicture from '../../../hooks/pictrue'
import LangContext from '../../provider/LangProvider/LangContext'
import UserContext from '../../provider/UserProvider/UserContext'
import DialogsContext from '../../provider/DialogProvider/DialogsContext'
import useEvent, {EVENT} from '../../../hooks/globalEvent'
import DialogFollowInfo from '@/components/base/Dialog/DialogFollowInfo/DialogFollowInfo'
import {PLACEMENT, StatefulPopover} from 'baseui/popover'
import AppButton, {BTN_KIND, BTN_SIZE} from '@/components/base/AppButton/AppButton'
import MenuItem from '@/components/base/MenuItem'
import ProfileSocialMediaList from '@/components/base/ProfileSocialMediaList/ProfileSocialMediaList'
import DialogProfileQRcode from "@/components/base/Dialog/DialogProfileQRcode/DialogProfileQRcode";

interface GroupPanelProps {
    group: Profile
}

function GroupPanel(props: GroupPanelProps) {
    const {defaultAvatar} = usePicture()
    const {lang} = useContext(LangContext)
    const {user} = useContext(UserContext)
    const {openDialog, showAvatar, showLoading, showToast} = useContext(DialogsContext)
    const [newProfile, _] = useEvent(EVENT.groupUpdate)
    const [group, setGroup] = useState(props.group)
    const [showUnFollowBtn, setShowUnFollowBtn] = useState(false)
    const [showFollowBtn, setShowFollowBtn] = useState(false)

    const checkFollow = async () => {
        const follower = await solas.getFollowers(props.group.id)
        const isFollower = follower.find(item => {
            return item.id === user.id
        })

        setShowFollowBtn(!isFollower && user.id !== props.group.id)
        setShowUnFollowBtn(!!isFollower)
        return !!isFollower
    }

    useEffect(() => {
        if (newProfile && newProfile.id === group.id) {
            setGroup({...group, ...newProfile})
        }
    }, [newProfile])

    useEffect(() => {
        setGroup(props.group)
    }, [props.group])

    useEffect(() => {
        if (!user.id) {
            setShowUnFollowBtn(false)
            return
        }
        checkFollow()
    }, [user.id, props.group.id])


    const showFollowInfo = () => {
        openDialog({
            size: ['100%', '100%'],
            content: (close: any) => <DialogFollowInfo title={props.group.domain!} profile={group} handleClose={close}/>
        })
    }

    const handleUnJoin = async () => {
        const unload = showLoading()
        try {
            const res = await solas.leaveGroup({
                group_id: props.group.id,
                auth_token: user.authToken || '',
                profile_id: user.id!
            })
            unload()
            setShowUnFollowBtn(false)
        } catch (e: any) {
            unload()
            console.log('[handleUnJoin]: ', e)
            showToast(e.message || 'Unjoin fail')
        }
    }

    const showAvatarDialog = () => {
        if (props.group.group_owner_id === user.id) {
            showAvatar(group)
        }
    }

    const showProfileQRcode = () => {
        openDialog({
            size: [316, 486],
            content: (close: any) => <DialogProfileQRcode handleClose={close} profile={props.group}/>
        })
    }

    const handleUnFollow = async () => {
        const unload = showLoading()
        try {
            const res = await solas.unfollow({
                target_id: props.group.id,
                auth_token: user.authToken || ''
            })
            unload()
            setShowUnFollowBtn(false)
            setShowFollowBtn(true)
        } catch (e: any) {
            unload()
            console.log('[handleUnFollow]: ', e)
            showToast(e.message || 'Unfollow fail')
        }
    }

    const handleFollow = async () => {
        const unload = showLoading()
        try {
            const res = await solas.follow({
                target_id: props.group.id,
                auth_token: user.authToken || ''
            })
            unload()
            setShowUnFollowBtn(true)
            setShowFollowBtn(false)
        } catch (e: any) {
            unload()
            console.log('[handleFollow]: ', e)
            showToast(e.message || 'Follow fail')
        }
    }

    return (
        <div className='profile-panel'>
            <div className='left-size'>
                <div className='avatar' onClick={showAvatarDialog}>
                    <img src={group.image_url || '/images/maodao/maodao_avatar.jpg'} alt=""/>
                </div>
                <div className='domain-bar'>
                    <div className='domain'>{group.nickname || 'Ready Player Club'}</div>
                    <img src="/images/group_label.png" alt=""/>
                    {
                        <div className='qrcode-btn' onClick={showProfileQRcode}>
                            <i className='icon icon-qrcode'></i>
                        </div>
                    }
                </div>
                {process.env.NEXT_PUBLIC_SPECIAL_VERSION !== 'maodao' &&
                    <div className='follow' onClick={showFollowInfo}>
                        <div><b>{group.followers}</b> {lang['Follow_detail_followed']} </div>
                        {/*<div> { lang['Group_detail_Join_Time'] } <b>{ group.following }</b></div>*/}
                    </div>
                }
                {!!group.location &&
                    <div className='profile-position'>
                        <i className='icon-Outline'/>
                        <span>{group.location}</span>
                    </div>
                }
                {!!group.about ?
                    <div className={'profile-bio'}>{group.about}</div>
                    : <div
                        className={'profile-bio'}>{'Ready Player Club (RPC) is a club for Web3 Chinese professionals dedicated to promoting resource sharing and collaboration among its members.'}</div>
                }
                <ProfileSocialMediaList profile={props.group}/>
            </div>
            {process.env.NEXT_PUBLIC_SPECIAL_VERSION !== 'maodao' &&
                <div className='right-size'>
                    {
                        showUnFollowBtn &&
                        <StatefulPopover
                            placement={PLACEMENT.bottomRight}
                            popoverMargin={0}
                            content={({close}) => <MenuItem onClick={() => {
                                handleUnFollow()
                            }}>{lang['Relation_Ship_Action_Unfollow']}</MenuItem>}>
                            <div>
                                <AppButton
                                    size={BTN_SIZE.mini}
                                    style={{width: '37px', border: '1px solid #272928', marginRight: '12px'}}>
                                    <i className='icon-user-check'></i>
                                </AppButton>
                            </div>
                        </StatefulPopover>
                    }

                    {
                        showFollowBtn &&
                        <AppButton
                            style={{backgroundColor: '#272928!important', color: '#fff', width: '94px'}}
                            onClick={() => {
                                handleFollow()
                            }}
                            kind={BTN_KIND.primary} size={BTN_SIZE.mini}>
                            <i className='icon-user-plus'></i>
                            <span>{lang['Relation_Ship_Action_Follow']}</span>
                        </AppButton>
                    }
                </div>
            }
        </div>
    )
}

export default GroupPanel
