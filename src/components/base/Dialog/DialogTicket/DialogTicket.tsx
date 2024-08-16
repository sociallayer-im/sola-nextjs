import {useContext, useEffect, useMemo, useRef, useState} from 'react'
import styles from './DialogTicket.module.scss'
import LangContext from "@/components/provider/LangProvider/LangContext";
import useCopy from "@/hooks/copy";
import AppButton from "@/components/base/AppButton/AppButton";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import DialogConnectWalletForPay from "@/components/base/Dialog/DialogConnectWalletForPay/DialogConnectWalletForPay";
import {useAccount} from "wagmi";
import Erc20TokenPaymentHandler from "@/components/base/Erc20TokenPaymentHandler/Erc20TokenPaymentHandler";
import Erc20TokenApproveHandler from "@/components/base/Erc20TokenApproveHandler/Erc20TokenApproveHandler";
import Erc20Balance from "@/components/base/Erc20Balance/Erc20Balance";
import EventDefaultCover from "@/components/base/EventDefaultCover";
import {
    Badge,
    Event,
    getParticipantDetail, getTicketItemDetail,
    joinEvent,
    queryBadgeDetail,
    queryBadgelet,
    rsvp,
    Ticket
} from '@/service/solas'
import useTime from "@/hooks/formatTime";
import {paymentTokenList} from "@/payment_settring";
import UserContext from "@/components/provider/UserProvider/UserContext";
import useEvent, {EVENT} from "@/hooks/globalEvent";
import ButtonLoading from "@/components/base/ButtonLoading";
import {Select} from "baseui/select";
import {useRouter} from "next/navigation"


function DialogTicket(props: { close: () => any, event: Event, ticket: Ticket }) {
    const {lang} = useContext(LangContext)
    const {user} = useContext(UserContext)
    const router = useRouter()
    const {copyWithDialog} = useCopy()
    const {openDialog, showToast, showLoading} = useContext(DialogsContext)
    const [errorMsg, setErrorMsg] = useState('')
    const [approved, setApproved] = useState(false)
    const [_, emit] = useEvent(EVENT.participantUpdate)
    const [soldOut, setSoldOut] = useState(false)
    const [badge, setBadge] = useState<Badge | null>(null)
    const [OwnedBadge, setOwnedBadge] = useState(false)
    const [stopSales, setStopSales] = useState(false)

    const {address} = useAccount()
    const formatTime = useTime()

    const [busy, setBusy] = useState(false)
    const [paymentIndex, setPaymentIndex] = useState(0)

    const reFleshAllowanceRef = useRef<any>(null)

    const hasBadgePermission = !props.ticket.check_badge_class_id || (!!props.ticket.check_badge_class_id && OwnedBadge)

    useEffect(() => {
        if (!!user.id && !!badge) {
            queryBadgelet({owner_id: user.id, badge_class_id: badge.id, page: 1}).then((res) => {
                setOwnedBadge(!!res.length)
            })
        } else {
            setOwnedBadge(false)
        }
    }, [user.id, badge])

    const payments = useMemo(() => {
        if (props.ticket.payment_methods!.length === 0) return []
        return props.ticket.payment_methods!.map((payment, index) => {
            const chain = paymentTokenList.find((chain) => chain.id === payment.chain)

            let token: any = undefined
            if (!!chain) {
                token = chain.tokenList.find((t: any) => t.id === payment.token_name)
            }

            return {
                chain,
                token,
                payment,
                index,
                label: `${Number(payment.price) / 10 ** (token?.decimals || 0)} ${payment.token_name}`
            }
        })
    }, [props.ticket])

    useEffect(() => {
        (async () => {
            if (user.id) {
                const participant = await getParticipantDetail({profile_id: user.id, ticket_id: props.ticket.id})
                if (!participant) {
                    setApproved(false)
                    return
                }

                const ticket_item = await getTicketItemDetail({participant_id: participant.id})
                if (!!ticket_item) {
                    const methodIndex = props.ticket.payment_methods.findIndex((p => p.id === ticket_item.payment_method_id))
                    if (methodIndex !== -1) {
                        setPaymentIndex(methodIndex)
                        setApproved(true)
                    } else {
                        setApproved(false)
                    }
                } else {
                    setApproved(false)
                }
            }
        })()
    }, [user.id, payments])

    useEffect(() => {
        setApproved(false)
        setErrorMsg('')
    }, [paymentIndex])

    const isStripe = useMemo(() => {
        return payments[paymentIndex]?.chain?.id === 'stripe'
    }, [paymentIndex, payments])

    useEffect(() => {
        setSoldOut(props.ticket.quantity === 0)

        if (props.ticket.check_badge_class_id) {
            queryBadgeDetail({id: props.ticket.check_badge_class_id}).then((res) => {
                res && setBadge(res)
            })
        }

        if (props.ticket.end_time && new Date(props.ticket.end_time).getTime() < new Date().getTime()) {
            setStopSales(true)
        }
    }, [props.ticket])

    const connectWallet = () => {
        openDialog({
            content: (close: any) => <DialogConnectWalletForPay handleClose={close}/>,
            size: [360, 'auto']
        })
    }

    const shotAddress = (address: string) => {
        const len = address.length
        return address.slice(0, 6) + '...' + address.slice(len - 6, len)
    }

    const freePay = async () => {
        const unload = showLoading()

        try {
            const join = await rsvp(
                {
                    auth_token: user.authToken || '',
                    id: props.event.id,
                    ticket_id: props.ticket.id,
                }
            )

            emit(join)
            props.close()
            showToast('Purchase successful')

            return join
        } catch (e: any) {
            console.error(e)
            showToast(e.message)
        } finally {
            unload()
        }
    }

    const [balance, setBalance] = useState<string | null>(null)

    useEffect(() => {
        if (hasBadgePermission && payments.length && !!balance && !busy && Number(balance) < Number(payments[paymentIndex].payment.price)) {
            setErrorMsg('Insufficient balance')
        }
    }, [balance, busy, payments, hasBadgePermission])

    return (<div className={styles['dialog-ticket']}>
        <div className={styles['dialog-title']}>
            <div>{'Event'}</div>
            {!busy &&
                <svg
                    onClick={props.close}
                    className={styles['close']} xmlns="http://www.w3.org/2000/svg" width="14" height="15"
                    viewBox="0 0 14 15" fill="none">
                    <rect x="0.93335" y="0.311127" width="18.479" height="1.31993" rx="0.659966"
                          transform="rotate(45 0.93335 0.311127)" fill="#7B7C7B"/>
                    <rect x="14" y="0.933319" width="18.479" height="1.31993" rx="0.659966"
                          transform="rotate(135 14 0.933319)" fill="#7B7C7B"/>
                </svg>
            }
        </div>

        <div className={styles['dialog-event']}>
            {
                props.event.cover_url ?
                    <img className={styles['cover']} src={props.event.cover_url} alt=""/>
                    : <EventDefaultCover width={53} height={74} event={props.event}/>

            }
            <div className={styles['info']}>
                <div className={styles['title']}>{props.event.title}</div>
                <div className={styles['time']}>{formatTime(props.event.start_time!)}</div>
                <div className={styles['location']}>{props.event.location}</div>
            </div>
        </div>
        <div className={styles['type-name-title']}>Ticket type</div>
        <div className={styles['type-name']}>{props.ticket.title}</div>

        <div className={styles['detail']}>
            {
                !!badge &&
                <div className={styles['badge']}>
                    <div className={styles['title']}>{'Need to have badge'}</div>
                    <div className={styles['info']}>
                        <div className={styles['name']}>
                            <img src={badge.image_url} alt=""/>
                            <div>{badge.title}</div>
                        </div>
                        {OwnedBadge && <div className={styles['owned']}>Owned</div>}
                        {!OwnedBadge && user.id && <div className={styles['owned']}>Not Collected</div>}
                    </div>
                </div>
            }
        </div>

        {!!payments.length &&
            <>
                <div className={styles['payment-title']}>Payment</div>
                <div className={styles['price']}>
                    <div className={styles['label']}>Price</div>
                </div>
                <div className={styles['select']}>
                    <Select
                        disabled={busy}
                        value={[props.ticket.payment_methods[paymentIndex]] as any}
                        options={payments}
                        clearable={false}
                        searchable={false}

                        getValueLabel={() => {
                            return <div className={styles['payment-label']}>
                                <img src={payments![paymentIndex]!.chain!.icon} alt=""/>
                                <span> {Number(props.ticket.payment_methods[paymentIndex]!.price || '0') / (10 ** payments![paymentIndex]!.token!.decimals || 0)}</span>
                                <span>{payments[paymentIndex]!.token.name.toUpperCase()}</span>
                            </div>
                        }}

                        getOptionLabel={({option}: any) => {
                            return <div className={styles['payment-label']}>
                                <img src={option.chain.icon} alt=""/>
                                {option.payment.price / 10 ** (option.token.decimals)} {option.payment.token_name.toUpperCase()}
                            </div>
                        }}

                        onChange={({option}: any) => {
                            setPaymentIndex(option.index as any)
                        }}
                    />
                </div>

                {!!props.ticket.payment_methods[paymentIndex].receiver_address && !isStripe &&
                    <div className={styles['receiver']}>
                        <div className={styles['receiver-des']}>Payments will be sent to</div>
                        <div className={styles['address']}>
                            <div className={styles['left']}>
                                {
                                    payments[paymentIndex].chain &&
                                    <img src={payments![paymentIndex!].chain!.icon} alt=""/>
                                }
                                <div>{shotAddress(props.ticket.payment_methods[paymentIndex].receiver_address!)}</div>
                            </div>
                            <div className={styles['copy']}
                                 onClick={e => {
                                     copyWithDialog(props.ticket.payment_methods[paymentIndex].receiver_address!)
                                 }}>
                                {lang['Profile_Show_Copy']}
                            </div>
                        </div>
                    </div>
                }


                <div className={styles['balance']}>
                    {!isStripe &&
                        <>
                            <div className={styles['label']}>Balance</div>
                            <div className={styles['value']}>
                                {
                                    !!address ? <Erc20Balance
                                            onChange={(balance) => {
                                                setBalance(balance)
                                            }}
                                            chanId={payments![paymentIndex]!.chain!.chainId}
                                            account={address}
                                            token={payments[paymentIndex]!.token!.contract}
                                            decimals={payments[paymentIndex]!.token!.decimals}/>
                                        : '--'
                                }
                                <span>{payments[paymentIndex]!.token!.name?.toUpperCase()}</span>
                            </div>
                        </>
                    }
                </div>
            </>
        }

        {!!errorMsg &&
            <div className={styles['error-msg']}>{errorMsg}</div>
        }

        {
            soldOut &&
            <AppButton disabled>{'Sold Out'}</AppButton>
        }

        {
            stopSales &&
            <AppButton disabled>{'Stop ticket sales'}</AppButton>
        }

        {
            !hasBadgePermission &&
            <AppButton disabled>{'Need to have badge'}</AppButton>
        }

        {!address
            && !stopSales
            && !soldOut
            && !!user.id
            && hasBadgePermission
            && !!payments.length
            && !isStripe &&
            <AppButton special onClick={e => {
                connectWallet()
            }}>{'Connect Wallet'}</AppButton>
        }

        {
            !!user.id
            && isStripe &&
            <AppButton special onClick={e => {
                router.push(`/stripe-pay?ticket=${props.ticket.id}&methodid=${props.ticket.payment_methods[paymentIndex].id}`)
                props.close()
            }}>{'Go to pay'}</AppButton>
        }

        {!!address
            && !!payments.length
            && approved
            && !stopSales
            && !soldOut
            && !!user.id
            && hasBadgePermission
            && !isStripe &&
            <Erc20TokenPaymentHandler
                eventId={props.event.id}
                methodId={props.ticket.payment_methods[paymentIndex]!.id!}
                ticketId={props.ticket.id}
                token={payments![paymentIndex]!.token!.contract}
                to={props.ticket.payment_methods[paymentIndex]!.receiver_address!}
                amount={props.ticket.payment_methods[paymentIndex]!.price?.toString() || '0'}
                decimals={payments![paymentIndex]!.token!.decimals}
                chainId={payments![paymentIndex]!.chain!.chainId}
                onErrMsg={(errMsg: string) => {
                    emit('payment-error')
                    setErrorMsg(errMsg)
                }}
                onSuccess={(txHash: string) => {
                    emit('payment-success')
                    showToast('Payment successful')
                    props.close()
                }}
                content={(trigger, busy, sending, verifying) => {
                    setTimeout(() => {
                        setBusy(busy || verifying)
                    }, 100)
                    return errorMsg ? <AppButton special onClick={e => {
                            setErrorMsg('')
                            setApproved(false)
                            reFleshAllowanceRef.current && reFleshAllowanceRef.current.reFleshAllowance()
                        }
                        }>{'Retry'}</AppButton>
                        : <AppButton
                            disabled={busy || !!errorMsg}
                            special
                            onClick={async (e) => {
                                setErrorMsg('')
                                trigger?.()
                            }}>{
                            sending ?
                                <ButtonLoading>Sending Transaction</ButtonLoading> :
                                verifying ?
                                    <ButtonLoading>Verifying</ButtonLoading> :
                                    'Pay'
                        }</AppButton>
                }}
            />
        }

        {!!address
            && !!payments.length
            && !approved
            && !soldOut
            && !stopSales
            && !!user.id
            && hasBadgePermission
            && !isStripe &&
            <Erc20TokenApproveHandler
                ref={reFleshAllowanceRef}
                token={payments![paymentIndex]!.token!.contract}
                to={props.ticket.payment_methods[paymentIndex]!.receiver_address!}
                amount={props.ticket.payment_methods[paymentIndex]!.price?.toString() || '0'}
                decimals={payments![paymentIndex]!.token!.decimals}
                chainId={payments![paymentIndex]!.chain!.chainId}
                onErrMsg={(errMsg: string) => {
                    setErrorMsg(errMsg)
                }}
                onSuccess={(txHash: string) => {
                    setApproved(true)
                }}
                content={(trigger, busy) => {
                    setTimeout(() => {
                        setBusy(busy)
                    }, 100)
                    return <AppButton
                        disabled={busy || !!errorMsg}
                        special
                        onClick={async (e) => {
                            setErrorMsg('')
                            trigger?.()
                        }}>{busy ?
                        <ButtonLoading>Approving</ButtonLoading>
                        : 'Approve'}</AppButton>
                }}
            />
        }

        {!!user.id && !payments.length && hasBadgePermission && !stopSales && !soldOut &&
            <AppButton special onClick={e => {
                freePay()
            }}>{lang['Get_A_Ticket']}</AppButton>
        }
    </div>)
}

export default DialogTicket
