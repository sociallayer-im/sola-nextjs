import React, {useContext, useEffect} from 'react'
import CardPresend from '../../base/Cards/CardPresend/CardPresend'
import solas, { Profile } from '../../../service/solas'
import ListWrapper from '../../base/ListWrapper'
import Empty from '../../base/Empty'
import LangContext from '../../provider/LangProvider/LangContext'
import UserContext from '../../provider/UserProvider/UserContext'
import useEvent, { EVENT } from '../../../hooks/globalEvent'
import ListUserAssets , {ListUserAssetsMethods} from "../../base/ListUserAssets/ListUserAssets";

interface ListUserPresendProps {
    profile: Profile,
    userType?: 'group' | 'user'
}

function ListUserPresend ({ userType = 'user',  ...props }: ListUserPresendProps) {
    const { lang } = useContext(LangContext)
    const { user } = useContext(UserContext)
    const listWrapperRef = React.createRef<ListUserAssetsMethods>()
    const [newPresend, _] = useEvent(EVENT.presendListUpdate)

    const getPresend = async (page: number) => {
        const queryProps = props.profile.is_group
            ? { group_id: props.profile.id, page, auth_token: user.authToken || undefined }
            : { sender_id: props.profile.id, page, auth_token: user.authToken || undefined }

        return await solas.queryPresend(queryProps)
    }

    useEffect(() => {
        !!listWrapperRef.current && listWrapperRef.current!.refresh()
    }, [props.profile])

    useEffect(() => {
        if (newPresend) {
          !!newPresend && !!listWrapperRef.current && listWrapperRef.current!.refresh()
        }
    }, [newPresend])

    return <div style={{marginTop: '16px'}}>
        <ListUserAssets
            child={ (itemData, key) => <CardPresend presend={ itemData } key={key} /> }
            queryFcn={ getPresend }
            onRef={ listWrapperRef }
        />
    </div>
}

export default ListUserPresend
