import {useStyletron} from 'baseui'
import {useContext, useEffect, useState} from 'react'
import DialogsContext from '../../../provider/DialogProvider/DialogsContext'
import {NftDetail} from "@/service/alchemy/alchemy";
import DialogNftDetail from "@/components/base/Dialog/DialogNftDetail/DialogNftDetail";

const style1 = {
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
        color: '#272928',
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
        marginBottom: '8px'
    }
}

const style2 = {
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
        fontSize: '14px',
        color: 'var(--color-text-main)'
    },
    pendingMark: {
        position: 'absolute' as const,
        fontWeight: 600,
        fontSize: '12px',
        color: '#272928',
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

export interface CardNftProps {
    detail: NftDetail,
    type?: 'badge' | 'nft'
}

function CardNft(props: CardNftProps) {
    const [css] = useStyletron()
    const {openDialog} = useContext(DialogsContext)
    const style = props.type === 'badge' ? style2 : style1
    const [cover, setCover] = useState<string>('/images/nft.jpg')

    const showDialog = () => {
        const dialog = openDialog({
            content: (close: any) => DialogNftDetail({detail: {...props.detail, image: cover}, close}),
            size: [460, 'auto'],
            position: 'bottom' as const
        })
    }

    useEffect(() => {
        try {
            const img = new Image()
            const src = props.detail.image.includes('ipfs://')
                ? props.detail.image.replace('ipfs://', 'https://ipfs.io/ipfs/')
                : props.detail.image

            img.src = src
            img.onload = () => {
                setCover(src)
            }
            img.onerror = () => {
                setCover('/images/nft.jpg')
            }
        } catch (e) {
            setCover(props.detail.image)
        }
    }, [])

    return (<div className={css(style.wrapper)} onClick={() => {
        showDialog()
    }}>
        <div className={css(style.coverBg)}>
            <img className={css(style.img)} src={cover} alt="" width={132} height={132}/>
        </div>
        <div className={css(style.name)}>{props.detail.title}</div>
    </div>)
}

export default CardNft
