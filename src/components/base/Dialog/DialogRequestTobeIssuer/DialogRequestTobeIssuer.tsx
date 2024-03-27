import {useContext, useEffect, useState} from 'react'
import styles from './DialogRequestTobeIssuer.module.scss'
import langContext from "@/components/provider/LangProvider/LangContext";
import AppInput from "@/components/base/AppInput";
import AppButton from "@/components/base/AppButton/AppButton";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import {requestToBeIssuer} from "@/service/solas";
import userContext from "@/components/provider/UserProvider/UserContext";

function DialogRequestTobeIssuer({close, group_id}: { close: () => any, group_id: number }) {
    const [message, setMessage] = useState('')
    const {lang} = useContext(langContext)
    const {showToast, showLoading} = useContext(DialogsContext)
    const {user} = useContext(userContext)

    useEffect(() => {

    }, [])

    const handleApply = async () => {
        const unload = showLoading()
        try {
            const request = await requestToBeIssuer({
                auth_token: user.authToken || '',
                role: 'issuer',
                message: message,
                group_id: group_id
            })
            showToast('Apply Success')
            unload()
            close()
        } catch (e:any) {
            showToast(e.message)
            unload()
        }
    }

    return (<div className={styles['dialog-request-tobe-issuer']}>
        <div className={styles['title']}>{lang['Seedao_Request_Issuer_Dialog_Title']}</div>
        <div className={styles['message']}>
            {lang['Seedao_Request_Issuer_Dialog_Message']}
        </div>
        <div className={styles['input']}>
            <AppInput placeholder={lang['Seedao_Request_Issuer_Dialog_Message']} value={message} onChange={e => {
                setMessage(e.target.value)
            }}/>
        </div>
        <div className={'btn-group'}>
            <AppButton onClick={e => {
                close()
            }}>{lang['Profile_Edit_Cancel']}</AppButton>
            <AppButton onClick={e => {
                handleApply()
            }} special>{lang['Seedao_Request_Issuer_Dialog_Apply']}</AppButton>
        </div>
    </div>)
}

export default DialogRequestTobeIssuer
