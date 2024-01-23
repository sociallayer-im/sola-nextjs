import NotificationsContext from './NotificationsContext'
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import {useContext, useEffect, useState} from "react";
import DialogNotifications from "@/components/base/Dialog/DialogNotifications/DialogNotifications";
import userContext from "@/components/provider/UserProvider/UserContext";
import {gql, request} from "graphql-request";
import {wsClient} from "@/components/base/Subscriber";
import {Invite} from "@/service/solas";

let subscription: any = null

export default function NotificationsProvider(props: { children: any }) {
    const {openDialog} = useContext(DialogsContext)
    const {user} = useContext(userContext)
    const [subscribeGroup, setSubscribeGroup] = useState<number[]>([])
    const [infoList, setInfoList] = useState<Invite[]>([])

    const getMyGroup = async () => {
        const doc = gql`
        query MyQuery {
         groups(where: {memberships: {profile_id: {_eq: ${user.id}}, _or: [{role: {_eq: "manager"}},{ role: {_eq: "owner"}}]}}) {
            id
        }
        }
        `

        const res:any = await request(process.env.NEXT_PUBLIC_GRAPH!, doc)
        setSubscribeGroup(res.groups.map((item: any) => item.id))
    }

    useEffect(() => {
        if (!user.userName) {
            subscription = null
            setInfoList([])
            return
        }
        getMyGroup()
    }, [user.userName])

    useEffect(() => {
        subscription = null

        if (!subscribeGroup.length) {
            setInfoList([])
            return
        }

        subscription = wsClient.subscribe({
                query: `subscription { 
                        group_invites(where: {status: {_eq: "requesting"}, group_id: {_in: [${subscribeGroup.join(',')}]}}) 
                        {
                            message
                            id
                            group_id
                            role
                            receiver_id
                            created_at
                            status
                            receiver_address
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
                    console.log('subscription group_request_invites : ', event)
                    if (event.data.group_invites || event.data.group_invites.length) {
                        setInfoList(event.data.group_invites)
                    }
                },
                error: (error) => {
                    console.error(error)
                },
                complete: () => {
                },
            })

        return () => {
            subscription = null
        }
    }, [subscribeGroup])


    const showNotification = () => {
        openDialog({
            content: (close: any) => <DialogNotifications close={close} notification={infoList}/>,
            size: ['100%', '100%'],
        })
    }

    return <NotificationsContext.Provider value={{showNotification, notificationCount:infoList.length, newNotificationCount:infoList.length}}>
        {props.children}
    </NotificationsContext.Provider>
}
