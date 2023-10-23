import Page from '@/components/maodao/page'
import {getProfile, getProfile as getProfileDetail} from "@/service/solas";
import Alchemy from "@/service/alchemy/alchemy";
import fetch from "@/utils/fetch";

export default Page

export const getServerSideProps: any = (async (context: any) => {
    const username = context.params?.username
    const profile = await getProfile({username})

    if (profile?.address && process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'maodao') {
        const maodaoNft = await Alchemy.getMaodaoNft(profile.address)
        if (maodaoNft.length) {
            const maodaoProfile = await fetch.get({
                url: `https://metadata.readyplayerclub.com/api/rpc-fam/${maodaoNft[0].id}`,
                data: {}
            }) as any
            if (maodaoProfile?.data?.name) {
                profile.nickname = maodaoProfile.data.info.owner
                profile.image_url = maodaoProfile.data.image
            }
        }
    }

    return { props: { username:  context.params.username, profile} }
})
