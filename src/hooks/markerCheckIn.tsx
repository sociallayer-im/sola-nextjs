import {useContext} from 'react'
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import DialogMarkerCheckIn from "@/components/base/Dialog/DialogMarkerCheckIn/DialogMarkerCheckIn";

function useMarkerCheckIn() {
    const {openDialog} = useContext(DialogsContext)

    const scanQrcode = async (markerid: number, callback?: (result: boolean) => any) => {
        const dialog = openDialog({
            content: (close: any) => <DialogMarkerCheckIn
                markerid={markerid}
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
