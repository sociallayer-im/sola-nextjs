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
    joinEvent, PromoCode,
    queryBadgeDetail,
    queryBadgelet, queryPromoCodes, queryTicketItems,
    rsvp,
    Ticket, TicketItem
} from '@/service/solas'
import useTime from "@/hooks/formatTime";
import {paymentTokenList} from "@/payment_settring";
import UserContext from "@/components/provider/UserProvider/UserContext";
import useEvent, {EVENT} from "@/hooks/globalEvent";
import ButtonLoading from "@/components/base/ButtonLoading";
import {Select} from "baseui/select";
import {useRouter} from "next/navigation"
import AppInput from "@/components/base/AppInput";


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
    const [promoCode, setPromoCode] = useState('')
    const [validPromoCode, setValidPromoCode] = useState<null | PromoCode>(null)
    const [promoCodeError, setPromoCodeError] = useState('')

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

    const removePromoCode = async () => {
        setValidPromoCode(null)
        setPromoCode('')
        setApproved(false)
    }

    const checkPromoCode = async () => {
        const unload = showLoading()
        const codes = await queryPromoCodes({event_id: props.event.id})
        if (!codes.length) {
            setPromoCodeError('Invalid promo code')
            setValidPromoCode(null)
            unload()
            return
        }

        const target = codes.find(c => c.code === promoCode)
        if (!target) {
            setPromoCodeError('Invalid promo code')
            setValidPromoCode(null)
            unload()
            return
        }

        if (target.max_allowed_usages === target.order_usage_count) {
            setPromoCodeError('Promo code has been used up')
            setValidPromoCode(null)
            unload()
            return
        }

        if (new Date(target.expiry_time).getTime() < new Date().getTime()) {
            setPromoCodeError('Promo code has expired')
            setValidPromoCode(null)
            unload()
            return
        }

        unload()
        setValidPromoCode(target)
    }

    const finalPrice = useMemo(() => {
        let price: number
        if (!validPromoCode) {
            price = payments![paymentIndex].payment.price
        } else {
            if (validPromoCode.discount_type === 'ratio') {
                price = Number(payments![paymentIndex].payment.price || '0') * validPromoCode.discount / 10000
            } else {
                price = Number(payments![paymentIndex].payment.price || '0') - (validPromoCode.discount / 100) * 10 ** (payments![paymentIndex]!.token!.decimals || 0)
            }
        }

        return Math.max(price, 0)
    }, [validPromoCode, paymentIndex, payments])

    const discount = useMemo(() => {
        return payments[paymentIndex]!.payment.price - finalPrice
    }, [finalPrice, paymentIndex, payments])

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

        <div className={styles['scroll']}>
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
                                    <div className={styles['icon']}>
                                        <img className={styles['token']} src={payments![paymentIndex]!.token!.icon}
                                             alt=""/>
                                        <img className={styles['chain']} src={payments![paymentIndex]!.chain!.icon}
                                             alt=""/>
                                    </div>
                                    <span> {Number(props.ticket.payment_methods[paymentIndex]!.price || '0') / (10 ** payments![paymentIndex]!.token!.decimals || 0)}</span>
                                    <span>{payments[paymentIndex]!.token.name.toUpperCase()}</span>
                                </div>
                            }}

                            getOptionLabel={({option}: any) => {
                                return <div className={styles['payment-label']}>
                                    <div className={styles['icon']}>
                                        <img className={styles['token']} src={option.token.icon} alt=""/>
                                        <img className={styles['chain']} src={option.chain.icon} alt=""/>
                                    </div>
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

                    {
                        finalPrice === props.ticket.payment_methods[paymentIndex]!.price ?
                            <div className={styles['balance']}>
                                <div className={styles['label']}>Total</div>
                                <div
                                    className={styles['total']}>{Number(props.ticket.payment_methods[paymentIndex]!.price || '0') / (10 ** payments![paymentIndex]!.token!.decimals || 0)} {payments[paymentIndex]!.token!.name?.toUpperCase()}</div>
                            </div> :
                            <>
                                <div className={styles['balance']}>
                                    <div className={styles['label']}>Original Price</div>
                                    <div>{Number(props.ticket.payment_methods[paymentIndex]!.price || '0') / (10 ** payments![paymentIndex]!.token!.decimals || 0)} {payments[paymentIndex]!.token!.name?.toUpperCase()}</div>
                                </div>
                                <div className={styles['balance']}>
                                    <div className={styles['label']}></div>
                                    <div>-{discount / (10 ** payments![paymentIndex]!.token!.decimals || 0)} {payments[paymentIndex]!.token!.name?.toUpperCase()}</div>
                                </div>
                                <div className={styles['balance']}>
                                    <div className={styles['label']}>Final Price</div>
                                    <div
                                        className={styles['total']}>{finalPrice / (10 ** payments![paymentIndex]!.token!.decimals || 0)} {payments[paymentIndex]!.token!.name?.toUpperCase()}</div>
                                </div>
                            </>
                    }


                    <div className={styles['balance']}>
                        {!isStripe &&
                            <>
                                <div className={styles['label']}>Balance</div>
                                <div className={styles['value']}>
                                    <img style={{width: '18px', height: '18px', borderRadius: '50%'}}
                                         src={payments![paymentIndex]!.token.icon} alt=""/>
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

            <div className={styles['promo']}>
                <div className={styles['promo-title']}>Input the promo code</div>
                <div className={styles['promo-input']}>
                    <AppInput value={promoCode}
                              onChange={e => {
                                  setPromoCode(e.target.value)
                              }}
                              placeholder={'Promo code'}/>
                    {!!promoCode && !validPromoCode &&
                        <AppButton onClick={checkPromoCode}>Confirm</AppButton>
                    }
                    {
                        !!validPromoCode &&
                        <AppButton onClick={removePromoCode}>Remove</AppButton>
                    }
                </div>
                <div className={styles['errorMsg']}>{promoCodeError}</div>
            </div>

            {!!errorMsg &&
                <div className={styles['error-msg']}>{errorMsg}</div>
            }

            {
                soldOut &&
                <AppButton disabled>{'Ticket sold out'}</AppButton>
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
                && isStripe
                && !soldOut
                && !stopSales
                && <AppButton special onClick={e => {
                    router.push(`/stripe-pay?ticket=${props.ticket.id}&methodid=${props.ticket.payment_methods[paymentIndex].id}${validPromoCode?.code ? `&promo=${validPromoCode.code}` : ''}`)
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
                    promo_code={validPromoCode?.code || undefined}
                    eventId={props.event.id}
                    methodId={props.ticket.payment_methods[paymentIndex]!.id!}
                    ticketId={props.ticket.id}
                    token={payments![paymentIndex]!.token!.contract}
                    to={props.ticket.payment_methods[paymentIndex]!.receiver_address!}
                    amount={finalPrice.toString() || '0'}
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
                    methodId={props.ticket.payment_methods[paymentIndex]!.id!}
                    ref={reFleshAllowanceRef}
                    token={payments![paymentIndex]!.token!.contract}
                    to={props.ticket.payment_methods[paymentIndex]!.receiver_address!}
                    amount={finalPrice.toString() || '0'}
                    decimals={payments![paymentIndex]!.token!.decimals}
                    chainId={payments![paymentIndex]!.chain!.chainId}
                    onErrMsg={(errMsg: string) => {
                        setErrorMsg(errMsg)
                    }}
                    onResult={(needApprove, hash) => {
                        setApproved(!needApprove)
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
        </div>
    </div>)
}

export default DialogTicket
