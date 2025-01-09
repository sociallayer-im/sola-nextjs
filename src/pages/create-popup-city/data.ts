import {gql, request} from 'graphql-request'
import {Group, queryUserGroup} from '@/service/solas'

export const createPopupCityData = async (props: { userid: number }) => {
    const doc = gql`query MyQuery {
          memberships(where: {profile_id: {_eq: 1}, role: {_in:["owner","manager"]}}) {
                status
                group {
                    id
                    handle
                    nickname
                    image_url
                }
          }
        }`

    const data = await request<{
        memberships: { status: string, role: string, group: Group }[]
    }>(process.env.NEXT_PUBLIC_GRAPH!, doc)

    return {
        groups: data.memberships.map(item => item.group)
    }
}