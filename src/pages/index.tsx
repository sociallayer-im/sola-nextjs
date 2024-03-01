import DiscoverPage from "@/pages/discover"
import Page from "@/pages/event/index"
import MapPage from '@/pages/event/[groupname]/map'
import MaodaoHome from '@/pages/rpc'
import {
    Badge,
    Event,
    getEventGroup,
    getGroupMembership,
    Group,
    memberCount,
    Membership,
    PopupCity,
    queryBadge,
    queryEvent,
    queryPopupCity
} from "@/service/solas";
import SeedaoHome from "@/pages/seedao";

export default function HomePage(props: { badges: Badge[], eventGroups: Group[], members: { group_id: number, count: number }[], initEvent: Group, initList?: Event[], popupCities: PopupCity[], membership?: Membership[] }) {
    return <>
        {
            process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'zumap' ?
                <MapPage markerType={null}/> :
                process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'maodao' ?
                    <MaodaoHome/> :
                    process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'seedao' ?
                        <SeedaoHome group={props.initEvent}/> :
                        process.env.NEXT_PUBLIC_LEADING_EVENT_GROUP_ID ?
                            <Page
                                badges={props.badges}
                                initEvent={props.initEvent || undefined}
                                membership={props.membership || []}
                                initList={props.initList || []}/>
                            :
                            <DiscoverPage
                                popupCities={props.popupCities}
                                eventGroups={props.eventGroups}
                                members={props.members}/>
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
        queryBadge({group_id: targetGroupId, page: 1}),
        queryPopupCity({page: 1, page_size: 8})
    ]

    console.time('Home page fetch data')
    const [targetGroup, events, membership, badges, popupCities] = await Promise.all(task)
    console.timeEnd('Home page fetch data')

    const groupIds = targetGroup.map((item: Group) => item.id)
    const members = await memberCount(groupIds)

    return {
        props: {
            initEvent: targetGroup.find((g: Group) => g.id === targetGroupId),
            initList: events,
            badges: badges.data,
            popupCities,
            eventGroups: targetGroup,
            members,
            membership
        }
    }
})
