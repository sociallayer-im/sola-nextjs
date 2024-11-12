import DiscoverPage from "@/pages/discover"
import Page from "@/pages/event/index"
import MapPage from '@/pages/event/[groupname]/map'
import MaodaoHome from '@/pages/rpc'
import {
    Badge,
    Event,
    getEventGroup,
    getGroupMembership,
    Group, ListData,
    memberCount,
    Membership,
    PopupCity,
    queryBadge,
    queryEvent, queryGroupDetail,
    queryPopupCity
} from "@/service/solas";
import SeedaoHome from "@/pages/seedao";
import discoverData from "@/data/discover.data";
import {useEffect, useContext} from "react";
import DialogToMainScreen from "@/components/base/Dialog/DialogToMainScreen/DialogToMainScreen";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";

export default function HomePage(props: {
    badges?: Badge[],
    eventGroups?: Group[],
    initEvent?: Group,
    initList?: Event[],
    popupCities?: PopupCity[],
    membership?: Membership[]
    events?: Event[]
}) {

    const {openDialog} = useContext(DialogsContext)

    useEffect(() => {
        if (typeof window === 'undefined') return
        const expired = window.localStorage.getItem('installprompt')
        // 7 days 1000 * 60 * 60 * 24 * 7
        // 1min  1000 * 60
        if (!!(window as any).deferredPrompt && (!expired || (expired && Number(expired) + 1000 * 60 * 60 * 24 * 3  < new Date().getTime()))) {
            window.localStorage.setItem('installprompt', new Date().getTime().toString())
            openDialog({
                content: (close: any) => <DialogToMainScreen close={close}/>,
                position: 'bottom',
                size: ['auto', 'auto'],
            })
        }
    }, []);

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
                                events={props.events!}
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
        const eventgroup = await queryGroupDetail(targetGroupId)
        console.timeEnd('seedao home page fetch data')
        return  { props : {initEvent: eventgroup}}

    } else if (!!process.env.NEXT_PUBLIC_LEADING_EVENT_GROUP_ID) {
        console.time('event home page fetch data')
        const task = [
            queryGroupDetail(targetGroupId),
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



        const [targetGroup, events, membership, badges] = await Promise.all(task) as [Group, Event[], Membership[], ListData<Badge>]
        console.timeEnd('event home page fetch data')
        return {
            props: {
                initEvent: targetGroup,
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
