import {forwardRef, useContext, useEffect, useImperativeHandle, useMemo, useState} from 'react'
import styles from './TicketSetting.module.scss'
import LangContext from "@/components/provider/LangProvider/LangContext";
import AppInput from "@/components/base/AppInput";
import AppRadio from "@/components/base/AppRadio/AppRadio";
import {Select} from "baseui/select";
import AppButton from "@/components/base/AppButton/AppButton";
import {Badge, getParticipantDetail, Group, Profile, queryBadge, queryBadgeDetail, Ticket} from "@/service/solas";
import DialogIssuePrefill from "@/components/eventSpecial/DialogIssuePrefill/DialogIssuePrefill";
import {OpenDialogProps} from "@/components/provider/DialogProvider/DialogProvider";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import {Delete} from "baseui/icon";
import {paymentTokenList} from '@/payment_settring'
import {formatUnits, parseUnits} from "viem/utils";
import {Datepicker} from "baseui/datepicker";
import {TimePicker} from 'baseui/timepicker';

const emptyTicket: Partial<Ticket> = {
    title: '',
    content: '',
    check_badge_class_id: null,
    payment_metadata: [],
    quantity: null,
    end_time: null,
}

interface ErrorMsg {
    index: number,
    title: boolean,
    payment_target_address: number[],
}

function Ticket({creator, ...props}: {
    ticket: Partial<Ticket>,
    creator: Group | Profile,
    index?: number,
    errorMsg?: ErrorMsg[]
    onChange?: (ticket: Partial<Ticket>) => any
    onDelete?: (ticket: Partial<Ticket>) => any
})
{
    const {lang} = useContext(LangContext)
    const {openDialog, showLoading} = useContext(DialogsContext)

    const [badges, setBadges] = useState<Badge[]>([])
    const [badgeDetail, setBadgeDetail] = useState<Badge | null>(null)

    const errMsg = useMemo(() => {
        if (!props.errorMsg) return null
        return props.errorMsg.find((msg) => msg.index === props.index) || null
    }, [props.errorMsg])

    const handleChangePayment = (payment: any, index: number) => {
        const newPayments = [...props.ticket.payment_metadata!]
        newPayments[index] = payment
        props.onChange && props.onChange({
            ...props.ticket,
            payment_metadata: newPayments
        })
    }

    const addPayment = () => {
        props.onChange && props.onChange({
            ...props.ticket,
            payment_metadata: [ ...props.ticket.payment_metadata!, {
                payment_chain: paymentTokenList[0].id,
                payment_token_name: paymentTokenList[0].tokenList[0].id,
                payment_token_price: 0,
                payment_token_address: paymentTokenList[0].tokenList[0].contract,
            }] as any
        })
    }

    const removePayment = (index: number) => {
        const newPayments = [...props.ticket.payment_metadata!]
        newPayments.splice(index, 1)
        props.onChange && props.onChange({
            ...props.ticket,
            payment_metadata: newPayments
        })
    }

    useEffect(() => {
        if (props.ticket.check_badge_class_id && badges.length > 0) {
            setBadgeDetail(badges.find((badge) => badge.id === props.ticket.check_badge_class_id) || null)
        } else if (props.ticket.check_badge_class_id) {
            queryBadgeDetail({id: props.ticket.check_badge_class_id}).then((res) => {
                if (res) {
                    setBadgeDetail(res)
                }
            })
        } else {
            setBadgeDetail(null)
        }
    }, [props.ticket.check_badge_class_id])

    useEffect(() => {
        document.querySelectorAll('.ticket-payment input').forEach((input) => {
            input.setAttribute('readonly', 'readonly')
        })
    }, [])


    const showBadges = async () => {
        const queryProp = !!(creator as Group)?.creator ? {
                group_id: creator!.id,
                page: 1
            } :
            {
                sender_id: creator!.id,
                page: 1
            }

        const unload = showLoading()
        const badges = (await queryBadge(queryProp)).data
        setBadges(badges)
        unload()

        openDialog({
            content: (close: any) => <DialogIssuePrefill
                badges={badges}
                profileId={creator.id!}
                onSelect={(res) => {
                    if (res.badgeId) {
                        props.onChange && props.onChange({
                            ...props.ticket,
                            check_badge_class_id: res.badgeId
                        })
                    }
                }}
                handleClose={close}/>,
            position: 'bottom',
            size: [360, 'auto']
        } as OpenDialogProps)
    }

    const payments = useMemo(() => {
        if (props.ticket.payment_metadata!.length === 0) return []
        return props.ticket.payment_metadata!.map(payment => {
            const chain = paymentTokenList.find((chain) => chain.id === payment.payment_chain)

            let token: any = undefined
            if (!!chain) {
                token = chain.tokenList.find((t: any) => t.id === payment.payment_token_name)
            }

            return {
                chain,
                token
            }
        })
    }, [props.ticket])

    // console.log(`ticket: ${(props.index || 0) + 1}`, props.ticket)
    // console.log(`token: ${(props.index || 0) + 1}`, token)
    // console.log(`payments: ${(props.index || 0) + 1}`, payments)

    return (<div className={styles['ticket-form']}>
        <div className={styles['title']}>
            <div className={styles['left']}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                        d="M9 10C8.73478 10 8.48043 10.1054 8.29289 10.2929C8.10536 10.4804 8 10.7348 8 11V13C8 13.2652 8.10536 13.5196 8.29289 13.7071C8.48043 13.8946 8.73478 14 9 14C9.26522 14 9.51957 13.8946 9.70711 13.7071C9.89464 13.5196 10 13.2652 10 13V11C10 10.7348 9.89464 10.4804 9.70711 10.2929C9.51957 10.1054 9.26522 10 9 10ZM21 11C21.2652 11 21.5196 10.8946 21.7071 10.7071C21.8946 10.5196 22 10.2652 22 10V6C22 5.73478 21.8946 5.48043 21.7071 5.29289C21.5196 5.10536 21.2652 5 21 5H3C2.73478 5 2.48043 5.10536 2.29289 5.29289C2.10536 5.48043 2 5.73478 2 6V10C2 10.2652 2.10536 10.5196 2.29289 10.7071C2.48043 10.8946 2.73478 11 3 11C3.26522 11 3.51957 11.1054 3.70711 11.2929C3.89464 11.4804 4 11.7348 4 12C4 12.2652 3.89464 12.5196 3.70711 12.7071C3.51957 12.8946 3.26522 13 3 13C2.73478 13 2.48043 13.1054 2.29289 13.2929C2.10536 13.4804 2 13.7348 2 14V18C2 18.2652 2.10536 18.5196 2.29289 18.7071C2.48043 18.8946 2.73478 19 3 19H21C21.2652 19 21.5196 18.8946 21.7071 18.7071C21.8946 18.5196 22 18.2652 22 18V14C22 13.7348 21.8946 13.4804 21.7071 13.2929C21.5196 13.1054 21.2652 13 21 13C20.7348 13 20.4804 12.8946 20.2929 12.7071C20.1054 12.5196 20 12.2652 20 12C20 11.7348 20.1054 11.4804 20.2929 11.2929C20.4804 11.1054 20.7348 11 21 11ZM20 9.18C19.4208 9.3902 18.9205 9.77363 18.5668 10.2782C18.2132 10.7827 18.0235 11.3839 18.0235 12C18.0235 12.6161 18.2132 13.2173 18.5668 13.7218C18.9205 14.2264 19.4208 14.6098 20 14.82V17H10C10 16.7348 9.89464 16.4804 9.70711 16.2929C9.51957 16.1054 9.26522 16 9 16C8.73478 16 8.48043 16.1054 8.29289 16.2929C8.10536 16.4804 8 16.7348 8 17H4V14.82C4.57915 14.6098 5.07954 14.2264 5.43316 13.7218C5.78678 13.2173 5.97648 12.6161 5.97648 12C5.97648 11.3839 5.78678 10.7827 5.43316 10.2782C5.07954 9.77363 4.57915 9.3902 4 9.18V7H8C8 7.26522 8.10536 7.51957 8.29289 7.70711C8.48043 7.89464 8.73478 8 9 8C9.26522 8 9.51957 7.89464 9.70711 7.70711C9.89464 7.51957 10 7.26522 10 7H20V9.18Z"
                        fill="#272928"/>
                </svg>
                {`${lang['Ticket']} ${props.index !== undefined ? props.index + 1 : ''}`}
            </div>

            <svg className={styles['delete']}
                 onClick={() => props.onDelete && props.onDelete(props.ticket)}
                 xmlns="http://www.w3.org/2000/svg" width="14" height="15"
                 viewBox="0 0 14 15" fill="none">
                <rect x="0.93335" y="0.311035" width="18.479" height="1.31993" rx="0.659966"
                      transform="rotate(45 0.93335 0.311035)" fill="#272928"/>
                <rect x="14" y="0.93335" width="18.479" height="1.31993" rx="0.659966"
                      transform="rotate(135 14 0.93335)" fill="#272928"/>
            </svg>
        </div>

        <div className={styles['item-title']}>{lang['Name_Of_Tickets']}</div>
        <AppInput value={props.ticket.title || ''}
                  onChange={(e) => {
                      props.onChange && props.onChange({
                          ...props.ticket,
                          title: e.target.value
                      })
                  }}
                  placeholder={lang['Name_Of_Tickets']}/>
        {errMsg?.title && <div className={styles['error-msg']}>{'Please input ticket name'}</div>}

        <div className={styles['item-title']}>{lang['Ticket_Description']}</div>
        <AppInput value={props.ticket.content || ''}
                  onChange={(e) => {
                      props.onChange && props.onChange({
                          ...props.ticket,
                          content: e.target.value
                      })
                  }}
                  placeholder={lang['Ticket_Description']}/>

        <div className={styles['item-title-inline']}>
            <div className={styles['label']}> {lang['Price']}</div>

            <div className={styles['value']}>
                <div className={styles['ticket-type']} onClick={e => {
                    props.onChange && props.onChange({
                        ...props.ticket,
                        payment_metadata: []
                    })
                }}>
                    <AppRadio checked={props.ticket.payment_metadata?.length === 0}/>
                    {'Free'}
                </div>
                <div className={styles['ticket-type']}
                     onClick={e => {
                         props.onChange && props.onChange({
                             ...props.ticket,
                             payment_metadata: [{
                                 payment_token_price: "0",
                                 payment_chain: paymentTokenList[0].id,
                                 payment_token_name: paymentTokenList[0].tokenList[0].id,
                                 payment_token_address: paymentTokenList[0].tokenList[0].contract,
                             }] as any
                         })
                     }}>
                    <AppRadio checked={props.ticket.payment_metadata?.length !== 0}/>
                    {'Payment'}
                </div>
            </div>
        </div>

        {props.ticket.payment_metadata!.length > 0 && props.ticket.payment_metadata!.map((payment, index) => {
            return <div className={styles['payment-list-item']} key={index}>
                <div>
                    <div className={styles['item-title-inline']} style={{marginTop: '8px'}}>
                        <div className={styles['value']} style={{flex: 1}}>
                            <div className={styles['label']}>{lang['Price']}</div>
                            <div className={`${styles['ticket-payment']} ticket-payment`}>
                                <Select
                                    getOptionLabel={(option) => {
                                        return <span>{(option.option as any).chain}</span>
                                    }}
                                    getValueLabel={(option) => {
                                        return <span>{(option.option as any).chain}</span>
                                    }}
                                    value={[payments[index].chain] as any}
                                    clearable={false}
                                    searchable={false}
                                    options={paymentTokenList}
                                    onChange={(params) => {
                                        handleChangePayment({
                                            ...payment,
                                            payment_chain: (params.option as any).id,
                                            payment_token_name: (params.option as any).tokenList[0].id,
                                            payment_token_address: (params.option as any).tokenList[0].contract,
                                        }, index)
                                    }}
                                />

                                <Select
                                    getOptionLabel={(option) => {
                                        return <span>{(option.option as any).name}</span>
                                    }}
                                    getValueLabel={(option) => {
                                        return <span>{(option.option as any).name}</span>
                                    }}
                                    value={[payments![index]!.token!] as any}
                                    clearable={false}
                                    searchable={false}
                                    options={payments![index]!.chain!.tokenList as any}
                                    onChange={(params) => {
                                        handleChangePayment({
                                            ...payment,
                                            payment_token_name: (params.option as any).id,
                                            payment_token_address: (params.option as any).contract,
                                        }, index)
                                    }}
                                />
                            </div>
                            <div className={styles['width-limit-3']} style={{flex: 1}}>
                                <AppInput
                                    type={'number'}
                                    placeholder={lang['Price']}
                                    onChange={e => {
                                        if (Number(e.target.value) < 0) {
                                            return
                                        }
                                        handleChangePayment({
                                            ...payment,
                                            payment_token_price: parseUnits(e.target.value, payments[index].token.decimals!).toString()
                                        }, index)
                                    }}
                                    value={formatUnits(BigInt(payment.payment_token_price || 0), payments[index].token.decimals!)}/>
                            </div>
                        </div>
                    </div>

                    <div className={styles['item-title-inline']} style={{marginTop: '8px'}}>

                        <div className={styles['value']} style={{flex: 1}}>
                            <div className={styles['label']}>{lang['Receiving_Wallet_Address']}</div>
                            <AppInput
                                value={payment.payment_target_address || ''}
                                onChange={(e) => {
                                    handleChangePayment({
                                        ...payment,
                                        payment_target_address: e.target.value
                                    }, index)
                                }}
                                placeholder={lang['Receiving_Wallet_Address']}/>
                        </div>
                    </div>
                    {errMsg?.payment_target_address?.includes(index) &&
                        <div className={styles['error-msg']}>{'Please input receiving wallet address'}</div>
                    }
                </div>
                { payments.length === index + 1 ?
                    <div style={{marginLeft: '12px', cursor: 'pointer'}} onClick={addPayment}>
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="0.5" y="0.5" width="31" height="31" rx="15.5" fill="white"/>
                            <rect x="0.5" y="0.5" width="31" height="31" rx="15.5" stroke="#6CD7B2"/>
                            <path fillRule="evenodd" clipRule="evenodd"
                                  d="M15.5 12C15.2239 12 15 12.2239 15 12.5V15H12.5C12.2239 15 12 15.2239 12 15.5V16.5C12 16.7761 12.2239 17 12.5 17H15V19.5C15 19.7761 15.2239 20 15.5 20H16.5C16.7762 20 17 19.7761 17 19.5V17H19.5C19.7761 17 20 16.7761 20 16.5V15.5C20 15.2239 19.7761 15 19.5 15H17V12.5C17 12.2239 16.7762 12 16.5 12H15.5Z"
                                  fill="#6CD7B2"/>
                        </svg>
                    </div> :
                    <div style={{marginLeft: '12px', cursor: 'pointer'}} onClick={e => {removePayment(index)}}>
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="0.5" y="0.5" width="31" height="31" rx="15.5" fill="white"/>
                            <rect x="0.5" y="0.5" width="31" height="31" rx="15.5" stroke="#7B7C7B"/>
                            <path fillRule="evenodd" clipRule="evenodd" d="M19.5 15C19.7761 15 20 15.2239 20 15.5V16.5C20 16.7761 19.7761 17 19.5 17H12.5C12.2239 17 12 16.7761 12 16.5V15.5C12 15.2239 12.2239 15 12.5 15H19.5Z" fill="#7B7C7B"/>
                        </svg>
                    </div>
                }
            </div>
        })
        }


        <div className={styles['item-title-inline']}>
            <div className={styles['label']}> {lang['Ticket_Amount']}</div>

            <div className={styles['value']}>
                <div className={styles['ticket-type']} onClick={e => {
                    props.onChange && props.onChange({
                        ...props.ticket,
                        quantity: null
                    })
                }}>
                    <AppRadio checked={props.ticket.quantity === null}/>
                    {'No limit'}
                </div>

                <div className={styles['ticket-type']} onClick={e => {
                    props.onChange && props.onChange({
                        ...props.ticket,
                        quantity: 1
                    })
                }}>
                    <AppRadio checked={props.ticket.quantity !== null}/>
                    {'Limit'}
                </div>

                {props.ticket.quantity !== null &&
                    <div className={styles['ticket-quantity']}>
                        <div className={styles['width-limit-3']}>
                            <AppInput
                                onChange={e => {
                                    props.onChange && props.onChange({
                                        ...props.ticket,
                                        quantity: e.target.value >= 0 ? e.target.value * 1 : 0
                                    })
                                }}
                                type={'number'}
                                placeholder={'Quantity'}
                                value={props.ticket.quantity ? props.ticket.quantity + '' : '0'}/>
                        </div>

                        <div>{lang['Tickets']}</div>
                    </div>
                }
            </div>
        </div>

        <div className={styles['item-title-inline']}>
            <div className={styles['label']}> {'Ticket sales end time'}</div>

            <div className={styles['value']}>
                <div className={styles['ticket-type']} onClick={e => {
                    props.onChange && props.onChange({
                        ...props.ticket,
                        end_time: null
                    })
                }}>
                    <AppRadio checked={props.ticket.end_time === null}/>
                    {'No limit'}
                </div>

                <div className={styles['ticket-type']} onClick={e => {
                    props.onChange && props.onChange({
                        ...props.ticket,
                        end_time: new Date().toISOString()
                    })
                }}>
                    <AppRadio checked={props.ticket.end_time !== null}/>
                    {'Limit'}
                </div>

                {props.ticket.end_time !== null &&
                    <div className={styles['time-picker']}>
                        <Datepicker
                            value={new Date(props.ticket.end_time!)}
                            onChange={({date}) => {
                                props.onChange && props.onChange({
                                    ...props.ticket,
                                    end_time: Array.isArray(date) ? date[0]?.toISOString() : date?.toISOString()
                                })
                            }}
                        />
                        <TimePicker
                            value={new Date(props.ticket.end_time!)}
                            onChange={(date) => {
                                props.onChange && props.onChange({
                                    ...props.ticket,
                                    end_time: date?.toISOString()
                                })
                            }}
                            overrides={{
                                Select: {
                                    props: {
                                        overrides: {
                                            Dropdown: {
                                                style: ({$theme}: any) => ({
                                                    minHeight: '300px',
                                                })
                                            }
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                }
            </div>
        </div>

        <div className={styles['item-title']}>{lang['Qualification']}</div>
        <div className={styles['item-des']}>People possessing the badge you select have the privilege to make payments
            at this price.
        </div>

        {
            !props.ticket.check_badge_class_id &&
            <div className={styles['width-limit-4']}>
                <AppButton onClick={showBadges}>{lang['Select_A_Badge']}</AppButton>
            </div>
        }

        {!!badgeDetail &&
            <div className={styles['banded-badge']}>
                <Delete size={22} onClick={e => {
                    props.onChange && props.onChange({
                        ...props.ticket,
                        check_badge_class_id: undefined
                    })
                }
                }/>
                <img src={badgeDetail.image_url} alt=""/>
                <div>{badgeDetail.title}</div>
            </div>
        }
    </div>)
}

function TicketSetting(props: { creator: Group | Profile, onChange?: (tickets: Partial<Ticket>[]) => any, value: Partial<Ticket>[] }, ref: any) {
    const [errorMsg, setErrorMsg] = useState<ErrorMsg[]>([])
    const {showLoading, showToast} = useContext(DialogsContext)

    const verify = () => {
        let res = true
        let newErrorMsg: ErrorMsg[] = []
        props.value.forEach((ticket, index) => {
            let errMsg: ErrorMsg = {
                index,
                title: false,
                payment_target_address: [],
            }

            if (!ticket.title) {
                errMsg.title = true
            }

            if (!!ticket.payment_metadata?.length) {
                ticket.payment_metadata.forEach((payment, i) => {
                    if (!payment.payment_target_address) {
                        errMsg.payment_target_address.push(i)
                    }
                })
            }

            if (errMsg.title || errMsg.payment_target_address.length) {
                newErrorMsg.push(errMsg)
                res = false
            }
        })

        setErrorMsg(newErrorMsg)
        return res
    }

    useImperativeHandle(ref, () => {
        return {
            verify
        }
    })

    useEffect(() => {
        if (!props.value.length) {
            props.onChange && props.onChange([emptyTicket])
        }
    }, [])

    return (<div className={styles['ticket-setting-list']}>
        {
            props.value.map((ticket, index) => {
                return <Ticket
                    creator={props.creator}
                    ticket={ticket}
                    key={index}
                    index={index}
                    errorMsg={errorMsg}
                    onChange={(ticket) => {
                        const newTickets = [...props.value]
                        newTickets[index] = ticket
                        props.onChange && props.onChange(newTickets)
                    }}
                    onDelete={async () => {
                        const unload = showLoading()
                        try {

                            if (!!ticket.id) {
                                const checkSomebodyPaid = await getParticipantDetail({
                                    ticket_id: ticket.id
                                })

                                if (!!checkSomebodyPaid) {
                                    showToast('Cannot delete ticket type that somebody has paid')
                                    return
                                }
                            }

                            const newTickets = [...props.value]
                            newTickets.splice(index, 1)
                            props.onChange && props.onChange(newTickets)
                        } finally {
                            unload()
                        }
                    }}/>
            })
        }

        <AppButton onClick={e => {
            props.onChange && props.onChange([...props.value, emptyTicket])
        }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
                <path
                    d="M19.5 11H13.5V5C13.5 4.73478 13.3946 4.48043 13.2071 4.29289C13.0196 4.10536 12.7652 4 12.5 4C12.2348 4 11.9804 4.10536 11.7929 4.29289C11.6054 4.48043 11.5 4.73478 11.5 5V11H5.5C5.23478 11 4.98043 11.1054 4.79289 11.2929C4.60536 11.4804 4.5 11.7348 4.5 12C4.5 12.2652 4.60536 12.5196 4.79289 12.7071C4.98043 12.8946 5.23478 13 5.5 13H11.5V19C11.5 19.2652 11.6054 19.5196 11.7929 19.7071C11.9804 19.8946 12.2348 20 12.5 20C12.7652 20 13.0196 19.8946 13.2071 19.7071C13.3946 19.5196 13.5 19.2652 13.5 19V13H19.5C19.7652 13 20.0196 12.8946 20.2071 12.7071C20.3946 12.5196 20.5 12.2652 20.5 12C20.5 11.7348 20.3946 11.4804 20.2071 11.2929C20.0196 11.1054 19.7652 11 19.5 11Z"
                    fill="#272928"/>
            </svg>
            <span className={styles['add-btn']}>Add a ticket type</span>
        </AppButton>
    </div>)
}

export default forwardRef(TicketSetting)
