import {Event, getStripeClientSecret, queryEvent, queryTickets, Ticket} from "@/service/solas"
import {useContext, useEffect, useState} from "react"
import {loadStripe} from '@stripe/stripe-js'
import {Elements, PaymentElement, useElements, useStripe} from '@stripe/react-stripe-js'
import userContext from "@/components/provider/UserProvider/UserContext"
import styles from './stripe_pay.module.scss'
import AppButton from "@/components/base/AppButton/AppButton"
import {ArrowLeft} from 'baseui/icon'
import {useRouter} from "next/navigation"
import EventDefaultCover from "@/components/base/EventDefaultCover"
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext"

const api_key = 'pk_test_51OeSy4DtkneJ1BkLE1bqaFXFfKaIDC2vVvNSjxYITOpeHCOjqLcnrphytnpFpilM816hYXxtOEsmsXk1tLiwRU1s00OXWHHvaS'
const stripePromise = loadStripe(api_key)

export default function StripePay({ticketId, paymentIndex}: { ticketId: number | null, paymentIndex: number | null }) {
    if (ticketId === null || !paymentIndex === null) {
        throw new Error('Invalid ticketId or paymentIndex')
    }
    const router = useRouter()
    const {showLoading} = useContext(DialogsContext)

    const {user} = useContext(userContext)
    const [clientSecret, setClientSecret] = useState("");

    const [ticket, setTicket] = useState<Ticket | null>(null)
    const [event, setEvent] = useState<Event | null>(null)

    const returnPath = `/event/detail/${event?.id}`

    useEffect(() => {
        (async () => {
            if (ticketId && user.id) {
               const unload = showLoading(true)
                try {
                    const tickets = await queryTickets({id: ticketId})
                    !!tickets[0] && setTicket(tickets[0])

                    const clientSecret = await getStripeClientSecret({
                        auth_token: user.authToken || '',
                        ticket_id: ticketId
                    })

                    if (!!tickets[0]) {
                        const event = await queryEvent({id: tickets[0].event_id, page: 1})
                        setEvent(event[0])
                    }

                    setClientSecret(clientSecret)
                } finally {
                    unload()
                }
            }
        })()
    }, [ticketId, paymentIndex, user])

    const options = {
        clientSecret,
        appearance: {
            theme: 'stripe' as any,
        },
    };

    return <div className={styles['page']}>
        <div className={styles['center']}>
            <div className={styles['info']}>
                <div className={styles['back']} onClick={e => {
                    router.replace(returnPath)
                }}>
                    <ArrowLeft/>
                    Back
                </div>

                <div className={styles['price-tit']}>Price</div>
                <div className={styles['price']}>${ticket?.payment_metadata?.[paymentIndex!]!.payment_token_price}</div>

                {
                    !!event &&
                    <>
                        <div className={styles['sub-title']}>Ticket Type</div>
                        <div className={styles['ticket-type']}>
                            <div className={styles['ticket-info']}>
                                <div className={styles['ticket-title']}>{ticket?.title}</div>
                                <div className={styles['ticket-content']}>{ticket?.content}</div>
                                <div
                                    className={styles['ticket-price']}>{ticket?.payment_metadata?.[paymentIndex!]!.payment_token_price} USD
                                </div>
                            </div>
                            <div className={styles['ticket-cover']}>
                                {
                                    event.cover_url ?
                                        <img src={event.cover_url} alt=""/>
                                        : <EventDefaultCover event={event} width={120} height={120}/>
                                }
                            </div>
                        </div>
                    </>
                }

            </div>
            <div className={styles['form']}>
                <h1>Stripe Payment</h1>


                {!!user.id && !!ticket && !!clientSecret &&
                    <Elements options={options} stripe={stripePromise}>
                        <CheckoutForm ticket={ticket}/>
                    </Elements>
                }
            </div>
        </div>
    </div>
}

export async function getServerSideProps(context: any) {
    const ticketId = context.query?.ticket
    const paymentIndex = context.query?.index

    return {
        props: {
            ticketId: ticketId ? parseInt(ticketId) : null,
            paymentIndex: paymentIndex ? parseInt(paymentIndex) : null
        }
    }
}


function CheckoutForm(props: { ticket: Ticket }) {
    const stripe = useStripe();
    const elements = useElements();

    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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

        if (error.type === "card_error" || error.type === "validation_error") {
            setMessage(error.message || error.type);
        } else {
            setMessage("An unexpected error occurred.");
        }

        setIsLoading(false);
    };

    const paymentElementOptions: any = {
        layout: "tabs"
    }

    return (
        <form id="payment-form" onSubmit={handleSubmit}>
            <PaymentElement id="payment-element" options={paymentElementOptions}/>

            <div className={styles['pay-btn']}>
                <AppButton
                    special={true}
                    disabled={isLoading || !stripe || !elements}
                    isLoading={isLoading}
                    onClick={handleSubmit}
                >
                    Pay now
                </AppButton>
            </div>
            {message && <div id="payment-message">{message}</div>}
        </form>
    );
}
