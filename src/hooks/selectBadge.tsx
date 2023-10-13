import {useContext} from 'react'
import DialogsContext from "../components/provider/DialogProvider/DialogsContext";
import {Badge, queryBadge} from "../service/solas";
import DialogIssuePrefill from "../components/base/Dialog/DialogIssuePrefill/DialogIssuePrefill";

export interface showSelectedBadgeProps {
    profileId?: number
    groupId?: number
    onConfirm: (badge: Badge, close: () => any) => any
}

function useSelectedBadge() {
    const {openDialog, showLoading} = useContext(DialogsContext)

    const showSelectedBadge = async (props: showSelectedBadgeProps) => {
        let badge: Badge[] = []
        let page = 1
        const unload = showLoading()

        const getBadge = async () => {
            if (props.profileId) {
                const res  = await queryBadge({sender_id: props.profileId, page})
                badge = [...badge, ...res]
                if (res.length === 20) {
                    page++
                    await getBadge()
                }
            }
            if (props.groupId) {
                const res  = await queryBadge({group_id: props.groupId, page})
                badge = [...badge, ...res]
                if (res.length === 20) {
                    page++
                    await getBadge()
                }
            }
        }

        await getBadge()
        unload()

        const dialog = openDialog({
            content: (close: any) => {
                return <DialogIssuePrefill
                    badges={badge}
                    handleClose={close}
                    profileId={0}
                    onSelect={
                        (res) => {
                            if (res.badge) {
                                props.onConfirm(res.badge, close)
                            }
                        }
                    }
                />
            },
            size: [350, 'auto'],
            position: 'bottom'
        })
    }

    return {showSelectedBadge}
}

export default useSelectedBadge
