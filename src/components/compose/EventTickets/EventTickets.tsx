import {useContext, useEffect, useState} from 'react'
import {Badge, Event, queryBadgeDetail, Ticket} from '@/service/solas'
import styles from './EventTickets.module.scss'
import langContext from "@/components/provider/LangProvider/LangContext";
import AppButton from "@/components/base/AppButton/AppButton";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import DialogTicket from "@/components/base/Dialog/DialogTicket/DialogTicket";
import ImgLazy from "@/components/base/ImgLazy/ImgLazy";

function TicketItem({ticket, selected}: { ticket: Ticket, selected?: boolean }) {
    const [badge, setBadge] = useState<Badge | null>(null)

    useEffect(() => {
        if (ticket.check_badge_id) {
            queryBadgeDetail({id: ticket.check_badge_id}).then((res) => {
                res && setBadge(res)
            })
        }
    }, [ticket])


    return <div className={`${styles['item']} ${selected ? styles['selected'] : ''}`} key={ticket.id}>
        <div className={styles['item-title']}>{ticket.title}</div>
        <div className={styles['item-des']}>{ticket.content}</div>

        {
            ticket.check_badge_id !== null && badge &&
            <div className={styles['item-badge']}>
                <div className={styles['title']}>Need to have badge</div>
                <div className={styles['info']}>
                    <ImgLazy src={badge.image_url} width={100} height={100} alt=""/>
                    <span>{badge.title}</span>
                </div>
            </div>
        }

        {
            ticket.payment_token_price !== null &&
            <div
                className={styles['item-price']}>{ticket.payment_token_price} {ticket.payment_token_name?.toUpperCase()}</div>
        }

        {
            ticket.check_badge_id === null && ticket.payment_token_price === null &&
            <div className={styles['item-price']}>{'Free'}</div>
        }
    </div>
}

function EventTickets(props: { event: Event, tickets: Ticket[] }) {

    const {lang} = useContext(langContext)
    const {openDialog} = useContext(DialogsContext)
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(props.tickets[0] || null)


    const showTicketDialog = (ticket: Ticket) => {
        openDialog({
            content: (close) => <DialogTicket
                ticket={ticket}
                event={props.event}
                close={close}/>,
            size: [360, 'auto']
        })
    }

    return (<div className={styles['event-ticket-list']}>
        <div className={styles['event-ticket-title']}>{lang['Tickets']}</div>
        <div className={styles['list']}>
            {
                props.tickets.map((item, index) => {
                    return <div key={item.id} onClick={() => {
                        setSelectedTicket(item)
                    }}>
                        <TicketItem
                            selected={selectedTicket?.id === item.id}
                            ticket={item} />
                    </div>
                })
            }
            <AppButton special onClick={() => {
                selectedTicket && showTicketDialog(selectedTicket)
            }}>{lang['Get_A_Ticket']}</AppButton>
        </div>

    </div>)
}

export default EventTickets
