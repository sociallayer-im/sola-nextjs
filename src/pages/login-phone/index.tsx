import EmailLoginForm from '../../components/compose/FormEmailLogin'
import CodeInputForm from '../../components/compose/FormCodeInput'
import LangContext from '../../components/provider/LangProvider/LangContext'
import {useContext, useEffect, useState} from 'react'
import { LoginRes } from '@/service/solas'
import UserContext from '../../components/provider/UserProvider/UserContext'
import { setAuth } from '@/utils/authStorage'
import { useRouter } from 'next/router'
import usePageHeight from '../../hooks/pageHeight'
import PageBack from "../../components/base/PageBack";

function Login () {
    const { lang } = useContext(LangContext)
    const [loginPhone, setLoginPhone] = useState('')
    const {user, phoneLogin } = useContext(UserContext)
    const router = useRouter()
    const { heightWithoutNav } = usePageHeight()

    const setPhoneAuth = async (loginRes: LoginRes) => {
        window.localStorage.setItem('lastLoginType', 'phone')
        setAuth(loginRes.phone!, loginRes.auth_token)
        await phoneLogin()
    }

    useEffect(() => {
        if (user.domain) {
            const fallBack = window.localStorage.getItem('fallback')

            if (fallBack) {
                const path = fallBack.replace(window.location.origin, '')
                window.localStorage.removeItem('fallback')
                router.replace(path)
            } else {
                router.push(`/`)
            }
        }
    }, [user.domain])

    return <>
        <div className='login-page'>
            <div className={'login-page-back'}><PageBack onClose={() => {router.push('/')}} /></div>
            <div className='login-page-bg'></div>
            <div className='login-page-wrapper' style={{height: `${heightWithoutNav}px`}}>
                { !loginPhone ?
                    <div className='login-page-content' >
                        <div className='title'>{ lang['Login_Phone_Title'] }</div>
                        <div className='des'>{ lang['Login_Phone_alert'] }</div>
                        <EmailLoginForm inputType="phone" onConfirm={(phone) => { setLoginPhone(phone)} } />
                    </div>
                    :
                    <div className='login-page-content' >
                        <div className='title'>{ lang['Login_Phone_input_Code_title'] }</div>
                        <div className='des'>{ lang['Login_Phone_input_Code_des']([loginPhone]) }</div>
                        <CodeInputForm
                            loginType={'phone'}
                            loginAccount={ loginPhone } onConfirm={(loginRes) => { setPhoneAuth(loginRes) } } />
                    </div>
                }
            </div>
        </div>
    </>
}

export default Login
