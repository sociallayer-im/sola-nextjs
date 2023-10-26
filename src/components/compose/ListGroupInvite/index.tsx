import React, {useContext, useEffect} from 'react'
import CardInvite from '../../base/Cards/CardInvite/CardInvite'
import solas, {Profile} from '../../../service/solas'
import ListUserAssets, {ListUserAssetsMethods} from "../../base/ListUserAssets/ListUserAssets";
import UserContext from "@/components/provider/UserProvider/UserContext";

interface ListUserBadgeletProps {
    group: Profile
}

function ListGroupInvite(props: ListUserBadgeletProps) {
    const listWrapperRef = React.createRef<ListUserAssetsMethods>()
    const {user} = useContext(UserContext)

    const getInvite = async (page: number) => {
        return await solas.queryGroupInvites({
            group_id: props.group.id,
            page,
            auth_token: user.authToken || ''
        })
    }

    useEffect(() => {
        !!listWrapperRef.current && listWrapperRef.current!.refresh()
    }, [props.group])

    return <div style={{marginTop: '16px'}}>
        <ListUserAssets
            queryFcn={getInvite}
            child={(item, key) => <CardInvite
                invite={item}
                key={key}
                groupCover={props.group.image_url || undefined}
                groupName={props.group.username || ''}
            />}
            onRef={listWrapperRef}
        />
    </div>
}

export default ListGroupInvite
