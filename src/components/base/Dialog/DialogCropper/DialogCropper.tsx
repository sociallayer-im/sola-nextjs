import {useStyletron} from 'baseui'
import {useState, useContext, useEffect, useRef} from 'react'
import { Delete } from 'baseui/icon'
import langContext from '../../../provider/LangProvider/LangContext'
import Cropper, { ReactCropperElement } from 'react-cropper'
import 'cropperjs/dist/cropper.css'
import AppButton, { BTN_KIND, BTN_SIZE } from '../../AppButton/AppButton'
import AppSlider from '../../AppSlider/AppSlider'

export interface DialogCropperProps {
    imgURL: string
    handleClose: () => void
    handleConfirm: (res: Blob, close: () => any) => any
}

function DialogCropper(props: DialogCropperProps) {
    const [css] = useStyletron()
    const { lang } = useContext(langContext)
    const cropperRef = useRef<ReactCropperElement>(null);
    const [scale, setScale] = useState([0])
    const [minScale, setMinScale] = useState(0)
    const [maxScale, setMaxScale] = useState(0.001)
    const cropBoxInitSize = 216
    const resetTimeout = useRef<any>(null)
    const changeTimeout = useRef<any>(null)

    const setPosition = () => {
        const cropper = cropperRef.current?.cropper
        const img = new Image()
        img.src = props.imgURL
        img.onload = () => {
            cropper!.zoomTo(0)
            // 限制缩放比例
            const reference = Math.min(img.width, img.height)
            const calcMinScale = cropBoxInitSize / reference
            const calcMaxScale = cropBoxInitSize * 3/ reference

            setMaxScale(calcMaxScale)
            setMinScale(calcMinScale)
            console.log('calcMaxScale', calcMaxScale)
            console.log('calcMinScale', calcMinScale)
            setScale([calcMinScale])
            const getData = cropper!.getData()
            console.log('getData', getData)

            setTimeout(() => {
                cropper!.zoomTo(calcMinScale)
            }, 100)
        }
    }

    const regression = () => {
        const cropper = cropperRef.current?.cropper
        clearTimeout(resetTimeout.current)
        resetTimeout.current = setTimeout(() => {
            const imageInfo = cropper!.getImageData()
            console.log('imageInfo', imageInfo)
            const imageInfo2 = cropper!.getCanvasData()
            let offsetX = imageInfo2.left
            let offsetY = imageInfo2.top
            if (imageInfo2.left >= 48) {
                offsetX = 48
                console.log(1, 48)
            } else if (imageInfo2.left + imageInfo.width - 48 < cropBoxInitSize) {
                offsetX = (imageInfo.width - cropBoxInitSize) * -1 + 48
                console.log(2, offsetX)
            }

            if (imageInfo2.top > 0) {
                offsetY = 0
                console.log(11, offsetY)
            } else if (imageInfo2.top + imageInfo.height < cropBoxInitSize) {
                offsetY = (imageInfo.height - cropBoxInitSize) * -1
                console.log(22, offsetY)
            }

            if (offsetX !== imageInfo2.left || offsetY !== imageInfo2.top) {
                cropper?.setCanvasData({
                    left: offsetX,
                    top: offsetY
                })
            }
        }, 100)
    }

    const compress = (data: Blob):Promise<Blob | null> => {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.src = URL.createObjectURL(data)
            img.onload = () => {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')
                if (ctx) {
                    ctx.save()
                    canvas.width = 600
                    canvas.height = 600
                    ctx.drawImage(img, 0, 0, 600, 600)
                    ctx.restore()
                    canvas.toBlob(
                        blob => {
                            resolve(blob)
                        },
                        'image/png',
                        1
                    )
                }
            }
        })
    }

    const confirm =  () => {
        const cropper = cropperRef.current?.cropper
        cropper!.getCroppedCanvas().toBlob(async (blob) => {
            if (blob) {
                const data = await compress(blob)
                props.handleConfirm(data!, props.handleClose)
            }
        })
    }

    useEffect(() => {
        if (scale) {
            console.log('scale', scale)
            setTimeout(()=> {
                const cropper = cropperRef.current?.cropper
                cropper && cropper!.zoomTo(scale[0])
                setTimeout(() => {
                    regression()
                }, 500)
            }, 100)
        }
    }, [scale])

    return (<div className='dialog-cropper'>
        <div className='dialog-title'>
            <span>{ lang['Cropper_Dialog_Title'] }</span>
            <div className='close-dialog-btn' onClick={ props.handleClose }>
                <Delete title={'Close'} size={20}/>
            </div>
        </div>
        <Cropper
            src={ props.imgURL }
            style={{ height: "216px", width: "311px", marginBottom: '12px' }}
            aspectRatio={1}
            guides={false}
            ref={cropperRef}
            autoCrop={true}
            autoCropArea={1}
            cropBoxResizable={false}
            cropBoxMovable={false}
            scalable={false}
            zoomOnTouch={false}
            zoomOnWheel={false}
            dragMode={'move'}
            minCropBoxHeight={cropBoxInitSize}
            minCropBoxWidth={cropBoxInitSize}
            viewMode={0}
            ready={(e) => {
                setPosition()
            }}
            cropend={(e) => {
                regression()
            }}
        />
        <AppSlider onChange={ setScale } step={ (maxScale - minScale) / 20 } value={ scale } max={ maxScale } min={ minScale }/>
        <div className='btns'>
            <AppButton onClick={() => { confirm() }}
                       kind={ BTN_KIND.primary } special size={ BTN_SIZE.compact }>
                { lang['Cropper_Dialog_Btn'] }
            </AppButton>
        </div>
    </div>)
}

export default DialogCropper
