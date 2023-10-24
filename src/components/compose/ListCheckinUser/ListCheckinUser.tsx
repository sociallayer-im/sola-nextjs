import {useContext, useEffect, useState} from 'react'
import {Participants, unJoinEvent, eventCheckIn} from "@/service/solas";
import usePicture from "../../../hooks/pictrue";
import LangContext from "../../provider/LangProvider/LangContext";
import UserContext from "../../provider/UserProvider/UserContext";
import DialogsContext from "../../provider/DialogProvider/DialogsContext";

interface ListCheckinUserProps {
    participants: Participants[],
    onChange?: (selected: Participants[]) => void
    isHost?: boolean
    eventId: number
    editable?: boolean
}

function ListCheckinUser({editable=true, ...props}: ListCheckinUserProps) {
    const {defaultAvatar} = usePicture()
    const {lang} = useContext(LangContext)
    const [participants, setParticipants] = useState<Participants[]>(
        props.participants
    )

    const {user} = useContext(UserContext)
    const {showLoading, showToast, openConfirmDialog} = useContext(DialogsContext)

    useEffect(() => {

    }, [])

    const handleCheckin = async (item: Participants) => {
        if (!user.id) return
        if (item.check_time) return
        const unload = showLoading()
        try {
            const checkin = await eventCheckIn({
                id: props.eventId,
                auth_token: user.authToken || '',
                profile_id: item.profile.id
            })
            const newParticipants = participants.map(participant => {
                if (participant.profile.id === item.profile.id) {
                    participant.status = 'checked'
                }
                return participant
            })
            setParticipants(newParticipants)
            unload()
        } catch (e: any) {
            unload()
            console.error(e)
            showToast(e.message || 'Checkin failed')
        }
    }

    const goToProfile = (username: string) => {
        window.location.href = `/profile/${username}`
    }

    const handleUnJoin = async () => {
        const a = await openConfirmDialog({
            title: lang['Activity_Unjoin_Confirm_title'],
            confirmBtnColor: '#F64F4F!important',
            confirmTextColor: '#fff',
            confirmText: lang['Group_Member_Manage_Dialog_Confirm_Dialog_Confirm'],
            cancelText: lang['Group_Member_Manage_Dialog_Confirm_Dialog_Cancel'],
            onConfirm: async (close: any) => {
                const unload = showLoading()
                try {
                    const join = await unJoinEvent({id: Number(props.eventId), auth_token: user.authToken || ''})
                    unload()
                    showToast('Canceled')
                    setParticipants(participants.filter(item => item.profile.id !== user.id))
                    !!props.onChange && props.onChange(participants.filter(item => item.profile.id !== user.id))
                    close()
                } catch (e: any) {
                    console.error(e)
                    unload()
                    showToast(e.message)
                }
            }
        })
    }

    return (<div className={'checkin-user-list'}>
        {
            participants.map((item, index) => {
                const checked = item.status === 'checked' || !editable
                return <div className={!checked ? 'user-list-item uncheck' : 'user-list-item'} key={index}>
                    <div className={'left'}
                         onClick={e => {goToProfile(item.profile.domain?.split('.')[0]!)}}>
                        <img src={item.profile.image_url || defaultAvatar(item.profile.id)} alt=""/>
                        {item.profile.domain?.split('.')[0]}
                    </div>
                    <div className={'right'}>
                        {props.isHost && !checked &&
                            <div onClick={() => {
                                handleCheckin(item)
                            }}
                                 className={'checkin-by-host'}>
                                {lang['Activity_Detail_Btn_Checkin']}
                            </div>
                        }

                        {
                            user.id === item.profile.id && item.status !== 'cancel' && !editable &&
                            <div className={'unjoin'} onClick={handleUnJoin}>{lang['Activity_Detail_Btn_unjoin']}</div>
                        }
                    </div>
                </div>
            })
        }
    </div>)
}

export default ListCheckinUser
