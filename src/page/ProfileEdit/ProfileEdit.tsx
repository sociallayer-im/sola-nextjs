import {useNavigate, useParams} from 'react-router-dom'
import {useStyletron} from 'baseui'
import {useContext, useEffect, useState, createRef} from 'react'
import Layout from '../../components/Layout/Layout'
import solas, {Profile, verifyTwitter} from '../../service/solas'
import DialogsContext from '../../components/provider/DialogProvider/DialogsContext'
import PageBack from '../../components/base/PageBack'
import './ProfileEdit.less'
import AppButton, {BTN_KIND, BTN_SIZE} from '../../components/base/AppButton/AppButton'
import FormProfileEdit, { ProfileEditFormData } from '../../components/compose/FormProfileEdit/FormProfileEdit'
import LangContext from '../../components/provider/LangProvider/LangContext'
import { DialogConfirmProps } from '../../components/base/Dialog/DialogConfirm/DialogConfirm'
import UserContext from "../../components/provider/UserProvider/UserContext";


function ProfileEdit() {
    const [css] = useStyletron()
    const navigate = useNavigate()
    const [profile, setProfile] = useState<Profile | null>(null)
    const [newProfile, setNewProfile] = useState<Profile | null>(null)
    const {username} = useParams()
    const { showLoading, showToast, openConfirmDialog } = useContext(DialogsContext)
    const { lang } = useContext(LangContext)
    const form = createRef<ProfileEditFormData>()
    const { user, setUser } = useContext(UserContext)

    useEffect(() => {
        const unload = showLoading()
        const getProfile = async () => {
            if (!username) return
            try {
                const profile = await solas.getProfile({
                    username
                })

                setNewProfile(profile)
                setProfile(profile)
                unload()
            } catch (e: any) {
                console.error('[getProfile]: ', e)
            }
        }
        getProfile()
    }, [])

    const saveProfile = async () => {
        console.log('form.current?.profile)', form.current?.profile)
        let twitter = form.current?.profile.twitter
        const unload = showLoading()

        try {
            console.log('new Profile', form.current?.profile)
            //
            // if (twitter && twitter !== profile?.twitter) {
            //     const updateTwitter = await solas.verifyTwitter({
            //         twitter_handle: twitter.replace('https://twitter.com/', '') || '',
            //         tweet_url: '',
            //         auth_token: user.authToken || ''
            //     })
            // }

            const update = await solas.updateProfile({
                data: form.current!.profile,
                auth_token: user.authToken || ''
            })

            showToast('Save Successfully')
            setUser({
                avatar: update.image_url,
                twitter: update.twitter,
                nickname: update.nickname,
            })
            navigate(`/profile/${user.userName}`)
        } catch (e) {
            console.error('[saveProfile]: ', e)
        } finally {
            unload()
        }
    }

    const SaveBtn = function () {
        return <AppButton
            onClick={ saveProfile }
            style={{width: '60px'}} inline kind={BTN_KIND.primary}
            special
            size={BTN_SIZE.mini} >
            {lang['Profile_Edit_Save']}
        </AppButton>
    }

    const handleBack = () => {
        const editedAvatar = form.current?.profile.image_url !== profile?.image_url
        const editTwitter = form.current?.profile.twitter !== profile?.twitter

        if ( editedAvatar || editTwitter) {
            const props: DialogConfirmProps = {
                confirmLabel: lang['Profile_Edit_Leave'],
                cancelLabel: lang['Profile_Edit_Cancel'],
                title: lang['Profile_Edit_Leave_Dialog_Title'],
                content: lang['Profile_Edit_Leave_Dialog_Des'],
                onConfirm: (close) => {
                    navigate(`/profile/${user.userName}`)
                    close()
                }
            }
            const dialog = openConfirmDialog(props)
        } else {
            navigate(`/profile/${user.userName}`)
        }
    }

    return (<Layout>
        <div className='edit-profile-page'>
            {!!newProfile &&
                <div className='edit-profile-page-wrapper'>
                    <PageBack
                        onClose={ handleBack }
                        title={lang['Profile_Edit_Title']}
                        menu={ SaveBtn }/>
                    <FormProfileEdit profile={ newProfile } onRef={ form }/>
                </div>
            }
        </div>
    </Layout>)
}

export default ProfileEdit
