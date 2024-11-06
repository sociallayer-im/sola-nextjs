import styles from './DialogBindEmail.module.scss'
import AppButton from "@/components/base/AppButton/AppButton"
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import {useContext, useState} from "react";
import DialogConnectWalletForPay from "@/components/base/Dialog/DialogConnectWalletForPay/DialogConnectWalletForPay";
import {useAccount, useWalletClient} from "wagmi";
import {getProfile, requestEmailCode, setWallet} from "@/service/solas";
import UserContext from "@/components/provider/UserProvider/UserContext";
import {createSiweMessage} from "@/service/SIWE";
import AppInput from "@/components/base/AppInput";
import CodeInputForm from "@/components/compose/FormCodeInput";

export default function DialogBindEmail(props: {close: () => void, onSuccess: () => void}) {
    const {openDialog, showToast, showLoading} = useContext(DialogsContext)
    const {address} = useAccount()
    const {data} = useWalletClient()
    const {user, setUser} = useContext(UserContext)
    const [step, setStep] = useState(0)
    const [email, setEmail] = useState('')

    const connectWallet = () => {
        openDialog({
            content: (close: any) => <DialogConnectWalletForPay handleClose={close}/>,
            size: [360, 'auto']
        })
    }

    const shortAddress = address ? address.slice(0, 6) + '...' + address.slice(-6) : ''

    const handleLink = async () => {
        const profile = await getProfile({address})
        if (!data || !address) {
            showToast('Please connect wallet first')
            return
        }

        if(!!profile) {
            showToast('Wallet already linked to an account')
            return
        }

        const unloading = showLoading()

        const message =   await createSiweMessage(
            address,
            'Sign in with Ethereum to the app.'
        )

        try {
            const signature = await data.signMessage({account: address, message})
            await setWallet({message, auth_token: user.authToken || '', signature})
            setUser({wallet: address})
            props.onSuccess()
            props.close()
        } catch (e: any) {
            console.error(e)
            showToast(e.message || e.toString())
        } finally {
            unloading()
        }
    }

    const handleNextStep = async () => {
        // check email, if email is valid, to next step

        if (!email) {
            showToast('Please input email')
            return
        }

        if (email.indexOf('@') === -1 || email.indexOf('.') === -1) {
            showToast('Please input valid email')
            return
        }

        const unloading = showLoading()
        try {
            await requestEmailCode(email.trim())
        } catch (e: any) {
            console.error(e)
            showToast(e.message || 'Send email fail')
        } finally {
            unloading()
        }

        setStep(1)
    }


    return <div className={styles['dialog']}>
        <div className={styles['title']}>Link Your Email</div>
        { step === 0 &&
            <>
                <div className={styles['wallet']}>Before creating SBT, you will need to link your email</div>
                <div className={styles['email-input']}>
                    <AppInput placeholder={'Input your email'} type={'email'} value={email} onChange={e => {setEmail(e.target.value)}} />
                </div>
                <AppButton special onClick={handleNextStep}>Next</AppButton>
            </>
        }

        {
            step === 1 && <>
                <div className={styles['wallet']}>Input the code you got in your email</div>
                <CodeInputForm
                    loginAccount={email}
                    loginType={'binding'}
                    fallback={() => {
                        setUser({
                            email: email
                        })
                        props.close()
                        props.onSuccess()
                    }}
                />
            </>
        }
    </div>
}
