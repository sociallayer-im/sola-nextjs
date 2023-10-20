import ProfileMaodao from './profileMaodao'
import Profile from './profile'
import {getProfile} from '@/service/solas'

export default function ProfilePage(props: any) {
    const isMaodao = process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'maodao'

    return isMaodao ? <ProfileMaodao {...props} /> : <Profile {...props} />
}

export const getServerSideProps: any = (async (context: any) => {
    const username = context.params?.username
    const profile = await getProfile({username})
    return { props: { username:  context.params.username, profile} }
})
