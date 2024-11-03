import styles from './DialogBindWallet.module.scss'
import AppButton from "@/components/base/AppButton/AppButton"
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import {useContext} from "react";
import DialogConnectWalletForPay from "@/components/base/Dialog/DialogConnectWalletForPay/DialogConnectWalletForPay";
import {useAccount, useWalletClient} from "wagmi";
import {getProfile, setWallet} from "@/service/solas";
import UserContext from "@/components/provider/UserProvider/UserContext";

export default function DialogBindWallet(props: {}) {
    const {openDialog, showToast, showLoading} = useContext(DialogsContext)
    const {address} = useAccount()
    const {data} = useWalletClient()
    const {user} = useContext(UserContext)

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

        const message =  'Link wallet to account'
        try {
            const signature = await data.signMessage({account: address, message})
            await setWallet({message, auth_token: user.authToken || '', signature})
        } catch (e: any) {
            showToast(e.message || e.toString())
        } finally {
            unloading()
        }
    }


    return <div className={styles['dialog']}>
        <div className={styles['title']}>Link Your Wallet</div>
        {
            !address &&
            <AppButton special onClick={connectWallet}>Connect wallet</AppButton>
        }
        {
            address && <>
                <div className={styles['wallet']}>Connected Wallet: <b>{shortAddress}</b></div>

                <AppButton special onClick={handleLink}>Link</AppButton>
            </>
        }
    </div>
}
