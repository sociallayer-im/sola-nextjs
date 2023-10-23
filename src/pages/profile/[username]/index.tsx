import Profile from './profile'
import {getProfile} from '@/service/solas'

export default function ProfilePage(props: any) {
    return <Profile {...props} />
}

export const getServerSideProps: any = (async (context: any) => {
    const username = context.params?.username
    const profile = await getProfile({username})
    return { props: { username:  context.params.username, profile} }
})
