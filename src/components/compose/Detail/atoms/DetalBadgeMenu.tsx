import { StatefulPopover, PLACEMENT } from 'baseui/popover'
import { Overflow } from 'baseui/icon'
import { useState, useContext } from 'react'
import { Badge } from '../../../../service/solas'
import MenuItem from '../../../base/MenuItem'
import LangContext from '../../../provider/LangProvider/LangContext'
import UserContext from '../../../provider/UserProvider/UserContext'
import DialogsContext from '../../../provider/DialogProvider/DialogsContext'
import useEvent, { EVENT } from '../../../../hooks/globalEvent'
import useTransferOrRevoke from "../../../../hooks/transferOrRevoke";

export interface DetalBadgeMenuProps {
    badge: Badge,
    isGroupManager?: boolean
}

function DetailBadgeMenu (props: DetalBadgeMenuProps) {
    const { lang } = useContext(LangContext)
    const { user } = useContext(UserContext)
    const { showLoading, showToast } = useContext(DialogsContext)
    const [_1, emitListUpdate] = useEvent(EVENT.badgeletListUpdate)
    const [_2, emitDetailUpdate] = useEvent(EVENT.badgeletDetailUpdate)
    const {revoke} = useTransferOrRevoke()

    const MenuContent = (handleClose: () => any) => <>
        <MenuItem onClick={ () => { revoke({badge: props.badge}) } }>
            { lang['Dialog_Revoke_Confirm'] }
        </MenuItem>
    </>
    const overridesStyle = {
        Body : {
            style: {
                'z-index': 999,
                position: 'fixed',
                height: '24px'
            }
        },
        Inner: {
            style: {
                background: '#fff'
            }
        }
    }

    return (
        <>
            { (user.id === props.badge.sender.id || props.isGroupManager ) &&
                <StatefulPopover
                    overrides={ overridesStyle }
                    placement={ PLACEMENT.bottomRight }
                    content={ ({close}) => MenuContent(close) }
                    returnFocus
                >
                    <Overflow style={ { cursor: 'pointer', display: 'block' } } size={ 24 } />
                </StatefulPopover>
            }
        </>
    )
}

export default DetailBadgeMenu
