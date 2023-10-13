import {useNavigate} from 'react-router-dom'
import { useStyletron } from 'baseui'
import { useState, useContext, useEffect } from 'react'
import { ellipsisText } from 'baseui/styles/util'
import { Group, Profile } from '../../../../service/solas'
import usePicture from '../../../../hooks/pictrue'
import LangContext from '../../../provider/LangProvider/LangContext'
import { Plus } from 'baseui/icon'

const style = {
    wrapper: {
        display: 'flex',
        flexDirection: 'column' as const,
        width: '100px',
        height: '124px',
        borderRadius: '15px',
        background: '#fff',
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
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        marginBottom: '10px',
        background: '#f5f8f6',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
    }
}

interface CardInviteMemberProps {
    groupId: number
}

function CardInviteMember (props: CardInviteMemberProps) {
    const [css] = useStyletron()
    const navigate = useNavigate()
    const { lang } = useContext(LangContext)

    return (
        <div className={ css(style.wrapper) } onClick={() => { navigate(`/invite-create/${props.groupId}`) }}>
            <div className={ css(style.img) }><Plus size={28}/></div>
        </div>
    )
}

export default CardInviteMember
