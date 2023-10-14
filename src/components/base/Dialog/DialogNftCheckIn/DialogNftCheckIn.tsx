import {Delete, Menu} from "baseui/icon";
import LangContext from "../../../provider/LangProvider/LangContext";
import {useContext, useEffect, useState} from "react";
import ScanQrcode from "../../ScanQrcode/ScanQrcode";
import DialogsContext from "../../../provider/DialogProvider/DialogsContext";
import solas, {CheckIn, checkIn} from '../../../../service/solas'
import CheckInRecords from "../../CheckInRecords/CheckInRecords";
import AppButton from "../../AppButton/AppButton";

export interface DialogNftCheckInProps {
    handleClose: () => any
    nftPassId: number
}

function DialogNftCheckIn(props: DialogNftCheckInProps) {
    const {lang} = useContext(LangContext)
    const [canScan, setCanScan] = useState(true)
    const [showRecord, setShowRecord] = useState(false)
    const [records, setRecords] = useState<CheckIn[]>([])
    const {showToast} = useContext(DialogsContext)

    const handleScanResult = async (res: string) => {
        setCanScan(false)
        console.log('scan', res)

        // 识别结果： aut_token##nftpass_id
        const res_split = res.split('##')
        if (!res_split || res_split.length !== 2 || isNaN(Number(res_split[1]))) {
            showToast('Invalid QRCode !')
            setTimeout(() => {
                setCanScan(true)
            }, 1000)
            return
        }

        try {
            const checkInRes = await checkIn({
                auth_token: res_split[0],
                badgelet_id: Number(res_split[1])
            })
            showToast('Checked !')
        } catch (e: any) {
            console.error(e)
            showToast(e.message || 'Check in fail !')
        } finally {
            setTimeout(() => {
                setCanScan(true)
            }, 1000)
        }
    }

    const getRecord = async () => {
        const list = await solas.queryCheckInList({badge_id: props.nftPassId})
        setRecords(list)
    }

    useEffect(() => {
        getRecord()
    }, [])

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
                    <div role={"button"} onClick={() => {setShowRecord(true)}}><Menu size={30}/></div>
                </div>
            }
            { showRecord &&
                <div className={'mobile-records'}>
                    <CheckInRecords data={records} title={`${records.length} Receivers checked in`}/>
                    <AppButton kind={'primary'} onClick={() => {setShowRecord(false)}}>{lang['Profile_Show_Close']}</AppButton>
                </div>
            }
        </div>

        {screenWidth > 768 &&
            <div style={{marginTop: '12px'}}>
                <CheckInRecords data={records} title={`${records.length} Receivers checked in`}/>
            </div>
        }
    </div>
}

export default DialogNftCheckIn
