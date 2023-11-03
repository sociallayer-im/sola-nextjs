import {useContext} from 'react'
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import DialogMarkerCheckIn from "@/components/base/Dialog/DialogMarkerCheckIn/DialogMarkerCheckIn";
import {Marker} from "@/service/solas";

function useMarkerCheckIn() {
    const {openDialog} = useContext(DialogsContext)

    const scanQrcode = async (marker: Marker, callback?: (result: boolean) => any) => {
        const dialog = openDialog({
            content: (close: any) => <DialogMarkerCheckIn
                marker={marker}
                handleClose={(result) => {
                    close()
                    callback && callback(result)
                }}/>,
            size: ['100%', '100%']
        })
    }

    return {scanQrcode}
}

export default useMarkerCheckIn
