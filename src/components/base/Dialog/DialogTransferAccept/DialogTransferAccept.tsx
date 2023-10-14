import {useState, useContext, useEffect} from 'react'
import {Badgelet, PointItem, NftPasslet} from "../../../../service/solas";
import ReasonText from "../../ReasonText/ReasonText";
import AppButton from "../../AppButton/AppButton";
import langContext from "../../../provider/LangProvider/LangContext";

export interface DialogTransferAcceptProps {
    badgelet?: Badgelet | NftPasslet
    pointItem?: PointItem
    handleClose: () => any
}

function DialogTransferAccept(props: DialogTransferAcceptProps) {
    const [a, seta] = useState('')
    const {lang} = useContext(langContext)

    useEffect(() => {

    }, [])

    const title = props.badgelet ?
        props.badgelet.badge.badge_type === 'nftpass' ? lang['Detail_Transfer_Accept_Title_Nft']
            : lang['Detail_Transfer_Accept_Title_Gift']
        : lang['Detail_Transfer_Accept_Title_Point']

    return (<div className={'detail-transfer-accept'}>
        <div className={'title'}>{title}</div>
        <img className={'cover'} src={props.badgelet?.badge?.image_url || props.pointItem?.point.image_url} alt=""/>
        <div className={'item-name'}>{
            props.badgelet?.badge?.name || props.pointItem?.point.name
        }</div>
        <ReasonText text={props.badgelet?.content || props.pointItem?.point.content || ''} />
        <div className={'sender-title'}>{lang['Detail_Transfer_Accept_From']}</div>
        <div className={'sender'}>
            <img src="/images/presend_default_avatar.png" alt=""/>
            <div className={'sender-name'}>Sender</div>
        </div>
        <AppButton special onClick={props.handleClose}>{lang['Detail_Transfer_Accept_Confirm']}</AppButton>
    </div>)
}

export default DialogTransferAccept
