import {EventSites, getEventSide, getGroups, Group} from "@/service/solas"
import Calendar from "@/pages/event/[groupname]/calendar";

function IframeCalendar({group, eventSite}: { group: Group, eventSite: EventSites[] }) {

    return (<Calendar group={group} eventSite={eventSite} />)
}

export default IframeCalendar


export const getServerSideProps: any = (async (context: any) => {
    const groupname = context.query?.group
    if (groupname) {
        const group = await getGroups({username: groupname})
        const eventSite = await getEventSide(group[0].id)
        return {props: {group: group[0], eventSite}}
    } else {
        throw new Error('Group not found')
    }
})
