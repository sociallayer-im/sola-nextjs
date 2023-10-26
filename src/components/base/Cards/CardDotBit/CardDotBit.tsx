import {useStyletron} from 'baseui'
import {useContext} from 'react'
import DialogsContext from '../../../provider/DialogProvider/DialogsContext'
import {DotBitAccount} from "@/service/dotbit";
import DialogDotBitDetail from "@/components/base/Dialog/DialogDotBit/DialogDotBit";

const style = {
    wrapper: {
        position: 'relative' as const,
        display: 'flex',
        flexDirection: 'column' as const,
        width: '162px',
        height: '192px',
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
        width: '142px',
        height: '142px',
        borderRadius: '6px',
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
        height: '142px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '6px',
        marginBottom: '8px',
        background: 'var(--color-card-image-bg)',
    }
}

export interface CardNftProps {
    detail: DotBitAccount
}

function CardDotBit(props: CardNftProps) {
    const [css] = useStyletron()
    const {openDialog} = useContext(DialogsContext)

    const showDialog = () => {
        const dialog = openDialog({
            content: (close: any) => DialogDotBitDetail({detail: props.detail, close}),
            size: [460, 'auto'],
            position: 'bottom' as const
         })
    }

    return (<div className={css(style.wrapper)} onClick={() => {
        showDialog()
    }}>
        <div className={css(style.coverBg)}>
            <img className={css(style.img)} src={props.detail.image} alt="" width={132} height={132} />
        </div>
        <div className={css(style.name)}>{props.detail.account}</div>
    </div>)
}

export default CardDotBit
