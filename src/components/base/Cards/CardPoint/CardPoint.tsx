import { useStyletron } from 'baseui'
import {Badgelet, Point} from '../../../../service/solas'
import DialogsContext from '../../../provider/DialogProvider/DialogsContext'
import { useContext } from 'react'
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
        borderTopLeftRadius: '6px',
        borderBottomRightRadius: '6px',
        top: '10px',
        left: '10px'
    },
    value: {
        width: '90px',
        height: '90px',
        borderRadius: '50%',
        position: 'absolute' as const,
        background: 'rgba(0,0,0,0.3)',
        top: '26px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        color: '#fff'
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
    point: Point
}

function CardPoint(props: CardBadgeletProps) {
    const [css] = useStyletron()
    const { showPoint } = useContext(DialogsContext)
    const { user } = useContext(UserContext)

    const isOwner = user.id === props.point.sender.id

    return (<div className={ css(style.wrapper) } onClick={ () => { showPoint(props.point) }}>
                <div className={css(style.coverBg)}>
                    <img className={ css(style.img) } src={ props.point.image_url } alt=""/>
                </div>
                <div className={css(style.value)}>Value</div>
                <div className={ css(style.name) }>{ props.point.title }</div>
            </div>)
}

export default CardPoint
