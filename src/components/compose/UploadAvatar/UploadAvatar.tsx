import { styled, useStyletron } from 'baseui'
import {useState, useContext, useEffect} from 'react'
import LangContext from '../../provider/LangProvider/LangContext'
import UserContext from '../../provider/UserProvider/UserContext'
import DialogsContext from '../../provider/DialogProvider/DialogsContext'
import DialogPublicImage from '../../base/Dialog/DialogPublicImage/DialogPublicImage'
import chooseFile from "../../../utils/chooseFile";
import solas from "../../../service/solas";
import usePicture from '../../../hooks/pictrue'

const Wrapper = styled('div', () => {
    return {
        width: '100%',
        height: '173px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        background: '#F8F9F8',
        borderRadius: '16px',
    }
})

const Pic = styled('img', () => {
    return {
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        display: 'block',
        cursor: 'pointer',
    }
})

const Btn = styled('div', () => {
    return {
        width: '130px',
        height: '28px',
        background: '#FFFFFF',
        borderRadius: '39px',
        textAlign: 'center',
        lineHeight: '28px',
        marginTop: '18px',
        cursor: 'pointer',
        fontWeight: '600'
    }
})

export interface UploadImageProps {
    confirm: (url: string) => any
    imageSelect?: string
}

function UploadAvatar (props: UploadImageProps) {
    const defaultImg = '/images/upload_default.png'
    const [css] = useStyletron()
    const [imageSelect, setImageSelect] = useState(props.imageSelect)
    const { lang } = useContext(LangContext)
    const { user } = useContext(UserContext)
    const { showToast, showLoading, showCropper, openDialog } = useContext(DialogsContext)
    const { selectImage } = usePicture()

    const select = async () => {
        await selectImage((imgRes: string) => {
            props.confirm(imgRes)
            setImageSelect(imgRes)
        })
    }

    return <Wrapper onClick={ select }>
        <Pic src={ imageSelect || defaultImg } alt=""/>
        <Btn>{ lang['Dialog_Public_Image_UploadBtn'] }</Btn>
    </Wrapper>
}

export default UploadAvatar
