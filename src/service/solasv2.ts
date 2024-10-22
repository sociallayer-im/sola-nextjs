import fetch from '../utils/fetch'
import ex = CSS.ex;
const apiUrl = process.env.NEXT_PUBLIC_EVENT_LIST_API!
import {Comment, CommentType, Event} from './solas'

export const handleEventStar = async (props: {event_id: number, auth_token: string}) => {
    return await fetch.post({
        url: `${apiUrl}/comment/create`,
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

    return res.data as Event[]
}