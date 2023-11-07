import {useStyletron} from 'baseui'
import {useRouter} from 'next/navigation'

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
        height: '195px',
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
        width: '50px',
        height: '50px',
        borderRadius: '50%',
    },
    name: {
        fontWeight: 400,
        maxWidth: '90%',
        whiteSpace: 'nowrap' as const,
        overflow: 'hidden' as const,
        textOverflow: 'ellipsis' as const,
        fontSize: '14px',
        color: 'var(--color-text-main)',
        lineHeight: '20px'
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
        minWidth: '50px',
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '6px',
        marginBottom: '8px',
        marginTop: '14px'
    },
    position: {
        fontWeight: 400,
        maxWidth: '90%',
        whiteSpace: 'nowrap' as const,
        overflow: 'hidden' as const,
        textOverflow: 'ellipsis' as const,
        fontSize: '12px',
        color: 'var(--color-text-sub)',
        lineHeight: '20px'
    },
    tag: {
        fontWeight: 400,
        maxWidth: '90%',
        whiteSpace: 'nowrap' as const,
        overflow: 'hidden' as const,
        textOverflow: 'ellipsis' as const,
        fontSize: '12px',
        color: 'var(--color-text-main)',
        backgroundColor: 'var(--color-page-bg)',
        lineHeight: '24px',
        padding: '0 7px',
        marginTop: '8px',
        minHeight: '24px',
        borderRadius: '4px'
    }
}

export interface CardNftProps {
    detail: {
        "cat_id": string,
        "cat_name": string,
        "owner": string,
        "tag1": string,
        "tag2": string,
        "project": string,
        "position": string
    },
    type?: 'badge' | 'nft'
}

const zeroPad = (num: string) => {
    // 使用正则匹配出第一个数字，然后补0
    const numStr = num.split('（')[0]
    return String(numStr).padStart(4, '0')
}


function MaodaoCardMembers(props: CardNftProps) {
    const [css] = useStyletron()
    const style = style2
    const router = useRouter()


    const showDialog = (id: string) => {
        router.push(`/maodao/${id}`, {scroll: false})
    }

    return (<div className={css(style.wrapper)} onClick={() => {
        showDialog(zeroPad(props.detail.cat_id))
    }}>
        <div className={css(style.coverBg)}>
            <img className={css(style.img)} src={`https://asset.maonft.com/rpc/${zeroPad(props.detail.cat_id)}.png`}
                 alt="" width={132} height={132}/>
        </div>
        <div className={css(style.name)}>{props.detail.owner}</div>
        <div className={css(style2.position)}>{props.detail.project}</div>
        {!!props.detail.tag1 &&
            <div className={css(style2.tag)}>{props.detail.tag1}</div>
        }
        {!!props.detail.tag2 &&
            <div className={css(style2.tag)}>{props.detail.tag2}</div>
        }
    </div>)
}

export default MaodaoCardMembers
