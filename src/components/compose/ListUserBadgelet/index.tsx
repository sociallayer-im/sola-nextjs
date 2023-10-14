import React, { useContext, useEffect } from 'react'
import CardBadgelet from '../../base/Cards/CardBadgelet/CardBadgelet'
import solas, {Profile, Badgelet, queryPrivacyBadgelet} from '../../../service/solas'
import LangContext from '../../provider/LangProvider/LangContext'
import useEvent, { EVENT } from '../../../hooks/globalEvent'
import UserContext from '../../provider/UserProvider/UserContext'
import ListTitle from '../../base/ListTitle/ListTitle'
import HorizontalList, { HorizontalListMethods } from '../../base/HorizontalList/HorizontalList'

interface ListUserBadgeletProps {
    profile: Profile
}

function ListUserBadgelet (props: ListUserBadgeletProps) {
    const { lang } = useContext(LangContext)
    const { user } = useContext(UserContext)

    const listWrapperRef = React.createRef<HorizontalListMethods>()

    const getBadgelet = async (page: number) => {
        const publicBadgelets = await solas.queryBadgelet({
            show_hidden: user.id === props.profile.id ? 1: undefined,
            owner_id: props.profile.id,
            page })

        const privateBadgelets = await solas.queryPrivacyBadgelet({
            show_hidden: user.id === props.profile.id ? 1: undefined,
            owner_id: props.profile.id,
            page })

        return [...publicBadgelets, ...privateBadgelets].sort((a, b) => {
            return b.id - a.id
        })
    }
    const [needUpdate, _] = useEvent(EVENT.badgeletListUpdate)

    useEffect(() => {
        if (!needUpdate) return
        !!listWrapperRef.current && listWrapperRef.current!.refresh()
    }, [needUpdate])

    useEffect(() => {
        !!listWrapperRef.current && listWrapperRef.current!.refresh()
    }, [props.profile.id, listWrapperRef.current])

    return (
        <div className='list-user-badgelet'>
            <ListTitle
                title={lang['Badgelet_List_Title']}
                count={ 0 }
                uint={lang['Badgelet_List_Unit']} />
            <div className='list-user-badgelet-content'>
                <HorizontalList
                    item={ (itemData: Badgelet) => <CardBadgelet badgelet={ itemData } /> }
                    space={ 12 }
                    itemWidth={ 162 }
                    itemHeight={ 184 }
                    queryFunction={ getBadgelet }
                    onRef={ listWrapperRef }
                    sortFunction={(list) => {
                        list.sort((a, b) => {
                            return b.top ? 1 : -1
                        })
                        return list
                    }}
                />
            </div>
        </div>
    )
}

export default ListUserBadgelet
