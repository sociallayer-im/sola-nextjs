import React, {useContext, useEffect, useState} from 'react'
import {Comment, Group, queryComment, sendComment, Event, CommentType} from "@/service/solas";
import styles from './EventComment.module.scss'
import userContext from "@/components/provider/UserProvider/UserContext";
import usePicture from "@/hooks/pictrue";
import {Textarea} from "baseui/textarea";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import AppButton from "@/components/base/AppButton/AppButton";
import Empty from "@/components/base/Empty";
import useTime from "@/hooks/formatTime";
import {Spinner} from "baseui/spinner";
import spinnerStyles from "@/components/compose/ListNftAsset/ListNftAsset.module.sass";
import {wsClient} from "@/components/base/Subscriber";
import fetch from "@/utils/fetch";

let subscription: any = null

function EventComment(props: { event: Event }) {
    const {user} = useContext(userContext)
    const {defaultAvatar} = usePicture()
    const formatTime = useTime()
    const {showToast} = useContext(DialogsContext)

    const [comments, setComments] = useState<CommentType[]>([])
    const [comment, setComment] = useState('')
    const [busy, setBusy] = useState(false)
    const [ready, setReady] = useState(false)
    const [page, setPage] = useState(1)
    const [loadAll, setLoadAll] = useState(true)
    const [empty, setEmpty] = useState(false)

    const handleSendComment = async () => {
        if (!comment || busy) {
            return
        }

        setBusy(true)
        const newComment = await fetch.post({
            url: `${process.env.NEXT_PUBLIC_EVENT_LIST_API}/comment/create`,
            data: {
                auth_token: user.authToken || '',
                comment_type:'comment',
                item_type: 'Event',
                item_id: props.event.id,
                content_type: 'text/plain',
                content: comment
            }
        })
            .catch(e => {
                console.log(e)
                showToast('Failed to send message')
            })

        if (newComment) {
            // setComments([newComment, ...comments])
            await getComments()
            setComment('')
            showToast('Message sent')
        }
        setBusy(false)
    }

    const getComments = async () => {
        setBusy(true)
        const res = await fetch.post({
            url: `${process.env.NEXT_PUBLIC_EVENT_LIST_API}/comment/index`,
            data: {
                comment_type:'comment',
                item_type: 'Event',
                item_id: props.event.id,
            }
        })
        setComments(res.data.comments)
        setBusy(false)
        setReady(true)
    }


    useEffect(() => {
        getComments()

        const interval = setInterval(async () => {
            await getComments();
        }, 5000);

        return () => clearInterval(interval);
    }, [page])

    return (<div className={styles['group-comment']}>
        {user.userName &&
            <div className={styles['input']}>
                <img src={user.avatar || defaultAvatar(user.id)} alt=""/>
                <div className={comment.length ? styles['wrapper-active'] : styles['wrapper']}>
                    <Textarea value={comment}
                              onKeyUp={e => {
                                  if (e.keyCode === 13 && !e.shiftKey) {
                                      (e.target as any).blur()
                                      handleSendComment()
                                  }
                              }}
                              placeholder={'Write a message...'}
                              maxLength={1000}
                              onChange={e => {
                                  setComment(e.target.value)
                              }}></Textarea>
                    <div>
                        <AppButton
                            onClick={() => {
                                handleSendComment()
                            }}
                            disabled={busy}>
                            Send
                        </AppButton>
                    </div>
                </div>
            </div>
        }

        {!ready && <Spinner className={spinnerStyles.spinner} $color={'#98f6db'}/>}
        {comments.length === 0 && ready && <Empty/>}
        <div className={styles['comment-list']}>
            {
                comments.map((comment, index) => {

                    return <div key={index} className={styles['comment-item']}>
                        <div className={styles['info']}>
                            <img src={comment.profile.image_url || defaultAvatar(comment.profile.id)} alt=""/>
                            <div className={styles['name']}>{comment.profile.nickname || comment.profile.username}</div>
                            {!!comment.created_at &&
                                <div className={styles['create-time']}>{formatTime(comment.created_at)}</div>
                            }
                        </div>
                        <div className={styles['content']}>
                            {comment.content}
                        </div>
                    </div>
                })
            }
        </div>
        {!loadAll && comments.length > 0 &&
            <div className={styles['action']}>
                <AppButton disabled={busy} onClick={e => {
                    setPage(page + 1)
                }}>{'Load more'}</AppButton>
            </div>
        }
    </div>)
}

export default EventComment
