import Edit from '@/pages/event/[groupname]/create'
import {Event, getProfile, Group, Profile, queryEvent, queryGroupDetail} from "@/service/solas";


export default function Page ({initEvent, group, initCreator}: {initEvent?: Event, group?: Group, initCreator?: Profile | Group}) {
    return <Edit initEvent={initEvent} group={group} initCreator={initCreator}/>
}

export const getServerSideProps: any = async (context: any) => {
    const groupname = context.params?.groupname
    const eventid = context.params?.eventid

    if (groupname) {
        const group = await queryGroupDetail(undefined, groupname)
        return {props: {group}}
    } else if (eventid) {
        const events = await queryEvent({allow_private: true, id: Number(eventid), page: 1, show_pending_event: true, show_cancel_event: true})
        if (!events[0]) {
            return {props: {initEvent: null, group: null, initCreator: null}}
        } else {
            const [group, creator] = await Promise.all(
                [
                    queryGroupDetail(events[0].group_id!),
                    getProfile({id: events[0].owner_id})
                ]
            )

            if (!!events[0].host_info) {
                const info = JSON.parse(events[0].host_info!)
                if (info.group_host) {
                    return {props: {group: group, initEvent: events[0], initCreator: info.group_host}}
                } else {
                    return {props: {group: group, initEvent: events[0], initCreator: creator}}
                }
            } else {
                return {props: {group: group, initEvent: events[0], initCreator: creator}}
            }
        }
    } else {
        return {props: {initEvent: null, group: null, initCreator: null}}
    }
}
