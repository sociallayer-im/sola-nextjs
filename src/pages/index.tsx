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
import discoverData from "@/data/discover.data";

export default function HomePage(props: { badges?: Badge[], eventGroups?: Group[], initEvent?: Group, initList?: Event[], popupCities?: PopupCity[], membership?: Membership[] }) {
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
                                eventGroups={props.eventGroups!}/>
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

    if (process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'zumap' || process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'maodao') {
        console.time('zumap/maodao home page fetch data')
        console.timeEnd('zumap/maodao home page fetch data')
        return  { props : {}}

    } else if (process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'seedao') {
        console.time('seedao home page fetch data')
        const eventgroups = await getEventGroup()
        console.timeEnd('seedao home page fetch data')
        return  { props : {initEvent: eventgroups.find((g: Group) => g.id === targetGroupId)}}

    } else if (!!process.env.NEXT_PUBLIC_LEADING_EVENT_GROUP_ID) {
        console.time('event home page fetch data')
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
        console.timeEnd('event home page fetch data')
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
        return await discoverData(context)
    }
})
