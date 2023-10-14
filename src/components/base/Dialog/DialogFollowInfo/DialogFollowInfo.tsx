import { useState, useContext, useEffect } from 'react'
import PageBack from '../../PageBack';
import langContext from '../../../provider/LangProvider/LangContext'
import AppTabs from "../../AppTabs"
import { Tab } from 'baseui/tabs'
import UserContext from '../../../provider/UserProvider/UserContext'
import solas, { Profile, Group } from '../../../../service/solas'
import AddressList from '../../AddressList/AddressList'
import Empty from '../../Empty'
import {useRouter} from 'next/navigation'

const overrides = {
    TabBar: {
        paddingBottom: '20px',
        paddingTop: '20px',
        backgroundColor: '#fff',
        maxWidth: '450px',
        width: '100%',
        boxSizing: 'border-box',
        marginLeft: 'auto',
        marginRight: 'auto',
        display: 'flex'
    },
    TabContent: {
        background: '#f8f8f8',
        width: '100%',
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    Tab: {
        flex: 1,
        textAlign: 'center'
    }
}

export interface DialogFollowInfoProps {
    handleClose: () => any,
    profile: Profile | Group
    title?: string
}

function DialogFollowInfo(props: DialogFollowInfoProps) {
    const { lang } = useContext(langContext)
    const { user } = useContext(UserContext)
    const router = useRouter()

    const [followers, setFollowers] = useState<Profile[]>([])
    const [followings, setFollowings] = useState<Profile[]>([])
    const [followersEmpty, setFollowersEmpty] = useState(false)
    const [followingsEmpty, setFollowingsEmpty] = useState(false)

    useEffect(() => {
        async function getFollowInfo () {
            const followers = await solas.getFollowers(props.profile.id!)
            const followerings = await solas.getFollowings(props.profile.id!)
            setFollowers(followers)
            setFollowings(followerings)
            setFollowingsEmpty(!followerings.length)
            setFollowersEmpty(!followers.length)
        }

        getFollowInfo()
    },[])

    const toProfile = (domain: string) => {
        const username = domain.split('.')[0]
        router.push(`/profile/${username}`)
        props.handleClose()
    }

    return (<div className='address-list-dialog'>
       <div className='top-side'>
           <div className='list-header'>
               <div className='center'>
                   <PageBack onClose={ () => { props.handleClose() } } title={props.title || lang['IssueBadge_Address_List_Title']}/>
               </div>
           </div>
           <AppTabs styleOverrides={ overrides } initialState={ { activeKey: "follower" } }>
               <Tab key='follower' title={lang['Follow_detail_followed']}>
                   <div className='center scroll-box'>
                       { followersEmpty && <Empty text={'no data'} /> }
                       <AddressList selected={ [] } data= { followers }  onClick={(profile) => { toProfile(profile.domain!) }}/>
                   </div>
               </Tab>
               <Tab key='following' title={lang['Follow_detail_following']}>
                   <div className='center scroll-box'>
                       { followingsEmpty && <Empty text={'no data'} /> }
                       <AddressList selected={ [] } data= { followings } onClick={(profile) => { toProfile(profile.domain!) }} />
                   </div>
               </Tab>
           </AppTabs>
       </div>
    </div>)
}

export default DialogFollowInfo
