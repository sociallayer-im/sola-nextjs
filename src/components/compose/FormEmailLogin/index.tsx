import { useContext, useState } from 'react'
import langContext from '../../provider/LangProvider/LangContext'
import AppInput from '../../base/AppInput'
import AppButton from '../../base/AppButton/AppButton'
import { KIND } from 'baseui/button'
import { useStyletron } from 'baseui'
import {requestPhoneCode, requestEmailCode, getProfile} from '@/service/solas'
import DialogsContext from '../../provider/DialogProvider/DialogsContext'

export interface EmailLoginFormProps {
    onConfirm: (email: string) => any
    inputType?: 'email' | 'phone' | 'binding'
}

function EmailLoginForm (props: EmailLoginFormProps) {
    const [account, setAccount] = useState('')
    const [error, setError] = useState('')
    const { lang } = useContext(langContext)
    const {showLoading, showToast } = useContext(DialogsContext)
    const [css] = useStyletron()

    const handleChange = (value: string) => {
        setError('')
        setAccount(value)
    }

    const sendEmail  = async () => {
        let requestFc: any = null

        if (props.inputType === 'binding') {
            const unload = showLoading()
            try {
                const checkProfile = await getProfile({email: account.trim()})
                if (checkProfile) {
                    unload()
                    setError('Email has been bound, Please use another email')
                    return
                }
                const requestEmailLoginCode = await requestEmailCode(account.trim())
                props.onConfirm(account)
                unload()
            } catch (e: any) {
                unload()
                console.log('[sendEmail]: ', e)
                showToast(e.message || 'Send email fail')
            }
            return
        }

        if (props.inputType !== 'phone') {
            if (!account && account.includes('@') && account.includes('.')) {
                setError('Invalid email address')
                return
            }
            requestFc = requestEmailCode
        } else {
            if (!account.match(/^\d{11}$/)) {
                setError('Invalid phone number')
                return
            }
            requestFc = requestPhoneCode
        }

        const unload = showLoading()
        try {
            const requestEmailLoginCode = await requestFc(account)
            props.onConfirm(account)
            unload()
        } catch (e: any) {
            unload()
            console.log('[sendEmail]: ', e)
            showToast(e.message || 'Send code fail')
        }
    }

    return <>
        <AppInput
            clearable={ true }
            errorMsg={ error }
            value={account}
            onChange={ (e) => { handleChange(e.target.value.toLowerCase()) } }
            placeholder={ props.inputType === 'phone' ? lang['Login_Phone_Placeholder'] : lang['Login_Placeholder'] }></AppInput>
        <div className={css({ marginTop: '34px' })}>
            <AppButton
                onClick={ sendEmail }
                kind={ KIND.primary }>
                { lang['Login_continue'] }
            </AppButton>
        </div>
    </>
}

export default EmailLoginForm
