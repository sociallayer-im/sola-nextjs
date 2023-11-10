import { useContext } from 'react'
import UserContext from '../provider/UserProvider/UserContext'
import MenuItem from './MenuItem'
import { StatefulPopover, PLACEMENT } from 'baseui/popover'
import { useStyletron } from 'baseui'
import LangContext from '../provider/LangProvider/LangContext'
import usePicture from '../../hooks/pictrue'
import {useRouter} from 'next/navigation'

function ProfileMenu () {
    const { user, logOut } = useContext(UserContext)
    const { lang } = useContext(LangContext)
    const [css] = useStyletron()
    const router = useRouter()
    const { defaultAvatar } = usePicture()

    const handleLogOut = () => {
        logOut()
    }

    const toProfile = () => {
        if (user?.maodaoid) {
            router.push(`/rpc/${user.maodaoid}`)
        } else {
            router.push(`/profile/${user.userName}`)
        }
    }

    const toBind = () => {
        router.push(`/bind-email`)
    }

    const menuContent = (close: any) => <>
        { !!user.domain &&
            <>
                <MenuItem onClick={ () => { toProfile(); close() } }>{ lang['UserAction_MyProfile'] }</MenuItem>
                { !user.email &&
                    <MenuItem onClick={ () => { toBind(); close() } }>{ lang['UserAction_Bind_Email'] }</MenuItem>
                }
            </>
        }
        <MenuItem onClick={ () => { handleLogOut(); close() } }>{ lang['UserAction_Disconnect'] }</MenuItem>
    </>

    const style = {
        wrapper: {
            display: 'flex',
            'flex-direction': 'row',
            'flex-wrap': 'nowrap',
            alignItems: 'center',
            cursor: 'pointer'
        },
        img : {
            width: '16px',
            height: '16px',
            borderRadius: ' 50%',
            marginRight: '6px'
        },
        showName: {
            maxWidth: '40px',
            overflow: 'hidden',
            'text-overflow': 'ellipsis',
            whitespace: 'nowrap',
            color:'var(--color-text-main)'
        },
    }

    const overridesStyle = {
        Body : {
            style: {
                'z-index': 999
            }
        }}

    const shortAddress = (address: null | string) => {
        if (!address) return address
        return `${address.substr(0, 6)}...${address.substr(-4)}`
    }

    return (
        <StatefulPopover
            overrides={ overridesStyle }
            placement={ PLACEMENT.bottomRight }
            returnFocus = { false }
            content={ ({close}) => menuContent(close) }
            autoFocus>
            <div className={ css(style.wrapper) }>
                <img className={ css(style.img) } src={ user.avatar || defaultAvatar(user.id) } alt="" />
                <div className={css(style.showName)}> {user.nickname || user.userName || shortAddress(user.wallet) || user.email}</div>
            </div>
        </StatefulPopover>
    )
}

export default ProfileMenu
