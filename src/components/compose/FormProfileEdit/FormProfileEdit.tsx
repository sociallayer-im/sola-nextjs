import React, {useContext, useEffect, useImperativeHandle, useState} from 'react'
import {getGroupMembers, Profile} from '../../../service/solas'
import UploadAvatar from '../UploadAvatar/UploadAvatar'
import usePicture from '../../../hooks/pictrue'
import AppInput from '../../base/AppInput'
import LangContext from '../../provider/LangProvider/LangContext'
import AppTextArea from '../../base/AppTextArea/AppTextArea'
import EditSocialMedia from '../EditSocialMedia/EditSocialMedia'
import {ArrowRight} from "baseui/icon";
import DialogsContext from "../../provider/DialogProvider/DialogsContext";
import DialogManageMember from "../../base/Dialog/DialogManageMember/DialogManageMember";
import DialogGroupManagerEdit from "../../base/Dialog/DialogGroupManagerEdit/DialogGroupManagerEdit";
import useEvent, {EVENT} from "../../../hooks/globalEvent";

export interface ProfileEditFormProps {
    profile: Profile
    onRef?: any
    isGroup?: boolean,
    isGroupManager?: boolean
}

export interface ProfileEditFormData {
    profile: Profile
}

function FormProfileEdit(props: ProfileEditFormProps) {
    const {defaultAvatar} = usePicture()
    const [newProfile, setNewProfile] = useState<Profile>(props.profile)
    const {lang} = useContext(LangContext)
    const {openDialog} = useContext(DialogsContext)
    const [members, setMembers] = useState<Profile[]>([])
    const [manager, setManager] = useState<Profile[]>([])
    const [needUpdate] = useEvent(EVENT.managerListUpdate)
    const isGroupOwner = props.profile.group_owner_id === props.profile.id

    const getMember = async () => {
        const res = await getGroupMembers({group_id: props.profile.id})
        setMembers(res)

        const res2 = await getGroupMembers({group_id: props.profile.id, role: 'group_manager'})
        setManager(res2)
    }

    const showMemberManageDialog = () => {
        const dialog = openDialog({
            content: (close: any) => <DialogManageMember
                groupId={props.profile.id}
                handleClose={close}/>,
            size: ['100%', '100%']
        })
    }

    const showManagerDialog = () => {
        const dialog = openDialog({
            content: (close: any) => <DialogGroupManagerEdit
                group={props.profile as any}
                members={members}
                managers={manager}
                handleClose={close}/>,
            size: ['100%', '100%']
        })
    }


    useEffect(() => {
        if (props.profile.group_owner_id) {
            getMember()
        }
        console.log('newProfile', newProfile)
    }, [needUpdate])

    useImperativeHandle(props.onRef, () => {
        // 需要将暴露的接口返回出去
        const a: ProfileEditFormData = {profile: newProfile}
        return a
    })

    const update = (key: keyof Profile, value: any) => {
        console.log(value)
        const profile: any = {...newProfile}
        profile[key] = value
        console.log('edit', profile)
        setNewProfile(profile)
    }

    return (<div className='profile-edit-from'>
        <div className='input-area'>
            <div className='input-area-title'>{lang['Profile_Edit_Avatar']}</div>
            <UploadAvatar
                imageSelect={newProfile.image_url || defaultAvatar(newProfile.id)}
                confirm={(imgRes) => {
                    update('image_url', imgRes)
                }}/>
        </div>

        <div className='input-area'>
            <div className='input-area-title'>{lang['Profile_Edit_Ncikname']}</div>
            <AppInput value={newProfile.nickname || ''} onChange={(e) => {
                update('nickname', e.target.value.trim())
            }}/>
        </div>

        <div className='input-area'>
            <div className='input-area-title'>{lang['Profile_Edit_Location']}</div>
            <AppInput value={newProfile.location || ''} onChange={(e) => {
                update('location', e.target.value.trim())
            }}/>
        </div>

        <div className='input-area'>
            <div className='input-area-title'>{lang['Profile_Edit_Bio']}</div>
            <AppTextArea
                maxLength={200}
                value={newProfile.about || ''}
                onChange={(e) => {
                    update('about', e.target.value)
                }}/>
        </div>
        <div className='input-area'>
            <div className='input-area-title'>{lang['Profile_Edit_Social_Media']}</div>
            <EditSocialMedia
                title={'Twitter'}
                icon={'icon-twitter'}
                value={newProfile.twitter || ''}
                type={'twitter'}
                onChange={(value) => {
                    update('twitter', value)
                }}
            />
            <EditSocialMedia
                title={'Telegram'}
                icon={'icon-tg'}
                value={newProfile.telegram || ''}
                type={'telegram'}
                onChange={(value) => {
                    update('telegram', value)
                }}
            />
            <EditSocialMedia
                title={'Github'}
                icon={'icon-github'}
                type={'github'}
                value={newProfile.github || ''}
                onChange={(value) => {
                    update('github', value)
                }}
            />
            <EditSocialMedia
                title={'Discord'}
                icon={'icon-discord'}
                type={'discord'}
                value={newProfile.discord || ''}
                onChange={(value) => {
                    update('discord', value)
                }}
            />
            <EditSocialMedia
                title={'ENS'}
                type={'ens'}
                icon={'icon-ens'}
                value={newProfile.ens || ''}
                onChange={(value) => {
                    update('ens', value)
                }}
            />
            <EditSocialMedia
                title={'Web'}
                type={'web'}
                icon={'icon-web2'}
                value={newProfile.website || ''}
                onChange={(value) => {
                    update('website', value)
                }}
            />
            <EditSocialMedia
                title={'Nostr'}
                type={'nostr'}
                icon={'icon-web2'}
                value={newProfile.nostr || ''}
                onChange={(value) => {
                    update('nostr', value)
                }}
            />
            <EditSocialMedia
                title={'Lens'}
                type={'lens'}
                icon={'icon-lens'}
                value={newProfile.lens || ''}
                onChange={(value) => {
                    update('lens', value)
                }}
            />
        </div>
        {
            props.isGroup &&
            <div className={'input-area'}>
                <div className='input-area-title'>{'Group member Setting'}</div>
                { props.isGroupManager &&
                    <div className={'input-area-btn'} role={'button'} onClick={event => {
                        showManagerDialog()
                    }}>
                        <div className={'btn-label'}>{'Managers'}</div>
                        <div className={'btn-extra'}>
                            <span>{manager.length}</span>
                            <ArrowRight size={24}/>
                        </div>
                    </div>
                }

                <div className={'input-area-btn'} role={'button'} onClick={e => {
                    showMemberManageDialog()
                }}>
                    <div className={'btn-label'}>{'Members'}</div>
                    <div className={'btn-extra'}>
                        <span>{members.length}</span>
                        <ArrowRight size={24}/>
                    </div>
                </div>
            </div>
        }
    </div>)
}

export default FormProfileEdit
