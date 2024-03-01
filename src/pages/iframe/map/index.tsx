import Map from "@/pages/event/[groupname]/map";
import {getGroups, Group} from "@/service/solas";

function IframeSchedulePage({markerType, group}: { markerType: string | null, group?: Group }) {

    return <Map markerType={markerType} group={group} isIframe />
}

export default IframeSchedulePage


export const getServerSideProps: any = (async (context: any) => {
    const groupname = context.query?.group
    const group = await getGroups({username: groupname})
    return {props: {markerType: null, group: group[0]}}
})
