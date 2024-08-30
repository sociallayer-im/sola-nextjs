import {Group, queryTicketItems, TicketItem} from "@/service/solas";
import styles from './GroupTicketsPurchased.module.scss'
import React, {useState, useContext, useEffect} from "react";
import userContext from "@/components/provider/UserProvider/UserContext";
import usePicture from "@/hooks/pictrue";
import Link from "next/link";

export default function GroupTicketsPurchased(props: {eventGroup?: Group}) {
    const {user} = useContext(userContext)
    const {defaultAvatar} = usePicture()

    const [ticketItems, setTicketItems] = useState<TicketItem[]>([])

    useEffect(() => {
        if (!user || !props.eventGroup || !user.id) {
            setTicketItems([])
            return
        }

        queryTicketItems({
            profile_id: user.id,
        }) .then(res => {
            const currGroupTicket = res.filter(ti => {
                return ti.event.group_id === props.eventGroup?.id && ti.status === 'succeeded'
            })
            setTicketItems(currGroupTicket)
        })
    }, [props.eventGroup, user]);

    return (<div className={styles['ticket-purchased']}>
        {
            ( !!user && !!props.eventGroup && !!ticketItems.length) ?
                <div className={styles['ticket-info']}>
                    <div className={styles['title']}>
                        <div className={styles['left']}>
                            <img src={props.eventGroup.image_url || defaultAvatar(props.eventGroup.id)} width={24}
                                 height={24}
                                 alt=""/>
                            {'My tickets'} {ticketItems.length ? `(${ticketItems.length})` : ''}
                        </div>

                        <div className={styles['right']}>
                            <img src={user.avatar || defaultAvatar(user.id)}
                                 width={16} height={16} alt=""/>
                            {user.nickname || user.userName}
                        </div>
                    </div>

                    <div  className={styles['scroll']}>
                        {
                            ticketItems.map((ticketItem, index) => {
                                return <Link href={`/event/detail/${ticketItem.event_id}`} className={styles['tickets']} key={index}>
                                    <div className={styles['name']}>{ticketItem.ticket.title}</div>
                                </Link>
                            })
                        }
                    </div>
                </div> : null
        }
    </div>)
}
