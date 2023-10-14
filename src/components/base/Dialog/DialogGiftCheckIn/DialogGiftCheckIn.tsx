import {Delete, Menu} from "baseui/icon";
import LangContext from "../../../provider/LangProvider/LangContext";
import {useContext, useEffect, useState} from "react";
import ScanQrcode from "../../ScanQrcode/ScanQrcode";
import DialogsContext from "../../../provider/DialogProvider/DialogsContext";
import {consume} from '../../../../service/solas'
import CheckInRecords from "../../CheckInRecords/CheckInRecords";
import AppButton from "../../AppButton/AppButton";

export interface DialogNftCheckInProps {
    handleClose: () => any
    giftId: number
}

function DialogGiftCheckIn(props: DialogNftCheckInProps) {
    const {lang} = useContext(LangContext)
    const [canScan, setCanScan] = useState(true)
    const {showToast} = useContext(DialogsContext)

    const handleScanResult = async (res: string) => {
        setCanScan(false)
        console.log('scan', res)

        // 识别结果： aut_token##gift_id
        const res_split = res.split('##')
        if (!res_split || res_split.length !== 2 || isNaN(Number(res_split[1]))) {
            showToast('Invalid QRCode !')
            setTimeout(() => {
                setCanScan(true)
            }, 1000)
            return
        }

        try {
            const checkInRes = await consume({
                auth_token: res_split[0],
                badgelet_id: Number(res_split[1])
            })
            showToast(lang['Gift_Detail_check_remain']([checkInRes.value]))
        } catch (e: any) {
            console.error(e)
            showToast(e.message || 'Check in fail !')
        } finally {
            setTimeout(() => {
                setCanScan(true)
            }, 1000)
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
            {isMobile &&
                <div className={'btns'}>
                    <div role={"button"} onClick={props.handleClose}><Delete size={30}/></div>
                </div>
            }
        </div>
    </div>
}

export default DialogGiftCheckIn
