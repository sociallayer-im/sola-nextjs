import {ReactNode, useContext, useEffect, useState} from 'react'
import {useAccount, useDisconnect, useWalletClient} from 'wagmi'
import UserContext from './UserContext'
import DialogsContext from '../DialogProvider/DialogsContext'
import * as AuthStorage from '../../../utils/authStorage'
import solas, {myProfile} from '../../../service/solas'
import { useRouter } from 'next/navigation'
import useEvent, {EVENT} from '../../../hooks/globalEvent'
import {getPlantLoginFallBack, deleteFallback, setAuth} from "../../../utils/authStorage";


import solaExtensionLogin from '../../../service/ExtensionLogin'

export interface User {
    id: number | null,
    userName: string | null,
    avatar: string | null,
    domain: string | null,
    email: string | null,
    wallet: string | null,
    twitter: string | null,
    authToken: string | null,
    nickname: string | null,
    permissions: string[],
}

export interface UserContext {
    user: User
    setUser: (data: Partial<Record<keyof User, any>>) => any
    logOut: () => any
}

export interface UserProviderProps {
    children: ReactNode
}

const emptyUser: User = {
    id: 0,
    userName: null,
    avatar: null,
    domain: null,
    email: null,
    wallet: null,
    twitter: null,
    authToken: null,
    nickname: null,
    permissions: [],
}

function UserProvider (props: UserProviderProps) {
    const [userInfo, setUserInfo] = useState<User>(emptyUser)
    const { address, isConnecting, isDisconnected } = useAccount()
    const { disconnect } = useDisconnect()
    const { data } = useWalletClient()
    const { showToast, clean, showLoading } = useContext(DialogsContext)
    const router = useRouter()
    const [newProfile, _] = useEvent(EVENT.profileUpdate)

    const setUser = (data: Partial<Record<keyof User, any>>) => {
        const copyUserInfo = { ...userInfo , ...data }
        setUserInfo(copyUserInfo)
    }


    const setProfile = async (props: { authToken: string}) => {
        try {
            const profileInfo = await solas.myProfile({auth_token: props.authToken})
            console.log('Profile: ', profileInfo)
            setUser({
                wallet: profileInfo?.address,
                id: profileInfo?.id! || null,
                twitter: profileInfo?.twitter || null,
                domain: profileInfo?.domain || null,
                userName: profileInfo?.domain ? profileInfo?.domain.split('.')[0]: null,
                email:  profileInfo?.email || null,
                avatar: profileInfo?.image_url || null,
                authToken: props.authToken,
                nickname: profileInfo?.nickname || null,
                permissions: profileInfo?.permissions || [],
            })

            if (!profileInfo!.domain) {
                // 如果当前页面是’/login‘说明是邮箱登录，fallback已经在点击邮箱登录按钮的时候设置了:
                // src/components/dialogs/ConnectWalletDialog/ConnectWalletDialog.tsx  42行

                if (!window.location.href.includes('/login')) {
                    window.localStorage.setItem('fallback', window.location.href)
                }
                clean()
                setTimeout(() => {
                    router.push('/regist')
                },100)
                return
            }

            // if (window.location.pathname === '/') {
            //     navigate(`/profile/${profileInfo.username}`)
            // }

            solaExtensionLogin.login(profileInfo!.id.toString(), profileInfo!.domain,props.authToken, profileInfo!.image_url || '')
        } catch (e: any) {
            console.error('[setProfile]: ', e)
            showToast('Login fail', 3000)
            logOut()
        }
    }

    const logOut = () => {
        disconnect()

        if (userInfo.wallet) {
            AuthStorage.burnAuth(userInfo.wallet)
        }

        if (userInfo.email) {
            AuthStorage.burnAuth(userInfo.email)
        }

        AuthStorage.setLastLoginType(null)
        window.localStorage.removeItem('isSolarLogin')
        window.localStorage.removeItem('wagmi.wallet')
        window.localStorage.removeItem('wagmi.store')
        window.localStorage.removeItem('wagmi.cache')
        window.localStorage.removeItem('wagmi.connected')

        setUserInfo(emptyUser)
    }

    const emailLogin = async () => {
        const loginType = AuthStorage.getLastLoginType()
        if (!loginType) return
        if (loginType !== 'email') return

        console.log('Login ...')
        console.log('Login type: ', loginType)

        const emailAuthInfo = AuthStorage.getEmailAuth()
        if (!emailAuthInfo) return

        const authToken = emailAuthInfo.authToken
        const email = emailAuthInfo.email
        console.log('Login email: ', email)
        console.log('Storage token: ', authToken)

        await setProfile({ authToken })
        setAuth(email, authToken)
    }

    const walletLogin = async () => {
        const loginType = AuthStorage.getLastLoginType()
        if (!loginType) return
        if (loginType !== 'wallet') return

        if (!address) {
            logOut()
            return
        }

        if (!data) return

        console.log('Login ...')
        console.log('Login type: ', loginType)
        console.log('Login wallet: ', address)

        let authToken = AuthStorage.getAuth(address)?.authToken
        if (!authToken) {
            const unloading = showLoading()
            try {
                authToken = await solas.login(data)
                console.log('New token: ', authToken)
            } catch (e) {
                console.error(e)
                showToast('Login fail', 3000)
                logOut()
                return
            } finally {
                unloading()
            }
        }

        console.log('Storage token: ', authToken)
        await setProfile({ authToken: authToken })
        setAuth(address, authToken)
    }

    useEffect(() => {
        emailLogin()
        return () => {}
    }, [])

    useEffect(() => {
        walletLogin()
    }, [data])

    // update profile from event
    useEffect(() => {
        if (newProfile && (newProfile.id === userInfo.id || (!userInfo.domain && userInfo.id))) {
            setUser({...userInfo,
                domain: newProfile.domain,
                userName: newProfile.domain ? newProfile.domain.split('.')[0]: null,
                nickname: newProfile.nickname,
                avatar: newProfile.image_url
            })
        }
    }, [newProfile])

    return (
        <UserContext.Provider value={{ user: userInfo, setUser, logOut, emailLogin, walletLogin}}>
            { props.children }
        </UserContext.Provider>
    )
}

export default UserProvider
