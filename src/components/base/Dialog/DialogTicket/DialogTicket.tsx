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
import TriangleDown from 'baseui/icon/triangle-down'
import {
    Badge,
    Event,
    Coupon,
    queryBadgeDetail,
    queryBadgelet,
    queryCoupons,
    rsvp,
    Ticket, ValidCoupon,
    verifyCoupon
} from '@/service/solas'
import useTime from "@/hooks/formatTime";
import {PaymentSettingChain, PaymentSettingToken, paymentTokenList} from "@/payment_setting";
import UserContext from "@/components/provider/UserProvider/UserContext";
import useEvent, {EVENT} from "@/hooks/globalEvent";
import ButtonLoading from "@/components/base/ButtonLoading";
import {Select} from "baseui/select";
import {useRouter} from "next/navigation"
import AppInput from "@/components/base/AppInput";
import {generatePayment} from "@/service/daimo";

const shotAddress = (address: string) => {
    const len = address.length
    return address.slice(0, 6) + '...' + address.slice(len - 6, len)
}

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
    const [coupon, setCoupon] = useState('')
    const [showCouponInput, setShowCouponInput] = useState(false)


    const [validCoupon, setValidCoupon] = useState<null | ValidCoupon>(null)
    const [couponError, setCouponError] = useState('')

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

    interface ChainsOptions extends PaymentSettingChain {
        label: string
    }

    const stripePaymentMethod = useMemo(() => {
        return props.ticket.payment_methods.find(item => item.chain === 'stripe')
    }, [props.ticket])

    const cryptoChains = useMemo(() => {
        if (props.ticket.payment_methods!.length === 0) return []
        let chains: ChainsOptions[] = []
        props.ticket.payment_methods!
            .filter(p => p.chain !== 'stripe')
            .forEach(p => {
                const chain = paymentTokenList.find(i => i.id === p.chain)
                if (!!chain && !chains.some(c => c.id === chain.id)) {
                    chains.push({
                        ...chain,
                        label: chain.chain
                    })
                }
            })
        return chains
    }, [props.ticket])
    const [currChain, setCurrChain] = useState<ChainsOptions | null>(cryptoChains[0] || (stripePaymentMethod ? paymentTokenList.find(i => i.id === 'stripe') : null))

    interface TokenOptions extends PaymentSettingToken {
        label: string
    }

    const getTokenOptions = (chain: ChainsOptions) => {
        const targetPayment = props.ticket.payment_methods.filter(item => item.chain === chain.id)
        if (!targetPayment) return []

        return chain.tokenList.filter((token) => {
            return targetPayment.some(t => token.id === t.token_name)
        }).map((token) => {
            return {
                ...token,
                label: token.id
            }
        })
    }

    const [currToken, setCurrToken] = useState<TokenOptions | null>(currChain ? getTokenOptions(currChain)[0] : null)

    const currPaymentMethod = useMemo(() => {
        const res = props.ticket.payment_methods.find((item) => item.chain === currChain?.id && item.token_name === currToken?.id)
        console.log('currPaymentMethod', res)
        return res
    }, [props.ticket, currChain, currToken])

    const StipePayment = useMemo(() => {
        return props.ticket.payment_methods.find(item => item.chain === 'stripe')
    }, [props.ticket])

    useEffect(() => {
        setApproved(false)
        setErrorMsg('')
    }, [currPaymentMethod])

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

    const removeCoupon = async () => {
        setValidCoupon(null)
        setCoupon('')
        setApproved(false)
    }

    const checkCoupon = async () => {
        const unload = showLoading()
        const verify = await verifyCoupon({event_id: props.event.id, code: coupon})
        if (!verify) {
            setCouponError('Invalid coupon code')
            setValidCoupon(null)
            unload()
            return
        }

        if (verify.max_allowed_usages === verify.order_usage_count) {
            setCouponError('Promo code has been used up')
            setValidCoupon(null)
            unload()
            return
        }

        if (new Date(verify.expires_at).getTime() < new Date().getTime()) {
            setCouponError('Promo code has expired')
            setValidCoupon(null)
            unload()
            return
        }

        unload()
        setValidCoupon(verify)
    }

    const finalPaymentPrice = useMemo(() => {
        let price: number
        const methodPrice = currPaymentMethod?.price || 0
        if (!validCoupon) {
            price = methodPrice
        } else {
            if (validCoupon.discount_type === 'ratio') {
                price = Number(methodPrice) * validCoupon.discount / 10000
            } else {
                price = Number(methodPrice) - (validCoupon.discount / 100) * 10 ** (currToken?.decimals || 0)
            }
        }

        if (currChain?.id === 'stripe' && price < 400) {
            return 0
        } else {
            return Math.max(price, 0)
        }
    }, [currChain?.id, currPaymentMethod?.price, currToken?.decimals, validCoupon])

    const paymentDiscount = useMemo(() => {
        return (currPaymentMethod?.price || 0) - finalPaymentPrice
    }, [currPaymentMethod?.price, finalPaymentPrice])

    useEffect(() => {
        console.log('==>', hasBadgePermission, !!balance, !stopSales, !soldOut, Number(balance) < Number(finalPaymentPrice))
        if (
            hasBadgePermission
            && !!balance
            && !stopSales
            && !soldOut
            && currPaymentMethod?.chain !== 'stripe'
            && Number(balance) < Number(finalPaymentPrice)) {
            setErrorMsg('Insufficient balance')
        } else {
            setErrorMsg('')
        }
    }, [balance, currPaymentMethod, finalPaymentPrice, hasBadgePermission, soldOut, stopSales])

    const switchToStripe = () => {
        if (!StipePayment) return

        setErrorMsg('')
        const stripeChain = paymentTokenList.find(i => i.id === 'stripe')!
        setCurrChain({...stripeChain, label: stripeChain.chain})
        setCurrToken({...stripeChain.tokenList[0], label: stripeChain.tokenList[0].id})
    }

    const switchToCrypto = () => {
        if (!cryptoChains.length) return

        setErrorMsg('')
        const method = props.ticket.payment_methods.find(item => item.chain !== 'stripe')

        const chain = paymentTokenList.find(i => i.id === method?.chain)!
        const token = chain.tokenList.find(i => i.id === method?.token_name)!
        setCurrChain({...chain, label: chain.chain})
        setCurrToken({...token, label: token.id})
    }

    const handleDaimoPayment = async (copyLink?: boolean) => {
        const unload = showLoading()
        try {
            const {url, id} = await generatePayment({
                eventTitle: props.event.title,
                eventCover: props.event.cover_url,
                amount: finalPaymentPrice.toString() || '0',
                receiver: currPaymentMethod!.receiver_address!,
                ticketName: props.ticket.title,
                tokenContract: currToken!.contract,
                ticketId: props.ticket.id,
                returnUrl: location.href,
                eventId: props.event.id,
                authToken: user.authToken || '',
                payment_method_id: currPaymentMethod!.id!,
            })

            if (copyLink) {
                copyWithDialog(url)
                unload()
            } else {
               location.href = url
            }

        } catch (e: any) {
            showToast(e.message)
            unload()
        }
    }

    return (<div className={styles['dialog-ticket']}>
        <div className={styles['dialog-title']}>
            <div>{lang['Event']}</div>
            {(!busy || soldOut ) &&
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

        <div className={styles['scroll']}>
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
            <div className={styles['type-name-title']}>{lang['Ticket_Type']}</div>
            <div className={styles['type-name']}>{props.ticket.title}</div>

            <div className={styles['detail']}>
                {
                    !!badge &&
                    <div className={styles['badge']}>
                        <div className={styles['title']}>{lang['Need_To_Have_Badge']}</div>
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

            {!!StipePayment && !!cryptoChains.length &&
                <div className={styles['payment-tab']}>
                    <div onClick={switchToCrypto}
                         className={currChain?.id !== 'stripe' ? styles['active'] : ''}>
                        {lang['Crypto']}
                    </div>
                    <div onClick={switchToStripe}
                         className={currChain?.id === 'stripe' ? styles['active'] : ''}>{lang['Credit_Debit_Card']}
                    </div>
                </div>
            }

            {!!props.ticket.payment_methods.length && !!currPaymentMethod &&
                <>
                    {currChain?.id !== 'stripe' &&
                        <>
                            <div className={styles['price']}>
                                <div className={styles['label']}>{lang['Main_Chain']}</div>
                            </div>
                            <div className={styles['select-bar']}>
                                <div className={styles['select']}>
                                    <Select
                                        disabled={busy}
                                        value={[currChain] as any}
                                        options={cryptoChains}
                                        clearable={false}
                                        searchable={false}

                                        getValueLabel={() => {
                                            return <div className={styles['payment-label']}>
                                                <div className={styles['icon']}>
                                                    <img className={styles['token']} src={currChain!.icon}
                                                         alt=""/>
                                                </div>
                                                <span> {currChain?.chain}</span>
                                            </div>
                                        }}

                                        getOptionLabel={({option}: any) => {
                                            return <div className={styles['payment-label']}>
                                                <div className={styles['icon']}>
                                                    <img className={styles['token']} src={option!.icon}
                                                         alt=""/>
                                                </div>
                                                <span> {option?.chain}</span>
                                            </div>
                                        }}

                                        onChange={({option}: any) => {
                                            setCurrChain(option)
                                            setCurrToken(getTokenOptions(option)[0])
                                        }}
                                    />
                                </div>

                                <div className={`${styles['select']} ${styles['select-token']}`}>
                                    <Select
                                        disabled={busy}
                                        value={[currToken] as any}
                                        options={getTokenOptions(currChain!)}
                                        clearable={false}
                                        searchable={false}

                                        getValueLabel={() => {
                                            return <div className={styles['payment-label']}>
                                                <div className={styles['icon']}>
                                                    <img className={styles['token']} src={currToken!.icon}
                                                         alt=""/>
                                                </div>
                                                <span> {currToken!.id.toUpperCase()}</span>
                                            </div>
                                        }}

                                        getOptionLabel={({option}: any) => {
                                            return <div className={styles['payment-label']}>
                                                <div className={styles['icon']}>
                                                    <img className={styles['token']} src={option!.icon}
                                                         alt=""/>
                                                </div>
                                                <span> {option!.id.toUpperCase()}</span>
                                            </div>
                                        }}

                                        onChange={({option}: any) => {
                                            setCurrToken(option)
                                        }}
                                    />
                                </div>
                            </div>
                        </>
                    }

                    {currPaymentMethod.chain !== 'stripe' &&
                        <div className={styles['split']}/>
                    }
                    <div className={styles['payment-title']}>{lang['Payment']}</div>
                    {finalPaymentPrice === currPaymentMethod?.price ?
                        <div className={styles['balance']}>
                            <div className={styles['label']}>{lang['Total']}</div>
                            <div
                                className={styles['total']}>{finalPaymentPrice / (10 ** (currToken?.decimals || 0))} {currToken?.name} </div>
                        </div> :
                        <>
                            <div className={styles['balance']}>
                                <div className={styles['label']}>{lang['Original_Price']}</div>
                                <div>{Number(currPaymentMethod!.price || '0') / (10 ** (currToken?.decimals || 0))} {currToken?.name}</div>
                            </div>
                            <div className={styles['balance']}>
                                <div className={styles['label']}></div>
                                <div>-{paymentDiscount / (10 ** (currToken?.decimals || 0))} {currToken?.name}</div>
                            </div>
                            <div className={styles['balance']}>
                                <div className={styles['label']}>{lang['Final_Price']}</div>
                                <div
                                    className={styles['total']}>{finalPaymentPrice / (10 ** (currToken?.decimals || 0))} {currToken?.name}</div>
                            </div>
                        </>
                    }

                    <div className={styles['balance']}>
                        {
                            currPaymentMethod?.chain !== 'stripe'
                            && currPaymentMethod?.chain !== 'daimo'
                            && !!currToken && !!currChain &&
                            <>
                                <div className={styles['label']}>{lang['Balance']}</div>
                                <div className={styles['value']}>
                                    <img style={{width: '18px', height: '18px', borderRadius: '50%'}}
                                         src={currToken.icon} alt=""/>
                                    {
                                        !!address ? <Erc20Balance
                                                onChange={(balance) => {
                                                    console.log('set balance', balance)
                                                    setBalance(balance)
                                                }}
                                                chanId={currChain!.chainId}
                                                account={address}
                                                token={currToken!.contract}
                                                decimals={currToken!.decimals}/>
                                            : '--'
                                    }
                                    <span>{currToken.name.toUpperCase()}</span>
                                </div>
                            </>
                        }
                    </div>

                    {currPaymentMethod?.chain !== 'stripe' &&
                        <div style={{color: '#7B7C7B', marginBottom: '12px'}}>{lang['Payments_Will_Be_Sent_To']} <span
                            style={{color: '#272928'}}>
                        {shotAddress(currPaymentMethod?.receiver_address || '')}
                    </span>
                        </div>
                    }
                </>
            }

            {!!props.ticket.payment_methods.length && !soldOut && !stopSales &&
                <div className={styles['promo']}>
                    <div className={styles['promo-title']} onClick={e => {
                        setShowCouponInput(true)
                    }}>
                        {lang['Promo_Code']}
                        {!showCouponInput ? <TriangleDown size={18}/> : null}
                    </div>
                    {showCouponInput &&
                        <>
                            <div className={styles['promo-input']}>
                                <AppInput value={coupon}
                                          onChange={e => {
                                              setCoupon(e.target.value)
                                          }}
                                          placeholder={'Promo code'}/>
                                {!!coupon && !validCoupon &&
                                    <AppButton black onClick={checkCoupon}>{lang['Apply']}</AppButton>
                                }
                                {
                                    !!validCoupon &&
                                    <AppButton onClick={removeCoupon}>{lang['Remove']}</AppButton>
                                }
                            </div>
                            <div className={styles['errorMsg']}>{couponError}</div>
                        </>
                    }
                </div>
            }


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
                && !!cryptoChains.length
                && currPaymentMethod?.chain !== 'stripe'
                && currPaymentMethod?.chain !== 'daimo' &&
                <AppButton special onClick={e => {
                    connectWallet()
                }}>{'Connect Wallet'}</AppButton>
            }


            {!!address
                && !!cryptoChains.length
                && !!currPaymentMethod
                && !stopSales
                && !soldOut
                && !!user.id
                && hasBadgePermission
                && currPaymentMethod?.chain !== 'stripe'
                && currPaymentMethod?.chain !== 'daimo'
                && (approved || finalPaymentPrice === 0) &&
                <Erc20TokenPaymentHandler
                    isGroupTicket={props.ticket.ticket_type === 'group'}
                    coupon={validCoupon?.code || undefined}
                    eventId={props.event.id}
                    methodId={currPaymentMethod.id!}
                    ticketId={props.ticket.id}
                    token={currToken!.contract}
                    to={currPaymentMethod.receiver_address!}
                    amount={finalPaymentPrice.toString() || '0'}
                    decimals={currToken!.decimals}
                    chainId={currChain!.chainId}
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
                                setValidCoupon(null)
                                setCoupon('')
                                reFleshAllowanceRef.current && reFleshAllowanceRef.current.reFleshAllowance()
                            }
                            }>{lang['Retry']}</AppButton>
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
                                        lang['Pay']
                            }</AppButton>
                    }}
                />
            }

            {!!address
                && !!cryptoChains.length
                && !!currPaymentMethod
                && !approved
                && !soldOut
                && !stopSales
                && !!user.id
                && finalPaymentPrice !== 0
                && hasBadgePermission
                && currPaymentMethod?.chain !== 'stripe'
                && currPaymentMethod?.chain !== 'daimo' &&
                <Erc20TokenApproveHandler
                    ref={reFleshAllowanceRef}
                    token={currToken!.contract}
                    amount={finalPaymentPrice.toString() || '0'}
                    decimals={currToken!.decimals}
                    chainId={currChain!.chainId}
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

            {
                !!user.id
                && currPaymentMethod?.chain === 'stripe'
                && !soldOut
                && !stopSales
                && <AppButton special onClick={e => {
                    router.push(`/stripe-pay?ticket=${props.ticket.id}&methodid=${currPaymentMethod!.id}${validCoupon?.code ? `&coupon=${validCoupon.code}` : ''}`)
                    props.close()
                }}>{lang['Pay_By_Card']}</AppButton>
            }

            {
                !!user.id
                && currPaymentMethod?.chain === 'daimo'
                && !soldOut
                && !stopSales
                && <div>
                    <AppButton special style={{marginBottom: '12px'}} onClick={() => {
                        handleDaimoPayment()
                    }}>{'Pay'}</AppButton>

                    <AppButton onClick={() => {
                        handleDaimoPayment(true)
                    }}>{'Copy payment link'}</AppButton>
                </div>
            }

            {!!user.id && !props.ticket.payment_methods.length && hasBadgePermission && !stopSales && !soldOut &&
                <AppButton special onClick={e => {
                    freePay()
                }}>{lang['Get_A_Ticket']}</AppButton>
            }
        </div>
    </div>)
}

export default DialogTicket
