import {useRouter, useParams} from "next/navigation"
import {createRef, useContext, useEffect, useState} from 'react'
import solas, {Profile} from '@/service/solas'
import DialogsContext from '@/components/provider/DialogProvider/DialogsContext'
import PageBack from '@/components/base/PageBack'
import AppButton, {BTN_KIND, BTN_SIZE} from '@/components/base/AppButton/AppButton'
import FormProfileEdit, {ProfileEditFormData} from '@/components/compose/FormProfileEdit/FormProfileEdit'
import LangContext from '@/components/provider/LangProvider/LangContext'
import {DialogConfirmProps} from '@/components/base/Dialog/DialogConfirm/DialogConfirm'
import UserContext from "@/components/provider/UserProvider/UserContext";


function GroupEdit() {
    const router = useRouter()
    const [profile, setProfile] = useState<Profile | null>(null)
    const [newProfile, setNewProfile] = useState<Profile | null>(null)
    const params = useParams()
    const groupname = params?.groupname
    const {showLoading, showToast, openConfirmDialog} = useContext(DialogsContext)
    const {lang} = useContext(LangContext)
    const form = createRef<ProfileEditFormData>()
    const {user, setUser} = useContext(UserContext)
    const [isGroupManager, setIsGroupManager] = useState(false)

    useEffect(() => {
        const getProfile = async () => {
            if (!params?.groupname) return

            const unload = showLoading()
            try {
                const profile = await solas.getProfile({
                    username: params?.groupname as string
                })

                setNewProfile(profile)
                setProfile(profile)

                if (user.id) {
                    const isManager = await solas.checkIsManager({
                        group_id: profile!.id,
                        profile_id: user.id
                    })

                    setIsGroupManager(isManager || profile!.group_owner_id === user.id)
                }

                unload()
            } catch (e: any) {
                console.error('[getProfile]: ', e)
            }
        }
        getProfile()
    }, [user.id, params?.groupname])

    const saveProfile = async () => {
        console.log(form.current?.profile)
        const unload = showLoading()

        try {
            const update = await solas.updateGroup({
                ...form.current!.profile,
                auth_token: user.authToken || ''
            })

            showToast('Save Successfully')
            router.push(`/group/${profile?.username}`)
        } catch (e) {
            showToast('Save Failed')
            console.error('[saveProfile]: ', e)
        } finally {
            unload()
        }
    }

    const SaveBtn = function () {
        return <AppButton
            onClick={saveProfile}
            style={{width: '60px'}} inline kind={BTN_KIND.primary}
            special
            size={BTN_SIZE.mini}>
            {lang['Profile_Edit_Save']}
        </AppButton>
    }

    const handleBack = () => {
        const editedAvatar = form.current?.profile.image_url !== profile?.image_url
        const editTwitter = form.current?.profile.twitter !== profile?.twitter

        if (editedAvatar || editTwitter) {
            const props: DialogConfirmProps = {
                confirmLabel: lang['Profile_Edit_Leave'],
                cancelLabel: lang['Profile_Edit_Cancel'],
                title: lang['Profile_Edit_Leave_Dialog_Title'],
                content: lang['Profile_Edit_Leave_Dialog_Des'],
                onConfirm: (close) => {
                    router.push(`/group/${profile?.username}`)
                    close()
                }
            }
            const dialog = openConfirmDialog(props)
        } else {
            router.push(`/group/${profile?.username}`)
        }
    }

    const handleFreeze = () => {
        const props: DialogConfirmProps = {
            confirmLabel: lang['Group_freeze_Dialog_confirm'],
            confirmBtnColor: '#F64F4F!important',
            confirmTextColor: '#fff',
            cancelLabel: lang['Group_freeze_Dialog_cancel'],
            title: lang['Group_freeze_dialog_title'],
            content: lang['Group_freeze_dialog_des'],
            onConfirm: async (close) => {
                close()
                const unload = showLoading()
                try {
                    const res = await solas.freezeGroup({
                        group_id: profile?.id!,
                        auth_token: user.authToken || ''
                    })
                    unload()
                    showToast('Froze')
                    router.push(`/profile/${user?.userName}`)
                } catch (e: any) {
                    console.log('[handleFreeze]:', e)
                    showToast(e.message)
                }
            }
        }
        const dialog = openConfirmDialog(props)
    }

    return (<div className='edit-profile-page'>
        {!!newProfile &&
            <div className='edit-profile-page-wrapper'>
                <PageBack
                    onClose={handleBack}
                    title={lang['Profile_Edit_Title']}
                    menu={SaveBtn}/>
                <FormProfileEdit isGroup={true} isGroupManager={isGroupManager} profile={newProfile} onRef={form}/>
                <AppButton style={{color: '#F64F4F'}}
                           onClick={handleFreeze}>{lang['Group_setting_dissolve']}</AppButton>
            </div>
        }
    </div>)
}

export default GroupEdit
