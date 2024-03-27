import {getGroups, Group} from "@/service/solas"
import Schedule from "@/pages/event/[groupname]/schedule";

function IframeSchedulePage({group}: { group: Group }) {

    return (<Schedule group={group} />)
}

export default IframeSchedulePage


export const getServerSideProps: any = (async (context: any) => {
    const groupname = context.query?.group
    if (groupname) {
        const group = await getGroups({username: groupname})
        return {props: {group: group[0]}}
    } else {
        throw new Error('Group not found')
    }
})
