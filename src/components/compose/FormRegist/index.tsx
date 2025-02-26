import { useContext, useEffect, useState } from 'react'
import langContext from '../../provider/LangProvider/LangContext'
import AppInput from '../../base/AppInput'
import AppButton from '../../base/AppButton/AppButton'
import { KIND } from 'baseui/button'
import { useStyletron } from 'baseui'
import solas from '../../../service/solas'
import useVerify from '../../../hooks/verify'
import DialogsContext from '../../provider/DialogProvider/DialogsContext'
import UserContext from '../../provider/UserProvider/UserContext'

export interface RegistFormProps {
    onConfirm: (domain: string) => any
}

function RegistForm (props: RegistFormProps) {
    const [domain, setDomain] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { lang } = useContext(langContext)
    const [css] = useStyletron()
    const { verifyDomain, checkDomainInput} = useVerify()
    const { openDomainConfirmDialog, showLoading, showToast } = useContext(DialogsContext)
    const { user, setUser } = useContext(UserContext)

    useEffect(() => {
        if (!domain) {
            setError('')
            return
        }

        const errorMsg = verifyDomain(domain)
        setError(errorMsg || '')
    }, [domain])

    const handleUpdateDomain = (e: any) => {
        if (checkDomainInput(e.target.value)) {
            setDomain(e.target.value.toLowerCase().trim())
        }
    }

    const showConfirm = () => {
        if (!domain || error) return

        const props = {
            title: lang['Regist_Dialog_Title'],
            confirmLabel: lang['Regist_Dialog_Create'],
            cancelLabel: lang['Regist_Dialog_ModifyIt'],
            onConfirm: async (close: any) => { close(); await createProfile() },
            content: () => <div className='confirm-domain'><span>{domain}</span></div>
        }

        openDomainConfirmDialog(props)
    }

    const createProfile = async () => {
        if (!user.authToken) return
        const unload = showLoading()
        setLoading(true)
        try {
            const create = await solas.regist({
                username: domain.toLowerCase().trim(),
                auth_token: user.authToken
            })

            const newProfile = await solas.getProfile({
                username: domain.toLowerCase().trim(),
            })

            unload()
            setUser({
                domain: newProfile!.domain,
                userName: newProfile!.username,
            })

            console.log('------------create profile ------------')
            console.log('create', create)
            setLoading(false)
            showToast('Create Success')
        } catch (e: any) {
            unload()
            console.log('[createProfile]: ', e)
            setLoading(false)
            showToast(e.message || 'Create profile fail')
        }
    }

    return <>
        <AppInput
            clearable={ true }
            errorMsg={ error }
            value={ domain }
            readOnly = { loading }
            onChange={ handleUpdateDomain }
            placeholder={ lang['Regist_Profile_Input_Placeholder'] } />
        <div className={css({ marginTop: '34px' })}>
            <AppButton
                onClick={ async () => { await showConfirm() } }
                kind={ KIND.primary }
                isLoading={ loading }>
                { lang['Regist_Confirm'] }
            </AppButton>
        </div>
    </>
}

export default RegistForm
