import { useStyletron } from 'baseui'
import { useState, useContext, useEffect } from 'react'
import { ellipsisText } from 'baseui/styles/util'
import { Group, Profile } from '../../../../service/solas'
import usePicture from '../../../../hooks/pictrue'
import LangContext from '../../../provider/LangProvider/LangContext'
import { Plus } from 'baseui/icon'
import {useRouter} from "next/navigation";

const style = {
    wrapper: {
        display: 'flex',
        flexDirection: 'column' as const,
        width: '100px',
        height: '124px',
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
        marginRight: '12px',
        transition: 'all 0.12s linear',
        ':hover' : {
            transform: 'translateY(-8px)'
        },
        ':active' : {
            boxShadow: '0px 1.9878px 3px rgba(0, 0, 0, 0.1)'
        }
    },
    img:  {
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        background: '#f5f8f6',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '10px'
    }
}

interface CardInviteMemberProps {
    groupId: number
}

function CardInviteMember (props: CardInviteMemberProps) {
    const [css] = useStyletron()
    const router = useRouter()
    const { lang } = useContext(LangContext)

    return (
        <div className={ 'list-item' } onClick={() => { router.push(`/create-invite/${props.groupId}`) }}>
            <div className={'left'}>
                <div className={ css(style.img) }><Plus size={16}/></div>
                <span>{'Invite members'}</span>
            </div>
        </div>
    )
}

export default CardInviteMember
