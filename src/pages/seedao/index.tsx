import GroupPage from '@/pages/group/[groupname]/index'
import {getGroups} from "@/service/solas";

export default function Page(props: {group: any }) {
    return <GroupPage group= {props.group} groupname={props.group.username}  />
}

export const getServerSideProps: any = (async (context: any) => {
    if (process.env.NEXT_PUBLIC_LEADING_EVENT_GROUP_ID) {
        const group = await getGroups({id: Number(process.env.NEXT_PUBLIC_LEADING_EVENT_GROUP_ID)})
        return {props: {group: group[0]}}
    } else {
        const group = await getGroups({username: 'playground2'})
        return {props: {group: group[0]}}
    }
})
