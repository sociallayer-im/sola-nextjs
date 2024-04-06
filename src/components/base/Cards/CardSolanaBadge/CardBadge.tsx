import {useStyletron} from 'baseui'
import {useContext} from 'react'
import UserContext from '../../../provider/UserProvider/UserContext'
import {useRouter} from "next/navigation";
import ImgLazy from "@/components/base/ImgLazy/ImgLazy";
import {SolanaBadgeLet} from "@/hooks/useMintSolanaBadge";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import {Badge, getProfileBatch, Group, ProfileSimple, queryBadgeDetail} from "@/service/solas";

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
    } as any,
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
    },
    solana: {
        position: 'absolute',
        right: '12px',
        top: '12px',
        width: '18px',
        height: '18px',
        borderRadius: '50%',
    } as any
}

export interface CardBadgeProps {
    badge: SolanaBadgeLet
}

function CardBadge(props: CardBadgeProps) {
    const [css] = useStyletron()
    const {user} = useContext(UserContext)
    const router = useRouter()
    const {showLoading, showBadgelet} = useContext(DialogsContext)

    const showDialog = async () => {
        // if (props.badge.badge_type === 'nftpass') {
        //     showNftpass(props.badge)
        // } else if (props.badge.badge_type === 'gift') {
        //     showGift(props.badge)
        // } else {
        //     showBadge(props.badge)
        // }
        //
        // router.push(`/badge/${props.badge.id}`)

        const badgeId = props.badge.metadataDetail.badge_id
        if (!badgeId) return

        const unload = showLoading()
        const task: any[] = [queryBadgeDetail({id: badgeId})]

        if (props.badge.metadataDetail.owner) {
            task.push(getProfileBatch([props.badge.metadataDetail.owner]))
        }

        if (props.badge.metadataDetail.creator) {
            task.push(getProfileBatch([props.badge.metadataDetail.creator]))
        }

        const [badge, owner, creator] = await Promise.all(task)

        const badgelet = {
            id: 0,
            badge_id: badgeId,
            content: props.badge.metadataDetail.description,
            domain: '',
            display: 'normal',
            owner: owner[0],
            creator: creator[0],
            status: 'accepted',
            token_id: null,
            badge: badge,
            chain_data: null,
            group: badge.group,
            created_at: props.badge.metadataDetail.create_at || null,
            last_consumed_at: null,
            metadata: null
        }

        unload()
        console.log('badgelet => ', badgelet)
        showBadgelet(badgelet)
    }

    const isSolana = true

    return (<div data-testid='CardBadge' className={css(style.wrapper)} onClick={() => {
        showDialog()
    }}>
        <div className={css(style.coverBg)}>
            <ImgLazy className={css(style.img)} width={180} height={180} src={props.badge.metadataDetail.image || '/images/solana.png'} alt=""/>
        </div>
        {isSolana && <img className={css(style.solana as any)} src={'/images/solana.png'} alt={'solana badge'}/>}
        <div className={css(style.name)}>{props.badge.metadataDetail.name}</div>
    </div>)
}

export default CardBadge
