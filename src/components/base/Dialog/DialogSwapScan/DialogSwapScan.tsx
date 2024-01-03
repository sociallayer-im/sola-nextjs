import {Delete} from "baseui/icon";
import LangContext from "../../../provider/LangProvider/LangContext";
import React, {useContext, useState} from "react";
import DialogsContext from "../../../provider/DialogProvider/DialogsContext";
import UserContext from "@/components/provider/UserProvider/UserContext";
import {swapBadgelet} from "@/service/solas";
import dynamic from 'next/dynamic'

const ScanQrcode = dynamic(() => import('@/components/base/ScanQrcode/ScanQrcode'), {
    loading: () => <p>Loading...</p>,
})

export interface DialogNftCheckInProps {
    handleClose: () => any
    badgeletId: number
}

function DialogSwapScan(props: DialogNftCheckInProps) {
    const {lang} = useContext(LangContext)
    const [canScan, setCanScan] = useState(true)
    const {showToast} = useContext(DialogsContext)
    const {user} = useContext(UserContext)

    const handleScanResult = async (res: string) => {
        setCanScan(false)

        const token = res

        await handleSwap()

        async function handleSwap() {
            try {
                await swapBadgelet({
                    auth_token: user.authToken || '',
                    badgelet_id: props.badgeletId,
                    swap_token: token
                })
                setTimeout(() => {
                    props.handleClose()
                }, 500)
            } catch (e: any) {
                console.error(e)
                showToast(e.message || 'Check in fail !')
                setCanScan(true)
            }
        }
    }

    const screenWidth = window.innerWidth
    const isMobile = screenWidth <= 768

    return <div className={isMobile ? 'dialog-nft-check-in mobile' : 'dialog-nft-check-in'}>
        {screenWidth > 768 &&
            <div className='dialog-title'>
                <span>{lang['Dialog_Check_In_Title']}</span>
                <div className='close-dialog-btn' onClick={props.handleClose}>
                    <Delete title={'Close'} size={20}/>
                </div>
            </div>
        }
        <div className={'scan-window'}>
            <ScanQrcode enable={canScan} onResult={(res) => {
                handleScanResult(res)
            }}/>
            <div className={'btns'}>
                <div role={"button"} onClick={props.handleClose}><Delete size={30}/></div>
            </div>
        </div>
    </div>
}

export default DialogSwapScan
