import Page from '@/pages/event/[groupname]/index'
import {getEventGroup, getGroupMembership, Group, queryBadge, queryEvent} from "@/service/solas";

export default function EventPage (props: any) {
    return <Page {...props}></Page>
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
