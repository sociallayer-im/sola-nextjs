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
        width: '335px',
        height: '210px',
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
        borderRadius: '50%',
        marginBottom: '8px',
        background: '#f5f8f6',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
    },
    name: {
        fontWeight: 600,
        maxWidth: '90%',
        whiteSpace: 'nowrap' as const,
        overflow: 'hidden' as const,
        textOverflow: 'ellipsis' as const,
        lineHeight: 'auto',
        marginBottom: '20px'
    },
    des: {
        fontSize: '12px',
        color: '#c3c7c3',
        textAlign: 'center' as const,
        lineHeight: '16px'
    }
}

function CardCreateGroup () {
    const [css] = useStyletron()
    const router = useRouter()
    const { lang } = useContext(LangContext)

    return (
        <div data-testid='CardCreateGroup' className={ css(style.wrapper) } onClick={() => { router.push('/create-group')}}>
            <div className={ css(style.img) }><Plus size={28}/></div>
            <div className={ css(style.name) }>{ lang['Group_regist_confirm'] }</div>
            <div className={ css(style.des) }>{ lang['Group_regist_des'] }</div>
        </div>
    )
}

export default CardCreateGroup
