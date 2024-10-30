import fetch from '../utils/fetch'
const apiUrl = process.env.NEXT_PUBLIC_EVENT_LIST_API!
import {Activity, Badgelet, Badge, CommentType, Event, Voucher, ProfileSimple} from './solas'

export const handleEventStar = async (props: {event_id: number, auth_token: string}) => {
    return await fetch.post({
        url: `${apiUrl}/comment/star`,
        data: {
            auth_token: props.auth_token,
            comment_type:'star',
            item_type: 'Event',
            item_id: props.event_id,
        }
    })
}

export const cancelEventStar = async (props: {event_id: number, auth_token: string}) => {
    return await fetch.post({
        url: `${apiUrl}/comment/unstar`,
        data: {
            auth_token: props.auth_token,
            comment_type:'star',
            item_type: 'Event',
            item_id: props.event_id,
        }
    })
}

export const getUserStaredComment = async (props: {profile_id: number}) => {
    const res =  await fetch.post({
        url: `${apiUrl}/comment/list`,
        data: {
            profile_id: props.profile_id,
            comment_type:'star',
            item_type: 'Event',
        }
    })

    return res.data.comments as CommentType[]
}

export const getStarEvent = async (props: {auth_token: string}) => {
    const res =  await fetch.get({
        url: `${apiUrl}/event/my_event_list`,
        data: {
            collection: 'my_stars',
            auth_token: props.auth_token,
        }
    })

    return res.data.events as Event[]
}

export const sendEventFeedback = async (props: {event_id: number, content: string, auth_token: string}) => {
    return await fetch.post({
        url: `${apiUrl}/comment/create`,
        data: {
            auth_token: props.auth_token,
            comment_type:'feedback',
            item_type: 'Event',
            item_id: props.event_id,
            content: props.content,
        }
    })
}

export const removeComment = async (props: {id: number, auth_token: string}) => {
    return await fetch.post({
        url: `${apiUrl}/comment/remove`,
        data: {
            auth_token: props.auth_token,
            id: props.id,
        }
    })
}

export const createRememberVoucher = async (props: {auth_token: string}) => {
    // 1749
     const res = await fetch.post({
        url: `${apiUrl}/remember/create`,
        data: {
            ...props,
            badge_class_id: 1749,
        }
    })

    return res.data.voucher as Voucher
}

export const joinRemember = async (props: {auth_token: string, voucher_id: number}) => {
    const res =  await fetch.post({
        url: `${apiUrl}/remember/join`,
        data: {
            ...props,
        }
    })

    return res.data as {
        activity: Activity,
        sender: ProfileSimple
    }
}


export const getJoinedRemember = async (props: {voucher_id: number}) => {
    const res =  await fetch.get({
        url: `${apiUrl}/remember/get`,
        data: {
            ...props,
        }
    })

    return res.data as {
        activities: Activity[],
        voucher: Voucher,
        badge_class: Badge
    }
}

export const mintRemember = async (props: {auth_token: string, voucher_id: number}) => {
    const res = await fetch.post({
        url: `${apiUrl}/remember/mint`,
        data: {
            ...props,
        }
    })

    return res.data.badge_class as Badge
}

export const cancelJoinRemember = async (props: {auth_token: string, voucher_id: number}) => {
    return await fetch.post({
        url: `${apiUrl}/remember/cancel`,
        data: {
            ...props,
        }
    })
}
