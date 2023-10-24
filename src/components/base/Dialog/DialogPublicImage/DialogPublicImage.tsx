import { useContext } from 'react'
import langContext from '../../../provider/LangProvider/LangContext'
import AppSwiper from '../../AppSwiper/AppSwiper'
import { Delete } from 'baseui/icon'
import DialogsContext from '../../../provider/DialogProvider/DialogsContext'
import chooseFile from "../../../../utils/chooseFile";
import solas from "../../../../service/solas";
import UserContext from "../../../provider/UserProvider/UserContext";

const sample = [
    'https://ik.imagekit.io/soladata/tr:n-ik_ml_thumbnail/cvs06g2n_kARAFJMkR',
    'https://ik.imagekit.io/soladata/tr:n-ik_ml_thumbnail/w7r1n4di_QxRt8gZBb',
    'https://ik.imagekit.io/soladata/tr:n-ik_ml_thumbnail/nlo4yr8d_7q2G-EXlw',
    'https://ik.imagekit.io/soladata/tr:n-ik_ml_thumbnail/iwag5uop_tOEUTph5X',
    'https://ik.imagekit.io/soladata/tr:n-ik_ml_thumbnail/jhzcud5i_ya0y_MMjI',
    'https://ik.imagekit.io/soladata/tr:n-ik_ml_thumbnail/go5h8usy_Tw9HhUYEC',
    'https://ik.imagekit.io/soladata/tr:n-ik_ml_thumbnail/6bzj88py_Z9rQMzf7I',
    'https://ik.imagekit.io/soladata/tr:n-ik_ml_thumbnail/evmxp50g_gFnWZKlMg',
    'https://ik.imagekit.io/soladata/tr:n-ik_ml_thumbnail/vtkjvmuj_P1ZCoNa-2',
    'https://ik.imagekit.io/soladata/tr:n-ik_ml_thumbnail/5ypp629n_4fCVC1OIJ'
]

export interface DialogPublicImageProps {
    onConfirm: (imageURL: string) => any
    handleClose: () => any
}

function DialogPublicImage (props: DialogPublicImageProps) {
    const { lang } = useContext(langContext)
    const { user } = useContext(UserContext)
    const { showToast, showLoading, showCropper, openDialog } = useContext(DialogsContext)

    const toCanva = () => {
        window.open('https://www.canva.com/create/logos/', '_blank')
    }

    const confirm = (url: string) => {
        props.onConfirm(url)
        props.handleClose()
    }

    const items = () => {
        return sample.map(item =>
            <div className='public-pic-item' key={item} onClick={() => { confirm(item) } }>
                <img src={item}  alt=""/>
            </div>
        )
    }

    const selectFile = async () => {
        try {
            const file = await chooseFile({ accepts: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']})
            const reader = new FileReader()
            reader.readAsDataURL(file[0])
            reader.onload = async (file)=> {
                showCropper({ imgURL: reader.result as string, onConfirm: async (res: Blob, close: () => any) => {
                        close()
                        const unload = showLoading()
                        try {
                            const newImage = await solas.uploadImage({
                                file: res,
                                uploader: user.wallet || user.email || '',
                                auth_token: user.authToken || ''
                            })
                            unload()
                            confirm(newImage)
                        } catch (e: any) {
                            console.log('[selectFile]: ', e)
                            unload()
                            showToast(e.message|| 'Upload fail')
                        }
                    }
                })
            }
        } catch (e: any) {
            console.log('[selectFile]: ', e)
            showToast(e.message || 'Upload fail')
        }
    }

    return (<div className='dialog-public-image'>
        <div className='dialog-title'>
            <div>{ lang['Dialog_Public_Image_Title'] }</div>
            <div className='dialog-close-btn' onClick={() => { props.handleClose() }}><Delete size={18} title='Close' /></div>
        </div>
        <div className='upload-image-btn' onClick={ selectFile }>
            <img src="/images/upload_image_icon.png" alt=""/>
            <div className='btn-main-text'>{ lang['Dialog_Public_Image_UploadBtn'] }</div>
            <div className='btn-sub-text'>{ lang['Dialog_Public_Image_UploadBtn_Des'] }</div>
        </div>
        <div className='public-pic'>
            <div className='public-pic-title'>{ lang['Dialog_Public_Image_List_Title'] }</div>
            <AppSwiper items={ items() } space={6} itemWidth={88}></AppSwiper>
        </div>

    </div>)
}

export default DialogPublicImage
