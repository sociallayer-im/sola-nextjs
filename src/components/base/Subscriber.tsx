import {useContext, useEffect, useRef} from 'react'
import UserContext from '../provider/UserProvider/UserContext'
import DialogsContext from '../provider/DialogProvider/DialogsContext'
import {voucherSchema} from '@/service/solas'
import {createClient} from 'graphql-ws'

export const wsClient = createClient({
    url: process.env.NEXT_PUBLIC_GRAPH!.replace('https', 'wss'),
})

let subscription: any = null
let subscriptionInvite: any = null
let subscriptionInvite2: any = null


function Subscriber() {
    const {user} = useContext(UserContext)
    const {showInvite, showVoucher} = useContext(DialogsContext)
    const SubscriptionUserId = useRef<null | string>(null)

    // 实时接受badgelet
    useEffect(() => {
        console.log('change subscription: ', user.userName)
        const clean = () => {
            // !!subscription && subscription()
            // !!subscriptionInvite && subscriptionInvite()
            subscription && subscription()
            subscription = null
            subscriptionInvite && subscriptionInvite()
            subscriptionInvite = null
            SubscriptionUserId.current = null
        }
        // unSubscribe
        if (!user.userName && SubscriptionUserId) {
            clean()
        }

        // handle subscribe
        if (user.userName && user.userName !== SubscriptionUserId.current) {
            clean()
            SubscriptionUserId.current = user.userName

            // create new
            subscription = wsClient.subscribe({
                query: `subscription { ${voucherSchema({page: 1, receiver_id: user.id!, address: user.wallet || undefined})} }`,
            }, {
                next: (event: any) => {
                    console.log('subscription voucher: ', event)
                    if (event.data.vouchers || event.data.vouchers.length) {
                        event.data.vouchers.forEach((item: any) => {
                            const history = window.sessionStorage.getItem('voucherHistory') || ''
                            if (!history.split(',').includes(item.id + '')) {
                                showVoucher(item)
                                window.sessionStorage.setItem('voucherHistory', `${history},${item.id}`)
                            }
                        })
                    }
                },
                error: (error) => {
                },
                complete: () => {
                },
            });

            subscriptionInvite = wsClient.subscribe({
                    query: `subscription { 
                        group_invites(where: {status: {_eq: "sending"}, expires_at: {_gt: "${new Date().toISOString()}"}, _or: [{receiver_address: {_eq: "${user.wallet || user.email}"}}, {receiver_id: {_eq: ${user.id}}}]}) 
                        {
                            message
                            id
                            group_id
                            role
                            receiver_id
                            created_at
                            status
                            receiver_address
                            expires_at
                            receiver {
                                id
                                image_url
                                nickname
                                username
                            }
                        }
                    }`,
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
                        console.error(error)
                    },
                    complete: () => {
                    },
                })

        }

        return () => {
            clean()
        }
    }, [user.userName])

    return (<></>)
}

export default Subscriber
