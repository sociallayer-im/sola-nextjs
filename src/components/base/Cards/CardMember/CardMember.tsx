import { useStyletron } from 'baseui'
import { useContext } from 'react'
import { Profile } from '../../../../service/solas'
import DialogsContext from '../../../provider/DialogProvider/DialogsContext'
import {useRouter} from "next/navigation";
import usePicture from "../../../../hooks/pictrue";

const style = {
    wrapper: {
        position: 'relative' as const,
        display: 'flex',
        flexDirection: 'column' as const,
        width: '100px',
        height: '125px',
        borderRadius: '15px',
        background: 'var(--color-card-bg)',
        boxShadow: '0 1.9878px 11.9268px rgb(0 0 0 / 10%)',
        padding: '10px',
        cursor: 'pointer' as const,
        alignItems: 'center',
        marginBottom: '10px',
        boxSizing: 'border-box' as const,
        transition: 'all 0.12s linear',
        ':hover' : {
            transform: 'translateY(-8px)'
        },
        ':active' : {
            boxShadow: '0px 1.9878px 3px rgba(0, 0, 0, 0.1)'
        }
    },
    img:  {
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        marginBottom: '10px'
    },
    name: {
        fontWeight: 400,
        maxWidth: '90%',
        whiteSpace: 'nowrap' as const,
        overflow: 'hidden' as const,
        textOverflow: 'ellipsis' as const,
        fontSize: '12px'
    },
    pendingMark: {
        position: 'absolute' as const,
        fontWeight: 600,
        fontSize: '12px',
        color: 'var(--color-text-main)',
        padding: '0 10px',
        background: '#ffdc62',
        height: '28px',
        boxSizing: 'border-box' as const,
        lineHeight: '28px',
        borderRadius: '28px',
        top: '5px',
        left: '5px'
    },
    hideMark: {
        width: '90px',
        height: '90px',
        borderRadius: '50%',
        position: 'absolute' as const,
        background: 'rgba(0,0,0,0.3)',
        top: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px'
    },
    coverBg: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '6px',
        marginBottom: '8px',
        marginTop: '8px',
        position: 'relative' as const,
    },
    ownerMark: {
        width: '17px',
        height: '17px',
        position: 'absolute' as const,
        right: '0',
        bottom: '10px'
    }
}

export interface CardMemberProps {
    profile: Profile
    isOwner?: boolean
}

function CardMember (props: CardMemberProps) {
    const [css] = useStyletron()
    const { showBadge } = useContext(DialogsContext)
    const router = useRouter()
    const { defaultAvatar } = usePicture()

    return (<div className={ css(style.wrapper) } onClick={() => { router.push(`/profile/${props.profile?.username}`) }}>
                <div className={ css(style.coverBg) }>
                    <img className={ css(style.img) } src={ props.profile.image_url || defaultAvatar(props.profile.id) } alt=""/>
                    {
                        props.isOwner && <img className={ css(style.ownerMark) } src='/images/icon_owner.png' />
                    }
                </div>
                <div className={ css(style.name) }>{ props.profile.username }</div>
            </div>)
}

export default CardMember
