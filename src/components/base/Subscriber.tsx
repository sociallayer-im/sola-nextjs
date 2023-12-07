import {useContext, useEffect, useRef} from 'react'
import UserContext from '../provider/UserProvider/UserContext'
import DialogsContext from '../provider/DialogProvider/DialogsContext'
import solas, {inviteSchema, voucherSchema} from '../../service/solas'
import {createClient} from 'graphql-ws'

const wsClient = createClient({
    url: process.env.NEXT_PUBLIC_GRAPH!.replace('https', 'wss'),
})

let subscription: any = null
let subscriptionInvite: any = null


function Subscriber() {
    const {user} = useContext(UserContext)
    const {showInvite, showVoucher} = useContext(DialogsContext)
    const SubscriptionUserId = useRef(0)

    // 实时接受badgelet
    useEffect(() => {
        const clean = () => {
            !!subscription && subscription()
            !!subscriptionInvite && subscriptionInvite()
            SubscriptionUserId.current = 0
        }
        // unSubscribe
        if (!user.id && SubscriptionUserId) {
            clean()
        }

        // handle subscribe
        if (user.id && user.id !== SubscriptionUserId.current) {
            clean()
            SubscriptionUserId.current = user.id

            // create new
            subscription = wsClient.subscribe({
                query: `subscription { ${voucherSchema({page: 1, receiver_id: user.id!})} }`,
            }, {
                next: (event: any) => {
                    console.log('subscription voucher: ', event)
                    if (event.data.vouchers || event.data.vouchers.length) {
                        event.data.vouchers.forEach((item: any) => {
                            showVoucher(item)
                        })
                    }
                },
                error: (error) => {
                },
                complete: () => {
                },
            });

            subscriptionInvite = wsClient.subscribe({
                    query: `subscription { ${inviteSchema({receiverId: user.id!})} }`,
                },
                {
                    next: (event: any) => {
                        console.log('subscription invite: ', event)
                        if (event.data.group_invites || event.data.group_invites.length) {
                            event.data.group_invites.forEach((item: any) => {
                                showInvite(item)
                            })
                        }
                    },
                    error: (error) => {
                    },
                    complete: () => {
                    },
                })
        }

        return () => {
            clean()
        }
    }, [user.id])

    return (<></>)
}

export default Subscriber
