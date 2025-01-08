import { useContext, useEffect, useState } from 'react'
import langContext from '../../provider/LangProvider/LangContext'
import AppInput from '../../base/AppInput'
import AppButton from '../../base/AppButton/AppButton'
import { KIND } from 'baseui/button'
import { useStyletron } from 'baseui'
import solas, {createGroup} from '../../../service/solas'
import useVerify from '../../../hooks/verify'
import DialogsContext from '../../provider/DialogProvider/DialogsContext'
import UserContext from '../../provider/UserProvider/UserContext'
import useEvent, { EVENT } from '../../../hooks/globalEvent'
import {useRouter} from 'next/navigation'

export interface RegistFormProps {
    onConfirm: (domain: string) => any
}

function RegistForm (props: RegistFormProps) {
    const [domain, setDomain] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { lang } = useContext(langContext)
    const [css] = useStyletron()
    const { verifyDomain, checkDomainInput } = useVerify()
    const { openDomainConfirmDialog, showLoading, showToast } = useContext(DialogsContext)
    const { user } = useContext(UserContext)
    const router = useRouter()

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
            title: lang['Group_regist_confirm_dialog'],
            confirmLabel: lang['Regist_Dialog_Create'],
            cancelLabel: lang['Regist_Dialog_ModifyIt'],
            onConfirm: (close: any) => { close(); createGroup() },
            content: () => <div className='confirm-domain'><span>{domain}</span></div>
        }

        openDomainConfirmDialog(props)
    }

    const createGroup = async () => {
        if (!user.authToken) return
        const unload = showLoading()
        setLoading(true)
        try {
            const newGroup = await solas.createGroup({
                username: domain.toLowerCase().trim(),
                auth_token: user.authToken
            })

            unload()
            setLoading(false)
            showToast('Create Success')

            router.push( `/group/${newGroup.username}`)
        } catch (e: any) {
            unload()
            console.log('[createGroup]: ', e)
            setLoading(false)
            showToast(e.message || 'Create group fail')
        }
    }


    return <>
        <AppInput
            clearable={ true }
            errorMsg={ error }
            value={ domain }
            readOnly = { loading }
            onChange={ handleUpdateDomain }
            placeholder={ lang['Regist_Input_Placeholder'] } />
        <div className={css({ marginTop: '34px' })}>
            <AppButton
                onClick={ () => { showConfirm() } }
                kind={ KIND.primary }
                isLoading={ loading }>
                { lang['Regist_Confirm'] }
            </AppButton>
        </div>
    </>
}

export default RegistForm
