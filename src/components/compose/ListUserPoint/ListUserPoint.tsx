import React, {useContext, useEffect, useRef} from 'react'
import ListUserAssets, {ListUserAssetsMethods} from "../../base/ListUserAssets/ListUserAssets";
import {PointItem, Profile, queryPoint, queryPointItems} from "../../../service/solas";
import UserContext from "../../provider/UserProvider/UserContext";
import CardPoint from "../../base/Cards/CardPoint/CardPoint";
import CardPointItem from "../../base/Cards/CardPointItem/CardPointItem";
import LangContext from "../../provider/LangProvider/LangContext";
import useEvent, {EVENT} from "../../../hooks/globalEvent";

interface ListUserPointProps {
    profile: Profile
}

function ListUserPoint(props: ListUserPointProps) {
    const {user} = useContext(UserContext)
    const {lang} = useContext(LangContext)
    const [newItem, _] = useEvent(EVENT.pointItemUpdate)
    const pointItem = useRef<PointItem[]>([])

    const getPoint = async (page: number) => {
        if (page > 1) return []
        const queryProps = props.profile.is_group
            ? {group_id: props.profile.id}
            : {sender_id: props.profile.id}

        return await queryPoint(queryProps)
    }

    const getPointItems = async (page: number) => {
        if (page > 1) return []
        const res = await queryPointItems({
            owner_id: props.profile.id,
        })

        let list: PointItem[] = []
        let idList: Number[] = []

        if (!res.length) return []

        // 合并相同Point的积分
        res.map(item => {
            if (item.status === 'sending') {
                list.push(item)
            } else if (!idList.includes(item.point.id)) {
                list.push(item)
                idList.push(item.point.id)
            } else {
                const pre = list.find(_item => {
                    return item.point.id === _item.point.id && _item.status !== 'sending'
                })
                if (pre) {
                    pre.value = pre.value + item.value
                    pre.created_at = item.created_at
                }
            }
        })

        return list
    }

    const listWrapperRefBadge = React.createRef<ListUserAssetsMethods>()
    const listWrapperRefBadgeLet = React.createRef<ListUserAssetsMethods>()

    useEffect(() => {
        !!listWrapperRefBadge.current && listWrapperRefBadge.current!.refresh()
        !!listWrapperRefBadgeLet.current && listWrapperRefBadgeLet.current!.refresh()
    }, [props.profile, newItem])

    return (<div className={'list-user-point'}>
        <div className={'list-title'}>{lang['Badgelet_List_Title']}</div>
        <ListUserAssets
            queryFcn={getPointItems}
            onRef={listWrapperRefBadgeLet}
            child={(item, key) => <CardPointItem pointitem={item} key={key}/>}/>

        <div className={'list-title margin'}>{lang['Created_List_Title']}</div>
        <ListUserAssets
            queryFcn={getPoint}
            onRef={listWrapperRefBadge}
            child={(item, key) => <CardPoint point={item} key={key}/>}/>
    </div>)
}

export default ListUserPoint
