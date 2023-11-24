import { createContext } from 'react'
import {Profile, Group} from "@/service/solas";

interface EventHomeContextType {
    eventGroups: Profile[],
    availableList: Profile[],
    userGroup: Profile[],
    ready: boolean,
    joined: boolean,
    leadingEvent: null | {id: number, username: string, logo: string | null}
    eventGroup: Profile | null,
    setEventGroup: (group: Profile) => any,
    setList: (groups: Group[]) => any,
    setReady: (ready: boolean) => any,
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
    setList: (groups: Group[]) => {},
    setReady: (ready: boolean) => {},
    findGroup: (username: string) => {},
    isManager: false,
    reload: () => {} ,
})

export default EventHomeContext
