import EmailLoginForm from '@/components/compose/FormEmailLogin'
import CodeInputForm from '@/components/compose/FormCodeInput'
import LangContext from '@/components/provider/LangProvider/LangContext'
import {useContext, useState} from 'react'
import usePageHeight from '@/hooks/pageHeight'
import PageBack from "@/components/base/PageBack";
import {useRouter, useSearchParams} from "next/navigation";

function BindEmail() {
    const {lang} = useContext(LangContext)
    const [loginEmail, setLoginEmail] = useState('')
    const router = useRouter()
    const {heightWithoutNav} = usePageHeight()
    const searchParams = useSearchParams()

    const fallback = async () => {
        // 返回之前的页面
        const fallBack = window.localStorage.getItem('fallback')
        if (fallBack && fallBack !== window.location.href && !fallBack.includes('login') && !fallBack.includes('regist')) {
            const path = fallBack.replace(window.location.origin, '')
            window.localStorage.removeItem('fallback')
            router.push(path)
        } else {
            router.push('/')
        }
    }

    return <div className='bind-email'>
        <div className={'login-page-back'}>
            {searchParams.get('new') ?
                <div className={'skip'} onClick={e => {fallback()}}>{lang['Bind_Email_Skip']}</div>
                : <PageBack onClose={() => {
                    router.push('/')
                }}/>
            }
        </div>
        <div className='login-page-bg'></div>
        <div className='login-page-wrapper' style={{height: `${heightWithoutNav}px`}}>
            {!loginEmail ?
                <div className='login-page-content'>
                    <div className='title'>{lang['Bind_Email_Title']}</div>
                    <div className='des'>{lang['Bind_Email_Des']}</div>
                    <EmailLoginForm
                        inputType={'binding'}
                        onConfirm={(email) => {
                            setLoginEmail(email)
                        }}/>
                </div>
                :
                <div className='login-page-content code'>
                    <div className='title'>{lang['Login_input_Code_title']}</div>
                    <div className='des'>{lang['Login_input_Code_des']([loginEmail])}</div>
                    <CodeInputForm
                        fallback={searchParams?.get('new') ? fallback : () => {}}
                        loginType={'binding'}
                        loginAccount={loginEmail}/>
                </div>
            }
        </div>
    </div>
}

export default BindEmail
