import fetch from '../utils/fetch'
import {CommentType, Event} from './solas'

const apiUrl = process.env.NEXT_PUBLIC_EVENT_LIST_API!

export const handleEventStar = async (props: { event_id: number, auth_token: string }) => {
    return await fetch.post({
        url: `${apiUrl}/comment/create`,
        data: {
            auth_token: props.auth_token,
            comment_type: 'star',
            item_type: 'Event',
            item_id: props.event_id,
        }
    })
}

export const getUserStaredComment = async (props: { profile_id: number }) => {
    const res = await fetch.post({
        url: `${apiUrl}/comment/list`,
        data: {
            profile_id: props.profile_id,
            comment_type: 'star',
            item_type: 'Event',
        }
    })

    return res.data.comments as CommentType[]
}

export const getStarEvent = async (props: { auth_token: string }) => {
    const res = await fetch.get({
        url: `${apiUrl}/event/my_event_list`,
        data: {
            collection: 'my_stars',
            auth_token: props.auth_token,
        }
    })

    return res.data.events as Event[]
}

export const sendEventFeedback = async (props: { event_id: number, content: string, auth_token: string }) => {
    return await fetch.post({
        url: `${apiUrl}/comment/create`,
        data: {
            auth_token: props.auth_token,
            comment_type: 'feedback',
            item_type: 'Event',
            item_id: props.event_id,
            content: props.content,
        }
    })
}

export const removeComment = async (props: { id: number, auth_token: string }) => {
    return await fetch.post({
        url: `${apiUrl}/comment/remove`,
        data: {
            auth_token: props.auth_token,
            id: props.id,
        }
    })
}

export const genDaimoLink = async (props: { ticket_item_id: number, redirect_uri?: string }) => {
    const res = await fetch.post({
        url: `${apiUrl}/ticket/daimo_create_payment_link`,
        data: props
    })

    return res.data as {
        id: string,
        url: string,
    }
}
