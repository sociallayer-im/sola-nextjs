import {useNavigate} from 'react-router-dom'
import {useStyletron} from 'baseui'
import {useContext, useEffect, useState} from 'react'
import './ScanQrcode.sass'
import {BrowserMultiFormatReader} from '@zxing/library'
import DialogsContext from "../../provider/DialogProvider/DialogsContext";

interface ScanQrcodeProps {
    onResult: (res: string) => any
    enable: boolean
}

function ScanQrcode(props: ScanQrcodeProps) {
    const {showToast} = useContext(DialogsContext)

    useEffect(() => {
        let codeReader: BrowserMultiFormatReader | null = new BrowserMultiFormatReader()
        const scan = async function () {
            if (!codeReader) return

            const videoInputDevices = await codeReader.listVideoInputDevices()
            let firstDeviceId = videoInputDevices[0].deviceId
            const videoInputDeviceslablestr = JSON.stringify(videoInputDevices[0].label)

            if (videoInputDevices.length > 1) {
                if (videoInputDeviceslablestr.indexOf('back') > -1) {
                    firstDeviceId = videoInputDevices[0].deviceId
                } else {
                    firstDeviceId = videoInputDevices[1].deviceId
                }
            }

            codeReader.reset()

            await codeReader.decodeFromVideoDevice(firstDeviceId, 'video', async (result: any, err: any) => {
                // console.log('props.enable', props.enable)
                if (result && result.text && props.enable) {
                    props.onResult(result.text)
                }

                if (err && !(err)) {
                    showToast(err.message || 'Scan Failed')
                }
            })
        }
        scan()

        return () => {
            codeReader && codeReader.reset()
            codeReader = null
        }
    }, [props.enable])

    return (<div className={'scan-qrcode'}>
        <img className={'scan-line'} src={'/images/scan.png'}/>
        <video id="video" className="video vjs-fluid"/>
    </div>)
}

export default ScanQrcode
