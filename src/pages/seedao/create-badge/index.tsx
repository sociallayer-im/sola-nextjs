import {useSearchParams} from "next/navigation";
import CreateBadgeNonPrefill from './NonPrefill'
import CreateBadgeWithPrefill from './WithPrefill'
import {getGroups} from "@/service/solas";

function CreateBadge(props: {group: any}) {
    const searchParams = useSearchParams()
    const prefillBadgeId = searchParams.get('badge')
    return  <>
        { prefillBadgeId
            ? <CreateBadgeWithPrefill badgeId={ Number(prefillBadgeId) } />
            : <CreateBadgeNonPrefill group={props.group}></CreateBadgeNonPrefill>
        }
    </>
}

export default CreateBadge


export async function getStaticProps() {
    const group = await getGroups({username: 'playground2'})
    return {props: {group: group[0]}}
}

