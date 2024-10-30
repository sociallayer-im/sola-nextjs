import {Delete} from "baseui/icon";
import LangContext from "../../../provider/LangProvider/LangContext";
import React, {useContext, useState} from "react";
import DialogsContext from "../../../provider/DialogProvider/DialogsContext";
import {eventCheckIn, punchIn} from '@/service/solas'
import UserContext from "@/components/provider/UserProvider/UserContext";
import useEvent, {EVENT} from "@/hooks/globalEvent";
import dynamic from 'next/dynamic'

const ScanQrcode = dynamic(() => import('@/components/base/ScanQrcode/ScanQrcode'), {
    loading: () => <p>Loading...</p>,
})

export interface DialogNftCheckInProps {
    handleClose: () => any
    onScanResult?: (res: string) => any
}

function DialogScanQrCode(props: DialogNftCheckInProps) {
    const {lang} = useContext(LangContext)
    const [canScan, setCanScan] = useState(true)
    const {showToast} = useContext(DialogsContext)
    const {user} = useContext(UserContext)
    const [_, emitCheckIn] = useEvent(EVENT.eventCheckin)

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
                !!props.onScanResult && props.onScanResult(res)
                props.handleClose()
            }}/>
            <div className={'btns'}>
                <div role={"button"} onClick={props.handleClose}><Delete size={30}/></div>
            </div>
        </div>
    </div>
}

export default DialogScanQrCode
