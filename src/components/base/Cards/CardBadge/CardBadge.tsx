import { useStyletron } from 'baseui'
import { useContext } from 'react'
import { Badge } from '../../../../service/solas'
import DialogsContext from '../../../provider/DialogProvider/DialogsContext'
import UserContext from '../../../provider/UserProvider/UserContext'

const style = {
    wrapper: {
        position: 'relative' as const,
        display: 'flex',
        flexDirection: 'column' as const,
        width: '162px',
        height: '182px',
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
        width: '90px',
        height: '90px',
        borderRadius: '50%',
        marginBottom: '10px'
    },
    name: {
        fontWeight: 600,
        maxWidth: '90%',
        whiteSpace: 'nowrap' as const,
        overflow: 'hidden' as const,
        textOverflow: 'ellipsis' as const,
        fontSize: '14px'
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
        width: '100%',
        minWidth: '142px',
        height: '132px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-card-image-bg)',
        borderRadius: '6px',
        marginBottom: '8px'
    }
}

export interface CardBadgeProps {
    badge: Badge
}

function CardBadge (props: CardBadgeProps) {
    const [css] = useStyletron()
    const { showBadge, showGift, showNftpass } = useContext(DialogsContext)
    const {user} = useContext(UserContext)

    const showDialog = () => {
        if (props.badge.badge_type === 'nftpass') {
            showNftpass(props.badge)
        } else if (props.badge.badge_type === 'gift') {
            showGift(props.badge)
        } else {
            showBadge(props.badge)
        }
    }

    return (<div data-testid='CardBadge' className={ css(style.wrapper) } onClick={() => { showDialog() }}>
        {
            (props.badge.badge_type === 'private' && props.badge.sender.id !== user.id) ?
                <>
                    <div className={ css(style.coverBg) }>
                        <img className={ css(style.img) } src={ '/images/badge_private.png'} alt=""/>
                    </div>
                    <div className={ css(style.name) }>🔒</div>
                </>
               : <>
                    <div className={ css(style.coverBg) }>
                        <img className={ css(style.img) } src={ props.badge.image_url } alt=""/>
                    </div>
                    <div className={ css(style.name) }>{ props.badge.name }</div>
                </>
        }
            </div>)
}

export default CardBadge
