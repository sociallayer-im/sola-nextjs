import { useStyletron } from 'baseui'
import { useState, useContext, useEffect } from 'react'
import { ellipsisText } from 'baseui/styles/util'
import { Group, Profile } from '../../../../service/solas'
import usePicture from '../../../../hooks/pictrue'
import LangContext from '../../../provider/LangProvider/LangContext'
import {useRouter} from "next/navigation";

const style = {
    wrapper: {
        display: 'flex',
        flexDirection: 'column' as const,
        height: '210px',
        width: '162px',
        borderRadius: '15px',
        background: 'var(--color-card-bg)',
        boxShadow: '0 1.9878px 11.9268px rgb(0 0 0 / 10%)',
        padding: '10px',
        cursor: 'pointer' as const,
        position: 'relative' as const,
        alignItems: 'center',
        justifyContent: 'center',
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
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        marginBottom: '8px'
    },
    name: {
        fontWeight: 600,
        maxWidth: '90%',
        whiteSpace: 'nowrap' as const,
        overflow: 'hidden' as const,
        textOverflow: 'ellipsis' as const,
        lineHeight: 'auto',
        fontSize: '16px',
        color: 'var(--color-text-main)',
    },
    des: {
        padding: '6px 12px',
        fontSize: '14px',
        color: '#272928',
        lineHeight: '16px',
        background: '#F8F9F8',
        borderRadius: '31px',
        marginTop: '38px'
    }
}

export interface CardGroupProps {
    group: Group,
    profile: Profile
}

function CardGroup (props: CardGroupProps) {
    const [css] = useStyletron()
    const router = useRouter()
    const { defaultAvatar } = usePicture()
    const { lang } = useContext(LangContext)

    const toGroupDetail = () => {
        router.push(`/group/${props.group.username}`)
    }

    return (
        <div data-testid='CardGroup' className={ css(style.wrapper) } onClick={ toGroupDetail }>
                <img className={ css(style.img) } src={ props.group.image_url || defaultAvatar(props.group.id) } alt=""/>
                <div className={ css(style.name) }>{ props.group.username }</div>
                <div className={ css(style.des) }>{ props.group.group_owner_id === props.profile.id
                    ? lang['Group_relation_ship_owner']
                    : lang['Group_relation_ship_member'] }</div>
        </div>
    )
}

export default CardGroup
