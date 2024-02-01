import {useContext, useState} from 'react'
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
import {Event, joinEvent, Ticket} from '@/service/solas'
import useTime from "@/hooks/formatTime";
import {paymentTokenList} from "@/payment_settring";
import UserContext from "@/components/provider/UserProvider/UserContext";
import useEvent, {EVENT} from "@/hooks/globalEvent";
import {formatUnits} from "viem/utils";


function DialogTicket(props: { close: () => any, event: Event, ticket: Ticket }) {
    const {lang} = useContext(LangContext)
    const {user} = useContext(UserContext)
    const {copyWithDialog} = useCopy()
    const {openDialog, showToast, showLoading} = useContext(DialogsContext)
    const [errorMsg, setErrorMsg] = useState('')
    const [approved, setApproved] = useState(false)
    const [_, emit] = useEvent(EVENT.participantUpdate)

    const {address} = useAccount()
    const formatTime = useTime()

    console.log('ticket====', props.ticket)

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

    const handleJoin = async () => {
        return await joinEvent(
            {
                id: props.event.id,
                auth_token: user.authToken || '',
                ticket_id: props.ticket.id,
            }
        )
    }

    const chain = props.ticket.payment_chain ? paymentTokenList.find(item => item.id === props.ticket.payment_chain) : undefined

    let token = !!chain ?
        chain.tokenList.find(item => item.id === props.ticket.payment_token_name) : undefined

    return (<div className={styles['dialog-ticket']}>
        <div className={styles['dialog-title']}>
            <div></div>
            <svg
                onClick={props.close}
                className={styles['close']} xmlns="http://www.w3.org/2000/svg" width="14" height="15"
                viewBox="0 0 14 15" fill="none">
                <rect x="0.93335" y="0.311127" width="18.479" height="1.31993" rx="0.659966"
                      transform="rotate(45 0.93335 0.311127)" fill="#7B7C7B"/>
                <rect x="14" y="0.933319" width="18.479" height="1.31993" rx="0.659966"
                      transform="rotate(135 14 0.933319)" fill="#7B7C7B"/>
            </svg>
        </div>
        <div className={styles['dialog-title']}>
            <div>{'Event'}</div>
        </div>

        <div className={styles['dialog-event']}>
            {
                props.event.cover_url ?
                    <img className={styles['cover']} src={props.event.cover_url} alt="" />
                    : <EventDefaultCover width={53} height={74} event={props.event} />

            }
            <div className={styles['info']}>
                <div className={styles['title']}>{props.event.title}</div>
                <div className={styles['time']}>{formatTime(props.event.start_time!)}</div>
                <div className={styles['location']}>{props.event.location}</div>
            </div>
        </div>
        <div className={styles['type-name-title']}>Ticket type</div>
        <div className={styles['type-name']}>{props.ticket.title}</div>

        { props.ticket.payment_target_address &&
            <div className={styles['receiver']}>
                <div className={styles['receiver-des']}>Payments will be sent to</div>
                <div className={styles['address']}>
                    <div className={styles['left']}>
                        {
                            chain &&
                            <img src={chain.icon} alt=""/>
                        }
                        <div>{shotAddress(props.ticket.payment_target_address)}</div>
                    </div>
                    <div className={styles['copy']}
                         onClick={e => {
                             copyWithDialog(props.ticket.payment_target_address!)
                         }}>
                        {lang['Profile_Show_Copy']}
                    </div>
                </div>
            </div>
        }

        { props.ticket.payment_token_price !== null && !!token && !!chain &&
            <>
                <div className={styles['payment-title']}>Payment</div>
                <div className={styles['price']}>
                    <div className={styles['label']}>Price</div>
                    <div className={styles['value']}>{formatUnits(BigInt(props.ticket.payment_token_price),token.decimals!)} {props.ticket.payment_token_name?.toUpperCase()}</div>
                </div>
                <div className={styles['balance']}>
                    <div className={styles['label']}>Balance</div>
                    <div className={styles['value']}>
                        {
                        !!address ? <Erc20Balance
                                chanId={chain.chainId}
                                account={address}
                                token={props.ticket.payment_token_address!}
                                decimals={token.decimals}/>
                            : '--'
                    }
                        <span>{props.ticket.payment_token_name?.toUpperCase()}</span>
                    </div>
                </div>
            </>
        }

        {errorMsg &&
            <div className={styles['error-msg']}>{errorMsg}</div>
        }


        {!address &&
            <AppButton special onClick={e => {
                connectWallet()
            }}>{'Connect Wallet'}</AppButton>
        }


        {!!address && !!token && !!chain && approved &&
            <Erc20TokenPaymentHandler
                eventId={props.event.id}
                ticketId={props.ticket.id}
                token={props.ticket.payment_token_address!}
                to={props.ticket.payment_target_address!}
                amount={props.ticket.payment_token_price?.toString() || '0'}
                decimals={token.decimals}
                chainId={chain.chainId}
                onErrMsg={(errMsg: string) => {
                    emit('payment-error')
                    setErrorMsg(errMsg)
                }}
                onSuccess={(txHash: string) => {
                    emit('payment-success')
                    showToast('Payment successful')
                    props.close()
                }}
                content={(trigger, busy) => <AppButton
                    disabled={busy || !!errorMsg}
                    special={!busy && !errorMsg}
                    onClick={ async (e) => {
                        const loading = showLoading()
                        const participant = await handleJoin()
                        loading()
                        setErrorMsg('')
                        trigger?.(participant.id)
                    }}>{'Pay'}</AppButton>}
            />
        }

        {!!address && !!token && !!chain && !approved &&
            <Erc20TokenApproveHandler
                token={props.ticket.payment_token_address!}
                to={props.ticket.payment_target_address!}
                amount={props.ticket.payment_token_price?.toString() || '0'}
                decimals={token.decimals}
                chainId={chain.chainId}
                onErrMsg={(errMsg: string) => {
                    setErrorMsg(errMsg)
                }}
                onSuccess={(txHash: string) => {
                   setApproved(true)
                }}
                content={(trigger, busy) => <AppButton
                    disabled={busy || !!errorMsg}
                    special={!busy && !errorMsg}
                    onClick={async (e) => {
                        setErrorMsg('')
                        trigger?.()
                    }}>{'Approve'}</AppButton>}
            />
        }
    </div>)
}

export default DialogTicket
