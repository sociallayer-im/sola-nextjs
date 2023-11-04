import {Delete} from "baseui/icon";
import LangContext from "../../../provider/LangProvider/LangContext";
import {useContext, useState} from "react";
import ScanQrcode from "../../ScanQrcode/ScanQrcode";
import DialogsContext from "../../../provider/DialogProvider/DialogsContext";
import {acceptPresend, Marker, markerCheckin} from '@/service/solas'
import UserContext from "@/components/provider/UserProvider/UserContext";
import useEvent, {EVENT} from "@/hooks/globalEvent";
import fa from "@walletconnect/legacy-modal/dist/cjs/browser/languages/fa";

export interface DialogNftCheckInProps {
    handleClose: (result: boolean) => any
    marker: Marker
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
        // res: https://event.sola.day?info=<marker id>-<voucher code>
        const info = res.split('info=')[1]
        if (!info) {
            showToast('invalid QR code')
            setTimeout(() => {
                setCanScan(true)
            }, 1500)
            return
        }

        const [resMarkerId, resVoucherCode] = info.split('-')

        if (Number(resMarkerId) !== props.marker.id) {
            showToast('invalid QR code')
            setTimeout(() => {
                setCanScan(true)
            }, 1500)
            return
        }

        try {
            let badgeletId = 0
            if (resVoucherCode && resVoucherCode!== '0') {
                const mintBadge = await acceptPresend({
                    id: props.marker.voucher_id!,
                    code: Number(resVoucherCode),
                    auth_token: user.authToken || ''
                })
                badgeletId = mintBadge.id
            }


            await checkIn(badgeletId || undefined)
        } catch (e: any) {
            console.error(e)
            showToast(e.message || 'Check in fail !')
            setTimeout(() => {
                setCanScan(true)
            }, 1500)
        }

        async function checkIn(badgeletId?: number) {
            try {
                const checkInRes = await markerCheckin({
                    auth_token: user.authToken || '',
                    id: Number(resMarkerId),
                    reaction_type: 'message',
                    badgelet_id: badgeletId
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

