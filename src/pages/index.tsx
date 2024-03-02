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

export default function HomePage(props: { badges?: Badge[], eventGroups?: Group[], members?: { group_id: number, count: number }[], initEvent?: Group, initList?: Event[], popupCities?: PopupCity[], membership?: Membership[] }) {
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
                                popupCities={props.popupCities!}
                                eventGroups={props.eventGroups!}
                                members={props.members!}/>
        }
    </>
}

export const getServerSideProps: any = (async (context: any) => {
    console.time('Home page fetch data')
    let targetGroupId = 1516
    const tab = context.query?.tab

    if (process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'zumap') {
        targetGroupId = 1984
    } else if (process.env.NEXT_PUBLIC_LEADING_EVENT_GROUP_ID) {
        targetGroupId = Number(process.env.NEXT_PUBLIC_LEADING_EVENT_GROUP_ID)
    }

    if (process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'zumap' || process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'maodao') {
        console.timeEnd('Home page fetch data')
        return  { props : {}}

    } else if (process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'seedao') {
        const eventgroups = await getEventGroup()
        console.timeEnd('Home page fetch data')
        return  { props : {initEvent: eventgroups.find((g: Group) => g.id === targetGroupId)}}

    } else if (!! process.env.NEXT_PUBLIC_LEADING_EVENT_GROUP_ID) {
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
        ]



        const [targetGroup, events, membership, badges] = await Promise.all(task)
        console.timeEnd('Home page fetch data')
        return {
            props: {
                initEvent: targetGroup.find((g: Group) => g.id === targetGroupId),
                initList: events,
                badges: badges.data,
                eventGroups: targetGroup,
                membership
            }
        }
    } else {
        const task = [
            queryPopupCity({page: 1, page_size: 8}),
            getEventGroup(),
        ]

        const [popupCities, eventGroups] = await Promise.all(task)

        const groupIds = eventGroups.map((item: Group) => item.id)
        const members = await memberCount(groupIds)

        console.timeEnd('Home page fetch data')
        return  {
            props: {
                popupCities,
                eventGroups,
                members
            }
        }
    }
})
