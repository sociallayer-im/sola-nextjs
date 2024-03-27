import {useContext} from 'react'
import UserContext from '../provider/UserProvider/UserContext'
import MenuItem from './MenuItem'
import {PLACEMENT, StatefulPopover} from 'baseui/popover'
import {useStyletron} from 'baseui'
import LangContext from '../provider/LangProvider/LangContext'
import usePicture from '../../hooks/pictrue'
import {useRouter} from 'next/navigation'
import ImgLazy from "@/components/base/ImgLazy/ImgLazy";
import NotificationsContext from "@/components/provider/NotificationsProvider/NotificationsContext";

const style = {
    wrapper: {
        display: 'flex',
        'flex-direction': 'row',
        'flex-wrap': 'nowrap',
        alignItems: 'center',
        cursor: 'pointer'
    },
    img: {
        width: '16px',
        height: '16px',
        borderRadius: ' 50%',
        marginRight: '6px'
    },
    showName: {
        maxWidth: '40px',
        overflow: 'hidden',
        'text-overflow': 'ellipsis',
        whiteSpace: 'nowrap',
        color: 'var(--color-text-main)'
    },
    dot: {
        height: '8px',
        width: '8px',
        borderRadius: '50%',
        background: '#F26692',
        position: 'relative',
        transform: 'translate(4px, -4px)',
        display: 'inline-block'
    }
}

function ProfileMenu() {
    const {user, logOut} = useContext(UserContext)
    const {lang} = useContext(LangContext)
    const [css] = useStyletron()
    const router = useRouter()
    const {defaultAvatar} = usePicture()
    const {showNotification, newNotificationCount} = useContext(NotificationsContext)

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

    const toSetting = () => {
        router.push(`/profile-edit/${user.userName}`)
    }

    const toBind = () => {
        router.push(`/bind-email`)
    }

    const menuContent = (close: any) => <>
        {!!user.userName &&
            <>
                <MenuItem onClick={() => {
                    toProfile();
                    close()
                }}>{lang['UserAction_MyProfile']}</MenuItem>
                {
                    !user?.maodaoid &&
                    <MenuItem onClick={() => {
                        toSetting();
                        close()
                    }}>{lang['Profile_Setting']}</MenuItem>
                }
                {!user.email &&
                    <MenuItem onClick={() => {
                        toBind();
                        close()
                    }}>{lang['UserAction_Bind_Email']}</MenuItem>
                }
                <MenuItem onClick={() => {
                    showNotification();
                    close()
                }}>
                    {lang['Notifications']}
                    {
                        newNotificationCount > 0 && <i className={css(style.dot as any)} />
                    }
                </MenuItem>
            </>
        }
        <MenuItem onClick={() => {
            handleLogOut();
            close()
        }}>{lang['UserAction_Disconnect']}</MenuItem>
    </>


    const overridesStyle = {
        Body: {
            style: {
                'z-index': 999
            }
        }
    }

    const shortAddress = (address: null | string) => {
        if (!address) return address
        return `${address.substr(0, 6)}...${address.substr(-4)}`
    }

    return (
        <StatefulPopover
            overrides={overridesStyle}
            placement={PLACEMENT.bottomRight}
            returnFocus={false}
            content={({close}) => menuContent(close)}
            autoFocus>
            <div className={css(style.wrapper)}>
                <ImgLazy className={css(style.img)} src={user.avatar || defaultAvatar(user.id)} width={32} alt=""/>
                <div className={css(style.showName)}> {user.nickname || user.userName || shortAddress(user.wallet) || user.email || shortAddress(user.far_address)}</div>
                { newNotificationCount > 0 && <i className={css(style.dot as any)} /> }
            </div>
        </StatefulPopover>
    )
}

export default ProfileMenu
