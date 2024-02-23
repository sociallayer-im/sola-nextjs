import {useSearchParams} from "next/navigation";
import CreateBadgeNonPrefill from './NonPrefill'
import CreateBadgeWithPrefill from './WithPrefill'
import {getGroups} from "@/service/solas";

function CreateBadge(props: {group: any}) {
    const searchParams = useSearchParams()
    const prefillBadgeId = searchParams?.get('badge')
    return  <>
        { prefillBadgeId
            ? <CreateBadgeWithPrefill badgeId={ Number(prefillBadgeId) } />
            : <CreateBadgeNonPrefill group={props.group} />
        }
    </>
}

export default CreateBadge


export async function getStaticProps() {
    if (process.env.NEXT_PUBLIC_LEADING_EVENT_GROUP_ID) {
        const group = await getGroups({id: Number(process.env.NEXT_PUBLIC_LEADING_EVENT_GROUP_ID)})
        return {props: {group: group[0]}}
    } else {
        const group = await getGroups({id: 1516})
        return {props: {group: group[0]}}
    }
}

