import {useContext, useEffect, useMemo, useState} from 'react'
import {
    Badge,
    Event,
    getParticipantDetail,
    getTicketItemDetail,
    Participants,
    queryBadgeDetail,
    Ticket
} from '@/service/solas'
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
import BigNumber from "bignumber.js";

function TicketItem({
                        ticket,
                        selected,
                    }: { ticket: Ticket, selected?: boolean, disable?: boolean}) {


    const [badge, setBadge] = useState<Badge | null>(null)

    const chain = useMemo(() => {
        return ticket.payment_methods.length && ticket.payment_methods[0].chain ? paymentTokenList.find(item => item.id === ticket.payment_methods[0].chain) : undefined
    }, [ticket])

    const token = useMemo(() => {
        if (!chain) return undefined
        return chain?.tokenList.find(item => item.id === ticket.payment_methods[0].token_name)
    }, [chain, ticket])

    const chainsIcons = useMemo(() => {
        const chains = ticket.payment_methods.map(item => item.chain)
        return chains.map(chain => paymentTokenList.find(item => item.id === chain)?.icon).reverse()
    }, [ticket])

    useEffect(() => {
        if (ticket.check_badge_class_id) {
            queryBadgeDetail({id: ticket.check_badge_class_id}).then((res) => {
                res && setBadge(res)
            })
        }
    }, [ticket])

    const price = useMemo(() => {
        if (ticket.payment_methods.length === 0) {
            return 'Free'
        }

        const prices = ticket.payment_methods.map(item => {
            const targetToken = paymentTokenList.find(chain => chain.id === item.chain)
            const targetTokenDetail = targetToken?.tokenList.find(token => token.id === item.token_name)

            return BigNumber(item.price).dividedBy(BigNumber(10).pow(targetTokenDetail?.decimals || 0)).toNumber()
        })

        const maxPrice = Math.max(...prices)
        const minPrice = Math.min(...prices)

        return maxPrice === minPrice ? `${minPrice} USD` : `${minPrice}-${maxPrice} USD`

    }, [ticket])


    return <div
        className={`${styles['item']} ${selected ? styles['selected'] : ''}`}
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
            ticket.payment_methods?.length !== 0 &&
            <div className={styles['price-info']}>
                <div
                    className={styles['item-price']}>{price}</div>
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
            ticket.payment_methods?.length === 0 &&
            <div className={styles['item-price']}>{'Free'}</div>
        }
    </div>
}

function EventTickets({

                          ...props
                      }: { event: Event, tickets: Ticket[], canAccess?: boolean, isDialog?: boolean }) {

    const {lang} = useContext(langContext)
    const canAccess = true
    const {openDialog, showToast} = useContext(DialogsContext)
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(props.tickets[0] || null)
    const {user} = useContext(userContext)
    const [userHasPaid, setUserHasPaid] = useState<Participants | null>(null)
    const [needUpdate, _] = useEvent(EVENT.participantUpdate)


    useEffect(() => {
        (async () => {
            if (user.userName || needUpdate) {
                const participant = await getParticipantDetail({event_id: props.event.id, profile_id: user.id!})
                if (!participant) {
                    setUserHasPaid(null)
                    return
                }

                if (!participant.ticket_id) {
                    // 可能不是经过票务参加
                    setUserHasPaid(participant)
                    return
                }

                // 票务参数
                if (participant.payment_status === 'succeeded') {
                    setUserHasPaid(participant)
                } else {
                    setUserHasPaid(null)
                }
            }
        })()
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
                        return <div key={item.id} onClick={() => {
                            setSelectedTicket(item)
                        }}>
                            <TicketItem
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
