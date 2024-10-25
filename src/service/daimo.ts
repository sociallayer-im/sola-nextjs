import {rsvp} from "@/service/solas";

export async function generatePayment(props: {
    eventTitle: string,
    eventCover?: string | null,
    amount: string,
    receiver: string,
    ticketName: string,
    tokenContract: string,
    ticketId: number,
    returnUrl: string,
    eventId: number,
    authToken: string,
    payment_method_id: number,
    coupon?: string,
}) {
    const join = await rsvp(
        {
            auth_token: props.authToken,
            id: props.eventId,
            ticket_id: props.ticketId,
            payment_method_id: props.payment_method_id,
            coupon: props.coupon
        }
    )

    const response = await fetch('https://pay.daimo.com/api/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Idempotency-Key': `ticket-${join.ticket_item.id}`,
            'Api-Key': 'daimopay-e74900de-4786-4b58-a74b-1a09139008ce',
        },
        body: JSON.stringify({
            intent: 'Ticket purchase',
            items: [
                {
                    name: props.ticketName,
                    description: `Ticket for [${props.eventTitle}]`,
                    image: props.eventCover || undefined,
                },
            ],
            recipient: {
                address: props.receiver,
                amount: props.amount,
                token: props.tokenContract,
                chain: 137,
            },
            redirectUri: props.returnUrl,
        }),
    })

    const data = await response.json()
    console.log(data)
    if (data.error) {
        throw new Error(data.error)
    }

    return data as {
        id: string,
        url: string
    }
}
