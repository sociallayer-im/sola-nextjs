import { StatefulPopover, PLACEMENT } from 'baseui/popover'
import { Overflow } from 'baseui/icon'
import { useState, useContext } from 'react'
import { Badgelet, setBadgeletStatus, SetBadgeletStatusType } from '../../../../service/solas'
import MenuItem from '../../../base/MenuItem'
import LangContext from '../../../provider/LangProvider/LangContext'
import UserContext from '../../../provider/UserProvider/UserContext'
import DialogsContext from '../../../provider/DialogProvider/DialogsContext'
import useEvent, { EVENT } from '../../../../hooks/globalEvent'
import useTransferOrRevoke from "../../../../hooks/transferOrRevoke";

export interface DetalBadgeletMenuProps {
    badgelet: Badgelet,
    closeFc?: () => any
}

function DetailBadgeletMenu (props: DetalBadgeletMenuProps) {
    const { lang } = useContext(LangContext)
    const { user } = useContext(UserContext)
    const { showLoading, showToast } = useContext(DialogsContext)
    const [_1, emitListUpdate] = useEvent(EVENT.badgeletListUpdate)
    const [_2, emitDetailUpdate] = useEvent(EVENT.badgeletDetailUpdate)
    const {transfer, burn} = useTransferOrRevoke()

    const setStatus = async (type: SetBadgeletStatusType, handleClose: () => any) => {
        handleClose()
        const unload = showLoading()
        try {
            const res = await setBadgeletStatus({
                auth_token: user.authToken || '',
                id: props.badgelet.id,
                type
            })
            unload()
            showToast('Operation succeeded')
            emitListUpdate(res)
            emitDetailUpdate(res)
        } catch (e: any) {
            console.log('[setStatus]:', e)
            unload()
            showToast(e.message || 'Operation failed')
        }
    }

    const MenuContent = (handleClose: () => any) => <>
        {
            props.badgelet.hide
                ? <MenuItem onClick={ () => { setStatus('unhide', handleClose) } }>
                    { lang['BadgeDialog_Label_action_public'] }
                  </MenuItem>
                : <MenuItem onClick={ () => { setStatus('hide', handleClose) } }>
                    { lang['BadgeDialog_Label_action_hide'] }
                  </MenuItem>
        }
        {
            props.badgelet.top
                ? <MenuItem onClick={ () => { setStatus('untop', handleClose) } }>
                    { lang['BadgeDialog_Label_action_untop'] }
                  </MenuItem>
                : <MenuItem onClick={ () => { setStatus('top', handleClose) } }>
                    { lang['BadgeDialog_Label_action_top'] }
                  </MenuItem>
        }
        { (props.badgelet.badge.badge_type === 'nftpass' || props.badgelet.badge.badge_type === 'gift') &&
            <MenuItem onClick={ () => { transfer({badgelet: props.badgelet}) } }>
                { lang['Dialog_Transfer_Confirm'] }
            </MenuItem>
        }

        <MenuItem onClick={ () => { burn({badgelet: props.badgelet, closeFc: props.closeFc}) } }>
            { lang['BadgeDialog_Label_action_Burn'] }
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
        <StatefulPopover
            overrides={ overridesStyle }
            placement={ PLACEMENT.bottomRight }
            content={ ({close}) => MenuContent(close) }
            returnFocus
        >
            <Overflow style={ { cursor: 'pointer', display: 'block' } } size={ 24 } />
        </StatefulPopover>
    )
}

export default DetailBadgeletMenu
