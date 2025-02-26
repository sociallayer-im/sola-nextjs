import {Event, Group, PopupCity, queryGroupDetail} from "@/service/solas";
import {gql, request} from "graphql-request";
import fetch from "@/utils/fetch";

const discoverData: any = async (context: any): Promise<{
    props: {
        eventGroups: Group[],
        popupCities: PopupCity[]
        events: Event[],
        mapGroup: Group
    }
}> => {
    const doc = gql`query MyQuery {
        mapGroups: groups(where: {id: {_eq: 3558}}) {
            id
            image_url
            lens
            location
            nickname
            status
        },
        groups(where: {group_tags: {_contains: [":top"]}, status: {_neq: "freezed"}}) {
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
      popup_cities(where:{group_tags: {_contains: [":top"]}},offset: 0, limit: 100, order_by: {id: desc}) {
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
          events: events(where:{tags: {_contains: [":featured"]}}, order_by: {id: desc}) {
            id
            title
            timezone
            tags
            start_time
            host_info
            location
            cover_url
            owner {
            id
            username
            nickname
            image_url
            }
          }
    }`
    // console.time('discover page fetch data: ')
    // const graphUrl = process.env.NEXT_PUBLIC_GRAPH!
    // const res: any = await request(graphUrl, doc)
    // console.timeEnd('discover page fetch data: ')


    const data = await fetch.get({url: `${process.env.NEXT_PUBLIC_EVENT_LIST_API}/event/discover`})
    const mapGroup = await queryGroupDetail(3558)

    return {
        props: {
            eventGroups: data.data.groups,
            popupCities: [ ...data.data.popups],
            events: data.data.events,
            mapGroup: mapGroup!
        }
    }
}

export default discoverData
