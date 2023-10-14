import { Badge, Presend } from '../../../service/solas'
import AppButton from '../AppButton/AppButton'

interface GenFaceToFaceProp {
    badge: Badge,
    reason: string
    onConfirm?: (...rest: any[]) => any
}

function GenFaceToFace(props: GenFaceToFaceProp) {
    return (<div className='gen-face2face'>
        <div className='badge-info'>
            <img src={props.badge.image_url} alt="" />
            <span>{props.badge.name}</span>
        </div>
        <img className='default-pic' src="/images/qrcore_default.png" alt="" />
        <div className='des'>{ 'Generate a QR Code for people around you to receive the badge.' }</div>
        <AppButton special inline onClick={ () => { !!props.onConfirm && props.onConfirm() } }>{ 'Generate a QR Code' }</AppButton>
    </div>)
}

export default GenFaceToFace
