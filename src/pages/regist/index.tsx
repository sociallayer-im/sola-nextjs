import { useContext, useEffect } from 'react'
import langContext from '@/components/provider/LangProvider/LangContext'
import RegistForm from '@/components/compose/FormRegist'
import DialogsContext from '@/components/provider/DialogProvider/DialogsContext'
import PageBack from '@/components/base/PageBack'
import UserContext from "@/components/provider/UserProvider/UserContext";
import {deleteFallback, getPlantLoginFallBack} from "@/utils/authStorage";
import {useRouter} from "next/navigation";

function ComponentName () {
    const { lang } = useContext(langContext)
    const { clean } = useContext(DialogsContext)
    const { user, logOut } = useContext(UserContext)
    const router = useRouter()

    useEffect(() => {
        if (user.domain && !user.email) {
            // 钱包登录, 提示绑定邮箱
            router.push(`/bind-email?new=true`)
        } else if (user.domain) {
            const fallBack = window.localStorage.getItem('fallback')
            const platformLoginFallback = getPlantLoginFallBack()
            const lastLoginType = window.localStorage.getItem('lastLoginType')
            if (platformLoginFallback) {
                deleteFallback()
                window.location.href = platformLoginFallback + `?auth=${user.authToken}&account${user.wallet || user.email}&logintype=${lastLoginType}`
            } else if (fallBack && fallBack !== window.location.href) {
                const path = fallBack.replace(window.location.origin, '')
                window.localStorage.removeItem('fallback')
                router.push(path)
            } else {
                if (user?.maodaoid) {
                    router.push(`/rpc/${user.maodaoid}`)
                } else {
                    router.push(`/profile/${user.userName}`)
                }
            }
        }
    }, [user.domain, user.email])


    useEffect(() => {
        clean('regist')
    }, [])

    // 如果用户已经登录，离开注册域名页面，将会被强制登出
    // useEffect(() => {
    //     return () => {
    //         if (user.authToken && !user.domain) {
    //             logOut()
    //         }
    //     }
    // },[location.pathname, user])

    return (
        <div className='regist-page'>
            <div className='regist-page-bg'></div>
            <div className='regist-page-wrapper'>
                <div className='regist-page-back'><PageBack onClose={() => { logOut(); router.push('/')}} /></div>
                <div className='regist-page-content' >
                    <div className='title'>{ lang['Regist_Title'] }</div>
                    <div className='des' dangerouslySetInnerHTML={ { __html: lang['Domain_Rule'] } }></div>
                    <RegistForm onConfirm={(domain) => {}}></RegistForm>
                </div>
            </div>
        </div>
    )
}

export default ComponentName
