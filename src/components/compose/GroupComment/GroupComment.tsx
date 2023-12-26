import {useContext, useEffect, useState} from 'react'
import {Comment, Group, queryComment, sendComment} from "@/service/solas";
import styles from './GroupComment.module.scss'
import userContext from "@/components/provider/UserProvider/UserContext";
import usePicture from "@/hooks/pictrue";
import {Textarea} from "baseui/textarea";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import AppButton from "@/components/base/AppButton/AppButton";
import Empty from "@/components/base/Empty";
import useTime from "@/hooks/formatTime";

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
            setComments([newComment, ...comments])
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
                        <AppButton className={styles['send-btn']}
                                   onClick={handleSendComment}
                                   disabled={busy}>
                            Send
                        </AppButton>
                    </div>
                </div>
            </div>
        }
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
