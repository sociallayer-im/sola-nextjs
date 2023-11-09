import {useRouter, useSearchParams} from "next/navigation";
import {useContext, useEffect, useRef, useState} from 'react'
import {Spinner} from "baseui/spinner";
import styles from './jubmoji.module.scss'
import UserContext from "@/components/provider/UserProvider/UserContext";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import AppButton from "@/components/base/AppButton/AppButton";
import {verifyAndChecking} from "@/service/apis";

function Page() {
    const router = useRouter()
    const {user} = useContext(UserContext)
    const {openConnectWalletDialog} = useContext(DialogsContext)
    const searchParams = useSearchParams()
    const [islogining, setIslogining] = useState(true)
    const [verifying, setVerifying] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [success, setSuccess] = useState(false)
    const timeOutRef = useRef<any>(null)

    useEffect(() => {
        if (user.authToken && searchParams?.get('proof') && !verifying && !errorMsg && !success) {
            setVerifying(true)
            verifyAndChecking({proof: searchParams!.get('proof')!, auth_token: user.authToken})
                .then(res => {
                    setSuccess(true)
                    setVerifying(false)
                    setTimeout(() => {
                        router.push(`/event/detail-marker/${res.marker_id}`)
                    }, 2000)
                })
                .catch((e: any) => {
                    console.error(e)
                    setErrorMsg('Verify failed')
                    setVerifying(false)
                })
        }
    }, [searchParams, user])

    useEffect(() => {
        if (!user.authToken) {
            timeOutRef.current = setTimeout(() => {
                setIslogining(false)
                openConnectWalletDialog()
            }, 2000)
        } else {
            clearTimeout(timeOutRef.current)
            setIslogining(false)
        }
    }, [user])

    return (<div className={styles['platform-login-page']}>
        <img src="/images/logo.svg" alt="" width={200}/>
        {islogining &&
            <>
                <Spinner $size={30} $color={'#6cd7b2'} $borderWidth={4}/>
                <div className={styles['text']}>Loading...</div>
            </>
        }

        {verifying &&
            <>
                <Spinner $size={30} $color={'#6cd7b2'} $borderWidth={4}/>
                <div className={styles['text']}>Verifying...</div>
            </>
        }

        {!user.authToken && !islogining &&
            <div className={styles['action']}>
                <AppButton special
                           onClick={openConnectWalletDialog}>Login to continue</AppButton>
            </div>
        }

        {user.authToken && !searchParams?.get('proof') &&
            <>
                <div className={styles['error-msg']}>Error: Invalid proof params</div>
                <div className={styles['action']}>
                    <AppButton special
                               onClick={() => {router.push('/')}}>Home</AppButton>
                </div>
            </>
        }

        {errorMsg && user.authToken &&
            <>
                <div className={styles['error-msg']}>{errorMsg}</div>
                <div className={styles['action']}>
                    <AppButton special
                               onClick={() => {router.push('/')}}>Home Page</AppButton>
                </div>
            </>
        }

        {success &&
            <>
                <Spinner $size={30} $color={'#6cd7b2'} $borderWidth={4}/>
                <div className={styles['success-msg']}>Checked !</div>
            </>
        }
    </div>)
}

export default Page
