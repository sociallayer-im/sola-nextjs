import React, {useContext, useEffect} from 'react'
import ListUserAssets, {ListUserAssetsMethods} from "../../base/ListUserAssets/ListUserAssets";
import solas, {Profile, QueryBadgeProps} from "../../../service/solas";
import CardBadge from "../../base/Cards/CardBadge/CardBadge";
import UserContext from "../../provider/UserProvider/UserContext";
import CardBadgelet from "../../base/Cards/CardBadgelet/CardBadgelet";
import LangContext from "../../provider/LangProvider/LangContext";
import useEvent, {EVENT} from "../../../hooks/globalEvent";

interface ListUserRecognitionProps {
    profile: Profile
}

function ListUserGift(props: ListUserRecognitionProps) {
    const {user} = useContext(UserContext)
    const {lang} = useContext(LangContext)

    const getBadge = async (page: number) => {
        const queryProps: QueryBadgeProps = props.profile.is_group
            ? {group_id: props.profile.id, badge_type: 'gift', page}
            : {sender_id: props.profile.id, badge_type: 'gift', page}

        return await solas.queryBadge(queryProps)
    }

    const getBadgelet = async (page: number) => {
        return await solas.queryBadgelet({
            show_hidden: user.id === props.profile.id ? 1 : undefined,
            owner_id: props.profile.id,
            badge_type: 'gift',
            page
        })
    }

    const [needUpdate, _] = useEvent(EVENT.giftItemUpdate)

    const listWrapperRefBadge = React.createRef<ListUserAssetsMethods>()
    const listWrapperRefBadgeLet = React.createRef<ListUserAssetsMethods>()

    useEffect(() => {
        !!listWrapperRefBadge.current && listWrapperRefBadge.current!.refresh()
        !!listWrapperRefBadgeLet.current && listWrapperRefBadgeLet.current!.refresh()
    }, [props.profile, needUpdate])

    return (<div className={'list-user-recognition'}>
        <div className={'list-title'}>{lang['Badgelet_List_Title']}</div>
        <ListUserAssets
            queryFcn={getBadgelet}
            onRef={listWrapperRefBadgeLet}
            child={(item, key) => <CardBadgelet badgelet={item} key={key}/>}/>

        <div className={'list-title margin'}>{lang['Created_List_Title']}</div>
        <ListUserAssets
            queryFcn={getBadge}
            onRef={listWrapperRefBadge}
            child={(item, key) => <CardBadge badge={item} key={key}/>}/>
    </div>)
}

export default ListUserGift
