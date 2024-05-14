import {EventSites, getEventSide, getGroups, Group} from "@/service/solas"
import Schedule from "@/pages/event/[groupname]/schedule";

function IframeSchedulePage({group, eventSite}: { group: Group, eventSite: EventSites[] }) {

    return (<Schedule group={group} eventSite={eventSite} />)
}

export default IframeSchedulePage


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
