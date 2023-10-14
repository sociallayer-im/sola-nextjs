import { useContext } from 'react'
import {Group, Profile, ProfileSimple} from '../../../../../service/solas'
import usePicture from '../../../../../hooks/pictrue'
import langContext from '../../../../provider/LangProvider/LangContext'

interface DetailCreatorProp {
    profile: Profile | ProfileSimple | Group
    isGroup?: boolean
}
function DetailCreator(props: DetailCreatorProp) {
    const { profile } = props
    const { defaultAvatar } = usePicture()
    const { lang } = useContext(langContext)
    const link = props.isGroup ? `/group/${profile.domain?.split('.')[0]}` : `/profile/${profile.domain?.split('.')[0]}`

    return (<a className='badge-creator-tag' href={link} target='_blank'>
        <div className='label'>{ lang['BadgeDialog_Label_Creator'] }</div>
        <img src={ profile.image_url || defaultAvatar(profile.id) } alt=""/>
        <div className='username'>{ profile.domain?.split('.')[0] }</div>
    </a>)
}

export default DetailCreator
