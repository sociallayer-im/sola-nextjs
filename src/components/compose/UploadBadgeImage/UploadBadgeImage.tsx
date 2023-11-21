import {styled} from 'baseui'
import {useContext, useState} from 'react'
import DialogsContext from '../../provider/DialogProvider/DialogsContext'
import DialogPublicImage from '../../base/Dialog/DialogPublicImage/DialogPublicImage'

const Wrapper = styled('div', () => {
    return {
        width: '100%',
        height: '214px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F8F9F8',
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

export interface UploadImageProps {
    confirm: (url: string) => any
    imageSelect?: string
}

function UploadBadgeImage(props: UploadImageProps) {
    const defaultImg = '/images/upload_default.png'
    const [imageSelect, setImageSelect] = useState(props.imageSelect)
    const {showToast, showLoading, showCropper, openDialog} = useContext(DialogsContext)

    const showPublicImageDialog = () => {
        const dialog = openDialog({
            content: (close: any) => <DialogPublicImage handleClose={close} onConfirm={(image) => {
                props.confirm(image);
                setImageSelect(image)
            }}/>,
            position: 'bottom',
            size: [360, 'auto']
        })
    }

    return (<Wrapper data-testid={'upload-badge-image'}>
        <Pic onClick={() => {
            showPublicImageDialog()
        }} src={imageSelect || defaultImg} alt=""/>
    </Wrapper>)
}

export default UploadBadgeImage
