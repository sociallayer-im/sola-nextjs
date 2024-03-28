import {signInWithEthereum} from './SIWE'
import fetch from '../utils/fetch'
import Alchemy from "@/service/alchemy/alchemy";
import {gql, request} from 'graphql-request'

const apiUrl = process.env.NEXT_PUBLIC_API!
const graphUrl = process.env.NEXT_PUBLIC_GRAPH!

export type BadgeType = 'badge' | 'nftpass' | 'nft' | 'private' | 'gift'

export interface ListData<T> {
    data: T[],
    total: number
}

export const voucherSchema = (props: QueryPresendProps) => {
    let variables = ''

    if (props.sender_id) {
        variables += `sender_id: {_eq: ${props.sender_id}},`
    }

    if (props.group_id) {
        variables += `badge: {group_id: {_eq: ${props.group_id}}},`
    }

    if (props.id) {
        variables += `id: {_eq: ${props.id}},`
    }

    if (props.receiver_id && props.address) {
        variables += `_or: [{receiver_id: {_eq: ${props.receiver_id}}}, {receiver_address: {_eq: "${props.address}"}}],`
    } else if (props.receiver_id) {
        variables += `receiver_id: {_eq: ${props.receiver_id}},`
    } else if (props.address) {
        variables += `receiver_address: {_eq: "${props.address}"},`
    }

    return gql`vouchers(where: {counter: {_neq: 0}, ${variables}, expires_at: {_gt: "${new Date().toISOString()}"}} limit: 20, offset: ${props.page * 20 - 20}, order_by: {created_at: desc}) {
        id
        strategy
        receiver_address
        badgelets {
          badge_id
          content
          id
          image_url
          owner {
            id
            image_url
            nickname
            username
          }
          owner_id
          title
          value
          badge {
            creator {
              id
              image_url
              nickname
              username
            }
            group_id
            id
            title
            image_url
            name
            creator_id
            badge_type
            content
          }
        }
        badge {
          badge_type
          content
          counter
          creator_id
          group {
            id
            username
            nickname
            image_url
          }
          group_id
          id
          hashtags
          image_url
          name
          permissions
          title
          transferable
        }
        badge_id
        badge_title
        created_at
        expires_at
        counter
        claimed_at
        claimed_by_server
        message
        receiver {
          id
          nickname
          username
          image_url
        }
        receiver_id
        sender {
          id
          image_url
          nickname
          username
        }
        sender_id
      }`
}

export const inviteSchema = (props: {
    inviteId?: number,
    receiverId?: number,
    groupId?: number,
    onlyPending?: boolean,
    address?: string
}) => {

    let variables = ''

    if (props.inviteId) {
        variables += `id: {_eq: "${props.inviteId}"},`
    }

    if (props.receiverId) {
        variables += `receiver_id: {_eq: "${props.receiverId}"},`
    }

    if (props.groupId) {
        variables += `group_id: {_eq: "${props.groupId}"},`
    }

    if (props.address) {
        variables += `receiver_address: {_eq: "${props.address}"},`
    }

    if (props.onlyPending) {
        variables += `status: {_eq: "sending"},`
    }

    variables = variables.replace(/,$/, '')


    return `group_invites(where: {${variables}}) {
        message
        id
        group_id
        role
        receiver_id
        created_at
        status
        receiver {
            id
            image_url
            nickname
            username
        }
    }`
}


interface AuthProp {
    auth_token: string
}

function checkAuth<K extends AuthProp>(props: K) {
    if (!props.auth_token) {
        throw new Error('Please login to continue')
    }
}

export async function login(signer: any, walletName?: string) {
    return await signInWithEthereum(signer, walletName)
}

export interface Profile {
    id: number,
    username: string | null,
    address: string | null,
    sol_address: string | null,
    email: string | null,
    phone: string | null,
    zupass: string | null,
    address_type: string,
    status: 'active' | 'freezed',
    image_url: string | null,

    domain: string | null,

    twitter: string | null,
    telegram: string | null,
    github: string | null,
    discord: string | null,
    ens: string | null,
    lens: string | null,
    website: string | null,
    nostr: string | null,
    location: string | null,
    about: string | null,
    nickname: string | null,

    followers: number,
    following: number,
    badge_count: number,
    permissions: string[],
    group_event_visibility: 'public' | 'private' | 'protected',
    event_tags: string[] | null,
    group_map_enabled: boolean,
    banner_image_url: null | string
    banner_link_url: null | string
    group_location_details: null | string
    maodaoid?: string
    zugame_team?: string | null
    maodao_profile?: {
        "name": string,
        "description": string,
        "external_url": string,
        "image": string,
        "info": {
            "cat": string,
            "owner": string,
            "company": string,
            "position": string,
            "tag": string,
            "industry": string
        }
    }
    far_address: null | string
}

export interface ProfileSimple {
    id: number,
    address: string | null,
    domain: string | null,
    image_url: string | null,
    email: string | null,
    nickname: string | null,
    username: string | null,
}

export async function queryProfileByGraph(props: { type: keyof GetProfileProps, address: string | number, skip_maodao?: boolean }) {
    const condition = `where: {${props.type}: {_eq: ${props.type === 'id' ? props.address : `"${props.address}"`}}}`

    const doc = gql`query MyQuery {
      profiles(${condition}) {
        id
        created_at
        discord
        ens
        about
        address
        address_type
        github
        group_id
        image_url
        lens
        location
        nickname
        status
        telegram
        twitter
        username
        website
        zupass
        permissions,
        sol_address,
        far_fid,
        far_address
      }
    }`

    const resp: any = await request(graphUrl, doc)

    if (!resp.profiles.length) {
        return null
    }

    const isMaodao = process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'maodao'
    if (isMaodao && resp.profiles[0].address && !props.skip_maodao) {
        const profile = await getMaodaoProfile(resp.profiles[0])
        return {
            ...profile,
            domain: profile.username ? profile.username + process.env.NEXT_PUBLIC_SOLAS_DOMAIN : null
        } as any

    } else {
        return {
            ...resp.profiles[0],
            domain: resp.profiles[0].username ? resp.profiles[0].username + process.env.NEXT_PUBLIC_SOLAS_DOMAIN : null,
        } as any
    }
}

export async function queryProfileByEmail(email: string) {
    const res = await fetch.get({
        url: `${apiUrl}/profile/get_by_email`,
        data: {email}
    })
        .catch(e => {
        })

    return res ? res.data.profile as Profile : null
}

interface GetProfileProps {
    address?: string
    email?: string
    id?: number,
    username?: string
    phone?: string
}

export async function getProfile(props: GetProfileProps): Promise<Profile | null> {
    const type = Object.keys(props)[0] as keyof GetProfileProps
    const address = props[type] as number | string

    let profile: null | Profile = null

    if (type === 'email') {
        profile = await queryProfileByEmail(props.email!)
    } else {
        profile = await queryProfileByGraph({type, address, skip_maodao: true})
    }

    if (process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'maodao' && profile?.address) {
        const maodaoProfile = await getMaodaoProfile({profile})
        return {
            ...maodaoProfile,
            followers: 0,
            following: 0
        } as Profile
    } else {
        return profile ? {
                ...profile,
                followers: 0,
                following: 0
            } as Profile
            : null
    }
}

export async function myProfile(props: { auth_token: string }): Promise<Profile> {
    checkAuth(props)

    const res: any = await fetch.get({
        url: `${apiUrl}/profile/me`,
        data: props
    })
    if (res.data.result === 'error') {
        throw new Error(res.data.message || 'Request fail')
    }

    return {
        ...res.data.profile,
        domain: res.data.profile.username!
    } as Profile
}

async function getMaodaoProfile(props: { profile: Profile }) {
    const maodaonft = await Alchemy.getMaodaoNft(props.profile.address!)

    if (maodaonft.length) {
        try {
            const maodaoProfile = await fetch.get({
                url: `https://metadata.readyplayerclub.com/api/rpc-fam/${maodaonft[0].id}`,
                data: {}
            }) as any
            props.profile.nickname = maodaoProfile?.data.info.owner
            props.profile.image_url = maodaoProfile?.data.image
            props.profile.maodaoid = maodaonft[0].id
        } catch (e) {
            const zeroPad = (num: string) => {
                // 使用正则匹配出第一个数字，然后补0
                const numStr = num.split('（')[0]
                return String(numStr).padStart(4, '0')
            }
            props.profile.maodaoid = maodaonft[0].id
            props.profile.nickname = maodaonft[0].id
            props.profile.image_url = `https://asset.maonft.com/rpc/${zeroPad(maodaonft[0].id)}.png`
        }
    }

    return props.profile
}

interface GetGroupProps {
    id?: number,
    username?: string
}

export async function getGroups(props: GetGroupProps): Promise<Group[]> {
    const type = Object.keys(props)[0] as keyof GetGroupProps
    const value = props[type] as number | string

    const condition = `where: {${type}: {_eq: ${type === 'id' ? value : `"${value}"`}}}`

    const doc = gql`query MyQuery {
      groups(${condition}) {
        events_count
        memberships_count
        group_tags
        about
        banner_image_url
        banner_link_url
        banner_text
        can_join_event
        can_publish_event
        can_view_event
        discord
        ens
        event_enabled
        event_tags
        id
        image_url
        lens
        location
        map_enabled
        nickname
        nostr
        permissions
        status
        telegram
        twitter
        username
        memberships (where: {role: {_eq: "owner"}}){
          id
          profile {
            id
            image_url
            username
            nickname
          }
          role
          profile_id
        }
      }
    }`

    const resp: any = await request(graphUrl, doc)
    const res = resp.groups.map((group: any) => {
        const profile = group.memberships.length ? group.memberships?.[0].profile : null
        return {
            domain: group.username + process.env.NEXT_PUBLIC_SOLAS_DOMAIN,
            ...group,
            creator: profile!,
            followers: 0,
            following: 0
        }
    })

    return res as Group[]
}

export async function queryGroupDetail(id?: number, username?: string): Promise<Group | null> {
    const res = id ? await getGroups({id}) : await getGroups({username})
    return res[0] ?
        {
            ...res[0],
            domain: res[0].username + process.env.NEXT_PUBLIC_SOLAS_DOMAIN,
            followers: 0,
            following: 0
        }
        : null
}

export async function requestEmailCode(email: string): Promise<void> {
    const res: any = await fetch.post({
        url: `${apiUrl}/service/send_email`,
        data: {email}
    })
    if (res.data.result === 'error') {
        throw new Error(res.data.message || 'Request fail')
    }
}

export interface LoginRes {
    auth_token: string,
    id: number,
    email: string
    phone: null | string
}

export async function emailLogin(email: string, code: string): Promise<LoginRes> {
    const res = await fetch.post({
        url: `${apiUrl}/profile/signin_with_email`,
        data: {email, code, app: window.location.host, address_source: 'email'}
    })
    if (res.data.result === 'error') {
        throw new Error(res.data.message || 'Verify fail')
    }

    return res.data
}

interface SolasRegistProps {
    auth_token: string
    username: string
}

export async function regist(props: SolasRegistProps): Promise<{ result: 'ok' }> {
    checkAuth(props)
    const res = await fetch.post({
        url: `${apiUrl}/profile/create`,
        data: props
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }

    return res.data
}

export interface AddManagerProps {
    auth_token: string
    group_id: number,
    profile_id: number
}

export async function addManager(props: AddManagerProps): Promise<void> {
    checkAuth(props)
    const res = await fetch.post({
        url: `${apiUrl}/group/add-manager`,
        data: props
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }
}

export async function addIssuer(props: AddManagerProps): Promise<void> {
    checkAuth(props)
    const res = await fetch.post({
        url: `${apiUrl}/group/add-issuer`,
        data: props
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }
}


export async function removeManager(props: AddManagerProps): Promise<void> {
    checkAuth(props)
    const res = await fetch.post({
        url: `${apiUrl}/group/remove-manager`,
        data: props
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }
}

export async function removeIssuer(props: AddManagerProps): Promise<void> {
    checkAuth(props)
    const res = await fetch.post({
        url: `${apiUrl}/group/remove-issuer`,
        data: props
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }
}

export interface Badge {
    id: number,
    created_at: string
    name: string,
    title: string,
    token_id: string,
    image_url: string,
    creator: Profile,
    group?: Group | null,
    content: string | null,
    counter: number,
    badge_type: BadgeType,
    transferable?: boolean
    unlocking?: null | string
    metadata?: string
    badgelets?: Badgelet[]
}

export type NftPass = Badge
export type NftPassWithBadgelets = BadgeWithBadgelets

export interface NftPasslet extends Badgelet {
}

export interface QueryBadgeProps {
    id?: number,
    sender_id?: number,
    group_id?: number,
    badge_type?: BadgeType,
    page: number
}

export async function queryBadge(props: QueryBadgeProps): Promise<ListData<Badge>> {
    // props.badge_type = props.badge_type || 'badge'
    //
    // const res = await fetch.get({
    //     url: `${api}/badge/list`,
    //     data: props,
    // })
    //
    // if (res.data.result === 'error') {
    //     throw new Error(res.data.message)
    // }
    //
    // return res.data.badges as Badge[]

    let variables = ''

    if (props.id) {
        variables += `id: {_eq: "${props.id}"},`
    }

    if (props.sender_id) {
        variables += `creator_id: {_eq: "${props.sender_id}"},`
    }

    if (props.group_id) {
        variables += `group_id: {_eq: "${props.group_id}"},`
    } else {
        variables += `group_id: {_is_null: true},`
    }

    if (props.badge_type) {
        variables += `badge_type: {_eq: "${props.badge_type}"},`
    } else {
        // todo
        // variables += `badge_type: {_eq: "badge"},`
    }

    variables = variables.replace(/,$/, '')

    const doc = gql`query MyQuery {
      badges(where:{${variables}}, limit: 20, offset: ${props.page * 20 - 20}, order_by: {id: desc}) {
        content
        counter
        creator {
          nickname
          id
          image_url
          username
        }
        creator_id
        group {
          id
          image_url
          nickname
          username
        }
        group_id
        id
        image_url
        name
        title
        badge_type
        created_at
        metadata
      }
      badges_aggregate (where:{${variables}}) {
        aggregate {
            count
        }
      }
    }`

    const res: any = await request(graphUrl, doc)

    return {
        data: res.badges as Badge[],
        total: res.badges_aggregate.aggregate.count
    }
}

export async function queryPrivateBadge(props: QueryBadgeProps): Promise<Badge[]> {
    // const res = await fetch.get({
    //     url: `${api}/badge/list`,
    //     data: {...props, badge_type: 'private'},
    // })
    //
    // if (res.data.result === 'error') {
    //     throw new Error(res.data.message)
    // }
    //
    // return res.data.badges as Badge[]
    return []
}

export async function queryNftpass(props: QueryBadgeProps): Promise<NftPass[]> {
    // const res = await fetch.get({
    //     url: `${api}/badge/list`,
    //     data: {...props, badge_type: 'nftpass'},
    // })
    //
    // if (res.data.result === 'error') {
    //     throw new Error(res.data.message)
    // }
    //
    // return res.data.badges as Badge[]
    return []
}

export interface QueryBadgeDetailProps {
    id: number
}

export interface BadgeWithBadgelets extends Badge {
    badgelets: Badgelet[]
}

export async function queryBadgeDetail(props: QueryBadgeDetailProps): Promise<BadgeWithBadgelets | null> {
    const doc = gql`query MyQuery {
      badges(where: {id: {_eq: "${props.id}"}}) {
        metadata
        badge_type
        content
        counter
        created_at
        group {
          id
          image_url
          nickname
          username
        }
        group_id
        creator {
          id
          image_url
          nickname
          username
        }
        id
        image_url
        name
        title
        transferable
        permissions
        badgelets(where: {status: {_neq: "rejected"}}) {
          created_at
          id
          image_url
          metadata
          title
          display
          status
          badge {
            badge_type
            content
            counter
            created_at
            group_id
            name
            title
            image_url
            id
          }
          badge_id
          content
          creator {
            id
            nickname
            image_url
            username
          }
          owner_id
          owner {
            id
            nickname
            image_url
            username
          }
        }
      }
    }`

    const resb: any = await request(graphUrl, doc)
    return resb.badges[0] || null
}

interface QueryPresendProps {
    sender_id?: number,
    page: number,
    group_id?: number,
    id?: number
    receiver_id?: number,
    address?: string
}

export interface Presend extends Voucher {
}

export async function queryPresend(props: QueryPresendProps): Promise<Presend[]> {
    const doc = `query MyQuery {${voucherSchema(props)}}`

    const res: any = await request(graphUrl, doc)
    return res.vouchers as Voucher[]
}

export interface PresendWithBadgelets extends Presend {
    badgelets: Badgelet[]
}

export interface QueryPresendDetailProps {
    id: number
}

export async function queryPresendDetail(props: QueryPresendDetailProps): Promise<PresendWithBadgelets> {
    const presend = await queryPresend({page: 1, id: props.id})
    return presend[0] as PresendWithBadgelets
}

export interface Badgelet {
    id: number,
    badge_id: number,
    content: string,
    domain: string,
    display: 'normal' | 'hide' | 'top',
    owner: ProfileSimple,
    creator: ProfileSimple,
    status: 'accepted' | 'pending' | 'new' | 'rejected' | 'burnt' | 'revoked',
    token_id: string | null,
    badge: Badge,
    chain_data: string | null
    group: Group | null
    created_at: string,
    starts_at?: null | string,
    expires_at?: null | string,
    value?: null | number,
    last_consumed_at: null | string,
    metadata?: string | null
}

export async function queryAllTypeBadgelet(props: QueryBadgeletProps): Promise<Badgelet[]> {

    // const res = await fetch.get({
    //     url: `${api}/badgelet/list`,
    //     data: {...props, badge_type: undefined}
    // })
    //
    // if (res.data.result === 'error') {
    //     throw new Error(res.data.message)
    // }
    //
    // const list: Badgelet[] = res.data.badgelets
    //
    // return list.filter((item : any) => {
    //     return item.status !== 'rejected'
    // })

    return []
}

export interface QueryBadgeletProps {
    page: number,
    id?: number,
    receiver_id?: number,
    owner_id?: number,
    group_id?: number,
    show_hidden?: number,
    badge_id?: number,
    badge_type?: BadgeType,
    status?: 'accepted' | 'pending' | 'new' | 'rejected' | 'burnt' | 'revoked',
}

export async function queryBadgelet(props: QueryBadgeletProps): Promise<Badgelet[]> {
    let variables = ''

    if (props.id) {
        variables += `id: {_eq: "${props.id}"},`
    }

    if (props.receiver_id || props.owner_id) {
        variables += `owner_id: {_eq: "${props.receiver_id || props.owner_id}"},`
    }

    if (props.badge_id) {
        variables += `badge_id: {_eq: "${props.badge_id}"},`
    }

    if (props.status) {
        variables += `status: {_eq: "${props.status}"},`
    }

    if (props.badge_type) {
        if (props.group_id) {
            variables += `badge: {badge_type: {_eq: "${props.badge_type}", group_id: {_eq: "${props.group_id}"}}},`
        } else {
            variables += `badge: {badge_type: {_eq: "${props.badge_type}"}},`
        }
    } else {
        if (props.group_id) {
            variables += `badge: {badge_type: {_eq: "badge"}, group_id: {_eq: "${props.group_id}"}},`
        } else {
            variables += ``
        }
    }

    if (variables.endsWith(',')) {
        variables = variables.slice(0, -1)
    }

    const doc = gql`query MyQuery {
      badgelets(where: {${variables}, status: {_neq: "burned"}}, limit: 20, offset: ${props.page * 20 - 20}, order_by: {id: desc}) {
        metadata
        badge_id
        content
        created_at
        display
        badge {
          image_url
          title
          content
          badge_type
          group_id
          group {
            id
            nickname
            username
            image_url
          }
        }
        id
        status
        title
        value
        voucher_id
        content
        creator_id
        creator {
          id
          nickname
          image_url
          username
        }
        owner_id
        owner {
          image_url
          id
          nickname
          username
        }
      }
    }`

    const res: any = await request(graphUrl, doc)

    return res.badgelets as Badgelet[]

    // return res.badgelets.sort((a: Badgelet, b: Badgelet) => {
    //     return b.display === 'top' ? 1 : -1
    // }) as Badgelet[]

    // props.badge_type = props.badge_type || 'badge'
    //
    // const res = await fetch.get({
    //     url: `${api}/badgelet/list`,
    //     data: props
    // })
    //
    // if (res.data.result === 'error') {
    //     throw new Error(res.data.message)
    // }
    //
    // const list: Badgelet[] = res.data.badgelets
    //
    // return list.filter(item => {
    //     return item.status !== 'rejected' && item.status !== 'revoked' && item.status !== 'burnt'
    // })
}

export async function queryPrivacyBadgelet(props: QueryBadgeletProps): Promise<Badgelet[]> {
    // const res = await fetch.get({
    //     url: `${api}/badgelet/list`,
    //     data: {...props, badge_type: 'private'}
    // })
    //
    // if (res.data.result === 'error') {
    //     throw new Error(res.data.message)
    // }
    //
    // const list: Badgelet[] = res.data.badgelets
    //
    // return list.filter((item : any) => {
    //     return item.status !== 'rejected'
    // })
    return []
}

export async function queryNftPasslet(props: QueryBadgeletProps): Promise<NftPasslet[]> {
    // const res = await fetch.get({
    //     url: `${api}/badgelet/list`,
    //     data: {...props, badge_type: 'nftpass'}
    // })
    //
    // if (res.data.result === 'error') {
    //     throw new Error(res.data.message)
    // }
    //
    // const list: NftPasslet[] = res.data.badgelets
    //
    // return list.filter((item : any) => {
    //     return item.status !== 'rejected' && item.status !== 'revoked' && item.status !== 'burnt'
    // })
    return []
}

export interface Membership {
    "id": number,
    "profile": ProfileSimple,
    role: string
}

export interface Group extends Profile {
    id: number,
    image_url: string | null,
    status: 'active' | 'freezed',
    token_id: string,
    twitter: string | null
    twitter_proof_url: string | null
    username: string
    domain: string,
    nickname: string,
    event_tags: string[] | null,
    group_map_enabled: boolean,
    creator: ProfileSimple,
    memberships: Membership[],
    event_enabled: boolean
    map_enabled: boolean
    can_publish_event: string
    can_join_event: string
    can_view_event: string
    events_count: number
    memberships_count: number
    group_tags :string | null
}

export interface QueryUserGroupProps {
    profile_id: number,
}

export async function queryGroupsUserJoined(props: QueryUserGroupProps): Promise<Group[]> {
    const doc = gql`query MyQuery {
      groups(where: {status: {_neq: "freezed"}, memberships: {role: {_neq: "owner"}, profile: {id: {_eq: "${props.profile_id}"}}}}) {
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
        event_enabled
        map_enabled
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
    }`

    const res: any = await request(graphUrl, doc)
    return res.groups.map((item: any) => {
        item.creator = item.memberships[0]?.profile || null
        return item
    })
}

export async function queryGroupsUserCreated(props: QueryUserGroupProps): Promise<Group[]> {
    const doc = gql`query MyQuery {
      groups(where: {status: {_neq: "freezed"}, memberships: {role: {_eq: "owner"}, profile: {id: {_eq: "${props.profile_id}"}}}}) {
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
        event_tags
        event_enabled
        map_enabled
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
    }`

    const res: any = await request(graphUrl, doc)
    return res.groups.map((item: any) => {
        item.creator = item.memberships[0].profile
        return item
    })
}

export async function queryGroupsUserManager(props: QueryUserGroupProps): Promise<Group[]> {
    const doc = gql`query MyQuery {
      groups(where: {status: {_neq: "freezed"}, memberships: {role: {_eq: "manager"}, profile: {id: {_eq: "${props.profile_id}"}}}}) {
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
        event_tags
        event_enabled
        map_enabled
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
    }`

    const res: any = await request(graphUrl, doc)
    return res.groups.map((item: any) => {
        item.creator = item.memberships[0].profile
        return item
    })
}

export async function queryUserGroup(props: QueryUserGroupProps): Promise<Group[]> {

    const res1 = await queryGroupsUserJoined(props)

    const res2 = await queryGroupsUserCreated(props)

    const total = [...res2, ...res1]
    const groups = total.filter((item) => {
        return item.status !== 'freezed'
    })

    const groupsDuplicateObj: any = {}
    groups.map((item: any) => {
        groupsDuplicateObj[item.id] = item
    })

    return Object.values(groupsDuplicateObj) as Group[]
}

export interface AcceptBadgeletProp {
    voucher_id: number,
    code?: number,
    auth_token: string
    index?: number
}

export async function acceptBadgelet(props: AcceptBadgeletProp): Promise<Badgelet> {
    checkAuth(props)
    const res = await fetch.post({
        url: `${apiUrl}/voucher/use`,
        data: {id: props.voucher_id, code: props.code, auth_token: props.auth_token, index: props.index}
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }

    return res.data.badgelet
}

export interface RejectVoucherProp {
    id: number,
    auth_token: string
}

export async function rejectVoucher(props: RejectVoucherProp): Promise<void> {
    checkAuth(props)
    const res = await fetch.post({
        url: `${apiUrl}/voucher/reject_badge`,
        data: props
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }
}

export interface RejectBadgeletProp {
    badgelet_id: number,
    auth_token: string
}

export async function rejectBadgelet(props: RejectBadgeletProp): Promise<void> {
    // checkAuth(props)
    // const res = await fetch.post({
    //     url: `${api}/badge/reject`,
    //     data: props
    // })
    //
    // if (res.data.result === 'error') {
    //     throw new Error(res.data.message)
    // }
    throw new Error('not implemented')
}

export async function acceptPresend(props: AcceptBadgeletProp) {
    return await acceptBadgelet({
        voucher_id: props.voucher_id,
        code: props.code,
        auth_token: props.auth_token,
        index: props.index
    })
}

export type SetBadgeletStatusType = 'top' | 'hide' | 'normal'

export interface SetBadgeletStatusProps {
    type: SetBadgeletStatusType,
    id: number,
    auth_token: string
}

export async function setBadgeletStatus(props: SetBadgeletStatusProps) {
    checkAuth(props)
    const res = await fetch.post({
        url: `${apiUrl}/badge/${props.type}`,
        data: {
            badgelet_id: props.id,
            auth_token: props.auth_token,
            display: props.type
        }
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }

    return res.data
}

export interface QueryBadgeletDetailProps {
    id: number
}

export async function queryBadgeletDetail(props: QueryBadgeletDetailProps): Promise<Badgelet | null> {
    const res = await queryBadgelet({
        id: props.id,
        page: 1,
    })

    return res ? res[0] : null
}

export async function queryNftPassDetail(props: QueryBadgeletDetailProps): Promise<NftPass> {
    return await queryBadgeletDetail(props) as any
}

export interface UploadImageProps {
    uploader: string,
    file: any,
    auth_token: string
}

export async function uploadImage(props: UploadImageProps): Promise<string> {
    checkAuth(props)
    const randomName = Math.random().toString(36).slice(-8)
    const formData = new FormData()
    formData.append('data', props.file)
    formData.append('auth_token', props.auth_token)
    formData.append('uploader', props.uploader)
    formData.append('resource', randomName)
    const res = await fetch.post({
        url: `${apiUrl}/service/upload_image`,
        data: formData,
        header: {'Content-Type': 'multipart/form-data'}
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }

    return res.data.result.url
}

export interface SetAvatarProps {
    image_url: string,
    auth_token: string
}

export async function setAvatar(props: SetAvatarProps) {
    checkAuth(props)
    const res = await fetch.post({
        url: `${apiUrl}/profile/update`,
        data: props
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }
}

export interface CreateBadgeProps {
    name: string,
    title: string,
    image_url: string,
    auth_token: string,
    content?: string,
    group_id?: number,
    badge_type?: string,
    value?: number,
    transferable?: boolean,
    weighted?: boolean,
    metadata?: string,
}

export async function createBadge(props: CreateBadgeProps): Promise<Badge> {
    checkAuth(props)
    props.badge_type = props.badge_type || 'badge'

    const res = await fetch.post({
        url: `${apiUrl}/badge/create`,
        data: props
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }

    return res.data.badge as Badge
}

export interface CreatePresendProps {
    badge_id: number,
    message: string,
    counter: number | string | null,
    auth_token: string
}

export async function createPresend(props: CreatePresendProps) {
    checkAuth(props)
    props.counter = props.counter === 'Unlimited' ? 65535 : props.counter
    const res = await fetch.post({
        url: `${apiUrl}/voucher/create`,
        data: props
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }

    return res.data.voucher
}

export interface GetGroupMembersProps {
    group_id: number,
    role?: 'manager' | 'member' | 'owner' | 'all',
}

export async function getGroupMembers(props: GetGroupMembersProps): Promise<Profile[]> {
    const condition = props.role ?
        props.role === 'all'
            ? `where: {group: {id: {_eq: "${props.group_id}"}}}`
            : `where: {group: {id: {_eq: "${props.group_id}"}}, role: {_eq: "${props.role}"}}`
        : `where: {group: {id: {_eq: "${props.group_id}"}}, role: {_neq: "owner"}}`

    const doc = gql`query MyQuery {
      memberships(${condition}) {
        id
        role
        profile {
          id
          image_url
          nickname
          username
          about
          address
          address_type
          status
        }
      }
    }`

    const resp: any = await request(graphUrl, doc)

    return resp.memberships.map((item: any) => item.profile) as Profile[]
}

export async function getGroupMembership(props: GetGroupMembersProps): Promise<Membership[]> {
    const condition = props.role ?
        props.role === 'all'
            ? `where: {group: {id: {_eq: "${props.group_id}"}}}`
            : `where: {group: {id: {_eq: "${props.group_id}"}}, role: {_eq: "${props.role}"}}`
        : `where: {group: {id: {_eq: "${props.group_id}"}}, role: {_neq: "owner"}}`


    const doc = gql`query MyQuery {
      memberships(${condition}) {
        id
        role
        profile {
          id
          image_url
          nickname
          username
          about
          address
          address_type
          status
        }
      }
    }`

    const resp: any = await request(graphUrl, doc)

    return resp.memberships as Membership[]
}

export interface Membership {
    id: number,
    role: string,
    profile: ProfileSimple
}

export async function getGroupMemberShips(props: GetGroupMembersProps): Promise<Membership[]> {
    const condition = props.role
        ? props.role === 'all'
            ? `where: {group: {id: {_eq: "${props.group_id}"}}}`
            : `where: {group: {id: {_eq: "${props.group_id}"}}, role: {_eq: "${props.role}"}}`
        : `where: {group: {id: {_eq: "${props.group_id}"}}, role: {_neq: "owner"}}`

    const doc = gql`query MyQuery {
      memberships(${condition}) {
        id
        role
        profile {
          id
          image_url
          nickname
          username
          about
          address
          address_type
          status
        }
      }
    }`

    const resp: any = await request(graphUrl, doc)

    return resp.memberships
}

export async function getFollowers(userId: number): Promise<Profile[]> {
    const doc = gql`query MyQuery {
      followings(where: {target_id: {_eq: ${userId}}}) {
        target_id
        target {
          id
          image_url
          nickname
          username
        }
        role
        id
        profile_id
        created_at
      }
    }`

    const resp1: any = await request(graphUrl, doc)

    const ids = resp1.followings.map((item: any) => item.profile_id)

    const resp2: any = await request(graphUrl, gql`query MyQuery {
      profiles(where: {id: {_in: [${ids.join(',')}]}}) {
        id
        username
        nickname
        image_url,
        sol_address
      }
    }
    `)

    return resp2.profiles as Profile[]
}

export async function getFollowings(userId: number): Promise<Profile[]> {
    const doc = gql`query MyQuery {
      followings(where: {profile_id: {_eq: ${userId}}}) {
        target {
          id
          image_url
          nickname
          username
        }
        target_id
        role
        id
        profile_id
        created_at
      }
    }`

    const resp: any = await request(graphUrl, doc)
    return resp.followings.map((item: any) => item.target) as Profile[]
}

export interface IssueBatchProps {
    issues: string[],
    auth_token: string,
    reason: string,
    badgeId: number,
    starts_at?: string,
    expires_at?: string,
    value?: number | null
}

export async function issueBatch(props: IssueBatchProps): Promise<Voucher[]> {
    checkAuth(props)
    const walletAddress: string[] = []
    const socialLayerUsers: string[] = []
    const domains: string[] = []
    const emails: string[] = []
    const socialLayerDomain = process.env.NEXT_PUBLIC_SOLAS_DOMAIN!

    props.issues.forEach((item: any) => {
        if (item.endsWith('.eth') || item.endsWith('.dot')) {
            domains.push(item)
        } else if (item.startsWith('0x')) {
            walletAddress.push(item)
        } else if (item.endsWith(socialLayerDomain!)) {
            socialLayerUsers.push(item)
        } else if (item.match(/^\w+@\w+\.\w+$/i)) {
            emails.push(item)
        } else {
            socialLayerUsers.push(item + socialLayerDomain)
        }
    })

    console.log('walletAddress', walletAddress)
    console.log('socialLayerUsers', socialLayerUsers)
    console.log('domains', domains)
    const domainToWalletAddress: any = []
    domains.map((item) => {
        return domainToWalletAddress.push(DDNSServer(item))
    })

    const domainOwnerAddress = await Promise.all(domainToWalletAddress)
    domainOwnerAddress.forEach((item, index) => {
        if (!item) throw new Error(`Domain ${domains[index]} is not exist`)
    })


    const handleError = (account: string) => {
        throw new Error(`Invalid Account ${account}`)
    }

    const task: any = []
    const link = [...walletAddress, ...socialLayerUsers, ...domainOwnerAddress, ...emails]
    walletAddress.forEach((item) => {
        task.push(getProfile({address: item}).catch(e => {
            handleError(item)
        }))
    })
    socialLayerUsers.map((item) => {
        task.push(getProfile({username: item.replace(process.env.NEXT_PUBLIC_SOLAS_DOMAIN!, '')}).catch(e => {
            handleError(item)
        }))
    })
    domainOwnerAddress.map((item) => {
        task.push(getProfile({address: item}).catch(e => {
            handleError(item)
        }))
    })
    emails.map((item) => {
        task.push(getProfile({email: item}).catch(e => {
            handleError(item)
        }))
    })

    const profiles = await Promise.all(task)
    profiles.forEach((item, index) => {
        if (!item) {
            handleError(link[index])
        }

        console.log('item.status', item.status)
        if (item.status === 'freezed') {
            handleError(link[index])
        }
    })

    const subjectUrls = props.reason.match(/@[^\s]+/g)
    let subjectUrl = ''
    if (subjectUrls) {
        subjectUrl = subjectUrls[0].replace('@', '')
    }

    const usernames = profiles.map((item: any) => item.username)

    const res = await fetch.post({
        url: `${apiUrl}/voucher/send_badge`,
        data: {
            badge_id: props.badgeId,
            receivers: usernames,
            subject_url: subjectUrl,
            auth_token: props.auth_token,
            starts_at: props.starts_at || null,
            expires_at: props.expires_at || null,
            value: props.value,
            message: props.reason
        }
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }

    return res.data.vouchers as Voucher[]
}

export async function DDNSServer(domain: string): Promise<string | null> {
    const res = await fetch.get({
        url: `https://api.ddns.so/name/${domain.toLowerCase()}`
    })

    if (res.data.result !== 'ok') {
        throw new Error(`[ddns]: get address fail: ${domain}`)
    }

    return res.data.data ? (res.data.data.owner || null) : null
}

interface FollowProps {
    target_id: number,
    auth_token: string
}

export async function follow(props: FollowProps) {
    checkAuth(props)
    const res = await fetch.post({
        url: `${apiUrl}/profile/follow`,
        data: props
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }
}

export async function unfollow(props: FollowProps) {
    checkAuth(props)
    const res = await fetch.post({
        url: `${apiUrl}/profile/unfollow`,
        data: props
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }
}

export interface Invite {
    id: number,
    message: string,
    receiver_id: number
    status: string
    role: string
    expires_at: string
    created_at: string
    group_id: number,
    receiver: ProfileSimple,
    receiver_address: string | null
}

export interface QueryGroupInvitesProps {
    group_id: number,
}

export async function queryGroupInvites(props: QueryGroupInvitesProps): Promise<Invite[]> {
    return await queryInvites({
        onlyPending: true,
        groupId: props.group_id
    })
}

export interface CreateGroupProps {
    username: string,
    auth_token: string
}

export async function createGroup(props: CreateGroupProps): Promise<Group> {
    checkAuth(props)
    const res = await fetch.post({
        url: `${apiUrl}/group/create`,
        data: props
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }

    return res.data.group
}

export interface SendInviteProps {
    group_id: number,
    receivers: string[],
    message: string,
    auth_token: string,
    role: string
}

export async function sendInvite(props: SendInviteProps): Promise<Invite[]> {
    checkAuth(props)
    const walletAddress: string[] = []
    const socialLayerUsers: string[] = []
    const domains: string[] = []
    const emails: string[] = []
    const socialLayerDomain = process.env.NEXT_PUBLIC_SOLAS_DOMAIN!

    props.receivers.forEach((item: any) => {
        if (item.endsWith('.eth') || item.endsWith('.dot')) {
            domains.push(item)
        } else if (item.startsWith('0x')) {
            walletAddress.push(item)
        } else if (item.endsWith(socialLayerDomain!)) {
            socialLayerUsers.push(item)
        } else if (item.match(/^\w+@\w+\.\w+$/i)) {
            emails.push(item)
        } else {
            socialLayerUsers.push(item + socialLayerDomain)
        }
    })

    console.log('walletAddress', walletAddress)
    console.log('socialLayerUsers', socialLayerUsers)
    console.log('domains', domains)
    const domainToWalletAddress: any = []
    domains.map((item) => {
        return domainToWalletAddress.push(DDNSServer(item))
    })

    const domainOwnerAddress = await Promise.all(domainToWalletAddress)
    domainOwnerAddress.forEach((item, index) => {
        if (!item) throw new Error(`Domain ${domains[index]} is not exist`)
    })


    const handleError = (account: string) => {
        throw new Error(`Invalid Account ${account}`)
    }

    const task: any = []
    const link = [...walletAddress, ...socialLayerUsers, ...domainOwnerAddress, ...emails]
    walletAddress.forEach((item) => {
        task.push(getProfile({address: item}).catch(e => {
            handleError(item)
        }))
    })
    socialLayerUsers.map((item) => {
        task.push(getProfile({username: item.replace(process.env.NEXT_PUBLIC_SOLAS_DOMAIN!, '')}).catch(e => {
            handleError(item)
        }))
    })
    domainOwnerAddress.map((item) => {
        task.push(getProfile({address: item}).catch(e => {
            handleError(item)
        }))
    })
    emails.map((item) => {
        task.push(getProfile({email: item}).catch(e => {
            handleError(item)
        }))
    })

    const profiles = await Promise.all(task)
    profiles.forEach((item, index) => {
        if (!item) {
            handleError(link[index])
        }

        console.log('item.status', item.status)
        if (item.status === 'freezed') {
            handleError(link[index])
        }
    })

    const usernames = profiles.map((item: any) => item.username)

    const res = await fetch.post({
        url: `${apiUrl}/group/send_invite`,
        data: {
            ...props,
            receivers: usernames
        }
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }

    if (!res.data.group_invites[0]) {
        throw new Error('Can not invite')
    }

    res.data.group_invites.forEach((item: any) => {
        if (item.result === 'error') {
            throw new Error(item.message)
        }
    })

    return res.data.group_invites
}

export async function sendInviteByEmail(props: SendInviteProps): Promise<Invite[]> {
    checkAuth(props)

    const res = await fetch.post({
        url: `${apiUrl}/group/send_invite_by_email`,
        data: props
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }

    if (!res.data.group_invites[0]) {
        throw new Error('Can not invite')
    }

    res.data.group_invites.forEach((item: any) => {
        if (item.result === 'error') {
            throw new Error(item.message)
        }
    })

    return res.data.group_invites
}

export interface QueryInviteDetailProps {
    invite_id?: number
    group_id?: number
}

export async function queryInviteDetail(props: QueryInviteDetailProps): Promise<Invite | null> {
    const res = await queryInvites({inviteId: props.invite_id, groupId: props.group_id})
    return res[0] || null
}

export interface AcceptInviteProps {
    group_invite_id: number,
    auth_token: string
}

export async function acceptInvite(props: AcceptInviteProps) {
    checkAuth(props)
    const res = await fetch.post({
        url: `${apiUrl}/group/accept_invite`,
        data: props
    })

    if (res.data.result === 'error' && res.data.message !== 'membership exists') {
        throw new Error(res.data.message)
    }
}

export async function cancelInvite(props: AcceptInviteProps) {
    checkAuth(props)
    const res = await fetch.post({
        url: `${apiUrl}/group/cancel_invite`,
        data: props
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }
}

export async function queryInvites(props: {
    inviteId?: number,
    receiverId?: number,
    groupId?: number,
    onlyPending?: boolean
}): Promise<Invite[]> {

    let variables = ''

    if (props.inviteId) {
        variables += `id: {_eq: "${props.inviteId}"},`
    }

    if (props.receiverId) {
        variables += `receiver_id: {_eq: "${props.receiverId}"},`
    }

    if (props.groupId) {
        variables += `group_id: {_eq: "${props.groupId}"},`
    }

    if (props.onlyPending) {
        variables += `status: {_eq: "sending"},`
    }

    variables = variables.replace(/,$/, '')

    const doc = gql`query MyQuery {
        ${inviteSchema(props)}
    }`

    const res: any = await request(graphUrl, doc)

    return res.group_invites as Invite[]
}

export interface UpdateGroupProps extends Partial<Group> {
    id: number,
    auth_token: string
}

export async function updateGroup(props: UpdateGroupProps) {
    checkAuth(props)
    const res = await fetch.post({
        url: `${apiUrl}/group/update`,
        data: {...props}
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }

    return res.data.group
}

export interface LeaveGroupProps {
    group_id: number,
    profile_id: number,
    auth_token: string
}

export async function leaveGroup(props: LeaveGroupProps) {
    checkAuth(props)
    const res = await fetch.post({
        url: `${apiUrl}/group/remove-member`,
        data: props
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }
}

export interface SearchDomainProps {
    username: string,
    page: number
}

export async function searchDomain(props: SearchDomainProps): Promise<Profile[]> {
    const doc = gql`query MyQuery {
      profiles(where: {_or: [{username: {_iregex: "${props.username}"}}, {nickname: {_iregex: "${props.username}"}}]}, limit: 20, offset: ${(props.page - 1) * 20}) {
        id
        username
        nickname
        image_url,
        sol_address
      }
    }`

    const res: any = await request(graphUrl, doc)

    return res.profiles.map((item: any) => {
        item.domain = item.username + process.env.NEXT_PUBLIC_SOLAS_DOMAIN!
        return item
    }) as Profile[]
}


export interface SearchBadgeProps {
    title: string,
    page: number
}

export async function searchBadge(props: SearchBadgeProps): Promise<Badge[]> {
    const doc = gql`query MyQuery {
      badges(where: {title: {_iregex: "${props.title}"}}, limit: 20, offset: ${(props.page - 1) * 20}) {
       metadata
       badge_type
        content
        counter
        created_at
        creator_id
        creator {
          id
          image_url
          nickname
          username
        }
        group {
          id
          image_url
          nickname
          username
        }
        group_id
        id
        image_url
        name
        title
        transferable
        permissions
        badgelets(where: {status: {_neq: "rejected"}}) {
          created_at
          id
          image_url
          display
          title
          status
          metadata
          badge {
            badge_type
            content
            counter
            created_at
            group_id
            name
            title
            image_url
            id
          }
          badge_id
          content
          creator {
            id
            nickname
            image_url
            username
          }
          owner_id
          owner {
            id
            nickname
            image_url
            username
          }
        }
      }
    }`

    const res: any = await request(graphUrl, doc)

    return res.badges as Badge[]
}

export interface QueryBadgeByHashTagProps {
    hashtag: string,
    page: number
}

export async function queryBadgeByHashTag(props: QueryBadgeByHashTagProps): Promise<Badgelet[]> {
    // const res = await fetch.get({
    //     url: `${api}/badgelet/list`,
    //     data: props
    // })
    //
    // if (res.data.result === 'error') {
    //     throw new Error(res.data.message)
    // }
    //
    // return res.data.badgelets
    //     .filter((item: Badgelet) => {
    //         return item.status !== 'rejected'
    //     })
    return []
}

export interface freezeGroupProps {
    group_id: number
    auth_token: string
}

export async function freezeGroup(props: freezeGroupProps) {
    checkAuth(props)
    const res = await fetch.post({
        url: `${apiUrl}/group/freeze`,
        data: {
            id: props.group_id,
            auth_token: props.auth_token
        }
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }
}

export async function updateProfile(props: { data: Partial<Profile>, auth_token: string }) {
    checkAuth(props)
    const res = await fetch.post({
        url: `${apiUrl}/profile/update`,
        data: {...props.data, auth_token: props.auth_token}
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }

    return res.data.profile
}

export interface VerifyTwitterProps {
    auth_token: string
    twitter_handle: string,
    tweet_url: string
}

export async function verifyTwitter(props: VerifyTwitterProps) {
    // const res = await fetch.post(
    //     {
    //         url: `${api}/profile/submit_twitter_proof`,
    //         data: props
    //     }
    // )
    //
    // if (res.data.result === 'error') {
    //     throw new Error(res.data.message)
    // }
    //
    // return res.data
    throw new Error('not implemented')
}

export interface CreatePointProps {
    name: string,
    title: string,
    auth_token: string,
    sym: string
    content?: string,
    token_id?: number,
    metadata?: string,
    point_type?: string,
    image_url: string,
    max_supply?: number,
    group_id?: number,
}

export interface Point {
    content: string
    created_at: string
    domain: string
    group: null | Group,
    id: number
    image_url: string
    max_supply: number | null
    metadata: null | string
    name: string
    point_type: null | string
    sender: ProfileSimple
    title: string
    token_id: string
    sym: string
    total_supply: number | null
    point_items?: PointItem[],
    transferable?: boolean
}

export async function createPoint(props: CreatePointProps) {
    // const res = await fetch.post({
    //     url: `${api}/point/create`,
    //     data: props
    // })
    //
    // if (res.data.result === 'error') {
    //     throw new Error(res.data.message)
    // }
    //
    // return res.data.point
    throw new Error('not implemented')
}

export interface SendPointProps {
    auth_token: string,
    receivers: { receiver: string, value: number }[],
    point_id: number,
    value: number
}

export interface PointItem {
    created_at: string
    id: number
    owner: ProfileSimple
    point: Point
    sender: ProfileSimple
    status: 'sending' | 'accepted' | 'rejected'
    value: number
}

export async function sendPoint(props: SendPointProps) {
    // const res = await fetch.post({
    //     url: `${api}/point/send`,
    //     data: props
    // })
    //
    // if (res.data.result === 'error') {
    //     throw new Error(res.data.message)
    // }
    //
    // return res.data.point_items as PointItem[]
    throw new Error('not implemented')
}

interface QueryPointProps {
    sender_id?: number,
    group_id?: number,
}

export async function queryPoint(props: QueryPointProps) {
    // const res = await fetch.get({
    //     url: `${api}/point/list`,
    //     data: props
    // })
    //
    // if (res.data.result === 'error') {
    //     throw new Error(res.data.message)
    // }
    // return res.data.points as Point[]
    return []
}

interface QueryPointItemProps {
    status?: 'sending' | 'accepted' | 'rejected',
    point_id?: number
    sender_id?: number,
    owner_id?: number,
}

export async function queryPointItems(props: QueryPointItemProps) {
    // const res = await fetch.get({
    //     url: `${api}/point/list_item`,
    //     data: props
    // })
    //
    // if (res.data.result === 'error') {
    //     throw new Error(res.data.message)
    // }
    // return res.data.point_items as PointItem[]
    return []
}

interface QueryPointDetail {
    id: number
}

export async function queryPointDetail(props: QueryPointDetail) {
    // const res = await fetch.get({
    //     url: `${api}/point/get`,
    //     data: {
    //         ...props,
    //         // with_point_items: 1
    //     }
    // })
    //
    // if (res.data.result === 'error') {
    //     throw new Error(res.data.message)
    // }
    //
    // return res.data.point as Point
    throw new Error('not implemented')
}

export async function queryPointItemDetail(props: QueryPointDetail) {
    // const res = await fetch.get({
    //     url: `${api}/point/get_item`,
    //     data: {
    //         ...props,
    //     }
    // })
    //
    // if (res.data.result === 'error') {
    //     throw new Error(res.data.message)
    // }
    //
    // return res.data.point_item as PointItem
    throw new Error('not implemented')
}

export interface AcceptPointProp {
    point_item_id: number
    auth_token: string
}

export async function acceptPoint(props: AcceptPointProp) {
    // checkAuth(props)
    //
    // const res: any = await fetch.post({
    //     url: `${api}/point/accept`,
    //     data: props
    // })
    //
    // if (res.data.result === 'error') {
    //     throw new Error(res.data.message || 'Accept fail')
    // }
    //
    // return res.data.point_item as PointItem
    throw new Error('not implemented')
}

export async function rejectPoint(props: AcceptPointProp) {
    // checkAuth(props)
    //
    // const res: any = await fetch.post({
    //     url: `${api}/point/reject`,
    //     data: props
    // })
    //
    // if (res.data.result === 'error') {
    //     throw new Error(res.data.message || 'Reject fail')
    // }
    //
    // return res.data.point_item as PointItem
    throw new Error('not implemented')
}

export interface CheckInProps {
    badgelet_id: number
    auth_token: string
}

export interface CheckInSimple {
    id: number,
    badgelet_id: number,
    profile_id: number,
    created_at: string,
    memo: null | string
}

export async function checkIn(props: CheckInProps): Promise<CheckInSimple> {
    // checkAuth(props)
    //
    // const res: any = await fetch.post({
    //     url: `${api}/badgelet/checkin`,
    //     data: props
    // })
    //
    // if (res.data.result === 'error') {
    //     throw new Error(res.data.message || 'Check in fail')
    // }
    //
    // return res.data.checkin as CheckInSimple
    throw new Error('not implemented')
}

export async function consume(props: CheckInProps): Promise<Badgelet> {
    // checkAuth(props)
    //
    // const res: any = await fetch.post({
    //     url: `${api}/badgelet/consume`,
    //     data: {...props, delta: 1}
    // })
    //
    // if (res.data.result === 'error') {
    //     throw new Error(res.data.message || 'Check in fail')
    // }
    //
    // return res.data.badgelet as Badgelet
    throw new Error('not implemented')
}

export interface QueryCheckInListProps {
    profile_id?: number,
    badgelet_id?: number,
    badge_id?: number
}

export interface CheckIn {
    id: number,
    badgelet: Badgelet,
    created_at: string,
    memo: null | string,
    profile: ProfileSimple,
    marker_id: number,
}

export async function queryCheckInList(props: QueryCheckInListProps): Promise<CheckIn[]> {
    let variables = ''

    if (props.profile_id) {
        variables += `profile_id: {_eq: ${props.profile_id}},`
    }

    if (props.badgelet_id) {
        variables += `badgelet_id: {_eq: ${props.badgelet_id}},`
    }

    if (props.badge_id) {
        variables += `badge_id: {_eq: ${props.badge_id}},`
    }

    variables = variables.replace(/,$/, '')

    const doc = gql`query MyQuery {
      map_checkins(where: {${variables}}) {
        marker_id
        content
        created_at
        id
        profile_id
        badgelet_id
        check_type
        image_url
        badgelet {
          badge_id
          image_url
          id
          content
          title
        }
        profile {
          id
          image_url
          nickname
          username
        }
          }
    }`

    const res: any = await request(graphUrl, doc)
    return res.map_checkins as CheckIn[]
}

export interface SetEmailProps {
    auth_token: string,
    code: string,
    email: string
}

export async function setEmail(props: SetEmailProps) {
    checkAuth(props)

    const res: any = await fetch.post({
        url: `${apiUrl}/profile/set_verified_email`,
        data: props
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message || 'Set email fail')
    }
}

export interface BadgeTransferProps {
    badgelet_id: number,
    target_id: number,
    auth_token: string
}

export async function badgeTransfer(props: BadgeTransferProps): Promise<Badgelet> {
    // checkAuth(props)
    //
    // const res = await fetch.post({
    //     url: `${api}/badge/transfer`,
    //     data: {
    //         ...props,
    //     }
    // })
    //
    // if (res.data.result === 'error') {
    //     throw new Error(res.data.message || 'transfer fail')
    // }
    //
    // return res.data.badgelet
    throw new Error('not implemented')
}

export interface BadgeRevokeProps {
    badgelet_id: number,
    auth_token: string
}

export async function badgeRevoke(props: BadgeRevokeProps): Promise<Badgelet> {
    checkAuth(props)

    const res = await fetch.post({
        url: `${apiUrl}/badgelet/burn`,
        data: {
            ...props,
        }
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message || 'transfer fail')
    }

    return res.data.badgelet
}

interface BadgeBurnProps {
    badgelet_id: number,
    auth_token: string
}

export async function badgeletBurn(props: BadgeBurnProps): Promise<Badgelet> {
    checkAuth(props)

    const res = await fetch.post({
        url: `${apiUrl}/badgelet/burn`,
        data: {
            ...props,
        }
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message || 'Burn fail')
    }

    return res.data.badgelet
}

export interface QueryUserActivityProps {
    badge_id?: number
    badgelet_id?: number,
    point_id?: number,
    point_item_id?: number,
    initiator_id?: number,
    target_id?: number,
    action?: string,
}

export interface Activity {
    "id": number,
    "badge_id": null | number
    "badgelet_id": null | number,
    "point_id": null | number,
    "point_item_id": null,
    "initiator_id": null | number,
    "target_id": null | number,
    "action": string,
    "data": any,
    "memo": any,
    "created_at": string
}

export interface Vote {
    id: number,
    group_id: number,
    title: string,
    content: string,
    creator_id: number,
    show_voter: boolean,
    eligibile_group_id: number | null,
    eligibile_badge_id: number | null,
    eligibile_point_id: number | null,
    max_choice: number,
    eligibility: 'has_group_membership' | 'has_badge' | 'badge_count',
    status: string | null,
    result: string | null,
    voter_count: number,
    weight_count: number,
    start_time: string,
    end_time: string | null,
    vote_options: { title: string, link: string | null, id: number, voted_weight: number }[],
    creator: ProfileSimple,
    group: ProfileSimple
}

export interface CreateVoteProps {
    auth_token: string,
    group_id: number,
    vote_options: { title: string, link: string | null }[],
    title: string,
    content: string,
    show_voter: boolean,
    max_choice: number
    eligibile_group_id?: number | null,
    eligibile_badge_id?: number | null,
    eligibile_point_id?: number | null,
    eligibility: 'has_group_membership' | 'has_badge' | 'badge_count',
    start_time: string | null,
    end_time?: string | null,
    status?: string | null,
}

export async function createVote(props: CreateVoteProps) {
    checkAuth(props)

    const res: any = await fetch.post({
        url: `${apiUrl}/vote/create`,
        data: props
    }).catch(e => {
        throw new Error(e.response.data.message)
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message || 'Create vote fail')
    }

    return res.data.proposal as Vote
}

export interface UpdateVoteProps extends Partial<CreateVoteProps> {
    auth_token: string,
    id: number
}

export async function updateVote(props: UpdateVoteProps) {
    checkAuth(props)

    const res: any = await fetch.post({
        url: `${apiUrl}/vote/update`,
        data: props
    }).catch(e => {
        throw new Error(e.response.data.message)
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message || 'update vote fail')
    }

    return res.data.proposal as Vote
}

export async function getVoteDetail(voteid: number) {
    const res = await queryVotes({vote_id: voteid, page: 1})
    return res[0] as Vote || null
}

export interface QueryVotesProps {
    group_id?: number,
    creator_id?: number,
    vote_id?: number,
    page: number,
}

export async function queryVotes(props: QueryVotesProps) {
    let variables = ''

    if (props.group_id) {
        variables += `group_id: {_eq: "${props.group_id}"},`
    }

    if (props.creator_id) {
        variables += `creator_id: {_eq: "${props.creator_id}"},`
    }

    if (props.vote_id) {
        variables += `id: {_eq: "${props.vote_id}"},`
    }

    variables = variables.slice(0, -1)


    const doc = gql`query MyQuery {
          vote_proposals(where: {${variables}, status: {_neq: "cancel"}}, limit: 10, offset: ${props.page * 10 - 10}, order_by: {created_at: desc}) {
            can_update_vote
            content
            voter_count
            weight_count
            created_at
            creator {
              id
              image_url
              nickname
              username
            }
            creator_id
            eligibile_badge_id
            eligibile_group_id
            eligibile_point_id
            eligibility
            end_time
            group {
              id
              image_url
              nickname
              username
            }
            group_id
            id
            max_choice
            show_voters
            start_time
            status
            title
            vote_options {
              id
              title
              link
              voted_weight
            }
          }
        }`

    const res: any = await request(graphUrl, doc)

    return res.vote_proposals as Vote[]
}

export interface VoteRecord {
    id: number,
    group_id: number,
    vote_proposal_id: number,
    voter_id: number,
    vote_option_id: number | null,
    vote_time: string,
    vote_options: number[] | null
    voter: Profile,
}

export interface QueryVoteRecordsProps {
    voter_id?: number,
    proposal_id?: number,
    page: number,
}

export async function queryVoteRecords(props: QueryVoteRecordsProps) {
    let variables = ''

    if (props.voter_id) {
        variables += `voter_id: {_eq: "${props.voter_id}"},`
    }

    if (props.proposal_id) {
        variables += `vote_proposal_id: {_eq: "${props.proposal_id}"},`
    }

    variables = variables.slice(0, -1)

    const doc = gql`query MyQuery {
      vote_records(
        where: {${variables}}) {
        created_at
        id
        voter {
          id
          image_url
          nickname
          username
        }
        voter_id
        vote_options,
        group_id
        vote_proposal_id
      }
    }`

    const res: any = await request(graphUrl, doc)

    return res.vote_records as VoteRecord[]
}

export interface CastVoteProps {
    auth_token: string,
    id: number,
    option: number[],
}

export async function castVote(props: CastVoteProps) {
    checkAuth(props)

    const res: any = await fetch.post({
        url: `${apiUrl}/vote/cast_vote`,
        data: props
    }).catch(e => {
        throw new Error(e.response.data.message)
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message || 'Check in fail')
    }

    return res.data.voter_records as VoteRecord[]
}

export async function cancelVote(props: { id: number, auth_token: string }) {
    checkAuth(props)

    const res: any = await fetch.post({
        url: `${apiUrl}/vote/cancel`,
        data: props
    }).catch(e => {
        throw new Error(e.response.data.message)
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message || 'cancel vote fail')
    }
}

export interface CheckIsManagerProps {
    profile_id: number,
    group_id: number,
}

export async function checkIsManager(props: CheckIsManagerProps): Promise<boolean> {
    const res = await getGroupMembers({
        group_id: props.group_id,
        role: 'manager',
    })

    if (!res) {
        return false
    }

    return res.some((item) => {
        return item.id === props.profile_id
    })
}

export async function isMember(props: { profile_id: number, group_id: number }) {
    const doc = gql`query MyQuery {
      memberships(where: {group: {id: {_eq: "${props.group_id}"}}, profile_id: {_eq: ${props.profile_id}}}) {
        id
        role
        profile {
          id
          image_url
          nickname
          username
        }
      }
    }`

    const resp: any = await request(graphUrl, doc)
    return resp.memberships.length > 0
}

export interface EventSites {
    "id": number,
    "title": string,
    "location": string,
    "about": string,
    "group_id": number,
    "owner_id": number,
    "created_at": string,
    "formatted_address": null | string,
    geo_lat: null | string,
    geo_lng: null | string,
}

export interface Participants {
    id: number,
    check_time: string | null,
    created_at: string,
    message: string | null,
    profile: ProfileSimple,
    profile_id: number,
    status: string,
    event: Event,
    role: string,
    event_id: number,
}

export interface Event {
    padge_link: string | null,
    id: number,
    title: string,
    content: string,
    cover_url: string | null,
    tags: null | string[],
    start_time: null | string,
    end_time: null | string,
    location: null | string,
    max_participant: null | number,
    min_participant: null | number,
    guests: null | string[],
    badge_id: null | number,
    host_info: null | string,
    meeting_url: null | string,
    event_site_id?: null | number,
    event_site: null | EventSites,
    event_type: 'event' | 'checklog',
    wechat_contact_group?: null | string,
    wechat_contact_person?: null | string,
    group_id?: null | number,
    formatted_address: null | any,
    owner: ProfileSimple,
    notes: string | null,
    display: string,

    owner_id: number,
    created_at: string,
    updated_at: string,
    category: null | string,
    status: string,
    telegram_contact_group?: null | string,
    recurring_event_id: null | number,
    recurring_event: null | {
        id: number
        interval: string
        start_time: string
        end_time: string
        timezone: string
    },
    timezone: null | string,
    geo_lng: null | string,
    geo_lat: null | string,
    participants: null | Participants[],
    external_url: null | string,
    operators: null | number[],
}

export interface CreateEventProps extends Partial<Event> {
    auth_token: string
}

export async function createEvent(props: CreateEventProps) {
    checkAuth(props)

    const res: any = await fetch.post({
        url: `${apiUrl}/event/create`,
        data: props
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message || 'Create event fail')
    }

    return res.data.event as Event
}

export async function updateEvent(props: CreateEventProps) {
    checkAuth(props)

    const res: any = await fetch.post({
        url: `${apiUrl}/event/update`,
        data: props
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message || 'Create event fail')
    }

    return res.data.event as Event
}

export interface QueryEventProps {
    id?: number,
    owner_id?: number,
    tag?: string,
    page: number,
    event_site_id?: number,
    start_time_from?: string,
    start_time_to?: string,
    end_time_gte?: string,
    end_time_lte?: string,
    group_id?: number,
    event_order?: 'asc' | 'desc',
    page_size?: number,
    show_pending_event?: boolean,
    show_rejected_event?: boolean,
    recurring_event_id?: number,
    show_cancel_event?: boolean,
    group_ids?: number[]
}


export async function queryEvent(props: QueryEventProps): Promise<Event[]> {
    const page_size = props.page_size || 10
    let variables = ''
    let order = `order_by: {id: ${props.event_order || 'desc'}}, `

    if (props.id) {
        variables += `id: {_eq: ${props.id}},`
    }

    if (props.owner_id) {
        variables += `owner_id: {_eq: ${props.owner_id}},`
    }

    if (props.tag) {
        variables += `tags: {_contains:["${props.tag}"]}, `
    }

    if (props.event_site_id) {
        variables += `event_site_id: {_eq: ${props.event_site_id}}, `
    }

    if(props.recurring_event_id) {
        variables += `recurring_event_id: {_eq: ${props.recurring_event_id}}, `
    }

    if (props.start_time_from && props.start_time_to) {
        order = `order_by: {start_time: ${props.event_order || 'desc'}}, `
        variables += `start_time: {_gte: "${props.start_time_from}"}, _and: {start_time: {_lte: "${props.start_time_to}"}}, `
    } else if (props.start_time_from) {
        order = `order_by: {start_time: ${props.event_order || 'desc'}}, `
        variables += `start_time: {_gte: "${props.start_time_from}"}, `
    } else if (props.start_time_to) {
        order = `order_by: {start_time: ${props.event_order || 'desc'}}, `
        variables += `start_time: {_lte: "${props.start_time_to}"}, `
    }

    if (props.end_time_gte) {
        order = `order_by: {start_time: ${props.event_order || 'desc'}}, `
        variables += `end_time: {_gte: "${props.end_time_gte}"}, `
    }

    if (props.end_time_lte) {
        order = `order_by: {end_time: ${props.event_order || 'desc'}}, `
        variables += `end_time: {_lte: "${props.end_time_lte}"}, `
    }

    if (props.group_id) {
        variables += `group_id: {_eq: ${props.group_id}}, `
    }

    let status = `"open", "new", "normal"`
    if (props.show_pending_event) {
        status = status + ', "pending"'
    }

    if(props.show_rejected_event) {
        status = status + ', "rejected"'
    }

    if(props.show_cancel_event) {
        status = status + ', "cancel"'
    }

    variables = variables.replace(/,$/, '')

    const doc = gql`query MyQuery {
      events (where: {${variables}, status: {_in: [${status}]}} ${order} limit: ${page_size}, offset: ${(props.page - 1) * page_size}) {
        display
        operators
        padge_link
        badge_id
        notes
        geo_lat
        geo_lng
        category
        content
        cover_url
        external_url
        created_at
        display
        end_time
        event_site_id
        event_site {
            id
            title
            location
            about
            group_id
            owner_id
            created_at
            formatted_address
            geo_lat
            geo_lng
        }
        event_type
        formatted_address
        location
        owner_id
        owner {
            id
            username
            nickname
            image_url
        }
        title
        timezone
        status
        tags
        start_time
        require_approval
        participants_count
        max_participant
        meeting_url
        group_id
        host_info
        id
        location_viewport
        min_participant
        recurring_event {
          id
        }
        recurring_event_id
        participants(where: {status: {_neq: "cancel"}}) {
          id
          profile_id
          profile {
            id
            username
            nickname
            image_url
          }
          role
          status
          voucher_id
          check_time
          created_at
          message
          event {
            id
          }
        }
      }
    }`

    const resp: any = await request(graphUrl, doc)
    return resp.events.map((item: any) => {
        return {
            ...item,
            end_time: item.end_time && !item.end_time.endsWith('Z') ? item.end_time + 'Z' : item.end_time,
            start_time: item.end_time && !item.start_time.endsWith('Z') ? item.start_time + 'Z' : item.start_time,
        }
    }) as Event[]
}

export async function queryPendingEvent(props: QueryEventProps): Promise<Event[]> {
    const page_size = props.page_size || 10
    let variables = ''
    let order = `order_by: {id: ${props.event_order || 'desc'}}, `

    if (props.id) {
        variables += `id: {_eq: ${props.id}},`
    }

    if (props.owner_id) {
        variables += `owner_id: {_eq: ${props.owner_id}},`
    }

    if (props.tag) {
        variables += `tags: {_contains:["${props.tag}"]}, `
    }

    if (props.event_site_id) {
        variables += `event_site_id: {_eq: ${props.event_site_id}}, `
    }

    if(props.recurring_event_id) {
        variables += `recurring_event_id: {_eq: ${props.recurring_event_id}}, `
    }

    if (props.start_time_from && props.start_time_to) {
        order = `order_by: {start_time: ${props.event_order || 'desc'}}, `
        variables += `start_time: {_gte: "${props.start_time_from}"}, _and: {start_time: {_lte: "${props.start_time_to}"}}, `
    } else if (props.start_time_from) {
        order = `order_by: {start_time: ${props.event_order || 'desc'}}, `
        variables += `start_time: {_gte: "${props.start_time_from}"}, `
    } else if (props.start_time_to) {
        order = `order_by: {start_time: ${props.event_order || 'desc'}}, `
        variables += `start_time: {_lte: "${props.start_time_to}"}, `
    }

    if (props.end_time_gte) {
        order = `order_by: {end_time: ${props.event_order || 'desc'}}, `
        variables += `end_time: {_gte: "${props.end_time_gte}"}, `
    }

    if (props.end_time_lte) {
        order = `order_by: {end_time: ${props.event_order || 'desc'}}, `
        variables += `end_time: {_lte: "${props.end_time_lte}"}, `
    }

    if (props.group_id) {
        variables += `group_id: {_eq: ${props.group_id}}, `
    }

    if (props.group_ids) {
        variables += `group_id: {_in: [${props.group_ids.join(',')}]}, `
    }


    variables = variables.replace(/,$/, '')


    const doc = gql`query MyQuery {
      events (where: {${variables} status: {_eq: "pending"}}, ${order} limit: ${page_size}, offset: ${(props.page - 1) * page_size}) {
        display
        operators
        padge_link
        badge_id
        notes
        external_url
        geo_lat
        geo_lng
        category
        content
        cover_url
        created_at
        display
        event_site_id
        event_site {
            id
            title
            location
            about
            group_id
            owner_id
            created_at
            formatted_address
            geo_lat
            geo_lng
        }
        event_type
        formatted_address
        location
        owner_id
        owner {
            id
            username
            nickname
            image_url
        }
        title
        timezone
        status
        tags
        start_time
        end_time
        require_approval
        participants_count
        max_participant
        meeting_url
        group_id
        host_info
        id
        location_viewport
        min_participant
        recurring_event {
          id
        }
        recurring_event_id
        participants(where: {status: {_neq: "cancel"}}) {
          id
          profile_id
          profile {
            id
            username
            nickname
            image_url
          }
          role
          status
          voucher_id
          check_time
          created_at
          message
          event {
            id
          }
        }
      }
    }`

    const resp: any = await request(graphUrl, doc)
    return resp.events.map((item: any) => {
        return {
            ...item,
            end_time: item.end_time && !item.end_time.endsWith('Z') ? item.end_time + 'Z' : item.end_time,
            start_time: item.end_time && !item.start_time.endsWith('Z') ? item.start_time + 'Z' : item.start_time,
        }
    }) as Event[]
}

export interface QueryRecommendEventProps {
    rec?: 'latest' | 'soon' | 'top'
    page: number,
    group_id?: number,
}

export async function queryRecommendEvent(props: QueryRecommendEventProps): Promise<Event[]> {
    // const res: any = await fetch.get({
    //     url: `${api}/event/recommended`,
    //     data: {...props}
    // })
    //
    // if (res.data.result === 'error') {
    //     throw new Error(res.data.message || 'Query event fail')
    // }
    //
    // return res.data.events.filter((item: Event) => {
    //     const cancel = item.status === 'cancel'
    //     const now = new Date().getTime()
    //     return new Date(item.end_time!).getTime() >= now && !cancel
    // }) as Event[]

    return []
}

export interface QueryEventDetailProps {
    id: number
}

export async function queryEventDetail(props: QueryEventDetailProps) {
    const res = await queryEvent({id: props.id, page: 1, show_pending_event: true, show_cancel_event: true})

    return res[0] as Event || null
}

export interface QueryMyEventProps {
    page?: number,
    profile_id?: number,
    page_size?: number,
}

export async function queryMyEvent({page = 1, page_size = 10, ...props}: QueryMyEventProps): Promise<Participants[]> {
    const doc = gql`query MyQuery {
     participants(
       where: {profile_id: {_eq: ${props.profile_id}}, status: {_neq: "cancel"}}
       limit: ${page_size}
       offset: ${page * page_size - page_size}
       order_by: {id: desc}
       ) {
        id
        event_id
        status
        message
        check_time
        created_at
        profile_id
        profile {
          id
          image_url
          nickname
          username
        }
        role
         event {
          cover_url
          content
          end_time
          notes
          id
          location
          title
          timezone
          owner_id
          start_time
          status
          participants(where: {status: {_neq: "cancel"}}) {
          id
          profile_id
          profile {
            id
            username
            nickname
            image_url
          }
          role
          status
          voucher_id
          check_time
          created_at
          message
          event {
            id
          }
        }
        }
      }
    }`

    const resp: any = await request(graphUrl, doc)
    return resp.participants as Participants[]
}

export interface CancelEventProps {
    auth_token: string,
    id: number
}

export async function cancelEvent(props: CancelEventProps): Promise<Participants[]> {
    checkAuth(props)

    const res: any = await fetch.post({
        url: `${apiUrl}/event/cancel_event`,
        data: {...props}
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message || 'Query event fail')
    }

    return res.data.participants as Participants[]
}

export async function getEventSide(groupId?: number): Promise<EventSites[]> {
    const doc = gql`query MyQuery {
      event_sites(where: {group_id: {_eq: ${groupId}}}, order_by: {id: desc}) {
        formatted_address
        geo_lat
        geo_lng
        group_id
        id
        about
        location
        location_viewport
        owner_id
        title
      }
    }`

    const resp: any = await request(graphUrl, doc)
    return resp.event_sites as EventSites[]
}

export interface JoinEventProps {
    id: number,
    auth_token: string,
}

export async function joinEvent(props: JoinEventProps) {
    checkAuth(props)
    const res: any = await fetch.post({
        url: `${apiUrl}/event/join`,
        data: props
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message || 'Join event fail')
    }

    return res.data.participant as Participants
}

export async function unJoinEvent(props: JoinEventProps) {
    checkAuth(props)
    const res: any = await fetch.post({
        url: `${apiUrl}/event/cancel`,
        data: props
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message || 'Join event fail')
    }

    return res.data.participant as Participants
}

export async function searchEvent(keyword: string) {
    const doc = gql`query MyQuery {
      events (where: {title: {_iregex: "${keyword}"} , status: {_neq: "closed"}}, limit: 10) {
        display
        operators
        padge_link
        badge_id
        notes
        external_url
        geo_lat
        geo_lng
        category
        content
        cover_url
        created_at
        display
        end_time
        event_site_id
        event_site {
            id
            title
            location
            about
            group_id
            owner_id
            created_at
            formatted_address
            geo_lat
            geo_lng
        }
        event_type
        formatted_address
        location
        owner_id
        owner {
            id
            username
            nickname
            image_url
        }
        title
        timezone
        status
        tags
        start_time
        require_approval
        participants_count
        max_participant
        meeting_url
        group_id
        host_info
        id
        location_viewport
        min_participant
        recurring_event {
          id
        }
        recurring_event_id
        participants(where: {status: {_neq: "cancel"}}) {
          id
          profile_id
          profile {
            id
            username
            nickname
            image_url
          }
          role
          status
          voucher_id
          check_time
          created_at
          message
          event {
            id
          }
        }
      }
    }`

    const resp: any = await request(graphUrl, doc)
    return resp.events.map((item: any) => {
        return {
            ...item,
            end_time: item.end_time && !item.end_time.endsWith('Z') ? item.end_time + 'Z' : item.end_time,
            start_time: item.end_time && !item.start_time.endsWith('Z') ? item.start_time + 'Z' : item.start_time,
        }
    }) as Event[]
}

interface InviteGuestProp {
    id: number,
    domains: string[],
    auth_token: string,
}

export async function inviteGuest(props: InviteGuestProp) {
    // checkAuth(props)
    //
    // const task = props.domains.map((item : any) => {
    //     const domain = item.endsWith(process.env.NEXT_PUBLIC_SOLAS_DOMAIN! || '') ? item : item + (process.env.NEXT_PUBLIC_SOLAS_DOMAIN || '')
    //     return getProfile({username: item})
    // })
    //
    // const profiles = await Promise.all(task).catch(e => {
    //     throw e
    // })
    //
    // const ids = profiles.map((item: Profile, index: number) => {
    //     if (!item) throw new Error('Profile not found: ' + props.domains[index])
    //
    //     return item.id
    // })
    //
    // const res = await fetch.post({
    //     url: `${api}/event/invite_guest`,
    //     data: {
    //         target_id: ids.join(','),
    //         auth_token: props.auth_token,
    //         id: props.id
    //     }
    // })
    //
    // if (res.data.result === 'error') {
    //     throw new Error(res.data.message || 'Invite fail')
    // }
}

export interface SetEventBadgeProps {
    id: number,
    badge_id: number,
    auth_token: string,
}

export async function setEventBadge(props: SetEventBadgeProps) {
    checkAuth(props)

    const res = await fetch.post({
        url: `${apiUrl}/event/set_badge`,
        data: props
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message || 'Join event fail')
    }
}

export interface SendEventBadgeProps {
    auth_token: string,
    event_id: number,
}

export async function sendEventBadge(props: SendEventBadgeProps) {
    checkAuth(props)

    const res = await fetch.post({
        url: `${apiUrl}/event/send_badge`,
        data: {
            id: props.event_id,
            auth_token: props.auth_token,
        }
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message || 'Join event fail')
    }
}

export interface GetEventCheckLogProps {
    page?: number
    event_id: number,
    profile_id?: number,
}

export interface CheckLog {
    id: number,
    message: string,
    image_url: string,
    event_id: number,
    profile_id: number
    profile: Profile,
    created_at: string,
}

export async function getEventCheckLog(props: GetEventCheckLogProps) {
    //
    // const res = await fetch.get({
    //     url: `${api}/event/list_checklogs`,
    //     data: props
    // })
    //
    // if (res.data.result === 'error') {
    //     throw new Error(res.data.message)
    // }
    //
    // return res.data.checklogs as CheckLog[]
    return []
}

export interface PunchInProps {
    auth_token: string,
    id: number,
    message?: string,
    image_url?: string,
}

export async function punchIn(props: PunchInProps) {
    // checkAuth(props)
    //
    // const res = await fetch.post({
    //     url: `${api}/event/add_checklog`,
    //     data: props
    // })
    //
    // if (res.data.result === 'error') {
    //     throw new Error(res.data.message)
    // }
    throw new Error('not implement')
}

export async function getShanhaiwooResource(profile_id: number) {
    // const res = await fetch.get({
    //     url: `${api}/profile/shanhaiwoo_resource_count`,
    //     data: {profile_id}
    // })
    //
    // if (res.data.result === 'error') {
    //     throw new Error(res.data.message)
    // }
    //
    // return res.data as {
    //     poap_count: number,
    //     host_count: number,
    //     shanhaiwoo_poap_used_count: number,
    //     shanhaiwoo_host_used_count: number,
    // }
    throw new Error('not implement')
}

export async function getDivineBeast(profile_id: number) {
    // const res = await fetch.get({
    //     url: `${api}/profile/shanhaiwoo_list`,
    //     data: {profile_id}
    // })
    //
    // if (res.data.result === 'error') {
    //     throw new Error(res.data.message)
    // }
    //
    // return res.data.badgelets as Badgelet[]
    throw new Error('not implement')
}

export interface DivineBeastMergeProps {
    auth_token: string,
    content: string,
    metadata: string,
    image_url: string,
}

export async function divineBeastMerge(props: DivineBeastMergeProps) {
    // checkAuth(props)
    //
    // const res = await fetch.post({
    //     url: `${api}/profile/shanhaiwoo_merge`,
    //     data: {...props, value: 1}
    // })
    //
    // if (res.data.result === 'error') {
    //     throw new Error(res.data.message)
    // }
    //
    // return res.data.badgelet as Badgelet
    throw new Error('not implement')
}

export interface DivineBeastRmergeProps {
    auth_token: string,
    badgelet_id: number,
    metadata: string,
    image_url: string,
    value: number,
}

export async function divineBeastRemerge(props: DivineBeastRmergeProps) {
    // checkAuth(props)
    //
    // const res = await fetch.post({
    //     url: `${api}/profile/shanhaiwoo_remerge`,
    //     data: props
    // })
    //
    // if (res.data.result === 'error') {
    //     throw new Error(res.data.message)
    // }
    //
    // return res.data.badgelets as Badgelet[]
    throw new Error('not implement')
}

export async function getEventGroup() {
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
    }`

    const res: any = await request(graphUrl, doc)
    return res.groups.map((item: any) => {
        item.domain = item.username + process.env.NEXT_PUBLIC_SOLAS_DOMAIN
        item.creator = item.memberships[0]?.profile || null
        return item
    })
}

export interface GetDateListProps {
    group_id: number,
    start_time_from: number,
    start_time_to: number,
    page: number,
}

export async function getDateList(props: GetDateListProps) {
    // const res = await fetch.get({
    //     url: `${api}/event/daylist`,
    //     data: {...props, page: props.page || 1, event_order: 'start_time_asc'}
    // })
    //
    // if (res.data.result === 'error') {
    //     throw new Error(res.data.message)
    // }
    //
    // return res.data.map((dataStr: string) => {
    //     const dateSplit = dataStr.split('-')
    //     return new Date(Number(dateSplit[0]), Number(dateSplit[1]) - 1, Number(dateSplit[2]), 0, 0, 0)
    // }) as Date[]
    return []
}

interface EditEventProps extends Partial<EventSites> {
    auth_token: string,
    event_site_id?: number,
}

export async function createEventSite(props: EditEventProps) {
    checkAuth(props)

    const res = await fetch.post({
        url: `${apiUrl}/event_site/create`,
        data: props
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }

    return res.data.event_site as EventSites
}

export async function updateEventSite(props: EditEventProps) {
    checkAuth(props)

    const res = await fetch.post({
        url: `${apiUrl}/event_site/update`,
        data: props
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }

    return res.data.event_site as EventSites
}

export async function removeEventSite({auth_token, id}: { auth_token: string, id: number }) {
    checkAuth({auth_token})

    const res = await fetch.post({
        url: `${apiUrl}/event_site/remove`,
        data: {
            auth_token,
            id
        }
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }

    // return res.data.event_site as EventSites
}


export async function requestPhoneCode(phone: string): Promise<void> {
    const res: any = await fetch.post({
        url: `${apiUrl}/profile/send_msg`,
        data: {phone}
    })
    if (res.data.result === 'error') {
        throw new Error(res.data.message || 'Request fail')
    }
}

export async function phoneLogin(phone: string, code: string): Promise<LoginRes> {
    const res = await fetch.post({
        url: `${apiUrl}/profile/signin_with_phone`,
        data: {phone, code, app: window.location.host, address_source: 'phone'}
    })
    if (res.data.result === 'error') {
        throw new Error(res.data.message || 'Verify fail')
    }

    return res.data
}

export interface EventStats {
    total_events: number,
    total_event_hosts: number,
    total_participants: number,
    total_issued_badges: number,
}

export async function getEventStats(props: { group_id: number, days: number }) {
    const res = await fetch.get({
        url: `${apiUrl}/event/stats`,
        data: props
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }

    return res.data as EventStats
}

export interface EventCheckInProps {
    id: number,
    auth_token: string,
    profile_id: number,
}

export async function eventCheckIn(props: EventCheckInProps) {
    checkAuth(props)
    const res: any = await fetch.post({
        url: `${apiUrl}/event/check`,
        data: props
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message || 'Check in fail')
    }
}

export interface CancelRepeatProps {
    auth_token: string,
    selector: 'one' | 'after' | 'all',
    recurring_event_id: number,
    event_id?: number,
}

export async function cancelRepeatEvent(props: CancelRepeatProps) {
    checkAuth(props)

    const res = await fetch.post({
        url: `${apiUrl}/recurring_event/cancel_event`,
        data: props
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }
}

export interface CreateRepeatEventProps extends CreateEventProps {
    interval?: 'day' | 'week' | 'month',
    repeat_start_time?: string,
    repeat_end_time?: string,
    event_count?: number,
}

export async function createRepeatEvent(props: CreateRepeatEventProps) {
    checkAuth(props)
    const res = await fetch.post({
        url: `${apiUrl}/recurring_event/create`,
        data: props
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }

    const event = await queryEvent({recurring_event_id: res.data.recurring_event_id, page: 1})
    return event[0]
}

export interface RepeatEventInviteProps {
    auth_token: string,
    repeat_event_id: number,
    selector?: 'one' | 'after' | 'all'
    domains: string[],
}

export async function RepeatEventInvite(props: RepeatEventInviteProps) {
    // checkAuth(props)
    //
    // const task = props.domains.map((item : any) => {
    //     return getProfile({domain: item})
    // })
    //
    // const profiles = await Promise.all(task).catch(e => {
    //     throw e
    // })
    //
    // const ids = profiles.map((item, index) => {
    //     if (!item) throw new Error('Profile not found: ' + props.domains[index])
    //
    //     return item.id
    // })
    //
    // const res = await fetch.post({
    //     url: `${api}/repeat_event/invite_guest`,
    //     data: {...props, target_id: ids.join(',')}
    // })
    //
    // if (res.data.result === 'error') {
    //     throw new Error(res.data.message)
    // }
    //
    // return res.data.events as Event[]
    return []
}

export interface RepeatEventSetBadgeProps {
    auth_token: string,
    badge_id: number,
    recurring_event_id: number,
    selector?: 'one' | 'after' | 'all'
}

export async function RepeatEventSetBadge(props: RepeatEventSetBadgeProps) {
    checkAuth(props)
    const res = await fetch.post({
        url: `${apiUrl}/recurring_event/set_badge`,
        data: props
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }
    return res.data.events as Event[]
}

export interface RepeatEventUpdateProps extends CreateEventProps {
    event_id?: number,
    selector?: 'one' | 'after' | 'all',
}


export async function RepeatEventUpdate(props: RepeatEventUpdateProps) {
    checkAuth(props)
    const res = await fetch.post({
        url: `${apiUrl}/recurring_event/update`,
        data: props
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }
}

export interface Marker {
    id: number,
    group_id: number,
    owner_id: number,
    owner: ProfileSimple,
    group: ProfileSimple,
    pin_image_url: string,
    cover_image_url: string,
    title: string,
    category: string,
    about: string | null,
    message: string | null,
    voucher_id: number | null,
    link: string | null,
    status: string
    marker_type: string,
    location: string
    formatted_address: string,
    geo_lat: number,
    geo_lng: number,
    start_time: string | null,
    end_time: string | null,
    map_checkins_count: number,
    map_checkins?: MarkerCheckinDetail[] | undefined,
    event_id: number | null,
    jubmoji_code?: string | null,
    zugame_state?: string | null,
    event?: Event | null,
}

export interface CreateMarkerProps extends Partial<Marker> {
    auth_token: string,
}

export async function createMarker(props: CreateMarkerProps) {
    checkAuth(props)

    if (props.category === 'Zugame') {
        props.category = 'zugame'
        props.marker_type = 'zugame'
    }

    const res = await fetch.post({
        url: `${apiUrl}/marker/create`,
        data: props
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }

    return res.data.marker as Marker
}

export async function markerDetail(markerid: number) {
    const res = await queryMarkers({
        id: markerid
    })

    return res[0] || null
}

export async function saveMarker(props: CreateMarkerProps) {
    checkAuth(props)

    if (props.category === 'Zugame') {
        props.category = 'zugame'
        props.marker_type = 'zugame'
    }

    const res = await fetch.post({
        url: `${apiUrl}/marker/update`,
        data: props
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }

    return res.data.marker as Marker
}

export async function queryMarkers(props: {
    owner_id?: number,
    group_id?: number,
    marker_type?: string,
    category?: string,
    with_checkins?: boolean,
    auth_token?: string,
    jubmoji?: number,
    start_time_from?: string,
    start_time_to?: string,
    id?: number,
    sort?: 'asc' | 'desc',
    sort_by?: 'start_time' | 'end_time' | 'map_checkins_count',
}) {

    let variables = ''

    if (props.id) {
        variables += `id: {_eq: ${props.id}},`
    }

    if (props.owner_id) {
        variables += `owner_id: {_eq: ${props.owner_id}},`
    }

    if (props.group_id) {
        variables += `group_id: {_eq: ${props.group_id}},`
    }

    if (props.marker_type) {
        variables += `marker_type: {_eq: "${props.marker_type}"},`
    }

    if (props.category) {
        variables += `category: {_eq: "${props.category}"},`
    }

    if (props.jubmoji) {
        variables += `jubmoji_code: {_eq: "${props.jubmoji}"},`
    }

    let sortStr = ''
    if (props.sort_by) {
        sortStr = `${props.sort_by}: ${props.sort || 'desc'}`
    } else {
        sortStr = `id: ${props.sort || 'desc'}`
    }

    if (props.start_time_from && props.start_time_to) {
        variables += `start_time: {_gte: "${props.start_time_from}"}, _and: {start_time: {_lte: "${props.start_time_to}"}}, `
    } else if (props.start_time_from) {
        variables += `start_time: {_gte: "${props.start_time_from}"}, `
    } else if (props.start_time_to) {
        variables += `start_time: {_lte: "${props.start_time_to}"}, `
    }

    variables = variables.replace(/,$/, '')

    const doc = gql`
        query MyQuery {
          markers(where: {${variables} ,status: {_nin: ["pending", "removed"]}} order_by: {${sortStr}}) {
          voucher_id
          voucher {
            id
                badge {
                    content
                    title
                    name
                    image_url
                    id
                }
            }
            id
            about
            badge_id
            category
            cover_image_url
            created_at
            end_time
            event_id
            event {
              end_time
              start_time 
              host_info
              notes
              id
              tags
              status
              location
              formatted_address
              participants {
                profile {
                  id
                  image_url
                  nickname
                  username
                }
              }
            }
            formatted_address
            geo_lat
            geo_lng
            group_id
            link
            location
            location_viewport
            message
            marker_type
            owner_id
            owner {
                id
                nickname
                image_url
                username
            }
            start_time
            status
            title
            pin_image_url
            map_checkins_count
            map_checkins {
              profile_id
               badgelet_id
               check_type
               content
               created_at
               id
               image_url
               marker_id
           }
          }
        }`

    const res: any = await request(graphUrl, doc)
    return res.markers as Marker[]
}

export interface MarkerCheckinDetail {
    profile_id: number
    profile: ProfileSimple,
    marker: Marker,
    badgelet_id: number | null,
    check_type: string,
    content: string | null,
    image_url: string | null,
    created_at: string,
    zugame_team: string | null,
}

export async function markersCheckinList({page = 1, ...props}: {
    id?: number,
    page?: number,
}) {
    const doc = gql`query MyQuery {
      map_checkins(where: {marker_id: {_eq: ${props.id}}}, limit: 50, offset: ${(page - 1) * 50}, order_by: {created_at: desc}){
        profile {
          id
          image_url
          nickname
          username
        }
        profile_id
        badgelet_id
        check_type
        content
        created_at
        id
        image_url
        marker_id
        marker {
          about
          geo_lat
          geo_lng
          formatted_address
          event_id
          end_time
          created_at
          cover_image_url
          category
          badge_id
          group_id
          highlight
          id
          link
          location
          location_viewport
          marker_state
          marker_type
          message
          map_checkins_count
          owner_id
          pin_image_url
          start_time
          status
          title
          voucher_id
        }
      }
    }`

    const res: any = await request(graphUrl, doc)

    return res.map_checkins as MarkerCheckinDetail[]
}

export async function markerCheckin(props: {
    auth_token: string,
    id?: number,
    check_type: string
    badgelet_id?: number,
}) {

    checkAuth(props)
    const res = await fetch.post({
        url: `${apiUrl}/marker/check`,
        data: props
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }

    return res.data.checklog as MarkerCheckinDetail
}

export async function removeMarker(props: {
    auth_token: string,
    id?: number,
}) {
    checkAuth(props)
    const res = await fetch.post({
        url: `${apiUrl}/marker/remove`,
        data: props
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }
}

export async function getVoucherCode(props: {
    auth_token: string,
    id?: number,
}) {
    checkAuth(props)
    const res = await fetch.get({
        url: `${apiUrl}/voucher/get_code`,
        data: props
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }

    return res.data.code as string
}

export async function transferGroupOwner(props: { id: number, new_owner_username: string, auth_token: string }) {
    const res = await fetch.post({
        url: `${apiUrl}/group/transfer_owner`,
        data: props
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }
}

export async function zupassLogin(props: {
    zupass_event_id: string,
    zupass_product_id: string,
    email: string,
    next_token: string
    host?: string,
}) {
    const res = await fetch.post({
        url: `${apiUrl}/profile/signin_with_zupass`,
        data: {...props, app: props.host, address_source: 'zupass'}
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }

    return res.data.auth_token as string
}

export async function farcasterLogin(props: {
    far_fid: number,
    far_address: string,
    next_token: string
    host?: string,
}) {
    const res = await fetch.post({
        url: `${apiUrl}/profile/signin_with_farcaster`,
        data: {...props, app: props.host, address_source: 'farcaster'}
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }

    return res.data.auth_token as string
}

export async function solanaLogin(props: {
    sol_address: string,
    next_token: string,
    host?: string
}) {
    const res = await fetch.post({
        url: `${apiUrl}/profile/signin_with_solana`,
        data: {...props, app: props.host, address_source: 'solana'}
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }

    return res.data.auth_token as string
}

export async function jubmojiCheckin(props: {
    id: number,
    auth_token: string,
    reaction_type: string,
}) {
    const res = await fetch.post({
        url: `${apiUrl}/marker/check_jubmoji`,
        data: props
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }
}

export async function zugameInfo() {
    const res = await fetch.get({
        url: `${apiUrl}/marker/zugame_checkin_stats`,
        data: {}
    })

    if (res.data.result === 'error') {
        throw new Error(res.data.message)
    }

    return res.data.checkin_stats as {
        a: any, b: any, c: any,
        a_profiles: any
        b_profiles: any
        c_profiles: any
    }
}

export async function userAppliedEvent(props: { id: number, page: number, group_id?: number }) {
    const a = await queryMyEvent({
        profile_id: props.id,
        page: props.page,
    })

    return a as Participants[]
}

export interface Voucher {
    id: number,
    badge: Badge,
    group: Group | null,
    group_id: number | null,
    badge_id: number,
    badge_title: string,
    created_at: string,
    expires_at: string | null,
    counter: number,
    claimed_at: string | null,
    claimed_by_server: boolean,
    message: string | null,
    receiver: ProfileSimple,
    receiver_id: number,
    sender: ProfileSimple,
    sender_id: number,
    badgelets: Badgelet[]
    strategy: 'code' | 'account'
    receiver_address: string | null
}

export async function getPendingBadges(profile_id: number, page = 1) {
    const doc = `query MyQuery {${voucherSchema({receiver_id: profile_id, page})}}`

    const res: any = await request(graphUrl, doc)
    return res.vouchers as Voucher[]
}

export async function queryVoucherDetail(id?: number, badge_id?: number, receiver_id?: number, canClaim?: boolean) {
    let variables = ''

    if (id) {
        variables += `id: {_eq: "${id}"},`
    }

    if (badge_id) {
        variables += `badge_id: {_eq: "${badge_id}"},`
    }

    if (receiver_id) {
        variables += `receiver_id: {_eq: "${receiver_id}"},`
    }

    if (canClaim) {
        variables += `counter: {_neq: 0},`
    }

    const doc = gql`query MyQuery {
      vouchers(where: {${variables}}) {
        id
        strategy
        receiver_address
        badge_id
        badge {
          badge_type
          content
          counter
          creator_id
          group {
            id
            username
            nickname
            image_url
          }
          group_id
          id
          hashtags
          image_url
          name
          permissions
          title
          transferable
        }
        badge_id
        badge_title
        created_at
        expires_at
        counter
        claimed_at
        claimed_by_server
        badgelets {
          badge_id
          content
          id
          image_url
          owner {
            id
            image_url
            nickname
            username
          }
          owner_id
          title
          value
          badge {
            creator {
              id
              image_url
              nickname
              username
            }
            group_id
            id
            title
            image_url
            name
            creator_id
            badge_type
            content
          }
        }
        message
        receiver {
          id
          nickname
          username
          image_url
        }
        receiver_id
        sender {
          id
          image_url
          nickname
          username
        }
        sender_id
      }
    }`

    const res: any = await request(graphUrl, doc)
    return res.vouchers[0] as Voucher || null
}

export async function sendBadgeByWallet(props: {
    receivers: string[],
    auth_token: string,
    reason: string,
    badge_id: number,
    starts_at?: string,
    expires_at?: string,
    value?: number | null
}) {
    checkAuth(props)

    const res = await fetch.post({
        url: `${apiUrl}/voucher/send_badge_by_address`,
        data: props
    })

    return res.data.vouchers as Voucher[]
}

export async function queryGroupEventCheckins(group_id: number) {
    const doc = `query participants {
      participants_aggregate(where: {event: {group_id: {_eq: ${group_id}}}, status: {_eq: "checked"}}) {
        aggregate {
          count
        }
      }
    }`

    const res: any = await request(graphUrl, doc)
    return res.participants_aggregate.aggregate.count as number
}

export async function getSwapCode(props: { auth_token: string, badgelet_id: number }) {
    checkAuth(props)

    const res = await fetch.post({
        url: `${apiUrl}/badgelet/swap_code`,
        data: props
    })

    return res.data.token as string
}

export async function swapBadgelet(props: { auth_token: string, badgelet_id: number, swap_token: string }) {
    checkAuth(props)

    const res = await fetch.post({
        url: `${apiUrl}/badgelet/swap`,
        data: props
    })
}

export interface Comment {
    id: number,
    content: string,
    created_at: string,
    topic_item_id: number,
    topic_item_type: number,
    sender: ProfileSimple
    sender_id: number,
}

export async function sendComment(props: {
    auth_token: string,
    type: string,
    target: number
    content: string
}) {
    checkAuth(props)

    const doc = gql`mutation {
        insert_chat_messages_one(object: {content: "${props.content.trim()}", topic_item_type: "${props.type}", topic_item_id: ${props.target}, created_at: "${new Date().toISOString()}"}) {
            id
            content
            created_at
            topic_item_id
            topic_item_type
            sender_id
            sender {
                id
                nickname
                username
                image_url
                }
        }
    }`

    const res: any = await request(graphUrl, doc, {}, {
        'Authorization': 'Bearer ' + props.auth_token
    })

    return res.insert_chat_messages_one as Comment
}

export async function queryComment(props: {
    type?: string,
    target: number
    page: number,
    page_size?: number
}) {

    const size = props.page_size || 10

    const doc = gql`query MyQuery {
        chat_messages(
        order_by: {created_at: desc}
        where: {topic_item_id: {_eq: ${props.target}}, topic_item_type: {_eq: ${props.type || 'Group'}}}
        limit: ${size}
        offset: ${(props.page - 1) * size}
      ) {
            id
            content
            created_at
            topic_item_id
            topic_item_type
            sender_id
            sender {
                id
                nickname
                username
                image_url
                }
        }
    }`

    const res: any = await request(graphUrl, doc)

    return res.chat_messages as Comment[]
}

export async function requestToBeIssuer(props: {
    auth_token: string,
    group_id: number,
    message: string,
    role: string
}) {
    checkAuth(props)

    const res = await fetch.post({
        url: `${apiUrl}/group/request_invite`,
        data: props
    })
}


export async function acceptRequest(props: {
    auth_token: string,
    group_invite_id: number,
}) {
    checkAuth(props)

    const res = await fetch.post({
        url: `${apiUrl}/group/accept_request`,
        data: props
    })
}

export async function getProfileBatch(usernames: string[]) {
    const doc = gql`query MyQuery @cached {
          profiles(where: {username: {_in:${JSON.stringify(usernames)}}}) {
            id,
            username,
            nickname,
            image_url,
            sol_address
          }
        }
        `
    const res: any = await request(graphUrl, doc)
    return res.profiles as ProfileSimple[]
}

export async function setEventStatus(props: {
    auth_token: string,
    id: number,
    status: string
}) {
    checkAuth(props)

    const res = await fetch.post({
        url: `${apiUrl}/event/set_status`,
        data: props
    })

    return res.data.event as Event
}

export interface Activity {
    id: number,
    created_at: string,
    action: string,
    has_read: boolean,
    initiator: ProfileSimple,
    item_id: number,
    receiver_id: number | null
}

export async function queryActivities(props: {
    page: number,
    page_size?: number,
    initiator_id?: number,
    receiver_id?: number,
    has_read?: boolean
}) {
    let variables = ''
    if (props.initiator_id) {
        variables += `, initiator_id: {_eq: ${props.initiator_id}},`
    }
    if (props.receiver_id) {
        variables += `, receiver_id: {_eq: ${props.receiver_id}},`
    }
    if (props.has_read !== undefined) {
        variables += `, has_read: {_eq: ${props.has_read}},`
    }

    const pageSize = props.page_size || 10

    const doc = gql`query MyQuery {
        activities(where: {${variables} _or: [{action: {_eq: "voucher/send_badge"}}]} limit: ${pageSize} offset: ${(props.page- 1) * pageSize}  order_by: {created_at: desc}) {
                    data
                    action
                    created_at
                    id
                    has_read
                    initiator {
                      id
                      image_url
                      nickname
                      username
                    }
                    item_class_id
                    item_id
                    item_type
                    memo
                    receiver_address
                    receiver_id
                    receiver_type
                    target_id
                    target_type
                  }
    }`

    const res: any = await request(graphUrl, doc)
    return res.activities as Activity[]
}

export async function setActivityRead (props: {ids: number[], auth_token: string}) {
    checkAuth(props)

    const res = await fetch.post({
        url: `${apiUrl}/activity/set_read_status`,
        data: props
    })
}

export interface PopupCity {
    id: number
    image_url: string | null
    location: string | null
    start_date: string | null
    title: string
    updated_at:  string | null
    website: string | null
    created_at: string | null
    end_date: string | null
    group_id: string | null,
    group: ProfileSimple
    group_tags: string[] | null
}

export async function queryPopupCity ({page = 1, page_size = 10}: {page?: number, page_size?: number}) {
    const doc = gql`
        query MyQuery {
          popup_cities(offset: ${(page - 1 ) * page_size}, limit: ${page_size}, order_by: {id: desc}) {
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
    }
    `

    const res: any = await request(graphUrl, doc)
    return res.popup_cities as PopupCity[]
}

export async function popupCityDetail (id: number) {
    const doc = gql`
        query MyQuery {
          popup_cities(where: {id: {_eq: ${id}}}, order_by: {id: desc}) {
            id
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
    }
    `

    const res: any = await request(graphUrl, doc)
    return res.popup_cities[0] as PopupCity || null
}

export async function memberCount (group_ids: number[]) {
    let queryItem = ''
    group_ids.forEach((item) => {
        queryItem = queryItem + `_${item}: memberships_aggregate(where: {group: {id: {_eq: "${item}"}}}) {aggregate {count}}
        `
    })

    const doc = `query MyQuery @cached {
        ${queryItem}
    }`

    const res: any = await request(graphUrl, doc)
    const keys = Object.keys(res)

    const res_format = keys.map((item, index) => {
        return {
            group_id: Number(item.replace('_', '')),
            count: res[item].aggregate.count
        }
    })

    return res_format
}

export async function groupComingEventCount (group_ids: number[]) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    let queryItem = ''
    group_ids.forEach((item) => {
        queryItem = queryItem + `_${item}: events_aggregate(where: {group: {id: {_eq: "${item}"}}, end_time: {_gt: "${today.toISOString()}"}}) {aggregate {count}}
        `
    })

    const doc = `query MyQuery @cached {
        ${queryItem}
    }`

    const res: any = await request(graphUrl, doc)
    const keys = Object.keys(res)

    const res_format = keys.map((item, index) => {
        return {
            group_id: Number(item.replace('_', '')),
            count: res[item].aggregate.count
        }
    })

    return res_format
}

export async function userManageGroups (userid: number) {
    const doc = `query MyQuery {
        memberships(where: {profile_id: {_eq: ${userid}}, role: {_in: ["owner", "manager"]}}) {
            group {
                id
                }
        }
    }`

    const res: any = await request(graphUrl, doc)

    return res.memberships.map((item: any) => item.group.id) as number[]
}

export async function combine(props: {
    badgelet_ids: number[],
    auth_token: string,
    color: string,
    new_badge_id: number
}) {
    checkAuth(props)

    const res = await fetch.post({
        url: `${apiUrl}/badgelet/wamo_go_merge`,
        data: props
    })

    return res.data.badgelet_id as number
}


export default {
    removeMarker,
    queryMarkers,
    saveMarker,
    markerDetail,
    createMarker,
    myProfile,
    setEmail,
    badgeletBurn,
    checkIsManager,
    cancelVote,
    castVote,
    queryVoteRecords,
    queryVotes,
    updateVote,
    getVoteDetail,
    createVote,
    login,
    getProfile,
    requestEmailCode,
    emailLogin,
    regist,
    queryBadge,
    queryPresend,
    queryBadgelet,
    queryUserGroup,
    acceptBadgelet,
    rejectBadgelet,
    acceptPresend,
    queryPresendDetail,
    queryBadgeDetail,
    setBadgeletStatus,
    queryBadgeletDetail,
    uploadImage,
    setAvatar,
    createBadge,
    createPresend,
    getGroupMembers,
    getFollowers,
    getFollowings,
    issueBatch,
    follow,
    unfollow,
    queryGroupInvites,
    queryGroupDetail,
    createGroup,
    sendInvite,
    queryInviteDetail,
    acceptInvite,
    cancelInvite,
    queryInvites,
    updateGroup,
    leaveGroup,
    searchDomain,
    searchBadge,
    queryBadgeByHashTag,
    freezeGroup,
    queryGroupsUserCreated,
    queryGroupsUserJoined,
    updateProfile,
    verifyTwitter,
    sendPoint,
    queryPointDetail,
    queryPointItemDetail,
    queryPointItems,
    rejectPoint,
    acceptPoint,
    queryNftPasslet,
    queryNftpass,
    queryNftPassDetail,
    queryPrivacyBadgelet,
    queryPrivateBadge,
    checkIn,
    queryCheckInList,
    queryAllTypeBadgelet,
    badgeTransfer,
    removeManager,
    addManager,
    getVoucherCode,
    getGroups,
    getPendingBadges,
    queryVoucherDetail,
    rejectVoucher,
    getGroupMemberShips
}
