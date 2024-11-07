import {useContext, useEffect, useRef, useState} from 'react'
import UserContext from '../../components/provider/UserProvider/UserContext'
import {useRouter} from 'next/router'
import usePageHeight from '../../hooks/pageHeight'
import PageBack from "../../components/base/PageBack";
import AppInput from "@/components/base/AppInput";
import AppButton from "@/components/base/AppButton/AppButton";
import {OauthClient} from "@zk-email/oauth-sdk"
import {Address, createPublicClient, http} from 'viem'
import {baseSepolia} from 'viem/chains'
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import {queryProfileByEmail} from "@/service/solas";

function Login() {
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const router = useRouter()
    const {heightWithoutNav} = usePageHeight()
    const [emailError, setEmailError] = useState('')
    const [loginError, setLoginError] = useState('')
    const [userNameError, setUserNameError] = useState('')
    const [waiting, setWaiting] = useState(false)
    const {setProfile, user} = useContext(UserContext)
    const {showLoading} = useContext(DialogsContext)
    const [step, setStep] = useState(0)
    const oauthClient = useRef<any | null >(null)


    const handleCheckEmail = (email: string) => {
        if (!email) {
            setEmailError('Please input email')
            return
        }

        if (!email.includes('@') || !email.includes('.')) {
            setEmailError('Invalid email')
            return
        }

        setEmailError('')
    }

    const handleCheckUsername = (username: string) => {
        if (!username) {
            setUserNameError('Please input zkemail wallet username')
            return
        }

        setUserNameError('')
    }


    const handleZkEmailSign = async (email: string, username?: string) => {
        setWaiting(true)

        try {
            const publicClient: any = createPublicClient({
                chain: baseSepolia, // Chain ID
                transport: http("https://sepolia.base.org"), // Transport URL
            })

            // Your core contract address. This prefilled default is already deployed on Base Sepolia
            const coreAddress: Address = '0x3C0bE6409F828c8e5810923381506e1A1e796c2F'
            // Your OAuth core contract address, deployed on Base Sepolia
            const oauthAddress: Address = '0x8bFcBe6662e0410489d210416E35E9d6B62AF659'
            // Your relayer host; this one is public and deployed on Base Sepolia
            const relayerHost: string = "https://oauth-api.emailwallet.org"
            oauthClient.current = new OauthClient(publicClient, coreAddress, oauthAddress, relayerHost)
            const requestId = await oauthClient.current.setup(email.trim(), username ? username.trim() : null, null, null)
            const isActivated = await oauthClient.current.waitEpheAddrActivated(requestId)
            if (!isActivated) {
                setLoginError('Email not activated')
                return
            }
            const epheSignature = await oauthClient.current.epheClient.signMessage({message: 'zkemail sign in'})
            const verifyRequest = await fetch('/api/zkemail-signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    epheSignature,
                    epheAddress: oauthClient.current.epheClient.address
                }),
            })

            if (!verifyRequest.ok) {
                throw new Error('Failed to sign in with ZK Email: ' + verifyRequest.statusText)
            }

            const data = await verifyRequest.json()
            if (data.result !== 'ok') {
                throw new Error(data.message)
            }

            await setProfile({authToken: data.auth_token})
        } catch (e: unknown) {
            console.error(e)
            setLoginError(e instanceof Error ? e.message : 'An error occurred')
        } finally {
            setWaiting(false)
        }
    }


    const handleCheckAccountAndSignIn = async () => {
        const unload = showLoading()

        try {
            const solarProfile = await queryProfileByEmail(email)

            const res = await fetch(`https://relayerapi.emailwallet.org/api/isAccountCreated`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({email_addr: email}),
            })

            if (!res.ok) {
                setLoginError('Failed to create account')
                throw new Error('Failed to create account: ' + res.statusText)
            }

            unload()
            const zkEmailWalletIsCreate = await res.json()
            if (zkEmailWalletIsCreate === 'true') {
                await handleZkEmailSign(email)
            } else {
                if (!!solarProfile && !!solarProfile.handle) {
                    setTimeout(async () => {
                        await handleZkEmailSign(email, solarProfile.handle!)
                    })
                } else {
                    setStep(1)
                }
            }
        } catch (e: unknown) {
            console.error(e)
            unload()
            setWaiting(false)
            setLoginError(e instanceof Error ? e.message : 'An error occurred')
        }
    }


    useEffect(() => {
        if (user.userName) {
            const fallBack = window.localStorage.getItem('fallback')

            if (fallBack) {
                const path = fallBack.replace(window.location.origin, '')
                window.localStorage.removeItem('fallback')
                router.push(path)
            } else {
                router.push(`/profile/${user.userName}`)
            }
        }

        return () => {
            if (oauthClient.current) {
                oauthClient.current = null
            }
        }
    }, [user.userName])


    return <>
        <div className='login-page'>
            <div className={'login-page-back'}><PageBack/></div>
            <div className='login-page-bg'></div>
            <div className='login-page-wrapper' style={{height: `${heightWithoutNav}px`}}>
                <div className='login-page-content'>
                    <div className='title'>{'Sign-in with ZK Email'}</div>
                    <div
                        className='des' style={{marginBottom: '36px'}}>Perform OAuth sign-in operations via an email,
                        you will be asked for One-on-one email reply to sign in.
                    </div>

                    {waiting && <div className="waiting">
                        <svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="32px" height="32px"
                             viewBox="0 0 128 128">
                            <rect x="0" y="0" width="100%" height="100%" fill="none"/>
                            <g>
                                <linearGradient id="linear-gradient">
                                    <stop offset="0%" stopColor="#ffffff"/>
                                    <stop offset="100%" stopColor="#6cd7b2"/>
                                </linearGradient>
                                <path
                                    d="M63.85 0A63.85 63.85 0 1 1 0 63.85 63.85 63.85 0 0 1 63.85 0zm.65 19.5a44 44 0 1 1-44 44 44 44 0 0 1 44-44z"
                                    fill="url(#linear-gradient)" fillRule="evenodd"/>
                                <animateTransform attributeName="transform" type="rotate" from="0 64 64" to="360 64 64"
                                                  dur="1080ms"
                                                  repeatCount="indefinite"></animateTransform>
                            </g>
                        </svg>

                        <div className="ml-2 text-sm">
                            <div>Loading until your sign-in is completed...</div>
                        </div>
                    </div>}


                    {!waiting && <>
                    {step === 0 && <>
                        <div className={'input-padding'}>
                            <AppInput
                                onBlur={() => {
                                    handleCheckEmail(email)
                                }}
                                type={'email'}
                                clearable={true}
                                errorMsg={emailError}
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value)
                                }}
                                placeholder={'Your email'}/>
                        </div>
                        <AppButton special onClick={() => {
                            !emailError && handleCheckAccountAndSignIn()
                        }}>Next</AppButton>
                    </>}

                        {step === 1 && <>
                            <div className={'input-padding'}>
                                <AppInput
                                    onBlur={() => {
                                        handleCheckUsername(username)
                                    }}
                                    type={'text'}
                                    clearable={true}
                                    errorMsg={userNameError}
                                    value={username}
                                    onChange={(e) => {
                                        setUsername(e.target.value)
                                    }}
                                    placeholder={'Your ZK Email wallet username'}/>
                            </div>

                            <AppButton special onClick={() => {
                                !emailError && !userNameError && handleZkEmailSign(email, username)
                            }}>Next</AppButton>
                        </>
                        }
                        <div>{loginError}</div>
                    </>
                    }
                </div>
            </div>
        </div>
    </>
}

export default Login
