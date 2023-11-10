import Page from '@/components/maodao/page'
import {getProfile, Profile} from "@/service/solas";
import Alchemy from "@/service/alchemy/alchemy";
import fetch from "@/utils/fetch";
import { toChecksumAddress } from 'web3-utils'

export default Page

export const getServerSideProps: any = (async (context: any) => {
    const tokenId = context.params?.tokenId
    const emptyProfile: Profile = {
        address: null,
        domain: null,
        group_owner_id: null,
        id: 0,
        image_url: null,
        email: null,
        twitter: null,
        telegram: null,
        github: null,
        discord: null,
        ens: null,
        lens: null,
        website: null,
        nostr: null,
        location: null,
        about:null,
        nickname: '--',
        username: '--',
        followers: 0,
        following: 0,
        is_group: false,
        badge_count: 0,
        status: 'active',
        permissions: [],
        group_event_visibility: 'public',
        group_event_tags: null,
        group_map_enabled: false,
        banner_image_url:null,
        banner_link_url: null,
        group_location_details: null
    }

    if (tokenId) {
       try {
           const maodaoProfile = await fetch.get({
               url: `https://metadata.readyplayerclub.com/api/rpc-fam/${tokenId}`,
               data: {}
           }) as any

           const walletAddress = await Alchemy.getMaodaoOwner(tokenId)
           if (walletAddress) {
               const solaProfile = await getProfile({address: toChecksumAddress(walletAddress)})
               if (solaProfile) {
                   solaProfile.nickname = maodaoProfile.data.info.owner
                   solaProfile.image_url = maodaoProfile.data.image
                   return { props: { tokenId, profile: solaProfile} }
               } else {
                   emptyProfile.nickname = maodaoProfile.data.info.owner
                   emptyProfile.image_url = maodaoProfile.data.image
                   return { props: { tokenId, profile: emptyProfile} }
               }
           }
       } catch (e) {
           return { props: { tokenId, profile: emptyProfile} }
       }
    }
})
