import { useStyletron} from 'baseui'
import { useContext, useEffect, useState } from 'react'
import ListTitle from '../../base/ListTitle/ListTitle'
import LangContext from '../../provider/LangProvider/LangContext'
import AppSubTabs from '../../base/AppSubTabs'
import {Tab} from 'baseui/tabs'
import {Profile} from '../../../service/solas'
import ListUserMinted from '../ListUserMinted'
import ListUserPresend from '../ListUserPresend'
import ListGroupInvite from '../ListGroupInvite'
import UserContext from '../../provider/UserProvider/UserContext'

interface ListUserCreatedProps {
    profile: Profile
    userType?: 'group' | 'user'
}

function ListUserCreated(props: ListUserCreatedProps) {
    const [css] = useStyletron()
    const [a, seta] = useState('')
    const { lang } = useContext(LangContext)
    const { user } = useContext(UserContext)

    useEffect(() => {

    }, [])

    // @ts-ignore
    // @ts-ignore
    return (<div className='list-user-created'>
        <ListTitle
            title={lang['Created_List_Title']}
            count={props.profile.badge_count}
            uint={lang['Badgelet_List_Unit']}/>
        {user.id === props.profile.id || user.id === props.profile.group_owner_id
            ? props.profile.is_group
                ? <AppSubTabs>
                    <Tab title={lang['Profile_Tab_Minted']} key='minted'>
                        <ListUserMinted userType={props.userType} profile={props.profile}/>
                    </Tab>
                    <Tab title={lang['Profile_Tab_Presend']} key='presend'>
                        <ListUserPresend profile={props.profile}/>
                    </Tab>
                    <Tab title={lang['Group_detail_tabs_Invite']} key='invite'>
                        <ListGroupInvite
                            group={props.profile}/>
                    </Tab>
                </AppSubTabs>
                : <AppSubTabs>
                    <Tab title={lang['Profile_Tab_Minted']} key='minted'>
                        <ListUserMinted userType={props.userType} profile={props.profile}/>
                    </Tab>
                    <Tab title={lang['Profile_Tab_Presend']} key='presend'>
                        <ListUserPresend profile={props.profile}/>
                    </Tab>
                </AppSubTabs>
            : <ListUserMinted userType={props.userType} profile={props.profile}/>
        }
    </div>)
}

export default ListUserCreated
