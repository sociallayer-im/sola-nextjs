import { createContext } from 'react'
import {Profile} from "@/service/solas";

interface EventHomeContextType {
    eventGroups: Profile[],
    availableList: Profile[],
    userGroup: Profile[],
    ready: boolean,
    joined: boolean,
    leadingEvent: null | {id: number, username: string, logo: string | null}
    eventGroup: Profile | null,
    setEventGroup: (group: Profile) => any,
    findGroup: (username: string) => any,
    reload: any,
    isManager: boolean,
}

const EventHomeContext = createContext<EventHomeContextType>({
    eventGroups: [],
    availableList: [],
    userGroup: [],
    leadingEvent: null,
    ready: false,
    joined: false,
    eventGroup: null,
    setEventGroup: (group: Profile) => {},
    findGroup: (username: string) => {},
    isManager: false,
    reload: () => {} ,
})

export default EventHomeContext
