import {useContext, useState} from 'react'
import styles from './DialogTicket.module.scss'
import LangContext from "@/components/provider/LangProvider/LangContext";
import useCopy from "@/hooks/copy";
import AppButton from "@/components/base/AppButton/AppButton";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import DialogConnectWalletForPay from "@/components/base/Dialog/DialogConnectWalletForPay/DialogConnectWalletForPay";
import {useAccount} from "wagmi";
import Erc20TokenPaymentHandler from "@/components/base/Erc20TokenPaymentHandler/Erc20TokenPaymentHandler";
import Erc20Balance from "@/components/base/Erc20Balance/Erc20Balance";
import EventDefaultCover from "@/components/base/EventDefaultCover";
import {Event} from '@/service/solas'
import useTime from "@/hooks/formatTime";

function DialogTicket(props: { close: () => any, event: Event }) {
    const {lang} = useContext(LangContext)
    const {copyWithDialog} = useCopy()
    const {openDialog, showToast} = useContext(DialogsContext)
    const [errorMsg, setErrorMsg] = useState('')

    const {address} = useAccount()
    const formatTime = useTime()

    const connectWallet = () => {
        openDialog({
            content: (close) => <DialogConnectWalletForPay handleClose={close}/>,
            size: [360, 'auto']
        })
    }

    const shotAddress = (address: string) => {
        const len = address.length
        return address.slice(0, 6) + '...' + address.slice(len - 6, len)
    }

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
        <div className={styles['type-name']}>Ticket type</div>

        <div className={styles['receiver']}>
            <div className={styles['receiver-des']}>Payments will be sent to</div>
            <div className={styles['address']}>
                <div className={styles['left']}>
                    <img src="/images/ethereum-icon.webp" alt=""/>
                    <div>{shotAddress('0x1234567890123456789012345678901234567890')}</div>
                </div>
                <div className={styles['copy']}
                     onClick={e => {
                         copyWithDialog('0x1234567890123456789012345678901234567890')
                     }}>
                    {lang['Profile_Show_Copy']}
                </div>
            </div>
        </div>

        <div className={styles['payment-title']}>Payment</div>
        <div className={styles['price']}>
            <div className={styles['label']}>Total</div>
            <div className={styles['value']}>10 USDT</div>
        </div>
        <div className={styles['balance']}>
            <div className={styles['label']}>Balance<span>USDT</span></div>
            <div className={styles['value']}>{
                !!address ? <Erc20Balance
                        chanId={43113}
                        account={address}
                        token={"0x70c34957154355a0bF048073eb1d4b7895359743"}
                        decimals={6}/>
                    : '--'
            }  </div>
        </div>

        {errorMsg &&
            <div className={styles['error-msg']}>{errorMsg}</div>
        }


        {!address &&
            <AppButton special onClick={e => {
                connectWallet()
            }}>{'Connect Wallet'}</AppButton>
        }

        {!!address &&
            <Erc20TokenPaymentHandler
                token={"0x70c34957154355a0bF048073eb1d4b7895359743"}
                to={"0xD21dAFbEbE121634a413AB53772CD17Bf0085976"}
                amount={'1'}
                decimals={6}
                chainId={43113}
                onErrMsg={(errMsg: string) => {
                    setErrorMsg(errMsg)
                }}
                onSuccess={(txHash: string) => {
                    showToast('Payment successful')
                    props.close()
                }}
                content={(trigger, busy) => <AppButton
                    disabled={busy || !!errorMsg}
                    special={!busy && !errorMsg}
                    onClick={e => {
                        setErrorMsg('')
                        trigger?.()
                    }}>{'Pay'}</AppButton>}
            />
        }
    </div>)
}

export default DialogTicket
