import EmailLoginForm from '@/components/compose/FormEmailLogin'
import CodeInputForm from '@/components/compose/FormCodeInput'
import LangContext from '@/components/provider/LangProvider/LangContext'
import {useContext, useEffect, useState} from 'react'
import UserContext from '@/components/provider/UserProvider/UserContext'
import { setAuth } from '@/utils/authStorage'
import usePageHeight from '@/hooks/pageHeight'
import PageBack from "@/components/base/PageBack";
import {useRouter} from 'next/navigation'
import {LoginRes} from '@/service/solas'

function Login () {
    const { lang } = useContext(LangContext)
    const [loginEmail, setLoginEmail] = useState('')
    const { user, emailLogin } = useContext(UserContext)
    const { heightWithoutNav } = usePageHeight()
    const router = useRouter()

    const setEmailAuth = async (loginRes: LoginRes) => {
        window.localStorage.setItem('lastLoginType', 'email')
        setAuth(loginRes.email, loginRes.auth_token)

        await emailLogin()
    }

    useEffect(() => {
        if (user.domain) {
            const fallBack = window.localStorage.getItem('fallback')

            if (fallBack) {
                const path = fallBack.replace(window.location.origin, '')
                window.localStorage.removeItem('fallback')
                router.push(path)
            } else {
                router.push(`/profile/${user.userName}`)
            }
        }
    }, [user.domain])

    return <div className='login-page'>
        <div className={'login-page-back'}><PageBack onClose={() => {router.push('/')}} /></div>
        <div className='login-page-bg'></div>
        <div className='login-page-wrapper' style={{height: `${heightWithoutNav}px`}}>
            { !loginEmail ?
                <div className='login-page-content' >
                    <div className='title'>{ lang['Login_Title'] }</div>
                    <div className='des'>{ lang['Login_alert'] }</div>
                    <EmailLoginForm onConfirm={(email) => { setLoginEmail(email)} } />
                </div>
                :
                <div className='login-page-content code' >
                    <div className='title'>{ lang['Login_input_Code_title'] }</div>
                    <div className='des'>{ lang['Login_input_Code_des']([loginEmail]) }</div>
                    <CodeInputForm
                        loginType={'email'}
                        loginAccount={ loginEmail } onConfirm={(loginRes) => { setEmailAuth(loginRes) } } />
                </div>
            }
        </div>
    </div>
}

export default Login
