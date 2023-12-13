import { createContext } from 'react'

export interface NotificationsContextType {
    showNotification: () => any
    notificationCount: number
    newNotificationCount: number

}

const NotificationsContext  = createContext<NotificationsContextType>({
    showNotification: () => {},
    notificationCount: 0,
    newNotificationCount: 0
})

export default NotificationsContext
