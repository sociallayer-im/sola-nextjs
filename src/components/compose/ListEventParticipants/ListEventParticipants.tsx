import {useContext, useEffect, useState} from 'react'
import {Participants, unJoinEvent, eventCheckIn, Ticket} from "@/service/solas";
import usePicture from "../../../hooks/pictrue";
import LangContext from "../../provider/LangProvider/LangContext";
import UserContext from "../../provider/UserProvider/UserContext";
import DialogsContext from "../../provider/DialogProvider/DialogsContext";
import styles from './ListEventParticipants.module.scss'
import Link from "next/link";

interface ListCheckinUserProps {
    participants: Participants[],
    onChange?: (selected: Participants[]) => void
    isHost?: boolean
    eventId: number
    onChecked?: (participants: Participants) => any
    showDownload?: boolean
    tickets?: Ticket[]
}

function ListEventParticipants(props: ListCheckinUserProps) {
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
            props.onChecked && props.onChecked(item)
            unload()
        } catch (e: any) {
            unload()
            console.error(e)
            showToast(e.message || 'Checkin failed')
        }
    }

    const goToProfile = (username: string) => {
        if (username) {
            window.location.href = `/profile/${username}`
        }
    }

    const handleUnJoin = async () => {
        const a = await openConfirmDialog({
            title: lang['Activity_Unjoin_Confirm_title'],
            confirmBtnColor: '#F64F4F',
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

    const downloadCSV = () => {
        const title = ['Username', 'Nickname', 'Status']
        const rows = participants.map((item, index) => {
            return [item.profile.username, item.profile.nickname || '' ,item.status]
        })

        const csvContent = "data:text/csv;charset=utf-8,"
            + title.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);

        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "participants.csv");
        document.body.appendChild(link); // Required for FF
        link.click();
        link.remove();
    }

    const shortAddress = (address: string) => {
        return address.substr(0, 6) + '...' + address.substr(-4)
    }

    return (<div className={styles['checkin-user-list']}>
        { props.showDownload &&
            <div className={styles['dl-btn']} onClick={downloadCSV}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M14 9.3335C13.8232 9.3335 13.6536 9.40373 13.5286 9.52876C13.4035 9.65378 13.3333 9.82335 13.3333 10.0002V12.6668C13.3333 12.8436 13.2631 13.0132 13.1381 13.1382C13.013 13.2633 12.8435 13.3335 12.6666 13.3335H3.33331C3.1565 13.3335 2.98693 13.2633 2.86191 13.1382C2.73688 13.0132 2.66665 12.8436 2.66665 12.6668V10.0002C2.66665 9.82335 2.59641 9.65378 2.47138 9.52876C2.34636 9.40373 2.17679 9.3335 1.99998 9.3335C1.82317 9.3335 1.6536 9.40373 1.52858 9.52876C1.40355 9.65378 1.33331 9.82335 1.33331 10.0002V12.6668C1.33331 13.1973 1.54403 13.706 1.9191 14.081C2.29417 14.4561 2.80288 14.6668 3.33331 14.6668H12.6666C13.1971 14.6668 13.7058 14.4561 14.0809 14.081C14.4559 13.706 14.6666 13.1973 14.6666 12.6668V10.0002C14.6666 9.82335 14.5964 9.65378 14.4714 9.52876C14.3464 9.40373 14.1768 9.3335 14 9.3335ZM7.52665 10.4735C7.59005 10.5342 7.66481 10.5818 7.74665 10.6135C7.82645 10.6488 7.91273 10.667 7.99998 10.667C8.08723 10.667 8.17351 10.6488 8.25331 10.6135C8.33515 10.5818 8.40991 10.5342 8.47331 10.4735L11.14 7.80683C11.2655 7.68129 11.336 7.51103 11.336 7.3335C11.336 7.15596 11.2655 6.9857 11.14 6.86016C11.0144 6.73463 10.8442 6.6641 10.6666 6.6641C10.4891 6.6641 10.3188 6.73463 10.1933 6.86016L8.66665 8.3935V2.00016C8.66665 1.82335 8.59641 1.65378 8.47138 1.52876C8.34636 1.40373 8.17679 1.3335 7.99998 1.3335C7.82317 1.3335 7.6536 1.40373 7.52857 1.52876C7.40355 1.65378 7.33331 1.82335 7.33331 2.00016V8.3935L5.80665 6.86016C5.74449 6.798 5.67069 6.7487 5.58948 6.71506C5.50826 6.68142 5.42122 6.6641 5.33331 6.6641C5.24541 6.6641 5.15836 6.68142 5.07715 6.71506C4.99593 6.7487 4.92214 6.798 4.85998 6.86016C4.79782 6.92232 4.74851 6.99611 4.71487 7.07733C4.68123 7.15854 4.66392 7.24559 4.66392 7.3335C4.66392 7.4214 4.68123 7.50845 4.71487 7.58966C4.74851 7.67088 4.79782 7.74467 4.85998 7.80683L7.52665 10.4735Z" fill="#7492EF"/>
                </svg>
                <span>{lang['Download_the_list_of_all_participants']}</span>
            </div>
        }

        {
            participants.map((item, index) => {
                const checked = item.status === 'checked'
                const ticket = (props.tickets || []).find(ticket => ticket.id === item.ticket_id)

                return <div className={styles['user-list-item']} key={index}>
                    <Link href={item.profile.username ? `/profile/${item.profile.username}` : ''} className={styles['left']}
                         onClick={e => {goToProfile(item.profile.username!)}}>
                        <img src={item.profile.image_url || defaultAvatar(item.profile.id)} alt=""/>
                        <div>
                            <div>{item.profile.nickname || item.profile.username || `user #${item.profile.id}`}</div>
                            <div className={styles['address']}>{item.profile.address ? shortAddress(item.profile.address) :  ''}</div>
                        </div>
                    </Link>
                    <div className={styles['right']}>
                        {!!ticket  &&
                            <div className={styles['ticket']}>{ticket.title}</div>
                        }

                        {
                            user.id === item.profile.id && item.status !== 'cancel' &&
                            <div className={styles['unjoin']} onClick={handleUnJoin}>{lang['Activity_Detail_Btn_unjoin']}</div>
                        }

                        {props.isHost && !checked &&
                            <div onClick={() => {
                                handleCheckin(item)
                            }}
                                 className={styles['checkin-by-host']}>
                                {lang['Activity_Detail_Btn_Checkin']}
                            </div>
                        }

                        {checked && <div className={styles['checked-status']}>Checked</div>}

                    </div>
                </div>
            })
        }
    </div>)
}

export default ListEventParticipants
