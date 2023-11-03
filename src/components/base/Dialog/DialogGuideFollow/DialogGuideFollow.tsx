import {useContext, useEffect, useRef, useState} from 'react'
import {follow, Profile} from "@/service/solas";
import styles from './DialogGuideFollow.module.scss'
import usePicture from "@/hooks/pictrue";
import AppButton from "@/components/base/AppButton/AppButton";
import useEvent, {EVENT} from "@/hooks/globalEvent";
import userContext from "@/components/provider/UserProvider/UserContext";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";

function DialogGuideFollow() {
    const [newProfile, _] = useEvent(EVENT.showFollowGuide)
    const {showLoading, showToast} = useContext(DialogsContext)
    const {user} = useContext(userContext)
    const {defaultAvatar} = usePicture()


    const [profile, setProfile] = useState<Profile | null>(null)
    const [show, setShow] = useState(false)

    const timeOut = useRef<any>(null)

    const handleFollow = async () => {
        const unload = showLoading()
        try {
            const res = await follow({
                target_id: profile!.id,
                auth_token: user.authToken || ''
            })
            unload()
            showToast('Followed')
            if (timeOut.current) {
                clearTimeout(timeOut.current)
            }
            setShow(false)
        } catch (e: any) {
            unload()
            console.log('[handleFollow]: ', e)
            showToast(e.message || 'Follow fail')
        }
    }


    useEffect(() => {
        if (newProfile) {
            setProfile(newProfile)
            setShow(true)
            timeOut.current = setTimeout(() => {
                setShow(false)
            }, 7000)

            return () => {
                clearTimeout(timeOut.current)
            }
        }
    }, [newProfile])

    return (<>
        {show &&
            <div className={styles['dialog-guide-follow']}>
                <div className={styles['info']}>
                    <div className={styles['user']}>
                        <img className={styles['avatar']} src={profile?.image_url || defaultAvatar()} alt=""/>
                        <span className={styles['name']}>{profile?.nickname || profile?.username}</span>
                    </div>
                    <AppButton onClick={handleFollow} special size={'mini'} style={{width: '70px'}}>Follow</AppButton>
                </div>
                <div className={styles['des']}>Follow the creator of this marker, you can see what he‘s/she’s
                    participating in.
                </div>
            </div>
        }
    </>)
}

export default DialogGuideFollow
