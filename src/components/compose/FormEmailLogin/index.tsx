import { useContext, useState } from 'react'
import langContext from '../../provider/LangProvider/LangContext'
import AppInput from '../../base/AppInput'
import AppButton from '../../base/AppButton/AppButton'
import { KIND } from 'baseui/button'
import { useStyletron } from 'baseui'
import solas from '../../../service/solas'
import DialogsContext from '../../provider/DialogProvider/DialogsContext'

export interface EmailLoginFormProps {
    onConfirm: (email: string) => any,
    type?: 'login' | 'binding'
}

function EmailLoginForm (props: EmailLoginFormProps) {
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const { lang } = useContext(langContext)
    const { showLoading, showToast } = useContext(DialogsContext)
    const [css] = useStyletron()

    const verifyAndSetEmail = (value: string) => {
        const valid = value && value.includes('@') && value.includes('.')
        setError(valid ? '' : 'Invalid email address')
        return valid
    }

    const sendEmail  = async () => {
        const isValid = verifyAndSetEmail(email)
        if (!isValid) return

        const unload = showLoading()
        try {
            if (props.type === 'binding') {
                const checkProfile = await solas.getProfile({email: email.trim()})
                if (checkProfile) {
                    unload()
                    setError('Email has been bound, Please use another email')
                    return
                }
            }

            const requestEmailLoginCode = await solas.requestEmailCode(email.trim())
            props.onConfirm(email)
            unload()
        } catch (e: any) {
            unload()
            console.log('[sendEmail]: ', e)
            showToast(e.message || 'Send email fail')
        }
    }

    return <>
        <AppInput
            clearable={ true }
            errorMsg={ error }
            value={email}
            onChange={ (e) => { setError('');setEmail(e.target.value.toLowerCase()) } }
            placeholder={ lang['Login_Placeholder'] }></AppInput>
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
