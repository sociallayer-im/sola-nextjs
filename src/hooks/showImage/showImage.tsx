import {useContext} from 'react'
import DialogsContext from "../../components/provider/DialogProvider/DialogsContext";
import {Delete} from "baseui/icon";
import AppButton from "../../components/base/AppButton/AppButton";
import LangContext from "../../components/provider/LangProvider/LangContext";

function useShowImage() {
    const {openDialog} = useContext(DialogsContext)
    const {lang} = useContext(LangContext)

    const download = (url: string, name?: string) => {
        const image = new Image()
        image.setAttribute('crossOrigin', 'anonymous')
        image.src = url
        image.onload = function () {
            const canvas = document.createElement('canvas')
            canvas.width = image.width
            canvas.height = image.height
            const context = canvas.getContext('2d')
            context!.drawImage(image, 0, 0, image.width, image.height)
            const url = canvas.toDataURL('image/png')
            const a = document.createElement('a')
            const event = new MouseEvent('click')
            a.download = name || lang['Activity_Form_Wechat']
            a.href = url
            a.dispatchEvent(event)
        }
    }

    const showImage = (img: string) => {
        const dialog = openDialog({
            content: (close: any) => <div className={'image-detail-dialog'}>
                <img src={img} alt=""/>
                <Delete className={'close-btn'} size={28} onClick={close} />
               <div className={'actions'}>
                   <AppButton special size={'compact'}
                                onClick={() => download(img)}>
                       <i className={'icon-download'} />
                       {lang['Save_Card']}
                   </AppButton>
               </div>
            </div>,
            size: ['100%', '100%'],
        })
    }

    return {showImage}
}

export default useShowImage
