import NotificationsContext from './NotificationsContext'
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import {useContext} from "react";
import DialogNotifications from "@/components/base/Dialog/DialogNotifications/DialogNotifications";


export default function NotificationsProvider(props: { children: any}) {
    const {openDialog} = useContext(DialogsContext)

    const showNotification = () => {
        openDialog({
            content: (close: any) => <DialogNotifications close={close}  notification={[]}/>,
            size: ['100%', '100%'],
        })
    }

    return <NotificationsContext.Provider value={{showNotification, notificationCount: 0, newNotificationCount: 0}}>
        { props.children }
    </NotificationsContext.Provider>
}
