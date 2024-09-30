import {EventSites, getEventSide, getGroups, getTracks, Group, Track} from "@/service/solas"
import Schedule from "@/pages/event/[groupname]/schedule";

function IframeSchedulePage({group, eventSite, tracks}: { group: Group, eventSite: EventSites[], tracks: Track[] }) {

    return (<Schedule group={group} eventSite={eventSite} tracks={tracks}/>)
}

export default IframeSchedulePage


export const getServerSideProps: any = (async (context: any) => {
    const groupname = context.query?.group
    if (groupname) {
        const group = await getGroups({username: groupname})
        const eventSite = await getEventSide(group[0].id)
        const tracks = await getTracks({groupId: group[0].id})
        return {props: {group: group[0], eventSite: eventSite, tracks}}
    } else {
        throw new Error('Group not found')
    }
})
