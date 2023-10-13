import React, {useContext, useEffect} from 'react'
import CardInvite from '../../base/Cards/CardInvite/CardInvite'
import solas, {Profile} from '../../../service/solas'
import LangContext from '../../provider/LangProvider/LangContext'
import ListUserAssets, {ListUserAssetsMethods} from "../../base/ListUserAssets/ListUserAssets";

interface ListUserBadgeletProps {
    group: Profile
}

function ListGroupInvite(props: ListUserBadgeletProps) {
    const {lang} = useContext(LangContext)
    const listWrapperRef = React.createRef<ListUserAssetsMethods>()

    const getInvite = async (page: number) => {
        return await solas.queryGroupInvites({
            group_id: props.group.id,
            page
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
