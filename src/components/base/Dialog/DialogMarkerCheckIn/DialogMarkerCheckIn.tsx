import {Delete} from "baseui/icon";
import LangContext from "../../../provider/LangProvider/LangContext";
import {useContext, useState} from "react";
import ScanQrcode from "../../ScanQrcode/ScanQrcode";
import DialogsContext from "../../../provider/DialogProvider/DialogsContext";
import {markerCheckin} from '@/service/solas'
import UserContext from "@/components/provider/UserProvider/UserContext";
import useEvent, {EVENT} from "@/hooks/globalEvent";
import fa from "@walletconnect/legacy-modal/dist/cjs/browser/languages/fa";

export interface DialogNftCheckInProps {
    handleClose: (result: boolean) => any
    markerid: number
}

function DialogMarkerCheckIn(props: DialogNftCheckInProps) {
    const {lang} = useContext(LangContext)
    const [canScan, setCanScan] = useState(true)
    const [ifSuccess, setIfSuccess] = useState(false)
    const {showToast} = useContext(DialogsContext)
    const {user} = useContext(UserContext)
    const [_, emitCheckIn] = useEvent(EVENT.markerCheckin)

    const handleScanResult = async (res: string) => {
        setCanScan(false)
        console.log('scan', res)
        const resMarkerId = res.split('/')[res.split('/').length - 1]

        if (Number(resMarkerId) !== props.markerid) {
            showToast('invalid QR code')
            setTimeout(() => {
                setCanScan(true)
            }, 1500)
            return
        }

        await checkIn()
        async function checkIn() {
            try {
                const checkInRes = await markerCheckin({
                    auth_token: user.authToken || '',
                    id: Number(resMarkerId),
                })
                showToast('Checked !')
                emitCheckIn(Number(resMarkerId))
                setIfSuccess(true)
                setTimeout(() => {
                    props.handleClose(true)
                }, 1000)
            } catch (e: any) {
                console.error(e)
                setIfSuccess(false)
                showToast(e.message || 'Check in fail !')
                setTimeout(() => {
                    setCanScan(true)
                }, 1500)
            }
        }
    }

    const screenWidth = window.innerWidth
    const isMobile = screenWidth <= 768

    return <div className={isMobile ? 'dialog-nft-check-in mobile' : 'dialog-nft-check-in mobile'}>
        <div className={'scan-window'}>
            <ScanQrcode enable={canScan} onResult={(res) => {
                handleScanResult(res)
            }}/>
            <div className={'btns'}>
                <div role={"button"} onClick={e => {props.handleClose(ifSuccess)}}><Delete size={30}/></div>
            </div>
        </div>
    </div>
}

export default DialogMarkerCheckIn

