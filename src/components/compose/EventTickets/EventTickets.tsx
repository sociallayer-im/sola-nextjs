import {useContext, useEffect, useMemo, useState} from 'react'
import {Badge, Event, getParticipantDetail, Participants, queryBadgeDetail, Ticket} from '@/service/solas'
import styles from './EventTickets.module.scss'
import langContext from "@/components/provider/LangProvider/LangContext";
import AppButton from "@/components/base/AppButton/AppButton";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import DialogTicket from "@/components/base/Dialog/DialogTicket/DialogTicket";
import ImgLazy from "@/components/base/ImgLazy/ImgLazy";
import userContext from "@/components/provider/UserProvider/UserContext";
import useEvent, {EVENT} from "@/hooks/globalEvent";
import {formatUnits} from "viem/utils";
import {paymentTokenList} from "@/payment_settring";

function TicketItem({
                        ticket,
                        selected,
                        disable,
                        waitForPayment
                    }: { ticket: Ticket, selected?: boolean, disable?: boolean, waitForPayment?: boolean }) {


    const [badge, setBadge] = useState<Badge | null>(null)

    const chain = useMemo(() => {
        return ticket.payment_metadata.length && ticket.payment_metadata[0].payment_chain ? paymentTokenList.find(item => item.id === ticket.payment_metadata[0].payment_chain) : undefined
    }, [ticket])

    const token = useMemo(() => {
        if (!chain) return undefined
        return chain?.tokenList.find(item => item.id === ticket.payment_metadata[0].payment_token_name)
    }, [chain, ticket])

    const chainsIcons = useMemo(() => {
        const chains = ticket.payment_metadata.map(item => item.payment_chain)
        return chains.map(chain => paymentTokenList.find(item => item.id === chain)?.icon).reverse()
    }, [ticket])

    useEffect(() => {
        if (ticket.check_badge_class_id) {
            queryBadgeDetail({id: ticket.check_badge_class_id}).then((res) => {
                res && setBadge(res)
            })
        }
    }, [ticket])


    return <div
        className={`${styles['item']} ${selected ? styles['selected'] : ''} ${disable ? styles['disable'] : ''}`}
        key={ticket.id}>
        <div className={styles['item-title']}>{ticket.title}</div>
        <div className={styles['item-des']}>{ticket.content}</div>

        {
            ticket.check_badge_class_id !== null && badge &&
            <div className={styles['item-badge']}>
                <div className={styles['title']}>Need to have badge</div>
                <div className={styles['info']}>
                    <ImgLazy src={badge.image_url} width={100} height={100} alt=""/>
                    <span>{badge.title}</span>
                </div>
            </div>
        }

        {
            ticket.payment_metadata?.length !== 0 &&
            <div className={styles['price-info']}>
                <div
                    className={styles['item-price']}>{formatUnits(BigInt(ticket.payment_metadata[0].payment_token_price || 0), token?.decimals!)} {ticket.payment_metadata[0].payment_token_name?.toUpperCase()}</div>
                <div className={styles['chain-icons']}>
                    {
                        chainsIcons.map((icon, index) => {
                            return <img key={index} src={icon} alt="" width={20} height={20}/>
                        })
                    }
                </div>
            </div>
        }

        {
            ticket.payment_metadata?.length === 0 &&
            <div className={styles['item-price']}>{'Free'}</div>
        }

        {
            waitForPayment &&
            <div className={styles['item-waiting-payment']}>{'Waiting for payment'}</div>
        }
    </div>
}

function EventTickets({
                          canAccess = true,
                          ...props
                      }: { event: Event, tickets: Ticket[], canAccess?: boolean, isDialog?: boolean }) {

    const {lang} = useContext(langContext)
    const {openDialog, showToast} = useContext(DialogsContext)
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(props.tickets[0] || null)
    const {user} = useContext(userContext)
    const [userPendingPayment, setUserPendingPayment] = useState<Participants | null>(null)
    const [userHasPaid, setUserHasPaid] = useState<Participants | null>(null)
    const [needUpdate, _] = useEvent(EVENT.participantUpdate)


    useEffect(() => {
        if (user.userName || needUpdate) {
            getParticipantDetail({event_id: props.event.id, profile_id: user.id!}).then((res) => {
                if (!!res) {
                    const ticket = props.tickets.find(item => item.id === res.ticket_id)

                    if (!!ticket && res.payment_status === 'success') {
                        setUserPendingPayment(null)
                        setUserHasPaid(res)
                    } else if (!!ticket && res.payment_status !== 'success' && !!res.payment_data) {
                        setUserHasPaid(null)
                        setUserPendingPayment(res)
                    } else {
                        setUserHasPaid(null)
                        setUserPendingPayment(null)
                    }
                } else {
                    setUserHasPaid(null)
                    setUserPendingPayment(null)
                }
            })
        }
    }, [user.id, needUpdate])


    const showTicketDialog = (ticket: Ticket) => {
        openDialog({
            content: (close: any) => <DialogTicket
                ticket={ticket}
                event={props.event}
                close={close}/>,
            size: [400, 'auto'],
            position: 'bottom',
            closeable: false,
            shellClose: false
        })
    }

    return (<div className={styles['event-ticket-list']}>
        <div className={styles['event-ticket-title']}>{lang['Tickets']}</div>
        <div className={`${styles['list']} ${props.isDialog ? styles['dialog'] : ''}`}>
            <div className={`${props.isDialog ? styles['scroll'] : ''}`}>
                {
                    props.tickets.map((item, index) => {
                        const disable = !!userPendingPayment && userPendingPayment.ticket_id !== item.id
                        return <div key={item.id} onClick={() => {
                            !disable && setSelectedTicket(item)
                        }}>
                            <TicketItem
                                waitForPayment={!!userPendingPayment && !disable}
                                disable={disable}
                                selected={selectedTicket?.id === item.id && !userHasPaid}
                                ticket={item}/>
                        </div>
                    })
                }
            </div>

            {
                !!userHasPaid ?
                    <AppButton disabled>
                        {'You have purchased the ticket'}
                    </AppButton>
                    : canAccess ?
                        <AppButton special onClick={() => {
                            if (!selectedTicket) {
                                showToast('Please select a ticket')
                                return
                            }
                            selectedTicket && showTicketDialog(selectedTicket)
                        }}>{lang['Get_A_Ticket']}</AppButton>
                        : <AppButton disabled>
                            {'Only for group members'}
                        </AppButton>
            }
        </div>

    </div>)
}

export default EventTickets
