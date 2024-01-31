import NotificationsContext from './NotificationsContext'
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import {useContext, useEffect, useState} from "react";
import DialogNotifications from "@/components/base/Dialog/DialogNotifications/DialogNotifications";
import userContext from "@/components/provider/UserProvider/UserContext";
import {gql, request} from "graphql-request";
import {wsClient} from "@/components/base/Subscriber";
import {Activity, Invite} from "@/service/solas";

let subscription: any = null
let subscriptionActivity: any = null

export default function NotificationsProvider(props: { children: any }) {
    const {openDialog} = useContext(DialogsContext)
    const {user} = useContext(userContext)
    const [subscribeGroup, setSubscribeGroup] = useState<number[]>([])
    const [userRequest, setUserRequest] = useState<Invite[]>([])
    const [activities, setActivities] = useState<Activity[]>([])

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
            subscriptionActivity = null
            setUserRequest([])
            setActivities([])
            return
        }

        subscriptionActivity = null
        // create new subscription
        subscriptionActivity = wsClient.subscribe({
            query: `subscription {
                activities(where: {action: {_in: ["voucher/send_badge"]}, receiver_id: {_eq: ${user.id!}}, has_read: {_eq: false}}, order_by: {created_at: desc})  {
                    data
                    action
                    created_at
                    id
                    has_read
                    initiator {
                      id
                      image_url
                      nickname
                      username
                    }
                    item_class_id
                    item_id
                    item_type
                    memo
                    receiver_address
                    receiver_id
                    receiver_type
                    target_id
                    target_type
                  }
                  }`
        }, {
            next: (event: any) => {
                console.log('subscription activities : ', event)
                if (event.data.activities || event.data.activities.length) {
                    setActivities(event.data.activities)
                }
            },
            error: (error) => {
                console.error(error)
            },
            complete: () => {
            },
        })

        getMyGroup()
    }, [user.userName])

    useEffect(() => {
        subscription = null

        if (!subscribeGroup.length) {
            setUserRequest([])
            setActivities([])
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
                        setUserRequest(event.data.group_invites)
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
            content: (close: any) => <DialogNotifications
                newActivities={activities}
                close={close}
                newRequestList={userRequest}/>,
            size: ['100%', '100%'],
        })
    }

    return <NotificationsContext.Provider value={{
        showNotification,
        notificationCount: userRequest.length,
        newNotificationCount:userRequest.length  + activities.length}}>
        {props.children}
    </NotificationsContext.Provider>
}
