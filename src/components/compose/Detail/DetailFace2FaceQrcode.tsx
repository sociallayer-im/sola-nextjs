import {useContext, useEffect, useState} from 'react'
import LangContext from '../../provider/LangProvider/LangContext'
import DetailWrapper from './atoms/DetailWrapper/DetailWrapper'
import DetailHeader from './atoms/DetailHeader'
import PresendQrcode from '../PresendQrcode/PresendQrcode'
import AppButton from '../../base/AppButton/AppButton'
import copy from '../../../utils/copy'
import DialogsContext from '../../provider/DialogProvider/DialogsContext'
import solas, { PresendWithBadgelets } from '../../../service/solas'
import userContext from '../../provider/UserProvider/UserContext'
import BtnGroup from '../../base/BtnGroup/BtnGroup'

interface DetailFace2FaceQrcodeProps {
    handleClose: () => void
    presendId: number
}

function DetailFace2FaceQrcode(props: DetailFace2FaceQrcodeProps) {
    const { lang } = useContext(LangContext)
    const { showToast } = useContext(DialogsContext)
    const [presend, setPresend] = useState<PresendWithBadgelets | null>(null)
    const { user } = useContext(userContext)

    const handleCopy = () => {
        const link = `https://${window.location.host}/presend/${presend?.id}_${presend?.code || ''}`
        const description = lang['IssueFinish_share']
            .replace('#1',  user.domain!)
            .replace('#2', presend?.badge.name || '')
            .replace('#3', link)

        // copy(description)
        copy(link)
        props.handleClose()
        showToast('Copied')
    }

    useEffect(() => {
        const getDetail = async function() {
            const presend = await solas.queryPresendDetail({ id: props.presendId, auth_token: user.authToken || '' })
            setPresend(presend)
        }
        getDetail()

    }, [])

    return (
        <DetailWrapper>
            <DetailHeader title={ lang['BadgeDialog_Btn_Face2face'] } onClose={()=> { props.handleClose() }}></DetailHeader>
            <div style={ { height: '545px' } }>
                { !!presend &&
                    <>
                        <PresendQrcode presend={ presend }></PresendQrcode>
                        <BtnGroup style={ { marginTop: '16px'} } >
                            <AppButton special onClick={ () => { handleCopy() } }>
                                <i className='icon-copy' style={{marginRight: '10px'}}></i>
                                <span>{ lang['IssueFinish_CopyLink'] }</span>
                            </AppButton>
                        </BtnGroup>
                    </>
                }
            </div>
        </DetailWrapper>
    )
}

export default DetailFace2FaceQrcode
