"use client";
import {useRouter} from "next/navigation";
import {useZupassPopupSetup} from "@/service/zupass/PassportPopup";
import {useEffect} from "react";
import {useZupass} from '@/service/zupass/zupass'
import styles from './popup.module.scss'
import {Spinner} from "baseui/spinner";
import AppButton from "@/components/base/AppButton/AppButton";


/**  This popup sends requests and receives PCDs from the passport. */
export default function PassportPopupRedirect() {
    const router = useRouter()
    const {error, pcdStr} = useZupassPopupSetup();
    const {zupassAuth} = useZupass()

    useEffect(() => {
        (async () => {
            if (pcdStr) {
                zupassAuth(pcdStr)
            }
        })();
    }, [pcdStr]);

    return <>
        <div className={styles['platform-login-page']}>
            <img src="/images/logo.svg" alt="" width={200}/>
            {error ?
                <>
                    <div className={styles['error-msg']}>{error}</div>
                    <div className={styles['action']}>
                        <AppButton special
                                   onClick={() => {
                                       router.push('/')
                                   }}>Home Page</AppButton>
                    </div>
                </>
                : <>
                    <Spinner $size={30} $color={'#6cd7b2'} $borderWidth={4}/>
                    <div className={styles['text']}>Loading...</div>
                </>
            }
        </div>
    </>;
}
