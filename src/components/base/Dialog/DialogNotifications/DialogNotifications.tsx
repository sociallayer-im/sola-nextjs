import {useContext, useEffect, useRef, useState} from 'react'
import styles from './DialogNotifications.module.scss'
import langContext from "@/components/provider/LangProvider/LangContext";
import PageBack from "@/components/base/PageBack";
import usePicture from "@/hooks/pictrue";
import AppButton from "@/components/base/AppButton/AppButton";
import BtnGroup from "@/components/base/BtnGroup/BtnGroup";
import {
    acceptRequest,
    Activity,
    cancelInvite,
    Invite,
    queryActivities,
    queryVoucherDetail,
    setActivityRead
} from "@/service/solas";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import userContext from "@/components/provider/UserProvider/UserContext";
import Empty from "@/components/base/Empty";
import useTime from '@/hooks/formatTime'

function RequestItem({invite, onAction}: { invite: Invite, onAction?: (invite_id: number) => any }) {
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
                try {
                    await cancelInvite({
                        group_invite_id: invite_id,
                        auth_token: user.authToken || ''
                    })
                    showToast('Rejected')
                    onAction && onAction(invite_id)
                    unload()
                    close()
                } catch (e: any) {
                    showToast(e.message)
                    unload()
                }
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
                            <span dangerouslySetInnerHTML={{__html: formatMessage(invite.message || '')}}/>
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

function ActivityItem({activity}: { activity: Activity }) {
    const {defaultAvatar} = usePicture()
    const {showLoading, showToast, showVoucher} = useContext(DialogsContext)
    const {user} = useContext(userContext)
    const formatTime = useTime()
    const {lang} = useContext(langContext)
    const [hasRead, setHasRead] = useState(activity.has_read)


    const handleRead = async () => {
        const unload = showLoading()
        try {
            if (!activity.has_read) {
                await setActivityRead({ids: [activity.id], auth_token: user.authToken || ''})
                setHasRead(true)
            }

            if (activity.action === 'voucher/send_badge' && activity.data) {
                const voucher = await queryVoucherDetail(Number(activity.data.split(':')[1]))
                if (voucher) {
                    showVoucher(voucher, undefined, false)
                }
            }
        } finally {
            unload()
        }

    }

    const msg = activity.action === 'voucher/send_badge' ? lang['Send_You_A_Badge'] : ''
    return (<div className={`${styles['notification-item']}`} onClick={e => {
            handleRead()
        }}>
            <a className={styles['notification-item-profile']}>
                <div className={styles['left']}>
                    <div className={styles['notification-item-profile-info']}>
                        <img className={styles['avatar']}
                             src={activity.initiator.image_url || defaultAvatar(activity.initiator.id)} alt=""/>
                        {activity.initiator.nickname || activity.initiator.username}
                    </div>
                    <div className={styles['notification-item-profile-time']}>{formatTime(activity.created_at)}</div>
                </div>
                {
                    hasRead ? null : <div className={styles['is-new']}/>
                }
            </a>
            <div className={styles['notification-item-message']}>
                <div>{`${activity.initiator.nickname || activity.initiator.username} ${msg}`}</div>
                <div className={styles['result']}></div>
            </div>
        </div>
    )
}

function DialogNotifications(props: { close: () => any, newRequestList: any[], newActivities: Activity[] }) {
    const {user} = useContext(userContext)

    const {lang} = useContext(langContext)
    const [list, setList] = useState<Invite[]>(props.newRequestList)
    const {showLoading} = useContext(DialogsContext)
    const [readActivity, setReadActivity] = useState<Activity[]>([])
    const [ready, setReady] = useState(false)
    const [loadAll, setLoadAll] = useState(true)
    const [page, setPage] = useState(1)
    const pageSize = 10


    useEffect(() => {
        const unload = showLoading()

        if (!user.id) {
            setReadActivity([])
            unload()
            setReady(true)
            setLoadAll(true)
        } else {
            queryActivities(
                {
                    receiver_id: user.id!,
                    page_size: pageSize,
                    page: page,
                    has_read: true
                },
            )
                .then((res: Activity[]) => {
                    setLoadAll(res.length < pageSize)
                    setReadActivity(res)
                    unload()
                }).finally(() => {
                setReady(true)
                unload()
            })
        }
    }, [user.id])

    useEffect(() => {
        if (page > 1) {
            const unload = showLoading()
            queryActivities(
                {
                    receiver_id: user.id!,
                    page_size: pageSize,
                    page: page,
                    has_read: true
                },
            )
                .then((res: Activity[]) => {
                    setLoadAll(res.length < pageSize)
                    setReadActivity([...readActivity, ...res])
                    unload()
                }).finally(() => {
                setReady(true)
                unload()
            })
        }
    }, [page])

    return (<div className={styles['dialog-notification']}>
        <div className={styles['center']}>
            <PageBack title={lang['Notification_Title']} onClose={() => {
                props.close()
            }}/>
        </div>
        <div className={styles['notification-list']}>
            { ready &&
                <>
                    {list.length === 0 && props.newActivities.length === 0 && readActivity.length === 0 && <Empty/>}
                    {
                        list.map((item, index) => {
                            return <RequestItem key={index}
                                                onAction={(invite_id: number) => {
                                                    setList(list.filter(i => i.id !== invite_id))
                                                }}
                                                invite={item}/>
                        })
                    }
                    {
                        props.newActivities.map((item, index) => {
                            return <ActivityItem key={index} activity={item}/>
                        })
                    }
                    {
                        readActivity.map((item, index) => {
                            return <ActivityItem key={index} activity={item}/>
                        })
                    }

                    { !loadAll &&
                        <div className={styles['action']}>
                            <AppButton onClick={() => {setPage(page + 1)}}>Load more</AppButton>
                        </div>
                    }
                </>
            }
        </div>
    </div>)
}

export default DialogNotifications
