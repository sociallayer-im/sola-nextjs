import React, {useContext, useEffect, useRef, useState} from 'react'
import ListUserAssets, {ListUserAssetsMethods} from "../../base/ListUserAssets/ListUserAssets";
import solas, {Profile, Group} from "../../../service/solas";
import CardBadge from "../../base/Cards/CardBadge/CardBadge";
import UserContext from "../../provider/UserProvider/UserContext";
import CardBadgelet from "../../base/Cards/CardBadgelet/CardBadgelet";
import LangContext from "../../provider/LangProvider/LangContext";
import useEvent, {EVENT} from "../../../hooks/globalEvent";
import AppButton from "@/components/base/AppButton/AppButton";
import {Spinner} from "baseui/spinner";
import spinnerStyles from "@/components/compose/ListNftAsset/ListNftAsset.module.sass";

interface ListUserRecognitionProps {
    profile: Profile
    onBadgeCount?: (total: number) => any
}

function ListUserRecognition(props: ListUserRecognitionProps) {
    const {user} = useContext(UserContext)
    const {lang} = useContext(LangContext)

    const [noBadge, setNoBadge] = useState(true)
    const [badgeCount, setBadgeCount] = useState(0)
    const [ready, setReady] = useState(false)

    const getBadge = async (page: number) => {
        const queryProps = !!(props.profile as Group).creator
            ? {group_id: props.profile.id, page}
            : {sender_id: props.profile.id, page}

        const res = await solas.queryBadge(queryProps)
        setBadgeCount(res.total)
        setReady(true)
        props.onBadgeCount && props.onBadgeCount(res.total)
        return res.data
    }

    const getBadgelet = async (page: number) => {
        const publicBadgelet = await solas.queryBadgelet({owner_id: props.profile.id, page})
        setReady(true)
        return publicBadgelet
    }

    const [needUpdate, _] = useEvent(EVENT.badgeletListUpdate)
    const listWrapperRefBadge = React.createRef<ListUserAssetsMethods>()
    const listWrapperRefBadgeLet = React.createRef<ListUserAssetsMethods>()

    useEffect(() => {
        !!listWrapperRefBadge.current && listWrapperRefBadge.current!.refresh()
        !!listWrapperRefBadgeLet.current && listWrapperRefBadgeLet.current!.refresh()
    }, [props.profile, needUpdate])

    return (<div className={'list-user-recognition'}>
        {!ready && <Spinner className={spinnerStyles.spinner} $color={'#98f6db'}/>}
        { !(props.profile as Group).creator &&
            <>
                <div className={'list-title'}>{lang['Badgelet_List_Title']}</div>
                <ListUserAssets
                    previewCount={9}
                    queryFcn={getBadgelet}
                    onRef={listWrapperRefBadgeLet}
                    child={(item, key) => <CardBadgelet badgelet={item} key={key}/>}/>

            </>
        }
        <div className={`${noBadge && !(props.profile as Group).creator ? 'hide-item' : ''}`}>
            { !(props.profile as Group).creator &&
                <div className={`list-title margin}`}>{lang['Created_List_Title']}</div>
            }
            <ListUserAssets
                previewCount={ (props.profile as Group).creator ? 8 : 9 }
                queryFcn={getBadge}
                onListChange={(list: any) => {
                    setNoBadge(!list.length)
                }}
                onRef={listWrapperRefBadge}
                child={(item, key) => <CardBadge badge={item} key={key}/>}/>
        </div>
    </div>)
}

export default ListUserRecognition
