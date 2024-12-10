import fetch from '../utils/fetch'
const apiUrl = process.env.NEXT_PUBLIC_EVENT_LIST_API!
import {Activity, Badgelet, Badge, CommentType, Event, Voucher, ProfileSimple, EventSites} from './solas'

export const handleEventStar = async (props: { event_id: number, auth_token: string }) => {
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

export const createRememberVoucher = async (props: {auth_token: string, badge_class_id: number}) => {
     const res = await fetch.post({
        url: `${apiUrl}/remember/create`,
        data: props
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

export const getUserPopupcitys = async (props: {ids: number[]}) => {
    const res =  await fetch.get({
        url: `${apiUrl}/service/get_user_related_groups`,
        data: {
            profile_ids: props.ids.join(',') ,
        }
    })

    return res.data.group_data as {[index: string]: {
            groups: {id: number, handle: string, image_url: null | string}[]
    }}
}

export const getRememberMetadata = async () => {
    const res =  await fetch.get({
        url: `${apiUrl}/remember/meta`,
        data: {}
    })

    return res.data.types[0] as {
        "path": string,
        "badge_class_id": number,
        "count": number,
        "description": string
    } | undefined
}

export const getThemeEvent = async (props: {theme: string, group_id?: number, auth_token?:  string}) => {
    if (!props.group_id) {
        return  []
    }

    const res =  await fetch.get({
        url: `${apiUrl}/event/list`,
        data: props
    })

    return res.data.events as Event[]
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

export const signinWithZkEmail = async (props: {email: string, next_token: string}) => {
    const response = await fetch.post({
        url: `${apiUrl}/profile/signin_with_zkemail`,
        data: {
            ...props,
            address_source: 'zkemail'
        }
    })

    if (response.data.result !== 'ok') {
        throw new Error(response.data.message)
    }

    return response.data.auth_token as string
}

export async function minaLogin(props: {
    mina_address: string,
    next_token: string,
    host?: string
}) {
    const res: any = await fetch.post({
        url: `${apiUrl}/profile/signin_with_mina`,
        data: {...props, app: props.host, address_source: 'mina'}
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }

    return res.data.auth_token as string
}

interface EditEventProps extends Partial<EventSites> {
    auth_token: string,
    venue_id?: number,
}

export async function updateEventSite(props: EditEventProps) {
    const res: any = await fetch.post({
        url: `${apiUrl}/venue/update`,
        data: {
            auth_token: props.auth_token,
            id: props.venue_id,
            venue: {
                ...props,
                venue_overrides_attributes: props.venue_overrides,
                venue_timeslots_attributes: props.venue_timeslots
            }
        }
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }

    return res.data.venue as EventSites
}

export async function createEventSite(props: EditEventProps) {
    const res: any = await fetch.post({
        url: `${apiUrl}/venue/create`,
        data: {
            group_id: props.group_id,
            auth_token: props.auth_token,
            venue: {
                ...props,
                venue_overrides_attributes: props.venue_overrides,
                venue_timeslots_attributes: props.venue_timeslots
            }
        }
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }

    return res.data.venue as EventSites
}

export async function fuelLogin(props: {
    fuel_address: string,
    next_token: string,
    host?: string
}) {
    const res: any = await fetch.post({
        url: `${apiUrl}/profile/signin_with_fuel`,
        data: {...props, app: props.host, address_source: 'fuel'}
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }

    return res.data.auth_token as string
}

