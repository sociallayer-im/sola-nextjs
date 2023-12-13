import {useState, useContext, useEffect} from 'react'
import styles from  './DialogRequestTobeIssuer.module.scss'
import langContext from "@/components/provider/LangProvider/LangContext";
import AppInput from "@/components/base/AppInput";
import AppButton from "@/components/base/AppButton/AppButton";

function DialogRequestTobeIssuer({close}: {close: () => any}){
    const [message, setMessage] = useState('')
    const {lang} = useContext(langContext)

    useEffect(() => {

    }, [])

    return (<div className={styles['dialog-request-tobe-issuer']}>
        <div className={styles['title']}>{lang['Seedao_Request_Issuer_Dialog_Title']}</div>
        <div className={styles['message']}>
            {lang['Seedao_Request_Issuer_Dialog_Message']}
        </div>
       <div className={styles['input']}>
           <AppInput placeholder={lang['Seedao_Request_Issuer_Dialog_Message']} value={message} onChange={e => {setMessage(e.target.value)}} />
       </div>
        <div className={'btn-group'}>
            <AppButton onClick={e => {close()}}>{lang['Profile_Edit_Cancel']}</AppButton>
            <AppButton special>{lang['Seedao_Request_Issuer_Dialog_Apply']}</AppButton>
        </div>
    </div>)
}

export default DialogRequestTobeIssuer
