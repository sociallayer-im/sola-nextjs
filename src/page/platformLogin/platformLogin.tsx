import {useRouter, useSearchParams} from "next/navigation";
import {useState, useContext, useEffect} from 'react'
import './PlatformLogin.less'
import { Spinner } from "baseui/spinner";
import DialogsContext from "../../components/provider/DialogProvider/DialogsContext";
import {getLatestAuth, getLastLoginType, setPlantLoginFallBack} from "../../utils/authStorage";

function platformLogin() {
    const router = useRouter()
    const [a, seta] = useState('')
    const { showToast, clean, showLoading, openConnectWalletDialog } = useContext(DialogsContext)
    const [searchParams] = useSearchParams()

    const fallbackUrl = searchParams.get('from')
    useEffect(() => {
        if (!fallbackUrl) {
            router.push('/error')
            return
        }

        setPlantLoginFallBack(fallbackUrl)
        const auth = getLatestAuth()
        const loginType = getLastLoginType()

        if (!auth || !loginType) {
            openConnectWalletDialog()
            return
        }

        // if (fallbackUrl && loginType) {
        //     alert('ok')
        //     window.location.href = fallbackUrl + `?auth=${auth[1]}&account=${auth[0]}&logintype=${loginType}`
        // }
    }, [])

    return (<div className={'platform-login-page'}>
        <img src="/images/logo.svg" alt="" width={200}/>
        <Spinner $size={30} $color={'#6cd7b2'} $borderWidth={4} />
        <div className={'text'}>Login...</div>
    </div>)
}

export default platformLogin
