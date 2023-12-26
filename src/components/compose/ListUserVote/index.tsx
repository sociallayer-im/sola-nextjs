import React, {useContext, useEffect, useState} from 'react'
import { Profile,  queryVotes, isMember, Group} from '../../../service/solas'
import Empty from '../../base/Empty'
import LangContext from '../../provider/LangProvider/LangContext'
import UserContext from '../../provider/UserProvider/UserContext'
import useEvent, { EVENT } from '../../../hooks/globalEvent'
import ListUserAssets , {ListUserAssetsMethods} from "../../base/ListUserAssets/ListUserAssets";
import CardVote from "../../base/Cards/CardVote/CardVote";
import {useRouter} from "next/navigation";
import {Spinner} from "baseui/spinner";
import spinnerStyles from "@/components/compose/ListNftAsset/ListNftAsset.module.sass";

interface ListUserPresendProps {
    profile: Profile,
}

function ListUserVote (props: ListUserPresendProps) {
    const { lang } = useContext(LangContext)
    const { user } = useContext(UserContext)
    const listWrapperRef = React.createRef<ListUserAssetsMethods>()
    const [newVote, _] = useEvent(EVENT.VoteListUpdate)
    const router = useRouter()
    const [member, setMember] = useState(false)
    const [count, setCount] = useState(0)
    const [ready, setReady] = React.useState(false)

    const getVotes = async (page: number) => {
        const res = await queryVotes({group_id: props.profile.id, page,})
        setCount(res.length)
        setReady(true)
        return res
    }

    useEffect(() => {
        !!listWrapperRef.current && listWrapperRef.current!.refresh()
    }, [props.profile])

    useEffect(() => {
        if (newVote) {
          !!newVote && !!listWrapperRef.current && listWrapperRef.current!.refresh()
        }
    }, [newVote])

    useEffect(() => {
        if (user.id) {
            const checkIsMember = async () => {
                const res = await isMember({
                    group_id: props.profile.id,
                    profile_id: user.id!
                })
                setMember(res)
            }
            checkIsMember()
        } else {
            setMember(false)
        }
    }, [user.id])

    return <div className='vote-tab-list' style={{marginTop: '16px'}}>
        <div className={'title-member'} style={{marginBottom: '12px'}}>
            <div><b>{count}</b>{`${lang['Group_detail_tabs_Vote']}`}</div>
            { (member || (props.profile as Group).creator.id === user.id) &&
                <div className={'action'}>
                    <div className={'create-vote-btn'} onClick={e => {
                        router.push(`/create-vote?group=${props.profile.id}`)
                    }}>+ {lang['Vote_Create_Page_Title']}</div>
                </div>
            }
        </div>
        {!ready && <Spinner className={spinnerStyles.spinner} $color={'#98f6db'}/>}
        <ListUserAssets
            child={ (itemData, key) => <CardVote key={key} item={itemData} /> }
            queryFcn={ getVotes }
            onRef={ listWrapperRef }
        />
    </div>
}

export default ListUserVote
