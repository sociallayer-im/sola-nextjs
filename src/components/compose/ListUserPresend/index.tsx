import React, {useContext, useEffect} from 'react'
import CardPresend from '../../base/Cards/CardPresend/CardPresend'
import { Profile, Group, queryPresend } from '../../../service/solas'
import ListWrapper from '../../base/ListWrapper'
import Empty from '../../base/Empty'
import LangContext from '../../provider/LangProvider/LangContext'
import UserContext from '../../provider/UserProvider/UserContext'
import useEvent, { EVENT } from '../../../hooks/globalEvent'
import ListUserAssets , {ListUserAssetsMethods} from "../../base/ListUserAssets/ListUserAssets";
import {Spinner} from "baseui/spinner";
import spinnerStyles from "@/components/compose/ListNftAsset/ListNftAsset.module.sass";

interface ListUserPresendProps {
    profile: Profile,
    userType?: 'group' | 'user'
}

function ListUserPresend ({ userType = 'user',  ...props }: ListUserPresendProps) {
    const { lang } = useContext(LangContext)
    const { user } = useContext(UserContext)
    const listWrapperRef = React.createRef<ListUserAssetsMethods>()
    const [newPresend, _] = useEvent(EVENT.presendListUpdate)
    const [ready, setReady] = React.useState(false)

    const getPresend = async (page: number) => {
        const queryProps = !!(props.profile as Group).creator
            ? { group_id: props.profile.id, page}
            : { sender_id: props.profile.id, page}

        const res = await queryPresend(queryProps)
        setReady(true)

        return res
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
        {!ready && <Spinner className={spinnerStyles.spinner} $color={'#98f6db'}/>}
        <ListUserAssets
            child={ (itemData, key) => <CardPresend presend={ itemData } key={key} /> }
            queryFcn={ getPresend }
            onRef={ listWrapperRef }
        />
    </div>
}

export default ListUserPresend
