import {useRouter, useParams} from "next/navigation";
import {useContext, useEffect, useState} from 'react'
import langContext from "@/components/provider/LangProvider/LangContext";
import useCopy from "@/hooks/copy";
import CardVote from "@/components/base/Cards/CardVote/CardVote";
import {cancelVote, getProfile, getVoteDetail, Profile, updateVote, Vote} from "@/service/solas";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import PageBack from "@/components/base/PageBack";
import AppButton from "@/components/base/AppButton/AppButton";
import MenuItem from "@/components/base/MenuItem";
import {PLACEMENT, StatefulPopover} from "baseui/popover";
import {Overflow} from "baseui/icon";
import userContext from "@/components/provider/UserProvider/UserContext";
import usePicture from "@/hooks/pictrue";

const overridesStyle = {
    Body: {
        style: {
            'z-index': 999,
            position: 'fixed',
            height: '24px'
        }
    },
    Inner: {
        style: {
            background: '#fff'
        }
    }
}


function VoteDetail() {
    const router = useRouter()
    const {lang} = useContext(langContext)
    const params = useParams()
    const {copy} = useCopy()
    const {showLoading, showToast, openConfirmDialog} = useContext(DialogsContext)
    const {defaultAvatar} = usePicture()
    const {user} = useContext(userContext)

    const [vote, setVote] = useState<Vote | null>(null)
    const [group, setGroup] = useState<Profile | null>(null)
    const [owner, setOwner] = useState<Profile | null>(null)
    const [isOwner, setIsOwner] = useState(false)

    const getVote = async () => {
        if (!params?.voteid) {
            return
        }

        const unload = showLoading()
        const vote = await getVoteDetail(Number(params?.voteid))
        if (!vote) {
            router.push('/error')
            return
        }

        const group = await getProfile({id: vote.group_id})
        const owner = await getProfile({id: vote.creator_id})
        setVote(vote)
        setGroup(group)
        setOwner(owner)
        unload()
    }

    useEffect(() => {
        getVote()
        if (typeof window !== 'undefined') {
            document.getElementById('PageContent')?.scrollTo(0, 0)
        }
    }, [params?.voteid])

    useEffect(() => {
        if (user.id && owner) {
            setIsOwner(user.id === owner.id)
        }
    }, [user.id, owner])

    const handleCancel = async () => {
        openConfirmDialog({
            title: lang['Vote_Delete_Vote_title'],
            content: lang['Vote_Delete_Vote_Des'],
            confirmLabel: lang['Vote_detail_Cancel'],
            cancelLabel: lang['Vote_Confirm_Dialog_Cancel'],
            confirmBtnColor: '#FF4D4F',
            confirmBtnHoverColor: '#FF4D4F',
            confirmTextColor: '#fff',
            onConfirm: async (close: any) => {
                close()
                const unloading = showLoading()
                try {
                    const res = await cancelVote({
                        auth_token: user.authToken || '',
                        id: Number(params?.voteid!)
                    })
                    unloading()
                    router.push(`/group/${group!.username}?tab=3`)
                    return
                } catch (e: any) {
                    unloading()
                    showToast(e.message)
                }
            }
        })
    }

    const MenuContent = () => <>
        <StatefulPopover
            overrides={overridesStyle}
            placement={PLACEMENT.bottomRight}
            content={({close}) => <>
                <MenuItem onClick={() => {
                    handleCancel()
                    close()
                }}>
                    {lang['Vote_detail_Cancel']}
                </MenuItem>
            </>}
            returnFocus
        >
            <Overflow style={{cursor: 'pointer', display: 'block'}} size={24}/>
        </StatefulPopover>
    </>


    return (<>
        <div className={'vote-detail-page'}>
            <div className={'center'}>
                <PageBack
                    title={lang['Vote_detail_Title']}
                    onClose={() => {
                        router.back()
                    }}
                    menu={() => {
                        return isOwner ? <MenuContent/>: <></>
                    }}
                />
                {
                    !!vote && <>
                        {!!owner &&
                            <div className={'host-info'}>{lang['Vote_detail_hoster']}
                                <div className={'hoster'}>
                                    <img src={owner?.image_url || defaultAvatar(owner?.id)} alt=""/>
                                    {owner.nickname || owner.username}
                                </div>
                            </div>
                        }
                        <CardVote item={vote}/>
                        <div className={'des'}>
                            {vote.content}
                        </div>
                    </>
                }

                <AppButton onClick={e => {
                    copy(window.location.href)
                    showToast(lang['Profile_Show_Copy'])
                }}>{lang['IssueFinish_Title']}</AppButton>
            </div>
        </div>
    </>)
}

export default VoteDetail
