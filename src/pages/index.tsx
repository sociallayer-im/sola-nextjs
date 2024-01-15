import Page from "@/pages/event/index"
import MapPage from '@/pages/event/[groupname]/map'
import MaodaoHome from '@/pages/rpc'
import {Event, getEventGroup, getGroupMembership, Group, Membership, queryBadge, queryEvent, Badge} from "@/service/solas";
import SeedaoHome from "@/pages/seedao";

export default function HomePage(props: { badges: Badge[], initEvent: Group, initList?: Event[], membership?: Membership[] }) {
    return <>
        {
            process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'zumap' ?
                <MapPage markerType={null}/> :
                process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'maodao' ?
                    <MaodaoHome/> :
                    process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'seedao' ?
                        <SeedaoHome group={props.initEvent}/> :
                        <Page
                            badges={props.badges}
                            initEvent={props.initEvent || undefined}
                            membership={props.membership || []}
                            initList={props.initList || []}/>
        }
    </>
}

export const getServerSideProps: any = (async (context: any) => {
    let targetGroupId = 1516
    const tab = context.query?.tab

    if (process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'zumap') {
        targetGroupId = 1984
    } else if (process.env.NEXT_PUBLIC_LEADING_EVENT_GROUP_ID) {
        targetGroupId = Number(process.env.NEXT_PUBLIC_LEADING_EVENT_GROUP_ID)
    }


    const task = [
        getEventGroup(),
        tab === 'past' ?
            queryEvent({
                page: 1,
                end_time_lte: new Date().toISOString(),
                event_order: 'desc',
                group_id: targetGroupId
            }) :
            queryEvent({
                page: 1,
                end_time_gte: new Date().toISOString(),
                event_order: 'asc',
                group_id: targetGroupId
            }),
        getGroupMembership({
            group_id: targetGroupId,
            role: 'all',
        }),
        queryBadge({group_id: targetGroupId, page: 1})
    ]

    console.time('Home page fetch data')
    const [targetGroup, events, membership, badges] = await Promise.all(task)
    console.timeEnd('Home page fetch data')

    return {props: {
        initEvent: targetGroup.find((g: Group) => g.id === targetGroupId),
            initList: events,
            badges: badges.data,
            membership}}
})
