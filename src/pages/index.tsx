import Page from "@/pages/event/index"
import MapPage from '@/pages/event/[groupname]/map'
import MaodaoHome from '@/pages/rpc'
import {Event, getEventGroup, getGroupMembership, Group, Membership, queryEvent} from "@/service/solas";
import SeedaoHome from "@/pages/seedao";

export default function HomePage(props: { initEvent: Group, initList?: Event[], membership?: Membership[] }) {
    return <>
        {
            process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'zumap' ?
                <MapPage markerType={null}/> :
                process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'maodao' ?
                    <MaodaoHome/> :
                    process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'seedao' ?
                        <SeedaoHome group={props.initEvent} /> :
                        <Page
                            initEvent={props.initEvent || undefined}
                            membership={props.membership || []}
                            initList={props.initList || []}/>
        }
    </>
}

export const getServerSideProps: any = (async (context: any) => {
    const list = await getEventGroup()
    let targetGroup: Group | undefined = undefined
    if (process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'zumap') {
        targetGroup = list.find((item: Group) => {
            return item.username === 'istanbul2023'
        })
    } else if (process.env.NEXT_PUBLIC_LEADING_EVENT_GROUP_ID) {
        targetGroup = list.find((item: Group) => {
            return item.id === Number(process.env.NEXT_PUBLIC_LEADING_EVENT_GROUP_ID)
        })
    } else {
        targetGroup = list[0]
    }

    const tab = context.query?.tab
    let res: any = []
    if (tab === 'past') {
        res = await queryEvent({
            page: 1,
            start_time_to: new Date().toISOString(),
            event_order: 'desc',
            group_id: targetGroup?.id
        })
    } else {
        res = await queryEvent({
            page: 1,
            start_time_from: new Date().toISOString(),
            event_order: 'asc',
            group_id: targetGroup?.id
        })
    }

    const membership = await getGroupMembership({
        group_id: targetGroup!.id,
        role: 'all',
    })

    return {props: {initEvent: targetGroup, initList: res, membership}}
})
