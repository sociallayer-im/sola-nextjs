import {forwardRef, useContext, useEffect, useImperativeHandle, useState} from 'react'
import styles from './TicketSetting.module.scss'
import LangContext from "@/components/provider/LangProvider/LangContext";
import AppInput from "@/components/base/AppInput";
import AppRadio from "@/components/base/AppRadio/AppRadio";
import {Select} from "baseui/select";
import AppButton from "@/components/base/AppButton/AppButton";
import {Badge, Group, Profile, queryBadge, queryBadgeDetail, Ticket} from "@/service/solas";
import DialogIssuePrefill from "@/components/eventSpecial/DialogIssuePrefill/DialogIssuePrefill";
import {OpenDialogProps} from "@/components/provider/DialogProvider/DialogProvider";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import {Delete} from "baseui/icon";
import {paymentTokenList} from '@/payment_settring'
import {parseUnits, formatUnits} from "viem/utils";

const emptyTicket: Partial<Ticket> = {
    title: '',
    content: '',
    check_badge_id: null,
    payment_chain: null,
    payment_target_address: null,
    payment_token_address: null,
    payment_token_name: null,
    payment_token_price: null,
    quantity: null,
}

interface ErrorMsg {
    index: number,
    title: boolean,
    payment_target_address: boolean,
}

function Ticket({creator, ...props}: {
    ticket: Partial<Ticket>,
    creator: Group | Profile,
    index?: number,
    errorMsg?: ErrorMsg[]
    onChange?: (ticket: Partial<Ticket>) => any
    onDelete?: (ticket: Partial<Ticket>) => any
}) {
    const {lang} = useContext(LangContext)
    const {openDialog, showLoading} = useContext(DialogsContext)

    const [badges, setBadges] = useState<Badge[]>([])
    const [badgeDetail, setBadgeDetail] = useState<Badge | null>(null)
    const [errMsg, setErrMsg] = useState<ErrorMsg | null>(null)

    useEffect(() => {
        if (props.ticket.check_badge_id && badges.length > 0) {
            setBadgeDetail(badges.find((badge) => badge.id === props.ticket.check_badge_id) || null)
        } else if (props.ticket.check_badge_id) {
            queryBadgeDetail({id: props.ticket.check_badge_id}).then((res) => {
                if (res) {
                    setBadgeDetail(res)
                }
            })
        } else {
            setBadgeDetail(null)
        }
    }, [props.ticket.check_badge_id])

    useEffect(() => {
        document.querySelectorAll('.ticket-payment input').forEach((input) => {
            input.setAttribute('readonly', 'readonly')
        })
    }, [])

    useEffect(() => {
        if (props.errorMsg?.length) {
            const target = props.errorMsg.find((msg) => msg.index === props.index)
            setErrMsg(target || null)
        }
    }, [props.errorMsg])

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
                            check_badge_id: res.badgeId
                        })
                    }
                }}
                handleClose={close}/>,
            position: 'bottom',
            size: [360, 'auto']
        } as OpenDialogProps)
    }

    const chain = props.ticket.payment_token_price !== null ? paymentTokenList.find((chain) => chain.id === props.ticket.payment_chain)! : undefined


    let token: any = undefined
    if (chain) {
        const tokenExist = chain.tokenList.find((t: any) => {
            return t.id === props.ticket.payment_token_name
        })
        if (tokenExist) {
            token = tokenExist
        } else {
            token = chain.tokenList[0]
        }
    }

    console.log(`ticket: ${(props.index || 0) + 1}`, props.ticket)
    console.log(`token: ${(props.index || 0) + 1}`, token)

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
        <div className={styles['width-limit']}>
            <AppInput value={props.ticket.title || ''}
                      onChange={(e) => {
                          props.onChange && props.onChange({
                              ...props.ticket,
                              title: e.target.value
                          })
                      }}
                      placeholder={lang['Name_Of_Tickets']}/>
        </div>
        { errMsg?.title && <div className={styles['error-msg']}>{'Please input ticket name'}</div> }

        <div className={styles['item-title']}>{lang['Ticket_Description']}</div>
        <div className={styles['width-limit-2']}>
            <AppInput value={props.ticket.content || ''}
                      onChange={(e) => {
                          props.onChange && props.onChange({
                              ...props.ticket,
                              content: e.target.value
                          })
                      }}
                      placeholder={lang['Ticket_Description']}/>
        </div>

        <div className={styles['item-title-inline']}>
            <div className={styles['label']}> {lang['Price']}</div>

            <div className={styles['value']}>
                <div className={styles['ticket-type']} onClick={e => {
                    props.onChange && props.onChange({
                        ...props.ticket,
                        payment_token_price: null,
                        payment_chain: null,
                        payment_token_name: null,
                        payment_token_address: null,
                        payment_target_address: null
                    })
                }}>
                    <AppRadio checked={props.ticket.payment_token_price === null}/>
                    {'Free'}
                </div>
                <div className={styles['ticket-type']}
                     onClick={e => {
                         props.onChange && props.onChange({
                             ...props.ticket,
                             payment_token_price: parseUnits('0', paymentTokenList[0].tokenList[0].decimals).toString(),
                             payment_chain: paymentTokenList[0].id,
                             payment_token_name: paymentTokenList[0].tokenList[0].id,
                             payment_token_address: paymentTokenList[0].tokenList[0].contract,
                         })
                     }}>
                    <AppRadio checked={props.ticket.payment_token_price !== null}/>
                    {'Payment'}
                </div>
            </div>
        </div>

        {props.ticket.payment_token_price !== null && !!chain && !!token &&
            <div className={styles['item-title-inline']}>
                <div className={styles['label']}>{lang['Price']}</div>

                <div className={styles['value']}>
                    <div className={`${styles['ticket-payment']} ticket-payment`}>
                        <Select
                            getOptionLabel={(option) => {
                                return <span>{(option.option as any).chain}</span>
                            }}
                            getValueLabel={(option) => {
                                return <span>{(option.option as any).chain}</span>
                            }}
                            value={[chain]}
                            clearable={false}
                            searchable={false}
                            options={paymentTokenList}
                            onChange={(params) => {
                                props.onChange && props.onChange({
                                    ...props.ticket,
                                    payment_chain: (params.option as any).id,
                                    payment_token_name: (params.option as any).tokenList[0].id,
                                    payment_token_address: (params.option as any).tokenList[0].contract,
                                })
                            }}
                        />

                        <Select
                            getOptionLabel={(option) => {
                                return <span>{(option.option as any).name}</span>
                            }}
                            getValueLabel={(option) => {
                                return <span>{(option.option as any).name}</span>
                            }}
                            value={[token]}
                            clearable={false}
                            searchable={false}
                            options={chain.tokenList as any}
                            onChange={(params) => {
                                props.onChange && props.onChange({
                                    ...props.ticket,
                                    payment_token_name: (params.option as any).id,
                                    payment_token_address: (params.option as any).contract,
                                })
                            }}
                        />
                    </div>
                   <div className={styles['width-limit-3']}>
                       <AppInput
                           type={'number'}
                           placeholder={lang['Price']}
                           onChange={e => {
                               props.onChange && props.onChange({
                                   ...props.ticket,
                                   payment_token_price: parseUnits(e.target.value , token.decimals!).toString()
                               })
                           }}
                           value={formatUnits(BigInt(props.ticket.payment_token_price || 0), token.decimals!)}/>
                   </div>
                </div>
            </div>
        }

        {props.ticket.payment_token_price !== null &&
            <>
                <div className={styles['item-title']}>{lang['Receiving_Wallet_Address']}</div>
                <div className={styles['width-limit-2']}>
                    <AppInput
                        value={props.ticket.payment_target_address || ''}
                        onChange={(e) => {
                            props.onChange && props.onChange({
                                ...props.ticket,
                                payment_target_address: e.target.value
                            })
                        }}
                        placeholder={lang['Receiving_Wallet_Address']}/>
                </div>
                { errMsg?.payment_target_address && <div className={styles['error-msg']}>{'Please input receiving wallet address'}</div> }
            </>
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

        <div className={styles['item-title']}>{lang['Qualification']}</div>
        <div className={styles['item-des']}>People possessing the badge you select have the privilege to make payments
            at this price.
        </div>

        {
            !props.ticket.check_badge_id &&
            <div className={styles['width-limit-4']}>
                <AppButton onClick={showBadges}>{lang['Select_A_Badge']}</AppButton>
            </div>
        }

        {!!badgeDetail &&
            <div className={'banded-badge'}>
                <Delete size={22} onClick={e => {
                    props.onChange && props.onChange({
                        ...props.ticket,
                        check_badge_id: undefined
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

    const verify = () => {
        let res = true
        let newErrorMsg: ErrorMsg[] = []
        props.value.forEach((ticket, index) => {
            let errMsg: ErrorMsg = {
                index,
                title: false,
                payment_target_address: false,
            }

            if (!ticket.title) {
                errMsg.title = true
            }

            if (ticket.payment_token_price !== null && !ticket.payment_target_address) {
                errMsg.payment_target_address = true
            }

            if (errMsg.title || errMsg.payment_target_address) {
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
                    onDelete={() => {
                        const newTickets = [...props.value]
                        newTickets.splice(index, 1)
                        props.onChange && props.onChange(newTickets)
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
