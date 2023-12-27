import React, {useContext, useEffect, useState} from 'react'
import {Comment, Group, queryComment, sendComment} from "@/service/solas";
import styles from './GroupComment.module.scss'
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

let subscription: any = null

function GroupComment(props: { group: Group }) {
    const {user} = useContext(userContext)
    const {defaultAvatar} = usePicture()
    const formatTime = useTime()
    const {showToast} = useContext(DialogsContext)

    const [comments, setComments] = useState<Comment[]>([])
    const [comment, setComment] = useState('')
    const [busy, setBusy] = useState(false)
    const [ready, setReady] = useState(false)

    const handleSendComment = async () => {
        if (!comment) {
            return
        }

        setBusy(true)
        const newComment = await sendComment({
            auth_token: user.authToken || '',
            type: 'group',
            target: props.group.id,
            content: comment
        })
            .catch(e => {
                console.log(e)
                showToast('Failed to send comment')
            })

        if (newComment) {
            // setComments([newComment, ...comments])
            setComment('')
            showToast('Comment sent')
        }
        setBusy(false)
    }


    useEffect(() => {
        queryComment({target: props.group.id, page: 1}).then(res => {
            setComments(res)
            setReady(true)
        }).catch(e => {
            setReady(true)
        })
    }, [])


    useEffect(() => {
        if (!ready) {
            return
        }

        subscription = wsClient.subscribe({
            query: `subscription {chat_messages(
                order_by: {created_at: desc}
                where: {topic_item_id: {_eq: ${props.group.id}}}
                limit: 5
              ) {
                    id
                    content
                    created_at
                    topic_item_id
                    topic_item_type
                    sender_id
                    sender {
                        id
                        nickname
                        username
                        image_url
                        }
                }
        }`
        }, {
            next: (comment1: any) => {
                console.log('subscription comment: ', comment1)
                if (comment1.data.chat_messages || comment1.data.chat_messages.length) {
                    const newMessages: any = []
                    comment1.data.chat_messages.forEach((target: any) => {
                        if (!comments.find((c: any) => c.id === target.id)) {
                            console.log(target)
                            newMessages.push(target)
                        }
                    })

                    if (newMessages.length) {
                        setComments([...newMessages, ...comments])
                    }
                }
            },
            error: (error) => {
            },
            complete: () => {
            },
        })

        return () => {
            if (subscription) {
                subscription = null
            }
        }
    }, [ready])

    return (<div className={styles['group-comment']}>
        {user.userName &&
            <div className={styles['input']}>
                <img src={user.avatar || defaultAvatar(user.id)} alt=""/>
                <div className={comment.length ? styles['wrapper-active'] : styles['wrapper']}>
                    <Textarea value={comment}
                              placeholder={'Write a comment...'}
                              maxLength={1000}
                              onChange={e => {
                                  setComment(e.target.value)
                              }}></Textarea>
                    <div>
                        <AppButton
                            onClick={handleSendComment}
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
                            <img src={comment.sender.image_url || defaultAvatar(comment.sender.id)} alt=""/>
                            <div className={styles['name']}>{comment.sender.nickname || comment.sender.username}</div>
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
    </div>)
}

export default GroupComment