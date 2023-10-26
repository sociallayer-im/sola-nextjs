import { styled } from 'baseui'
import { useState, useContext, useEffect } from 'react'
import LangContext from '../../provider/LangProvider/LangContext'
import chooseFile from '../../../utils/chooseFile'
import solas from '../../../service/solas'
import UserContext from '../../provider/UserProvider/UserContext'
import DialogsContext from '../../provider/DialogProvider/DialogsContext'
import DialogPublicImage from '../../base/Dialog/DialogPublicImage/DialogPublicImage'

const Wrapper = styled('div', () => {
    return {
        width: '100%',
        height: '214px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-input-bg)',
        borderRadius: '16px',
        userSelect: 'none',
    }
})

const Pic = styled('img', () => {
    return {
        width: '130px',
        height: '130px',
        borderRadius: '50%',
        display: 'block',
        cursor: 'pointer',
    }
})

const Pic2 = styled('img', () => {
    return {
        maxWidth: '90%',
        width: 'auto',
        maxHeight: '210px',
        display: 'block',
        cursor: 'pointer',
    }
})

export interface UploadImageProps {
    confirm: (url: string) => any
    imageSelect?: string,
    cropper?: boolean
}

function UploadImage ({cropper=true, ...props}: UploadImageProps) {
    const defaultImg = '/images/upload_default.png'
    const [imageSelect, setImageSelect] = useState(props.imageSelect)
    const { lang } = useContext(LangContext)
    const { user } = useContext(UserContext)
    const { showToast, showLoading, showCropper, openDialog } = useContext(DialogsContext)

    const selectFile = async () => {
        try {
            const file = await chooseFile({ accepts: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']})
            const reader = new FileReader()
            reader.readAsDataURL(file[0])
            reader.onload = async (file)=> {
                const baseData = reader.result as string;

                //base64-->blob
                let byteString;
                if(baseData!.split(',')[0].indexOf('base64') >= 0)
                    byteString = atob(baseData.split(',')[1]);//base64 解码
                else{
                    byteString = unescape(baseData.split(',')[1]);
                }
                const mimeString = baseData.split(',')[0].split(':')[1].split(';')[0];//mime类型 -- image/png
                const ia = new Uint8Array(byteString.length);//创建视图
                for(let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                let blob = new Blob([ia], {type:'image/png'});

                const unload = showLoading()
                try {
                    const newImage = await solas.uploadImage({
                        file: blob,
                        uploader: user.wallet || user.email || '',
                        auth_token: user.authToken || ''
                    })
                    unload()
                    props.confirm(newImage);
                    setImageSelect(newImage)
                } catch (e: any) {
                    console.log('[selectFile]: ', e)
                    unload()
                    showToast(e.message|| 'Upload fail')
                }
            }
        } catch (e: any) {
            console.log('[selectFile]: ', e)
            showToast(e.message || 'Upload fail')
        }
    }

    useEffect(() => {
        if (props.imageSelect) {
            setImageSelect(props.imageSelect)
        }
    }, [props.imageSelect])

    return (<Wrapper>
        { cropper ?
            <Pic onClick={ () => { selectFile() } } src={ imageSelect || defaultImg } alt=""/>
            : imageSelect ? <Pic2 onClick={ () => { selectFile() } } src={ imageSelect  } alt=""/>
                : <Pic onClick={ () => { selectFile() } } src={ defaultImg } alt=""/>
        }
    </Wrapper>)
}

export default UploadImage
