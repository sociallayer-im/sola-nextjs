import {useContext, useEffect, useState} from 'react'
import styles from './DialogTicket.module.scss'
import LangContext from "@/components/provider/LangProvider/LangContext";
import useCopy from "@/hooks/copy";
import AppButton from "@/components/base/AppButton/AppButton";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import DialogConnectWalletForPay from "@/components/base/Dialog/DialogConnectWalletForPay/DialogConnectWalletForPay";
import {useAccount, useWriteContract} from "wagmi";

function DialogTicket(props: { close: () => any }) {
    const {lang} = useContext(LangContext)
    const {copyWithDialog} = useCopy()
    const {openDialog} = useContext(DialogsContext)
    const {address} = useAccount()

    const { data: hash, writeContract } = useWriteContract()

    useEffect(() => {

    }, [])

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
            {/*<EventDefaultCover width={53} height={74} event={{
                id: 1,
                title: 'Event Title',
                cover: 'https://ik.imagekit.io/soladata/0gwjdhtx_2D4ss0TJB?tr=w-300',
                startTime: '2021-08-01 12:00:00',
                endTime: '2021-08-01 12:00:00',
                location: 'Event Location',
                description: 'Event Description',
                formatted_address: 'Event Address',
            } as any}/>*/}
            <img className={styles['cover']} src="https://ik.imagekit.io/soladata/0gwjdhtx_2D4ss0TJB?tr=w-300" alt=""/>
            <div className={styles['info']}>
                <div className={styles['title']}>Event Title Event Title Event Title Event Title Event Title</div>
                <div className={styles['time']}>2021-08-01 12:00:00</div>
                <div className={styles['location']}>Event Location</div>
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

        {!address &&
            <AppButton special onClick={e => {connectWallet()}}>{'Connect Wallet'}</AppButton>

        }

        {address &&
            <AppButton special onClick={e => {connectWallet()}}>{'Pay'}</AppButton>
        }

    </div>)
}

export default DialogTicket
