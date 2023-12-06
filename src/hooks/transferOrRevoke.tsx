import DialogsContext from "../components/provider/DialogProvider/DialogsContext";
import {useContext} from "react";
import DialogAddressList from "../components/base/Dialog/DialogAddressList/DialogAddressList";
import userContext from "../components/provider/UserProvider/UserContext";
import langContext from "../components/provider/LangProvider/LangContext";
import {Badge, Badgelet, badgeletBurn, badgeRevoke, badgeTransfer} from "../service/solas";
import useEvent, {EVENT} from "./globalEvent";

export interface BadgeTransferProps {
    badgelet: Badgelet,
}

export interface BadgeBurnProps {
    badgelet: Badgelet,
    closeFc?: () => any,
}

export interface BadgeRevokeProps {
    badge: Badge,
}

const useTransferOrRevoke = () => {
    const {
        openDialog,
        showTransferAccept,
        showToast,
        showLoading,
        clean,
        openConfirmDialog,
        showRevoke,
    } = useContext(DialogsContext);
    const {user} = useContext(userContext);
    const {lang} = useContext(langContext);
    const [_1, updateNftpass] = useEvent(EVENT.nftpassItemUpdate)
    const [_2, updateGiftList] = useEvent(EVENT.giftItemUpdate)
    const [_3, updateBadgeletList] = useEvent(EVENT.badgeletListUpdate)

    const transfer = (props: BadgeTransferProps) => {
        openDialog({
            content: (close: () => any) => {
                const handleTransfer = async (selected: number[]) => {
                    const unloading = showLoading()
                    // showTransferAccept({badgelet: props.badgelet, pointItem: props.pointItem})
                    try {
                        const transfer = await badgeTransfer({
                            badgelet_id: props.badgelet?.id!,
                            target_id: selected[0],
                            auth_token: user.authToken || '',
                        })
                        updateNftpass('0')
                        updateGiftList('0')
                        unloading()
                        showToast('Transfer Success')
                        setTimeout(() => {
                            clean('transfer success')
                        }, 3000)
                    } catch (e: any) {
                        unloading()
                        console.error(e)
                        showToast(e.message || 'Transfer failed')
                    }
                }

                return <DialogAddressList
                    value={[] as any}
                    title={lang['Dialog_Transfer_Title']}
                    confirmText={lang['Dialog_Transfer_Confirm']}
                    single
                    valueType={'id'}
                    handleConfirm={(selected) => {
                        handleTransfer(selected as number[])
                    }}
                    handleClose={close}/>
            },
            size: ['100%', '100%']
        })
    }

    const revoke = (props: BadgeRevokeProps) => {
        showRevoke({
            badge: props.badge,
        })
    }

    const burn = (props: BadgeBurnProps) => {
        const diaolog = openConfirmDialog({
            title: lang['Dialog_burn_Title'],
            content: lang['Dialog_burn_Confirm_des'],
            confirmTextColor: '#F64F4F!important',
            confirmBtnColor: 'rgb(245, 248, 246)!important',
            onConfirm: async (close: any) => {
                const unloading = showLoading()
                try {
                    const res = await badgeletBurn({
                        badgelet_id: props.badgelet?.id || 0,
                        auth_token: user.authToken || '',
                    })
                    updateNftpass(res)
                    updateGiftList(res)
                    updateBadgeletList(res)
                    unloading()
                    showToast('Burn Success')
                    close()
                    props.closeFc?.()
                } catch (e: any) {
                    unloading()
                    console.error(e)
                    showToast(e.message || 'Burn failed')
                }
            }
        })
    }

    return {transfer, revoke, burn}
}

export default useTransferOrRevoke
