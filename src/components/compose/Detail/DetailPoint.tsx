import LangContext from '../../provider/LangProvider/LangContext'
import UserContext from '../../provider/UserProvider/UserContext'
import DialogsContext from '../../provider/DialogProvider/DialogsContext'
import {useContext, useState} from 'react'
import DetailWrapper from './atoms/DetailWrapper/DetailWrapper'
import usePicture from '../../../hooks/pictrue'
import DetailHeader from './atoms/DetailHeader'
import DetailName from './atoms/DetailName'
import DetailDes from './atoms/DetailDes/DetailDes'
import DetailArea from './atoms/DetailArea'
import AppButton, {BTN_KIND, BTN_SIZE} from '../../base/AppButton/AppButton'
import BtnGroup from '../../base/BtnGroup/BtnGroup'
import {Point} from '../../../service/solas'
import ReasonText from '../../base/ReasonText/ReasonText'
import DetailScrollBox from './atoms/DetailScrollBox/DetailScrollBox'
import DetailCreator from './atoms/DetailCreator/DetailCreator'
import useTime from '../../../hooks/formatTime'
import PointCover from "./atoms/PointCover";
import DetailRow from "./atoms/DetailRow";
import DetailBadgeMenu from "./atoms/DetalBadgeMenu";
import {useRouter} from "next/navigation";

export interface DetailBadgeletProps {
    point: Point,
    handleClose: () => void
}

function DetailPoint(props: DetailBadgeletProps) {
    const {lang} = useContext(LangContext)
    const {user} = useContext(UserContext)
    const {openConnectWalletDialog, showLoading, showToast} = useContext(DialogsContext)
    const {defaultAvatar} = usePicture()
    const formatTime = useTime()
    const router = useRouter()
    const {point} = props

    const handleIssue = async () => {
        router.push(`/create-point?point=${props.point.id}`)
        props.handleClose()
    }

    const swiperMaxHeight = window.innerHeight - 320
    return (
        <DetailWrapper>
            <DetailHeader
                title={lang['Point_Detail_Title']}
                onClose={props.handleClose}/>
            <PointCover value={'Value'} src={point.image_url}/>
            <DetailName> {point.title} </DetailName>
            <DetailRow>
                <DetailCreator isGroup={!!point.group} profile={point.group || point.sender}/>
            </DetailRow>
            <DetailScrollBox style={{maxHeight: swiperMaxHeight - 60 + 'px', marginLeft: 0}}>
                {
                    !!point.content &&
                    <DetailDes>
                        <ReasonText text={point.content}></ReasonText>
                    </DetailDes>
                }

                <DetailArea
                    title={lang['Create_Point_Symbol']}
                    content={point.sym ? point.sym.toUpperCase() : '--'}/>

                <DetailArea
                    title={lang['BadgeDialog_Label_Creat_Time']}
                    content={formatTime(point.created_at)}/>

            </DetailScrollBox>

            <BtnGroup>
                {!!user.domain
                    && user.id === point.sender.id
                    && <AppButton size={BTN_SIZE.compact} onClick={() => {
                        handleIssue()
                    }} kind={BTN_KIND.primary}>
                        {lang['BadgeDialog_Btn_Issue']}
                    </AppButton>
                }
            </BtnGroup>
        </DetailWrapper>
    )
}

export default DetailPoint
