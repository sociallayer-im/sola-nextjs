import Page from "@/pages/event/index"
import MapPage from '@/pages/event/[groupname]/map'
import MaodaoHome from '@/pages/rpc'
import {getEventGroup, Group, queryEvent, Event} from "@/service/solas";

export default function HomePage(props: { initEvent: Group, initList?: Event[] }) {
    return <>
        {
            process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'zumap' ?
                <MapPage markerType={null}/> :
                process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'maodao' ?
                    <MaodaoHome/>
                    : <Page initEvent={props.initEvent || undefined} initList={props.initList || []}/>
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

    const now = new Date()
    const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).toISOString()

    let res = await queryEvent({
        page: 1,
        start_time_from: todayZero,
        event_order: 'asc',
        group_id: targetGroup?.id
    })

    res = res.filter(item => {
        const endTime = new Date(item.end_time!).getTime()
        return endTime >= new Date().getTime()
    })

    return {props: {initEvent: targetGroup, initList: res}}
})
