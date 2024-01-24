import {useContext, useEffect} from 'react'
import {Event} from '@/service/solas'
import styles from './EventTickets.module.scss'
import langContext from "@/components/provider/LangProvider/LangContext";
import AppButton from "@/components/base/AppButton/AppButton";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import DialogTicket from "@/components/base/Dialog/DialogTicket/DialogTicket";

function EventTickets(props: { event: Event }) {

    const {lang} = useContext(langContext)
    const {openDialog} = useContext(DialogsContext)

    const showTicketDialog = () => {
        openDialog({
            content: (close) => <DialogTicket close={close} />,
            size: [360, 'auto']
        })
    }

    useEffect(() => {

    }, [])

    return (<div className={styles['event-ticket-list']}>
        <div className={styles['event-ticket-title']}>{lang['Tickets']}</div>
        <div className={styles['list']}>
            <div className={`${styles['item']} ${styles['selected']}`}>
                <div className={styles['item-title']}>VIP Ticket</div>
                <div className={styles['item-des']}>VIP Ticket VIP Ticket VIP Ticket VIP Ticket VIP TicketVIP Ticket
                </div>
                <div className={styles['item-price']}>100 USDT</div>
            </div>
            <div className={styles['item']}>
                <div className={styles['item-title']}>VIP Ticket</div>
                <div className={styles['item-des']}>VIP Ticket VIP Ticket VIP Ticket VIP Ticket VIP TicketVIP Ticket
                </div>
                <div className={styles['item-price']}>100 USDT</div>
            </div>
            <div className={styles['item']}>
                <div className={styles['item-title']}>VIP Ticket</div>
                <div className={styles['item-des']}>VIP Ticket VIP Ticket VIP Ticket VIP Ticket VIP TicketVIP Ticket
                </div>
                <div className={styles['item-price']}>100 USDT</div>
            </div>

            <AppButton special onClick={showTicketDialog}>{lang['Get_A_Ticket']}</AppButton>
        </div>

    </div>)
}

export default EventTickets
