import {useStyletron} from 'baseui'
import {Profile, Group} from '../../../../service/solas'
import usePicture from '../../../../hooks/pictrue'
import {useRouter} from "next/navigation";

const style = {
    wrapper: {
        position: 'relative' as const,
        display: 'flex',
        flexDirection: 'row' as const,
        borderRadius: '12px',
        background: 'var(--color-card-bg)',
        boxShadow: '0 1.9878px 11.9268px rgb(0 0 0 / 10%)',
        padding: '10px',
        cursor: 'pointer' as const,
        alignItems: 'center',
        marginBottom: '10px',
        boxSizing: 'border-box' as const,
        width: '100%',
        justifyContent: 'space-between'
    },
    img: {
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        marginRight: '10px'
    },
    name: {
        fontWeight: 400,
        color: 'var(--color-text-main)',
        fontSize: '14px'
    },
    leftSide: {
        display: 'flex',
        flexDirection: 'row' as const,
        alignItems: 'center',
    }
}

export interface CardSearchDomainProps {
    profile: Profile,
    keyword?: string
    onClick?: () => any,
    type?: 'group' | 'profile'
}

function CardSearchDomain(props: CardSearchDomainProps) {
    const [css] = useStyletron()
    const router = useRouter()
    const {defaultAvatar} = usePicture()

    const navigateToProfile = () => {
        if (props.type === 'group') {
            router.push(`/group/${props.profile?.username}`)
        } else {
            router.push(`/profile/${props.profile?.username}`)
        }
    }

    const displayName =  `${props.profile?.username}${props.profile?.nickname ? ` (${props.profile?.nickname})`: ''}`
    const highLightText = props.keyword
        ? displayName.replace(props.keyword, `<span class="highlight">${props.keyword}</span>`)
        : displayName

    return (<div data-testid='CardSearchDomain' className={css(style.wrapper)} onClick={() => {
        props.onClick ? props.onClick() : navigateToProfile()
    }}>
        <div className={css(style.leftSide)}>
            <img className={css(style.img)} src={props.profile?.image_url || defaultAvatar(props.profile?.id)} alt=""/>
            <div className={css(style.name)} dangerouslySetInnerHTML={{__html: highLightText || ''}}></div>
        </div>
        <div></div>
    </div>)
}

export default CardSearchDomain
