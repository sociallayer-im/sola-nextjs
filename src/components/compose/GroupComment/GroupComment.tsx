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
    const [page, setPage] = useState(1)
    const [loadAll, setLoadAll] = useState(false)
    const [empty, setEmpty] = useState(false)

    const handleSendComment = async () => {
        if (!comment || busy) {
            return
        }

        setBusy(true)
        const newComment = await sendComment({
            auth_token: user.authToken || '',
            type: 'Group',
            target: props.group.id,
            content: comment
        })
            .catch(e => {
                console.log(e)
                showToast('Failed to send message')
            })

        if (newComment) {
            // setComments([newComment, ...comments])
            setComment('')
            showToast('Message sent')
        }
        setBusy(false)
    }


    useEffect(() => {
        setBusy(true)
        queryComment({target: props.group.id, page: page}).then(res => {
            setComments([...comments, ...res])
            setReady(true)
            setBusy(false)
            if (res.length < 10) {
                setLoadAll(true)
            }

            if (res.length === 0 && page === 1) {
                setEmpty(true)
            }
        }).catch(e => {
            setBusy(false)
            setReady(true)
        })
    }, [page])


    useEffect(() => {
        if (!ready) {
            return
        }

        subscription = wsClient.subscribe({
            query: `subscription {chat_messages(
                order_by: {created_at: desc}
                where: {topic_item_id: {_eq: ${props.group.id}}, topic_item_type: {_eq: "Group"}}
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
                console.error(error)
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
        {!loadAll && comments.length > 0 &&
            <div className={styles['action']}>
                <AppButton disabled={busy} onClick={e => {
                    setPage(page + 1)
                }}>{'Load more'}</AppButton>
            </div>
        }
    </div>)
}

export default GroupComment
