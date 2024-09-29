import Edit from '@/pages/event/[groupname]/create'
import {Event, getProfile, getTracks, Group, Profile, queryEvent, queryGroupDetail, Track} from "@/service/solas";


export default function Page ({initEvent, group, initCreator, tracks}: {initEvent?: Event, group?: Group, initCreator?: Profile | Group, tracks: Track[]}) {
    return <Edit initEvent={initEvent} group={group} initCreator={initCreator} tracks={tracks}/>
}

export const getServerSideProps: any = async (context: any) => {
    const groupname = context.params?.groupname
    const eventid = context.params?.eventid

    if (groupname) {
        const group = await queryGroupDetail(undefined, groupname)
        const tracks = group ? await getTracks({groupId: group.id}) : []
        return {props: {group, tracks}}
    } else if (eventid) {
        const events = await queryEvent({
            id: Number(eventid),
            page: 1,
            show_pending_event: true,
            show_cancel_event: true,
            allow_private: true
        })

        if (!events[0]) {
            return {props: {}}
        } else {
            const [group, creator, tracks] = await Promise.all(
                [
                    queryGroupDetail(events[0].group_id!),
                    getProfile({id: events[0].owner_id}),
                    getTracks({groupId: events[0].group_id!})
                ]
            )

            console.log('tracks ===>', tracks)

            if (!!events[0].host_info) {
                const info = JSON.parse(events[0].host_info!)
                if (info.group_host) {
                    return {props: {group: group, initEvent: events[0], initCreator: info.group_host, tracks}}
                } else {
                    return {props: {group: group, initEvent: events[0], initCreator: creator, tracks}}
                }
            } else {
                return {props: {group: group, initEvent: events[0], initCreator: creator, tracks}}
            }
        }
    } else {
        return {props: {}}
    }
}
