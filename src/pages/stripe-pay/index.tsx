import {
    checkEventPermission,
    Event,
    getStripeClientSecret,
    joinEventWithTicketItem, Participants,
    queryEvent,
    queryTickets,
    Ticket
} from "@/service/solas"
import React, {useContext, useEffect, useState} from "react"
import {loadStripe} from '@stripe/stripe-js'
import {Elements, PaymentElement, useElements, useStripe} from '@stripe/react-stripe-js'
import userContext from "@/components/provider/UserProvider/UserContext"
import styles from './stripe_pay.module.scss'
import AppButton, {BTN_KIND} from "@/components/base/AppButton/AppButton"
import {ArrowLeft} from 'baseui/icon'
import {useRouter} from "next/navigation"
import EventDefaultCover from "@/components/base/EventDefaultCover"
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext"
import LangContext from "@/components/provider/LangProvider/LangContext"
import {formatUnits} from "viem/utils";

const api_key = 'pk_test_51OeSy4DtkneJ1BkLE1bqaFXFfKaIDC2vVvNSjxYITOpeHCOjqLcnrphytnpFpilM816hYXxtOEsmsXk1tLiwRU1s00OXWHHvaS'
const stripePromise = loadStripe(api_key)

export default function StripePay({ticketId, methodId}: { ticketId: number | null, methodId: number | null }) {
    if (ticketId === null || !methodId === null) {
        throw new Error('Invalid ticketId or methodId')
    }
    const router = useRouter()
    const {showLoading, showToast, openConnectWalletDialog} = useContext(DialogsContext)
    const {lang} = useContext(LangContext)

    const {user} = useContext(userContext)
    const [clientSecret, setClientSecret] = useState("");

    const [ticket, setTicket] = useState<Ticket | null>(null)
    const [eventDetail, setEventDetail] = useState<Event | null>(null)
    const [errorMsg, setErrorMsg] = useState('')

    const returnPath = `/event/detail/${eventDetail?.id}`

    async function checkJoined() {
        if (user.id) {
            const eventParticipants = eventDetail?.participants || []
            const joined = eventParticipants.find((item: Participants) => {
                return (!item.ticket_id && item.profile.id === user.id && (item.status === 'applied' || item.status === 'attending')) // no tickets needed
                    || (!!item.ticket_id && item.profile.id === user.id && (item.status === 'applied' || item.status === 'attending') && item.payment_status.includes('succe')) // paid ticket
            })

            return !!joined
        }
    }

    const handleJoin = async (eventDetail: Event, ticket: Ticket, methodId: number) => {
        const participantsAll = eventDetail?.participants || []
        const participants = participantsAll.filter(item => item.status !== 'cancel')

        if (eventDetail?.max_participant !== null && eventDetail?.max_participant !== undefined && eventDetail?.max_participant <= participants.length) {
            throw new Error('The event has reached its maximum capacity.')
        }

        const hasPermission = await checkEventPermission({id: eventDetail!.id, auth_token: user.authToken || ''})

        if (!hasPermission) {
            throw new Error('You do not have permission to join this event.')
        }

        const payment = ticket.payment_methods.find(p => {
            return p.id === methodId
        })

        return await joinEventWithTicketItem({
            auth_token: user.authToken || '',
            id: eventDetail.id,
            ticket_id: ticketId,
            chain: payment!.chain!,
            amount: payment!.price,
            ticket_price: payment!.price,
        })
    }

    const targetPayment = ticket?.payment_methods.find(item => item.id === methodId)

    useEffect(() => {
        (async () => {
            if (ticketId && user.id && methodId !== null) {
                const unload = showLoading(true)
                try {
                    const checkJoin = await checkJoined()
                    if (checkJoin) {
                        router.replace(`/event/detail/${eventDetail?.id}`)
                    }

                    const tickets = await queryTickets({id: ticketId})
                    !!tickets[0] && setTicket(tickets[0])

                    if (!!tickets[0]) {
                        const event = await queryEvent({id: tickets[0].event_id, page: 1})
                        setEventDetail(event[0])


                        const {participant, ticket_item} = await handleJoin(event[0], tickets[0], methodId)
                        const clientSecret = await getStripeClientSecret({
                            auth_token: user.authToken || '',
                            ticket_item_id: ticket_item.id
                        })

                        setClientSecret(clientSecret)
                    } else {
                        unload()
                        throw new Error('Ticket not found')
                    }
                } catch (e: any) {
                    console.error(e)
                    setErrorMsg(e.message || 'An unexpected error occurred.')
                } finally {
                    unload()
                }
            }
        })()
    }, [ticketId, methodId, user, eventDetail])

    const options = {
        clientSecret,
        appearance: {
            theme: 'stripe' as any,
        },
    };

    return <div className={styles['page']}>
        {!errorMsg ?
            !user.id ?
                <div className={'home-login-panel'}>
                    <img src="/images/balloon.png" alt=""/>
                    <div className={'text'}>{lang['Activity_login_des']}</div>
                    <AppButton onClick={e => {
                        openConnectWalletDialog()
                    }} special size={'compact'}>{lang['Activity_login_btn']}</AppButton>
                </div> :
                <div className={styles['center']}>
                    {!!eventDetail &&
                        <>
                            <div className={styles['info']}>
                                <div className={styles['back']} onClick={e => {
                                    router.replace(returnPath)
                                }}>
                                    <ArrowLeft/>
                                    Back
                                </div>

                                <div className={styles['price-tit']}>Price</div>
                                <div
                                    className={styles['price']}>
                                    ${formatUnits(BigInt(targetPayment?.price || 0), 2)}
                                    </div>


                                <div className={styles['sub-title']}>Ticket Type</div>
                                <div className={styles['ticket-type']}>
                                    <div className={styles['ticket-info']}>
                                        <div className={styles['ticket-title']}>{ticket?.title}</div>
                                        <div className={styles['ticket-content']}>{ticket?.content}</div>
                                        <div
                                            className={styles['ticket-price']}>
                                            {formatUnits(BigInt(targetPayment?.price || 0), 2)} USD
                                        </div>
                                    </div>
                                    <div className={styles['ticket-cover']}>
                                        {
                                            eventDetail.cover_url ?
                                                <img src={eventDetail.cover_url} alt=""/>
                                                : <EventDefaultCover event={eventDetail} width={120} height={120}/>
                                        }
                                    </div>
                                </div>
                            </div>
                        </>
                    }

                    <div className={styles['form']}>


                        {!!user.id && !!ticket && !!clientSecret && !!eventDetail &&
                            <>
                                <h1>Stripe Payment</h1>
                                <Elements options={options} stripe={stripePromise}>
                                    <CheckoutForm ticket={ticket} eventDetail={eventDetail}/>
                                </Elements>
                            </>
                        }
                    </div>
                </div>
            : <div>{errorMsg}</div>
        }
    </div>
}

export async function getServerSideProps(context: any) {
    const ticketId = context.query?.ticket
    const paymentMethodId = context.query?.methodid

    return {
        props: {
            ticketId: ticketId ? parseInt(ticketId) : null,
            methodId: paymentMethodId ? parseInt(paymentMethodId) : null
        }
    }
}


function CheckoutForm(props: { ticket: Ticket, eventDetail: Event }) {
    const stripe = useStripe();
    const elements = useElements();

    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const {showToast} = useContext(DialogsContext)

    useEffect(() => {
        if (!stripe) {
            return;
        }

        const clientSecret = new URLSearchParams(window.location.search).get(
            "payment_intent_client_secret"
        );

        if (!clientSecret) {
            return;
        }

        stripe.retrievePaymentIntent(clientSecret).then(({paymentIntent}) => {
            switch (paymentIntent?.status) {
                case "succeeded":
                    setMessage("Payment succeeded!");
                    break;
                case "processing":
                    setMessage("Your payment is processing.");
                    break;
                case "requires_payment_method":
                    setMessage("Your payment was not successful, please try again.");
                    break;
                default:
                    setMessage("Something went wrong.");
                    break;
            }
        });
    }, [stripe]);

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);


        const {error} = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${location.origin}/event/detail/${props.ticket.event_id}`,
            },
        });

        if (!!error) {
            if (error.type === "card_error" || error.type === "validation_error") {
                setMessage(error.message || error.type);
            } else {
                setMessage("An unexpected error occurred.");
            }
        } else {
            showToast('Payment successful')
        }

        setIsLoading(false);
    };

    const paymentElementOptions: any = {
        layout: "tabs"
    }

    return (
        <form id="payment-form" onSubmit={handleSubmit}>
            <PaymentElement
                id="payment-element" options={paymentElementOptions}/>

            <div className={styles['pay-btn']}>
                <AppButton
                    kind={BTN_KIND.primary}
                    disabled={isLoading || !stripe || !elements}
                    isLoading={isLoading}
                    onClick={handleSubmit}
                    style={{width: '100%'}}
                >
                    Pay now
                </AppButton>
            </div>
            {message && <div id="payment-message">{message}</div>}
        </form>
    );
}
