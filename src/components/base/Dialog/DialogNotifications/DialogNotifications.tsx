import {useState, useContext, useEffect} from 'react'
import styles from  './DialogNotifications.module.scss'
import langContext from "@/components/provider/LangProvider/LangContext";
import PageBack from "@/components/base/PageBack";
import usePicture from "@/hooks/pictrue";
import Link from "next/link";
import AppButton from "@/components/base/AppButton/AppButton";
import BtnGroup from "@/components/base/BtnGroup/BtnGroup";

function NotificationItem () {
    const {defaultAvatar} = usePicture()
    const [compact, setCompact] = useState(true)

    return (<div className={`${styles['notification-item']} ${!compact ? styles['active'] : ''}`} onClick={e => {setCompact(!compact)}}>
            <a className={styles['notification-item-profile']}>
               <div className={styles['left']}>
                   <div className={styles['notification-item-profile-info']}>
                       <img className={styles['avatar']} src={defaultAvatar()} alt=""/>
                       {'zfdz'}
                   </div>
                   <div className={styles['notification-item-profile-time']}>12: 30</div>
               </div>
                <div className={styles['is-new']} />
            </a>
            { compact ?
                <div className={styles['notification-item-message']}>
                   <div>money apply to be a issuer.</div>
                   <div className={styles['result']}>Reject</div>
                </div>
                : <div className={styles['notification-item-message']}>
                    <div>
                        <div className={styles['text']}> money apply to be a issuer. Agree and put him/her into the issuer whitelist.
                            <br /><a className={styles['link']} href="http://solas.event.day/SIP 101">http://solas.event.day/SIP 101</a>
                        </div>
                        <BtnGroup>
                            <AppButton kind={'primary'}>Reject</AppButton>
                            <AppButton special>Agree</AppButton>
                        </BtnGroup>
                    </div>
                </div>
            }
        </div>
    )
}

function DialogNotifications(props: {close: () => any, notification: any[]}) {
    const [a, seta] = useState('')
    const {lang} = useContext(langContext)


    useEffect(() => {

    }, [])

    return (<div className={styles['dialog-notification']}>
            <div className={styles['center']}>
                <PageBack  title={lang['Notification_Title']} onClose={() => {props.close()}}/>
            </div>
            <div className={styles['notification-list']}>
                <NotificationItem />
                <NotificationItem />
            </div>
        </div> )
}

export default DialogNotifications
