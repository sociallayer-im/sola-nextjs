import {useContext, useEffect, useState} from 'react'
import styles from './DialogNotifications.module.scss'
import langContext from "@/components/provider/LangProvider/LangContext";
import PageBack from "@/components/base/PageBack";
import usePicture from "@/hooks/pictrue";
import AppButton from "@/components/base/AppButton/AppButton";
import BtnGroup from "@/components/base/BtnGroup/BtnGroup";
import {acceptRequest, cancelInvite, Invite} from "@/service/solas";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import userContext from "@/components/provider/UserProvider/UserContext";
import Empty from "@/components/base/Empty";
import useTime from '@/hooks/formatTime'

function NotificationItem({invite, onAction}: { invite: Invite, onAction?: (invite_id: number) => any }) {
    const {defaultAvatar} = usePicture()
    const [compact, setCompact] = useState(true)
    const {openConfirmDialog, showLoading, showToast} = useContext(DialogsContext)
    const {user} = useContext(userContext)
    const formatTime = useTime()

    const formatMessage = (msg: string) => {
        // 通过正则匹配， 将msg中的https和http链接替换成<a>msg</a>

        const reg = /(https?:\/\/[^\s]+)/g
        return msg.replace(reg, '<a href="$1" target="_blank">$1</a>')
    }

    const handleAgree = async (invite_id: number) => {
        const unload = showLoading()
        await acceptRequest({
            group_invite_id: invite_id,
            auth_token: user.authToken || ''
        })
            .catch((e: any) => {
                if (e && e.message) {
                    unload()
                    showToast(e.message)
                }
            })

        unload()
        onAction && onAction(invite_id)
        showToast('Agreed')
    }

    const handleReject = (invite_id: number) => {
        openConfirmDialog({
            confirmBtnColor: 'red',
            confirmLabel: 'Reject',
            confirmTextColor: '#fff',
            title: 'Do you want to reject this application?',
            onConfirm: async (close: () => any) => {
                const unload = showLoading()
                await cancelInvite({
                    group_invite_id: invite_id,
                    auth_token: user.authToken || ''
                })
                    .catch((e: any) => {
                        if (e && e.message) {
                            unload()
                            showToast(e.message)
                        }
                    })

                showToast('Rejected')
                onAction && onAction(invite_id)
                unload()
                close()
            }
        })
    }

    return (<div className={`${styles['notification-item']} ${!compact ? styles['active'] : ''}`} onClick={e => {
            setCompact(!compact)
        }}>
            <a className={styles['notification-item-profile']}>
                <div className={styles['left']}>
                    <div className={styles['notification-item-profile-info']}>
                        <img className={styles['avatar']}
                             src={invite.receiver.image_url || defaultAvatar(invite.receiver.id)} alt=""/>
                        {invite.receiver.nickname || invite.receiver.username}
                    </div>
                    <div className={styles['notification-item-profile-time']}>{formatTime(invite.created_at)}</div>
                </div>
                <div className={styles['is-new']}/>
            </a>
            {compact ?
                <div className={styles['notification-item-message']}>
                    <div>{`${invite.receiver.nickname || invite.receiver.username} apply to be a ${invite.role}.`}</div>
                    <div className={styles['result']}></div>
                </div>
                : <div className={styles['notification-item-message']}>
                    <div>
                        <div
                            className={styles['text']}> {`${invite.receiver.nickname || invite.receiver.username}  apply to be a ${invite.role}. Agree and put him/her into the issuer whitelist.`}
                            <br/>
                            <span dangerouslySetInnerHTML={{__html: formatMessage(invite.message || '')}} />
                        </div>
                        <BtnGroup>
                            <AppButton size={'compact'} onClick={e => {
                                handleReject(invite.id)
                            }}>Reject</AppButton>
                            <AppButton size={'compact'} special
                                onClick={e => {
                                    handleAgree(invite.id)
                                }}
                            >Agree</AppButton>
                        </BtnGroup>
                    </div>
                </div>
            }
        </div>
    )
}

function DialogNotifications(props: { close: () => any, notification: any[] }) {
    const [a, seta] = useState('')
    const {lang} = useContext(langContext)
    const [list, setList] = useState<Invite[]>(props.notification)


    useEffect(() => {

    }, [])

    return (<div className={styles['dialog-notification']}>
        <div className={styles['center']}>
            <PageBack title={lang['Notification_Title']} onClose={() => {
                props.close()
            }}/>
        </div>
        <div className={styles['notification-list']}>
            { list.length === 0 && <Empty/>}
            {
                list.map((item, index) => {
                    return <NotificationItem key={index}
                                             onAction={(invite_id: number) => {
                                                    setList(list.filter(i => i.id !== invite_id))
                                             }}
                                             invite={item}/>
                })
            }
        </div>
    </div>)
}

export default DialogNotifications
