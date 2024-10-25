import styles from './DialogFeedback.module.scss'
import AppTextArea from "@/components/base/AppTextArea/AppTextArea";
import {useState, useContext} from "react";
import AppButton from "@/components/base/AppButton/AppButton";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import {sendEventFeedback} from "@/service/solasv2";
import userContext from "@/components/provider/UserProvider/UserContext";

export default function DialogFeedback(props: {close: ()=> void, event_id: number}) {
    const [feedback, setFeedback] = useState<string>('')
    const {showToast, showLoading, openConnectWalletDialog} = useContext(DialogsContext)
    const {user} = useContext(userContext)

    const handleSend = async ()=> {
       if (!user.authToken) {
            openConnectWalletDialog()
            return
       }

        const unload = showLoading()
        await sendEventFeedback({
            event_id: props.event_id,
            content: feedback,
            auth_token: user.authToken!,
        })
        unload()
        showToast('Feedback sent')
        props.close()
    }

    return (
        <div className={styles['dialog']}>
            <div className={styles['title']}>Feedback</div>
            <AppTextArea placeholder={'Input your feedback for this event'} value={feedback} onChange={e => setFeedback(e.target.value)} />
            <div className={styles['btns']}>
                <AppButton special size={'compact'} onClick={handleSend}>
                    {'Send'}
                </AppButton>
            </div>
        </div>
    )
}
