import React, {useState, useContext, useEffect, useRef} from 'react'
import CardBadge from '../../base/Cards/CardBadge/CardBadge'
import solas, { Profile, Badge } from '../../../service/solas'
import LangContext from '../../provider/LangProvider/LangContext'
import HorizontalList, {HorizontalListMethods} from '../../base/HorizontalList/HorizontalList'

interface ListUserMintedProps {
    profile: Profile
    userType?: 'group' | 'user'
}

function ListUserMinted ({ userType = 'user',  ...props }: ListUserMintedProps) {
    const listWrapperRef = React.createRef<HorizontalListMethods>()

    const getBadge = async (page: number) => {
        const queryProps = userType === 'user'
            ? { sender_id: props.profile.id, page }
            : { group_id: props.profile.id, page }

        return await solas.queryBadge(queryProps)
    }


    useEffect(() => {
        !!listWrapperRef.current && listWrapperRef.current!.refresh()
    }, [props.profile])

    return (
        <HorizontalList
            item={ (itemData: Badge) => <CardBadge badge={ itemData } /> }
            space={ 12 }
            itemWidth={ 162 }
            itemHeight={ 184 }
            queryFunction={ getBadge }
            onRef={ listWrapperRef }
        />
    )
}

export default ListUserMinted
