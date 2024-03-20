import {Group, PopupCity} from "@/service/solas";
import {gql, request} from "graphql-request";

const discoverData: any = async (context: any): Promise<{
    props: {
        eventGroups: Group[],
        popupCities: PopupCity[]
    }
}> => {
    const doc = gql`query MyQuery {
      groups(where: {event_enabled: {_eq: true}, status: {_neq: "freezed"}}) {
        events_count
        memberships_count
        group_tags
        about
        permissions
        banner_image_url
        banner_link_url
        banner_text
        can_join_event
        can_publish_event
        can_view_event
        created_at
        map_enabled
        event_enabled
        event_tags
        id
        image_url
        lens
        location
        nickname
        status
        telegram
        twitter
        username
        discord
        ens
        memberships(where: {role: {_eq: "owner"}}) {
          id
          role
          profile {
            id
            nickname
            username
            image_url
          }
        }
      }
      popup_cities(offset: 0, limit: 8, order_by: {id: desc}) {
            id
            group_tags
            image_url
            location
            start_date
            title
            updated_at
            website
            created_at
            end_date
            group_id
            group {
              image_url
              id
              nickname
              username
              banner_image_url
              map_enabled
            }
          }
    }`
    console.time('discover page fetch data: ')
    const graphUrl = process.env.NEXT_PUBLIC_GRAPH!
    const res: any = await request(graphUrl, doc)
    console.timeEnd('discover page fetch data: ')
    return {
        props: {
            eventGroups: res.groups,
            popupCities: res.popup_cities,
        }
    }
}

export default discoverData
