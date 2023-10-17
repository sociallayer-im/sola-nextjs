import React, {useContext, useEffect, useRef} from 'react'
import ListUserAssets, {ListUserAssetsMethods} from "../../base/ListUserAssets/ListUserAssets";
import solas, {Profile} from "../../../service/solas";
import CardBadge from "../../base/Cards/CardBadge/CardBadge";
import UserContext from "../../provider/UserProvider/UserContext";
import CardBadgelet from "../../base/Cards/CardBadgelet/CardBadgelet";
import LangContext from "../../provider/LangProvider/LangContext";
import useEvent, {EVENT} from "../../../hooks/globalEvent";

interface ListUserRecognitionProps {
    profile: Profile
}

function ListUserRecognition(props: ListUserRecognitionProps) {
    const {user} = useContext(UserContext)
    const {lang} = useContext(LangContext)

    const getBadge = async (page: number) => {
        const queryProps = props.profile.is_group
            ? {group_id: props.profile.id, page}
            : {sender_id: props.profile.id, page}

        const publicBadge =  await solas.queryBadge(queryProps)
        const privateBadge =  await solas.queryPrivateBadge(queryProps)

        return [...publicBadge, ...privateBadge].sort((a, b) => {
            return b.id - a.id
        })
    }

    const getBadgelet = async (page: number) => {
        const publicBadgelet =  await solas.queryBadgelet({
            show_hidden: user.id === props.profile.id ? 1 : undefined,
            owner_id: props.profile.id,
            page
        })

        const privateBadgelet =  await solas.queryPrivacyBadgelet({
            show_hidden: user.id === props.profile.id ? 1 : undefined,
            owner_id: props.profile.id,
            page
        })

        return [...publicBadgelet, ...privateBadgelet].sort((a, b) => {
            return b.id - a.id
        })
    }

    const [needUpdate, _] = useEvent(EVENT.badgeletListUpdate)
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

export default ListUserRecognition
