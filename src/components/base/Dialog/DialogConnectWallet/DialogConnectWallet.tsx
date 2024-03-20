import {Connector, useAccount, useConnect, useDisconnect} from 'wagmi'
import {useContext, useEffect, useRef} from 'react'
import LangContext from '../../../provider/LangProvider/LangContext'
import {setLastLoginType} from '@/utils/authStorage'
import DialogsContext from '../../../provider/DialogProvider/DialogsContext'
import UserContext from '../../../provider/UserProvider/UserContext'
import {useRouter} from 'next/navigation'
import {WalletContext as solanaWalletContext} from '@solana/wallet-adapter-react'
// import {SignInButton} from '@farcaster/auth-kit';

interface DialogConnectWalletProps {
    handleClose: (...rest: any[]) => any
}

const walletIcon: any = {
    'metamask': '/images/metamask.png',
    'joyid': '/images/joyid.png',
    'trust wallet': '/images/trust_wallet.webp',
    'rabby wallet': '/images/rabby wallet.png'
}

function DialogConnectWallet(props: DialogConnectWalletProps) {
    const unloading_1 = useRef<any>(null)
    const {connect, connectors, error, isLoading, pendingConnector} = useConnect({
        onSettled: () => {
            if (unloading_1) {
                unloading_1.current?.()
                unloading_1.current = null
            }
        }
    })
    const {disconnect} = useDisconnect()
    const {lang} = useContext(LangContext)
    const {isDisconnected} = useAccount()
    const router = useRouter()
    const {clean, showLoading} = useContext(DialogsContext)
    const {user, logOut, setUser} = useContext(UserContext)
    const solanaWallet: any = useContext(solanaWalletContext)

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
            connect({connector})
        }, 500)
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

    const handleSolanaLogin = (walletName: string) => {
        // solanaWallet.disconnect()
        setLastLoginType('solana')
        window.localStorage.setItem('fallback', window.location.href)
        solanaWallet.select(walletName)
        clean()
    }

    const hadleFarcasterLogin = () => {
        setLastLoginType('farcaster')
        const btn: any = document.querySelector('.fc-authkit-signin-button button')
        btn && btn.click()
    }

    const arrowPhoneLogin = process.env.NEXT_PUBLIC_ALLOW_PHONE_LOGIN === 'true'

    return (
        <div className='dialog-connect-wallet'>
            <div className={'title'}>
                <div>{lang['Nav_Wallet_Connect']}</div>
                <i className={'icon-close'} onClick={e => {
                    props.handleClose()
                }}/>
            </div>
            {connectors.map((connector) => (
                (!connector.ready) ?
                    <></>
                    : <div className={'connect-item'}
                           key={connector.id}
                           onClick={() => handleConnectWallet(connector)}>
                        <img src={walletIcon[connector.name.toLowerCase()] || `/images/injected.png`} alt={connector.name}/>
                        <div className='connect-name'>{connector.name}</div>
                    </div>
            ))}
            {process.env.NEXT_PUBLIC_SPECIAL_VERSION !== 'maodao' &&
                <div className='connect-item' onClick={handleConnectEmail}>
                    <img src="/images/email.svg" alt="email"/>
                    <div className='connect-name'>Email</div>
                </div>
            }
            {arrowPhoneLogin &&
                <div className='connect-item' onClick={handlePhoneLogin}>
                    <img src="/images/phone_login.png" alt="email"/>
                    <div className='connect-name'>Phone</div>
                </div>
            }
            <div className='connect-item' onClick={async () => {
                showLoading()
                const login = (await import('@/service/zupass/zupass')).login
                login()
            }}>
                <img src="/images/zupass.png" alt="email"/>
                <div className='connect-name'>Zupass</div>
            </div>

            {solanaWallet.wallets && solanaWallet.wallets.length > 0 ?
                <>
                    {
                        solanaWallet.wallets.map((wallet: any, idx: number) => {
                            return wallet.readyState !== 'NotDetected' ?
                                <div className='connect-item' key={idx} onClick={async () => {
                                    await handleSolanaLogin(wallet.adapter.name)
                                }}>
                                    <img src={wallet.adapter.icon} alt="email"/>
                                    <div className='connect-name'>{wallet.adapter.name}</div>
                                    <img className='chain-icon' src="/images/solana.png" alt=""/>
                                </div>
                                : <div className='connect-item disable'>
                                    <img src={wallet.adapter.icon} alt="solana"/>
                                    <div className='connect-name'>{wallet.adapter.name}</div>
                                    <img className='chain-icon' src="/images/solana.png" alt=""/>
                                </div>
                        })
                    }
                </>:
                <div className='connect-item disable'>
                    <img src={'/images/solana.png'} alt="email"/>
                    <div className='connect-name'>{'Solana'}</div>
                </div>
            }

            {/*<div className='connect-item' onClick={async () => {*/}
            {/*    hadleFarcasterLogin()*/}
            {/*}}>*/}
            {/*    <SignInButton/>*/}
            {/*    <img src="/images/farcaster.svg" alt="farcaster"/>*/}
            {/*    <div className='connect-name'>Farcaster</div>*/}
            {/*</div>*/}
        </div>
    )
}

export default DialogConnectWallet
