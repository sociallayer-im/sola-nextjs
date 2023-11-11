import {ReactNode, useContext, useEffect, useState} from 'react'
import {useAccount, useDisconnect, useWalletClient} from 'wagmi'
import UserContext from './UserContext'
import DialogsContext from '../DialogProvider/DialogsContext'
import * as AuthStorage from '../../../utils/authStorage'
import {myProfile, login as solaLogin} from '@/service/solas'
import { useRouter } from 'next/navigation'
import useEvent, {EVENT} from '../../../hooks/globalEvent'
import {setAuth} from "@/utils/authStorage";
import useShowRole from "@/components/zugame/RoleDialog/RoleDialog";


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
    phone: string | null,
    maodaoid?: number | null
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
    phone: null,
}

function UserProvider (props: UserProviderProps) {
    const [userInfo, setUserInfo] = useState<User>(emptyUser)
    const { address, isConnecting, isDisconnected } = useAccount()
    const { disconnect } = useDisconnect()
    const { data } = useWalletClient()
    const { showToast, clean, showLoading } = useContext(DialogsContext)
    const router = useRouter()
    const [newProfile, _] = useEvent(EVENT.profileUpdate)
    const showRoleDialog = useShowRole()

    const setUser = (data: Partial<Record<keyof User, any>>) => {
        const copyUserInfo = { ...userInfo , ...data }
        setUserInfo(copyUserInfo)
    }


    const setProfile = async (props: { authToken: string}) => {
        try {
            const profileInfo = await myProfile({auth_token: props.authToken})
            setUser({
                wallet: profileInfo?.address,
                id: profileInfo?.id! || null,
                twitter: profileInfo?.twitter || null,
                domain: profileInfo?.domain || null,
                userName: profileInfo?.domain ? profileInfo?.domain.split('.')[0]: null,
                email:  profileInfo?.email || null,
                avatar: profileInfo?.image_url || null,
                authToken: props.authToken,
                nickname:profileInfo?.nickname || null,
                permissions: profileInfo?.permissions || [],
                maodaoid: profileInfo?.maodaoid
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

            if ((window.location.origin.includes('zumap') || window.location.origin.includes('localhost'))
                && profileInfo.zugame_team) {
                showRoleDialog(profileInfo.zugame_team)
                window.localStorage.setItem('zugame_team', profileInfo.zugame_team)
            }

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
        window.localStorage.removeItem('wa')

        setUserInfo(emptyUser)
    }

    const zupassLogin = async () => {
        const loginType = AuthStorage.getLastLoginType()
        if (!loginType) return
        if (loginType !== 'zupass') return

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
                authToken = await solaLogin(data)
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

    const phoneLogin = async () => {
        const loginType = AuthStorage.getLastLoginType()
        if (!loginType) return
        if (loginType !== 'phone') return

        console.log('Login ...')
        console.log('Login type: ', loginType)

        const emailAuthInfo = AuthStorage.getPhoneAuth()
        if (!emailAuthInfo) return

        const authToken = emailAuthInfo.authToken
        const phone = emailAuthInfo.phone
        console.log('Login phone: ', phone)
        console.log('Storage token: ', authToken)
        await setProfile({ authToken })
        setAuth(phone, authToken)
    }

    const login = async () => {
        const loginType = AuthStorage.getLastLoginType()
        if (!loginType) return

        console.log('Login ...')
        console.log('Login type: ', loginType)

        let auth = AuthStorage.getAuth(address)
        if (!auth) {
            return
        }

        const authToken = auth.authToken
        const account = auth.account

        console.log('Login account: ', account)
        console.log('Storage token: ', authToken)

        if (loginType === 'wallet') {
            await setProfile({ authToken })
        } else if (loginType === 'email') {
            await setProfile({ authToken })
        } else if (loginType === 'phone') {
            await setProfile({ authToken })
        } else if (loginType == 'zupass') {
            setProfile({ authToken })
        }
    }

    useEffect(() => {
        login()
    }, [])

    useEffect(() => {
       if (data) {
           walletLogin()
       }
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
        <UserContext.Provider value={{ user: userInfo, setUser, logOut, emailLogin, walletLogin, phoneLogin, zupassLogin}}>
            { props.children }
        </UserContext.Provider>
    )
}

export default UserProvider
