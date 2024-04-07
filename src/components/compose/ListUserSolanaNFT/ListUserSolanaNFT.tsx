import React, {useContext, useEffect, useState} from 'react'
import ListUserAssets, {ListUserAssetsMethods} from "../../base/ListUserAssets/ListUserAssets";
import {Profile} from "@/service/solas";
import UserContext from "../../provider/UserProvider/UserContext";
import LangContext from "../../provider/LangProvider/LangContext";
import {Spinner} from "baseui/spinner";
import spinnerStyles from "@/components/compose/ListNftAsset/ListNftAsset.module.sass";
import useMintSolanaBadge from "@/hooks/useMintSolanaBadge";
import CardSolanaBadge from "@/components/base/Cards/CardSolanaBadge/CardBadge";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";

interface ListUserRecognitionProps {
    profile: Profile
    onBadgeCount?: (total: number) => any
}

function ListUserRecognition(props: ListUserRecognitionProps) {
    const {user} = useContext(UserContext)
    const {lang} = useContext(LangContext)
    const {getUserBadgelet, ready: solanaReady} = useMintSolanaBadge()
    const {showLoading} = useContext(DialogsContext)

    const [ready, setReady] = useState(false)

    const getBadge = async (page: number) => {
        const res =  await getUserBadgelet(props.profile.sol_address!)
        setReady(true)
        return res
    }

    const listWrapperRefBadge = React.createRef<ListUserAssetsMethods>()
    useEffect(() => {
        !!listWrapperRefBadge.current && listWrapperRefBadge.current!.refresh()
    }, [props.profile])

    return (<div className={'list-user-recognition'}>
        <div className={'list-title'}>{lang['Badgelet_List_Title']}</div>
        {!ready && <Spinner className={spinnerStyles.spinner} $color={'#98f6db'}/>}
        <ListUserAssets
            previewCount={100}
            queryFcn={getBadge}
            onRef={listWrapperRefBadge}
            child={(item, key) => <CardSolanaBadge badge={item} key={key}/>}/>
    </div>)
}

export default ListUserRecognition
