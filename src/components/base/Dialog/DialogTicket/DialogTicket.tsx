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
import {Badge, Event, getParticipantDetail, joinEvent, queryBadgeDetail, queryBadgelet, Ticket} from '@/service/solas'
import useTime from "@/hooks/formatTime";
import {paymentTokenList} from "@/payment_settring";
import UserContext from "@/components/provider/UserProvider/UserContext";
import useEvent, {EVENT} from "@/hooks/globalEvent";
import ButtonLoading from "@/components/base/ButtonLoading";
import {Select} from "baseui/select";
import {index} from "@zxing/text-encoding/es2015/encoding/indexes";


function DialogTicket(props: { close: () => any, event: Event, ticket: Ticket }) {
    const {lang} = useContext(LangContext)
    const {user} = useContext(UserContext)
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

    const [busy, setBusy] = useState(true)
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
        if (props.ticket.payment_metadata!.length === 0) return []
        return props.ticket.payment_metadata!.map((payment, index) => {
            const chain = paymentTokenList.find((chain) => chain.id === payment.payment_chain)

            let token: any = undefined
            if (!!chain) {
                token = chain.tokenList.find((t: any) => t.id === payment.payment_token_name)
            }

            return {
                chain,
                token,
                payment,
                index,
                label: `${Number(payment.payment_token_price) / 10 ** (token?.decimals || 0)} ${payment.payment_token_name}`
            }
        })
    }, [props.ticket])

    useEffect(() => {
        if (user.id) {
            getParticipantDetail({profile_id: user.id, ticket_id: props.ticket.id}).then((res) => {
                if (!res) {
                    setApproved(false)
                    return
                }

                if (!res.payment_data) {
                    setApproved(true)
                } else {
                    if (res.payment_data.startsWith('0x')) {
                        setApproved(true)
                    } else {
                        const paymentData = JSON.parse(res.payment_data)
                        const targetPaymentIndex = payments.findIndex((item) => {

                            return  item.chain!.chainId === paymentData.chain_id &&
                                    item.token.contract === paymentData.token &&
                                    item.payment.payment_token_price === paymentData.amount
                        })

                        if (targetPaymentIndex !== -1) {
                            setPaymentIndex(targetPaymentIndex)
                        }
                    }
                }
            })
        }
    }, [user.id, payments])

    useEffect(() => {
        setApproved(false)
        setErrorMsg('')
    }, [paymentIndex])

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
            const join = await joinEvent(
                {
                    id: props.event.id,
                    auth_token: user.authToken || '',
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
        if (payments.length && !!balance && !busy && Number(balance) < Number(payments[paymentIndex].payment.payment_token_price)) {
            setErrorMsg('Insufficient balance')
        }
    }, [balance, busy, payments])

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
                        value={[props.ticket.payment_metadata[paymentIndex]] as any}
                        options={payments as any}
                        clearable={false}
                        searchable={false}

                        getValueLabel={() => {
                            return <div className={styles['payment-label']}>
                                <img src={payments![paymentIndex]!.chain!.icon} alt=""/>
                               <span> {Number(props.ticket.payment_metadata[paymentIndex]!.payment_token_price || '0') / (10**payments![paymentIndex]!.token!.decimals || 0)}</span>
                               <span>{payments[paymentIndex]!.token.name.toUpperCase()}</span>
                            </div>
                        }}

                        getOptionLabel={({option}: any) => {
                            return <div className={styles['payment-label']}>
                                <img src={option.chain.icon} alt=""/>
                                {option.payment.payment_token_price / 10 ** (option.token.decimals)} {option.payment.payment_token_name.toUpperCase()}
                            </div>
                        }}

                        onChange={({option} : any) => {
                            setPaymentIndex(option.index as any)
                        }}
                    />
                </div>

                <div className={styles['receiver']}>
                    <div className={styles['receiver-des']}>Payments will be sent to</div>
                    <div className={styles['address']}>
                        <div className={styles['left']}>
                            {
                                payments[paymentIndex].chain &&
                                <img src={payments![paymentIndex!].chain!.icon} alt=""/>
                            }
                            <div>{shotAddress(props.ticket.payment_metadata[paymentIndex].payment_target_address!)}</div>
                        </div>
                        <div className={styles['copy']}
                             onClick={e => {
                                 copyWithDialog(props.ticket.payment_metadata[paymentIndex].payment_target_address!)
                             }}>
                            {lang['Profile_Show_Copy']}
                        </div>
                    </div>
                </div>

                <div className={styles['balance']}>
                    <div className={styles['label']}>Balance</div>
                    <div className={styles['value']}>
                        {
                            !!address ? <Erc20Balance
                                    onChange={(balance) => {
                                        console.log('balancebalancebalance', balance)
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
            && !!payments.length &&
            <AppButton special onClick={e => {
                connectWallet()
            }}>{'Connect Wallet'}</AppButton>
        }


        {!!address
            && !!payments.length
            && approved
            && !stopSales
            && !soldOut
            && !!user.id
            && hasBadgePermission &&
            <Erc20TokenPaymentHandler
                eventId={props.event.id}
                ticketId={props.ticket.id}
                token={payments![paymentIndex]!.token!.contract}
                to={props.ticket.payment_metadata[paymentIndex]!.payment_target_address!}
                amount={props.ticket.payment_metadata[paymentIndex]!.payment_token_price?.toString() || '0'}
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
                    setTimeout(() => {setBusy(busy || verifying)}, 100)
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
            && hasBadgePermission &&
            <Erc20TokenApproveHandler
                ref={reFleshAllowanceRef}
                token={payments![paymentIndex]!.token!.contract}
                to={props.ticket.payment_metadata[paymentIndex]!.payment_target_address!}
                amount={props.ticket.payment_metadata[paymentIndex]!.payment_token_price?.toString() || '0'}
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
