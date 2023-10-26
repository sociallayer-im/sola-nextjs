import {useStyletron} from 'baseui'
import {Badgelet} from '../../../../service/solas'
import DialogsContext from '../../../provider/DialogProvider/DialogsContext'
import {useContext, useEffect, useState} from 'react'
import UserContext from '../../../provider/UserProvider/UserContext'
import {checkIsManager, getProfile} from "../../../../service/solas";

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
        ':hover': {
            transform: 'translateY(-8px)'
        },
        ':active': {
            boxShadow: '0px 1.9878px 3px rgba(0, 0, 0, 0.1)'
        }
    },
    img: {
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
        borderTopLeftRadius: '6px',
        borderBottomRightRadius: '6px',
        top: '10px',
        left: '10px'
    },
    hideMark: {
        width: '90px',
        height: '90px',
        borderRadius: '50%',
        position: 'absolute' as const,
        background: 'rgba(0,0,0,0.3)',
        top: '26px',
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

export interface CardBadgeletProps {
    badgelet: Badgelet
}

function CardBadgelet(props: CardBadgeletProps) {
    const [css] = useStyletron()
    const {showBadgelet, showGiftItem} = useContext(DialogsContext)
    const {user} = useContext(UserContext)
    const [isGroupManager, setIsGroupManager] = useState(false)

    const isOwner = user.id === props.badgelet.receiver.id

    const showDialog = () => {
        if (props.badgelet.badge.badge_type === 'gift') {
            showGiftItem(props.badgelet)
        } else {
            showBadgelet(props.badgelet)
        }
    }

    useEffect(() => {
        async function checkManager() {
            if(user.id && props.badgelet.status === 'pending') {
                const receiverDetail = await getProfile({id:props.badgelet.owner.id})

                if (receiverDetail?.is_group) {
                    const res = await checkIsManager({
                        group_id: props.badgelet.owner.id,
                        profile_id: user.id
                    })
                    setIsGroupManager(res)
                }
            }
        }

        checkManager()
    }, [user.id])

    const metadata = props.badgelet.metadata ? JSON.parse(props.badgelet.metadata) : null

    return (<div data-testid='CardBadgelet' className={css(style.wrapper)} onClick={() => {
        showDialog()
    }}>
        {
            (props.badgelet.badge.badge_type === 'private' && !isOwner) ?
                <>
                    <div className={css(style.coverBg)}>
                        <img className={css(style.img)} src={'/images/badge_private.png'} alt=""/>
                    </div>
                    {props.badgelet.hide && <div className={css(style.hideMark)}><i className='icon-lock'></i></div>}
                    <div className={css(style.name)}>🔒</div>
                </>
                : <>
                    <div className={css(style.coverBg)}>
                        <img className={css(style.img)} src={metadata?.image || props.badgelet.badge.image_url} alt=""/>
                    </div>
                    {props.badgelet.hide && <div className={css(style.hideMark)}><i className='icon-lock'></i></div>}
                    <div className={css(style.name)}>{metadata?.name || props.badgelet.badge.name}</div>

                    {(isOwner || isGroupManager) && props.badgelet.status === 'pending' &&
                        <div className={css(style.pendingMark)}>Pending</div>
                    }
                </>
        }
    </div>)
}

export default CardBadgelet
