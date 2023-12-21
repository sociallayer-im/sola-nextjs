import {useContext, useEffect} from 'react'
import {Badgelet, ProfileSimple, queryBadgeletDetail} from "@/service/solas";
import styles from './DialogBadgeSwap.module.scss'
import usePicture from "@/hooks/pictrue";
import QRcode from "@/components/base/QRcode";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import DialogSwapScan from "@/components/base/Dialog/DialogSwapScan/DialogSwapScan";
import {useRouter} from "next/navigation";
import userContext from "@/components/provider/UserProvider/UserContext";

function DialogBadgeSwap(props: { badgelet: Badgelet, code: string, close?: () => any }) {
    const {defaultAvatar} = usePicture()
    const {openDialog} = useContext(DialogsContext)
    const router = useRouter()
    const {user} = useContext(userContext)

    const handleScan = () => {
        openDialog({
            content: (close: any) => <DialogSwapScan
                handleClose={close}
                badgeletId={props.badgelet.id}
            />,
            size: ['100%', '100%'],
        })
    }

    useEffect(() => {
        const timeout = setInterval(async () => {
            queryBadgeletDetail({id: props.badgelet.id}).then(res => {
                if (res?.owner.id !== props.badgelet.owner.id) {
                    router.push(`/profile/${user.userName}`)
                    props.close && props.close()
                }
            })
        }, 1000)

        return () => {
            clearInterval(timeout)
        }
    }, [user.id])

    return (<div className={styles['dialog']}>
        <div className={styles['card']}>
            <div className={styles['user']}>
                <img src={props.badgelet.owner.image_url || defaultAvatar(props.badgelet.owner.id)}/>
                <div>{`${props.badgelet.owner.nickname || props.badgelet.owner.username} want to change a card with you`}</div>
            </div>
            <div className={styles['white']}>
                <div className={styles['border']}>
                    <QRcode size={[114, 114]} text={props.code}/>
                    <div className={styles['des']}>Please select a card to change with me</div>
                </div>
            </div>
        </div>
        <svg className={styles['close']} onClick={e => {
            props.close && props.close()
        }} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="12" fill="#F8F8F8"/>
            <path fillRule="evenodd" clipRule="evenodd"
                  d="M7.52876 7.52827C7.78911 7.26792 8.21122 7.26792 8.47157 7.52827L12.0002 11.0569L15.5288 7.52827C15.7891 7.26792 16.2112 7.26792 16.4716 7.52827C16.7319 7.78862 16.7319 8.21073 16.4716 8.47108L12.943 11.9997L16.4716 15.5283C16.7319 15.7886 16.7319 16.2107 16.4716 16.4711C16.2112 16.7314 15.7891 16.7314 15.5288 16.4711L12.0002 12.9425L8.47157 16.4711C8.21122 16.7314 7.78911 16.7314 7.52876 16.4711C7.26841 16.2107 7.26841 15.7886 7.52876 15.5283L11.0574 11.9997L7.52876 8.47108C7.26841 8.21073 7.26841 7.78862 7.52876 7.52827Z"
                  fill="#9B9B9B"/>
        </svg>
        <div className={styles['swap-btn']} onClick={handleScan}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2.5 6.25V2.5H6.25" stroke="#272928" stroke-width="2" strokeLinecap="round"
                      strokeLinejoin="round"/>
                <path d="M6.25 17.5H2.5V13.75" stroke="#272928" stroke-width="2" strokeLinecap="round"
                      strokeLinejoin="round"/>
                <path d="M17.5 13.75V17.5H13.75" stroke="#272928" stroke-width="2" strokeLinecap="round"
                      strokeLinejoin="round"/>
                <path d="M13.75 2.5H17.5V6.25" stroke="#272928" stroke-width="2" strokeLinecap="round"
                      strokeLinejoin="round"/>
                <path d="M4.1665 10H15.8332" stroke="#272928" stroke-width="2" strokeLinecap="round"
                      strokeLinejoin="round"/>
            </svg>
            <div>Scan QR code</div>
        </div>
    </div>)
}

export default DialogBadgeSwap
