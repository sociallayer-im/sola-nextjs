import {useContext, useEffect, useState} from 'react'
import EventHomeContext from "./EventHomeContext";
import {checkIsManager, getEventGroup, Profile, queryUserGroup} from "@/service/solas";
import UserContext from "../UserProvider/UserContext";
import {useParams} from "next/navigation";
import DialogsContext from "../DialogProvider/DialogsContext";

function EventHomeProvider(props: { children: any }) {
    const params = useParams()

    const [eventGroups, setEventGroups] = useState<Profile[]>([])
    const [availableList, setAvailableList] = useState<Profile[]>([])
    const [userGroup, setUserGroup] = useState<Profile[]>([])
    const [ready, setReady] = useState(false)
    const [selectedEventGroup, setSelectedEventGroup] = useState<Profile | null>(null)
    const [joined, setJoined] = useState(true)

    const [isManager, setIsManager] = useState(false)
    const [leadingEvent, setLeadingEvent] = useState<{ id: number, username: string, logo: string | null } | null>(null)
    const {user} = useContext(UserContext)
    const {showToast, showLoading} = useContext(DialogsContext)

    const getEventGroupList = async () => {
        const unload = showLoading()
        let eventGroup = await getEventGroup()
        const leadingEventGroupId = process.env.NEXT_PUBLIC_LEADING_EVENT_GROUP_ID
        const leadingEventGroupLogo = process.env.NEXT_PUBLIC_LEADING_EVENT_GROUP_LOGO
        console.log('leadingEventGroupIdleadingEventGroupId', leadingEventGroupId)
        if (leadingEventGroupId) {
            const leading = eventGroup.find(g => g.id === Number(leadingEventGroupId))
            console.log('leadingleadingleading', leading)
            if (leading) {
                setLeadingEvent({
                    id: Number(leadingEventGroupId),
                    username: leading.username || '',
                    logo: leadingEventGroupLogo || null
                })
                const listWithoutLeading = eventGroup.filter(g => g.id !== Number(leadingEventGroupId))
                eventGroup = [leading, ...listWithoutLeading]
                setEventGroups(eventGroup as Profile[])
            } else {
                setEventGroups(eventGroup as Profile[])
            }
        } else {
            setEventGroups(eventGroup as Profile[])
        }

        unload()
        setReady(true)
    }

    useEffect(() => {
        getEventGroupList()
    }, [])

    useEffect(() => {
        async function getAvailableList() {
            if (eventGroups.length) {
                if (user.id) {
                    const userGroup = await queryUserGroup({profile_id: user.id})
                    setUserGroup(userGroup as Profile[])
                    const res = eventGroups.filter(g => {
                        return g.group_event_visibility !== 'private' ||
                            userGroup.find(ug => ug.id === g.id)
                    })
                    setAvailableList(res as Profile[])
                } else {
                    const res = eventGroups.filter(g => {
                        return g.group_event_visibility !== 'private'
                    })
                    setAvailableList(res as Profile[])
                    setUserGroup([])
                }
            }
        }

        async function checkManager() {
            if (user.id && selectedEventGroup) {
                const isManager = await checkIsManager({profile_id: user.id, group_id: selectedEventGroup.id})
                setIsManager(isManager || user.id === selectedEventGroup.group_owner_id)
            } else {
                setIsManager(false)
            }
        }

        checkManager()
        getAvailableList()
    }, [eventGroups, user.id, selectedEventGroup])


    useEffect(() => {
        if (userGroup.length) {
            const joined = userGroup.find(g => {
                return selectedEventGroup?.id === g.id
            })

            setJoined(!!joined)
        }
    }, [userGroup.length, selectedEventGroup])

    const findGroup = (username: string) => {
        return eventGroups.find(p => p.username === username)
    }

    return (<EventHomeContext.Provider value={{
            userGroup,
            eventGroups,
            eventGroup: selectedEventGroup,
            setEventGroup: setSelectedEventGroup,
            findGroup,
            availableList,
            ready,
            joined,
            isManager,
            leadingEvent,
            reload: getEventGroupList
        }}>
            {props.children}
        </EventHomeContext.Provider>
    )
}

export default EventHomeProvider
