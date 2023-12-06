import {useContext, useEffect, useRef} from 'react'
import UserContext from '../provider/UserProvider/UserContext'
import DialogsContext from '../provider/DialogProvider/DialogsContext'
import solas, {getPendingBadges} from '../../service/solas'

const Pusher = typeof window !== 'undefined' ? (window as any).Pusher : null
let pusher: any = null
if (Pusher) {
    Pusher.logToConsole = true
    pusher = new Pusher('f88b7452d706ba1a2494', {cluster: 'ap3'})
}

function Subscriber() {
    const {user} = useContext(UserContext)
    const {showBadgelet, showInvite, showNftpasslet, showGiftItem , showVoucher} = useContext(DialogsContext)
    const SubscriptionDomain = useRef('')

    // 实时接受badgelet
    useEffect(() => {
        if (!pusher) return

        if (!user.domain) {
            if (SubscriptionDomain.current) {
                pusher.unsubscribe(SubscriptionDomain.current)
            }
            return
        }

        const channel = pusher.subscribe(user.domain)
        SubscriptionDomain.current = user.domain
        channel.bind('send_badge', async (data: any) => {
            const badgeletId = data.message
            const badgelet = await solas.queryBadgeletDetail({id: Number(badgeletId)})
            showBadgelet(badgelet)
        })

        channel.bind('send_group_invite', async (data: any) => {
            const inviteId = data.message.group_invite_id
            const groupId = data.message.group_id
            const badgelet = await solas.queryInviteDetail({
                group_id: groupId,
                invite_id: inviteId,
            })
            showInvite(badgelet)
        })

    }, [user.domain])

    useEffect(() => {
        if (!user.id || !user.domain) return

        async function showPendingBadgelets() {
            const vouchers = await solas.getPendingBadges( user.id!, 1)
            const pendingBadgelets = vouchers.filter((item) => !item.claimed_at)

            pendingBadgelets.forEach((item) => {
                // if (!item.badge.badge_type || item.badge.badge_type === 'badge') {
                //     showBadgelet({...item, owner: item.receiver}, item)
                // }
                //
                // if (item.badge.badge_type === 'gift') {
                //     showGiftItem(item)
                // }
                //
                // if (item.badge.badge_type === 'nftpass') {
                //     showNftpasslet(item)
                // }
                //
                // if (item.badge.badge_type === 'private') {
                //     showBadgelet(item)
                // }
                showVoucher(item)
            })
        }

        showPendingBadgelets()

        async function showPendingInvite() {
            if (!user.id) return

            const invites = await solas.queryInvites({
                receiverId: user.id!,
                onlyPending: true
            })
            invites.forEach((item) => {
                showInvite(item)
            })
        }

        solas.queryUserActivity({target_id: user.id})
        showPendingInvite()
    }, [user.id, user.domain])

    return (<></>)
}

export default Subscriber
