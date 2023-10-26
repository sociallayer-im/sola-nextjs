import { useStyletron } from 'baseui'
import { Profile } from '../../../../service/solas'
import usePicture from '../../../../hooks/pictrue'
import { ReactDOM, ReactNode } from 'react'
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
    img:  {
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

export interface CardUserProps {
    profile?: Profile,
    endEnhancer? : () =>  string | ReactNode
    content?: () =>  string | ReactNode
    img?: () =>  string | ReactNode
    onClick?: () => any
}

function CardUser (props: CardUserProps) {
    const [css] = useStyletron()
    const router = useRouter()
    const { defaultAvatar } = usePicture()

    return (<div data-testid='CardUser' className={ css(style.wrapper) } onClick={ () => { props.onClick ? props.onClick() : router.push(`/profile/${props.profile?.username}`) }}>
                <div className={css(style.leftSide)}>
                    { props.img
                        ? props.img()
                        : <img className={ css(style.img) } src={ props.profile?.image_url || defaultAvatar(props.profile?.id)} alt=""/>
                    }

                    <div className={ css(style.name) }>{ props.content ? props.content() : props.profile?.domain }</div>
                </div>
                <div>{ !!props.endEnhancer && props.endEnhancer() }</div>
            </div>)
}

export default CardUser
