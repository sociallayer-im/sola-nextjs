import {Connector, useAccount, useConnect, useDisconnect } from 'wagmi'
import {useContext, useEffect, useRef} from 'react'
import LangContext from '../../../provider/LangProvider/LangContext'
import { setLastLoginType } from '@/utils/authStorage'
import DialogsContext from '../../../provider/DialogProvider/DialogsContext'
import UserContext from '../../../provider/UserProvider/UserContext'
import {useRouter} from 'next/navigation'
import {useZupass} from "@/service/zupass/zupass";

interface DialogConnectWalletProps {
    handleClose: (...rest: any[]) => any
}

function DialogConnectWallet (props: DialogConnectWalletProps) {
    const unloading_1 = useRef<any>(null)
    const { connect, connectors, error, isLoading, pendingConnector } = useConnect({
        onSettled: () => {
            if (unloading_1) {
                unloading_1.current?.()
                unloading_1.current = null
            }
        }
    })
    const { disconnect } = useDisconnect()
    const { lang } = useContext(LangContext)
    const { isDisconnected } = useAccount()
    const router = useRouter()
    const { clean, showLoading } = useContext(DialogsContext)
    const { user, logOut, setUser } = useContext(UserContext)

    const {login} = useZupass()

    useEffect(() => {
        if (user.id) {
            props.handleClose()
        }
    }, [user.id])

    useEffect(() => {
        if (isLoading) {
            unloading_1.current = showLoading()
        } else {
            unloading_1.current?.()
            unloading_1.current = null
        }
    }, [isLoading])

    const handleConnectWallet = (connector: Connector) => {
        // test code to trace the error
        if (isLoading) {
            console.error('Connector is loading')
        }

        if (error) {
            console.error('connector error: ' + error)
        }

        disconnect()
        logOut()

       setTimeout(() => {
           setLastLoginType('wallet')
           connect({ connector })
       },500)
    }

    const handleConnectEmail = () => {
        window.localStorage.setItem('fallback', window.location.href)
        clean()
        router.push('/login')
    }

    const handlePhoneLogin = () => {
        window.localStorage.setItem('fallback', window.location.href)
        clean()
        router.push('/login-phone')
    }

    const arrowPhoneLogin = process.env.NEXT_PUBLIC_ALLOW_PHONE_LOGIN === 'true'

    return (
        <div className='dialog-connect-wallet'>
            {connectors.map((connector) => (
                <div className={ (!connector.ready || isLoading) ? 'connect-item disable': 'connect-item' }
                    key={connector.id}
                    onClick={() => handleConnectWallet(connector)}>
                    <img src={ `/images/${connector.name.toLowerCase()}.png` } alt={connector.name} />
                    <div className='connect-name'>{connector.name}</div>
                    <div className='connect-des'>
                        {lang['Wallet_Intro']}
                    </div>
                </div>
            ))}
            { process.env.NEXT_PUBLIC_SPECIAL_VERSION !== 'maodao' &&
                <div className='connect-item' onClick={ handleConnectEmail }>
                    <img src="/images/email.svg" alt="email"/>
                    <div className='connect-name'>Email</div>
                    <div className='connect-des'>{ lang['Login_Title'] }</div>
                </div>
            }
            { arrowPhoneLogin &&
                <div className='connect-item' onClick={ handlePhoneLogin }>
                    <img src="/images/phone_login.png" alt="email"/>
                    <div className='connect-name'>Phone</div>
                    <div className='connect-des'>{ lang['Login_Phone_Title'] }</div>
                </div>
            }
            {(window.location.origin.includes('zumap') || window.location.origin.includes('localhost')) &&
                <div className='connect-item' onClick={ login }>
                    <img src="/images/zupass.png" alt="email"/>
                    <div className='connect-name'>Zupass</div>
                    <div className='connect-des'>{ 'Login using Zupass' }</div>
                </div>
            }
        </div>
    )
}

export default DialogConnectWallet
