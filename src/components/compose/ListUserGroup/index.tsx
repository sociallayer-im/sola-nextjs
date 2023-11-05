import React, {useContext, useEffect, useState} from 'react'
import CardGroup from '../../base/Cards/CardGroup/CardGroup'
import solas, { Profile, Group } from '../../../service/solas'
import LangContext from '../../provider/LangProvider/LangContext'
import UserContext from '../../provider/UserProvider/UserContext'
import ListTitle from '../../base/ListTitle/ListTitle'
import CardCreateGroup from '../../base/Cards/CardCreateGroup/CardCreateGroup'
import ListUserAssets, {ListUserAssetsMethods} from "../../base/ListUserAssets/ListUserAssets";

interface ListUserGroupProps {
    profile: Profile
}

function ListUserGroup (props: ListUserGroupProps) {
    const { lang } = useContext(LangContext)
    const { user } = useContext(UserContext)
    const listWrapperRef = React.createRef<ListUserAssetsMethods>()
    const [amount, setAmount] = useState(0)
    const getGroup = async (page: number) => {
        // 只有一页
        if (page > 1) return []

        const res = await solas.queryUserGroup({ profile_id: props.profile.id })
        setAmount(res.length)
        return res
    }

    useEffect(() => {
        !!listWrapperRef.current && listWrapperRef.current!.refresh()
    }, [props.profile, listWrapperRef.current])

    const isProfileOwner = user.id === props.profile.id

    return (
        <div className='list-user-group'>
            {/*<ListTitle*/}
            {/*    title={ lang['Profile_Tab_Groups'] }*/}
            {/*    uint={ lang['Profile_Tab_Groups'] }*/}
            {/*    count={ amount } />*/}
            <ListUserAssets
                previewCount={ 20 }
                child={(data, key) => <CardGroup profile={props.profile} group={data} key={key} />}
                queryFcn={ getGroup }
                preEnhancer={ isProfileOwner ? () => <CardCreateGroup /> : undefined }
                onRef={ listWrapperRef }
            />
        </div>
    )
}

export default ListUserGroup
