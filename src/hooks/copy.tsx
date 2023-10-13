import DialogsContext from '../components/provider/DialogProvider/DialogsContext'
import { OpenDialogProps } from '../components/provider/DialogProvider/DialogProvider'
import copyText from 'copy-to-clipboard'
import { useContext } from 'react'
import DialogCopy from '../components/base/Dialog/DialogCopy/DialogCopy'

export default function useCopy() {
    const { openDialog } = useContext(DialogsContext)

    const copyWithDialog = (text: string, message?: string) => {
        copyText(text)
        const props: OpenDialogProps = {
            content: (close) => <DialogCopy handleClose={close} message={ message } />,
            size: [316, 'auto']
        }

        openDialog(props)
    }

    return { copyWithDialog, copy: copyText }
}
