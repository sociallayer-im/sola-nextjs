import styles from './DialogGenPromoCode.module.scss'
import {Event, getCoupon, Coupon, queryCoupons, queryTicketItems, updateEvent} from "@/service/solas"
import PageBack from "@/components/base/PageBack"
import {useContext, useState} from "react"
import AppInput from "@/components/base/AppInput"
import AppRadio from "@/components/base/AppRadio/AppRadio";
import * as dayjsLib from "dayjs"
import {DatePicker} from "baseui/datepicker";
import AppButton from "@/components/base/AppButton/AppButton"
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext"
import userContext from "@/components/provider/UserProvider/UserContext"
import DialogListPromoCode from "@/components/base/Dialog/DialogListPromoCode/DialogListPromoCode"
import LangContext from "@/components/provider/LangProvider/LangContext"
import DialogPromoDetail from "@/components/base/Dialog/DialogPromoDetail/DialogPromoDetail";

const dayjs: any = dayjsLib

const emptyCoupon: Coupon = {
    selector_type: 'code',
    label: '',
    code: '',
    receiver_address: null,
    discount_type: 'ratio',
    discount: 8000,
    applicable_ticket_ids: [],
    ticket_item_ids: [],
    expiry_time: dayjs().add(1, 'month').toISOString(),
    max_allowed_usages: 1,
    order_usage_count: 0
}

export default function DialogGenPromoCode(props: {
    close: () => any,
    coupons: Coupon[],
    event: Event,
    onChange: (coupons: Coupon[]) => any
}) {
    const [coupon, setCoupon] = useState<Coupon>(JSON.parse(JSON.stringify(emptyCoupon)))
    const [busy, setBusy] = useState(false)
    const {showLoading, showToast, openDialog} = useContext(DialogsContext)
    const {user} = useContext(userContext)
    const {lang} = useContext(LangContext)

    // errors
    const [discountError, setDiscountError] = useState('')
    const [useTimesError, setUseTimesError] = useState('')

    const handleShowList = async () => {
        const unload = showLoading()
        try {
            const coupons = await queryCoupons({event_id: props.event.id})
            openDialog({
                content: (close: any) => <DialogListPromoCode coupons={coupons} close={close}/>,
                size: ['100%', '100%']
            })
        } finally {
            unload()
        }
    }

    const addOne = () => {
        setCoupon({
            ...coupon,
            max_allowed_usages: coupon.max_allowed_usages + 1
        })
    }

    const minusOne = () => {
        setCoupon({
            ...coupon,
            max_allowed_usages: coupon.max_allowed_usages - 1
        })
    }

    const handleGenerate = async () => {
        setDiscountError('')
        setUseTimesError('')

        if (coupon.discount < 0) {
            setDiscountError('Discount must be greater than 100%')
            return
        }

        if (coupon.max_allowed_usages <= 0) {
            setUseTimesError('Use times must be greater than 0')
            return
        }

        const unload = showLoading()
        setBusy(true)
        try {
            const _coupon = JSON.parse(JSON.stringify(coupon))
            const event = {
                ...props.event,
                coupons: [...props.coupons, coupon],
                auth_token: user.authToken || ''
            }

            const res = await updateEvent(event)
            setCoupon(JSON.parse(JSON.stringify(emptyCoupon)))
            const coupons = await queryCoupons({event_id: props.event.id})

            if (!!coupons[0]) {
                const code = await getCoupon({id: coupons[0].id!, auth_token: user.authToken || ''})
                openDialog({
                    content: (close: any) => {
                        return <DialogPromoDetail history={[]} coupon={coupons[0]!} close={close} code={code}/>
                    },
                    size: ['100%', '100%']
                })
            }

            setBusy(false)
            unload()
            showToast('Generate coupon code success')

        } catch (e: any) {
            setBusy(false)
            unload()
            console.error(e)
            showToast(e.message || 'Generate coupon code failed')
        }
    }

    return <div className={styles['dialog']}>
        <div className={styles['center']}>
            <PageBack title={lang['Promo_Code']} onClose={props.close}
                      menu={() => <div onClick={handleShowList} style={{fontWeight: 600, cursor: 'pointer'}}>{lang['Generated_History']}</div>}/>
            <div className={styles['body']}>
                <div className={`${styles['row']} ${styles['item']}`}>
                    <div style={{cursor: 'pointer'}} onClick={(e: any) => {
                        setCoupon({
                            ...coupon,
                            discount: 8000,
                            discount_type: 'ratio'
                        })
                    }}>
                        <AppRadio checked={coupon.discount_type === 'ratio'}/>
                    </div>
                    <div className={styles['row']}>
                        <div className={styles['title']}>{lang['Discount_Off']}</div>
                        {coupon.discount_type === 'ratio' &&
                            <>
                                <div className={styles['input']}>
                                    <AppInput type={'tel'} style={{textAlign: 'center'}}
                                              value={(10000 - coupon.discount) / 100 + ''}
                                              onChange={e => {
                                                  if (isNaN(Number(e.target.value))) {
                                                      return
                                                  }

                                                  setCoupon({
                                                      ...coupon,
                                                      discount: 10000 - parseFloat(e.target.value) * 100
                                                  })
                                              }}
                                    /></div>
                                <div className={styles['title']}>% OFF</div>
                            </>
                        }
                    </div>
                </div>

                <div className={`${styles['row']} ${styles['item']}`}>
                    <div style={{cursor: 'pointer'}} onClick={(e: any) => {
                        setCoupon({
                            ...coupon,
                            discount: 100,
                            discount_type: 'amount'
                        })
                    }}>
                        <AppRadio checked={coupon.discount_type === 'amount'}/>
                    </div>
                    <div className={styles['row']}>
                        <div className={styles['title']}>{lang['Amount_Off']}</div>
                        {coupon.discount_type === 'amount' &&
                            <>
                                <div className={styles['tel']}>
                                    <AppInput type={'tel'} style={{textAlign: 'center'}}
                                              value={coupon.discount / 100 + ''}
                                              onChange={e => {
                                                  if (isNaN(Number(e.target.value))) {
                                                      return
                                                  }
                                                  setCoupon({
                                                      ...coupon,
                                                      discount: parseFloat(e.target.value) * 100
                                                  })
                                              }}
                                    /></div>
                                <div className={styles['title']}>USD</div>
                            </>
                        }
                    </div>
                </div>
                <div className={styles['error']}>{discountError}</div>

                <div className={`${styles['row']} ${styles['item']}`} style={{marginTop: '30px'}}>
                    <div className={styles['title']}>{lang['Can_Be_Used']}</div>
                    <svg onClick={minusOne}
                         className={`${styles['btn']} ${coupon.max_allowed_usages === 1 ? styles['disable'] : ''}`}
                         width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0.5" y="0.5" width="31" height="31" rx="15.5" fill="white"/>
                        <rect x="0.5" y="0.5" width="31" height="31" rx="15.5" stroke="#272928"/>
                        <path fillRule="evenodd" clipRule="evenodd"
                              d="M19.5 15C19.7761 15 20 15.2239 20 15.5V16.5C20 16.7761 19.7761 17 19.5 17H12.5C12.2239 17 12 16.7761 12 16.5V15.5C12 15.2239 12.2239 15 12.5 15H19.5Z"
                              fill="#272928"/>
                    </svg>
                    <div className={styles['input']}>
                        <AppInput type={'tel'} style={{textAlign: 'center'}}
                                  value={coupon.max_allowed_usages + ''}
                                  onChange={e => {
                                      if (isNaN(Number(e.target.value))) {
                                          return
                                      }
                                      setCoupon({
                                          ...coupon,
                                          max_allowed_usages: parseFloat(e.target.value)
                                      })
                                  }}
                        />
                    </div>
                    <svg onClick={addOne} className={styles['btn']} width="32" height="32" viewBox="0 0 32 32"
                         fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0.5" y="0.5" width="31" height="31" rx="15.5" fill="white"/>
                        <rect x="0.5" y="0.5" width="31" height="31" rx="15.5" stroke="#272928"/>
                        <path fillRule="evenodd" clipRule="evenodd"
                              d="M15.5 12C15.2239 12 15 12.2239 15 12.5V15H12.5C12.2239 15 12 15.2239 12 15.5V16.5C12 16.7761 12.2239 17 12.5 17H15V19.5C15 19.7761 15.2239 20 15.5 20H16.5C16.7762 20 17 19.7761 17 19.5V17H19.5C19.7761 17 20 16.7761 20 16.5V15.5C20 15.2239 19.7761 15 19.5 15H17V12.5C17 12.2239 16.7762 12 16.5 12H15.5Z"
                              fill="#272928"/>
                    </svg>


                    <div className={styles['title']}>{lang['Times']}</div>
                </div>
                <div className={styles['error']}>{useTimesError}</div>

                <div className={`${styles['row']} ${styles['item']}`} style={{marginTop: '30px'}}>
                    <div className={styles['title']}>{lang['Valid_Date']}</div>
                    <div className={styles['input']} style={{width: '160px'}}>
                        <div className={styles['date-picker']}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16"
                                 fill="none">
                                <path
                                    d="M8.17936 9.33398C8.31122 9.33398 8.44011 9.29489 8.54974 9.22163C8.65938 9.14838 8.74482 9.04426 8.79528 8.92244C8.84574 8.80062 8.85894 8.66658 8.83322 8.53726C8.8075 8.40794 8.744 8.28915 8.65077 8.19591C8.55753 8.10268 8.43874 8.03918 8.30942 8.01346C8.1801 7.98774 8.04606 8.00094 7.92424 8.0514C7.80242 8.10186 7.6983 8.1873 7.62505 8.29694C7.5518 8.40657 7.5127 8.53546 7.5127 8.66732C7.5127 8.84413 7.58293 9.0137 7.70796 9.13872C7.83298 9.26375 8.00255 9.33398 8.17936 9.33398ZM11.5127 9.33398C11.6445 9.33398 11.7734 9.29489 11.8831 9.22163C11.9927 9.14838 12.0782 9.04426 12.1286 8.92244C12.1791 8.80062 12.1923 8.66658 12.1666 8.53726C12.1408 8.40794 12.0773 8.28915 11.9841 8.19591C11.8909 8.10268 11.7721 8.03918 11.6428 8.01346C11.5134 7.98774 11.3794 8.00094 11.2576 8.0514C11.1358 8.10186 11.0316 8.1873 10.9584 8.29694C10.8851 8.40657 10.846 8.53546 10.846 8.66732C10.846 8.84413 10.9163 9.0137 11.0413 9.13872C11.1663 9.26375 11.3359 9.33398 11.5127 9.33398ZM8.17936 12.0007C8.31122 12.0007 8.44011 11.9616 8.54974 11.8883C8.65938 11.815 8.74482 11.7109 8.79528 11.5891C8.84574 11.4673 8.85894 11.3332 8.83322 11.2039C8.8075 11.0746 8.744 10.9558 8.65077 10.8626C8.55753 10.7693 8.43874 10.7059 8.30942 10.6801C8.1801 10.6544 8.04606 10.6676 7.92424 10.7181C7.80242 10.7685 7.6983 10.854 7.62505 10.9636C7.5518 11.0732 7.5127 11.2021 7.5127 11.334C7.5127 11.5108 7.58293 11.6804 7.70796 11.8054C7.83298 11.9304 8.00255 12.0007 8.17936 12.0007ZM11.5127 12.0007C11.6445 12.0007 11.7734 11.9616 11.8831 11.8883C11.9927 11.815 12.0782 11.7109 12.1286 11.5891C12.1791 11.4673 12.1923 11.3332 12.1666 11.2039C12.1408 11.0746 12.0773 10.9558 11.9841 10.8626C11.8909 10.7693 11.7721 10.7059 11.6428 10.6801C11.5134 10.6544 11.3794 10.6676 11.2576 10.7181C11.1358 10.7685 11.0316 10.854 10.9584 10.9636C10.8851 11.0732 10.846 11.2021 10.846 11.334C10.846 11.5108 10.9163 11.6804 11.0413 11.8054C11.1663 11.9304 11.3359 12.0007 11.5127 12.0007ZM4.84603 9.33398C4.97788 9.33398 5.10678 9.29489 5.21641 9.22163C5.32604 9.14838 5.41149 9.04426 5.46195 8.92244C5.51241 8.80062 5.52561 8.66658 5.49989 8.53726C5.47416 8.40794 5.41067 8.28915 5.31743 8.19591C5.2242 8.10268 5.10541 8.03918 4.97609 8.01346C4.84677 7.98774 4.71272 8.00094 4.59091 8.0514C4.46909 8.10186 4.36497 8.1873 4.29172 8.29694C4.21846 8.40657 4.17936 8.53546 4.17936 8.66732C4.17936 8.84413 4.2496 9.0137 4.37462 9.13872C4.49965 9.26375 4.66922 9.33398 4.84603 9.33398ZM12.846 2.66732H12.1794V2.00065C12.1794 1.82384 12.1091 1.65427 11.9841 1.52925C11.8591 1.40422 11.6895 1.33398 11.5127 1.33398C11.3359 1.33398 11.1663 1.40422 11.0413 1.52925C10.9163 1.65427 10.846 1.82384 10.846 2.00065V2.66732H5.5127V2.00065C5.5127 1.82384 5.44246 1.65427 5.31743 1.52925C5.19241 1.40422 5.02284 1.33398 4.84603 1.33398C4.66922 1.33398 4.49965 1.40422 4.37462 1.52925C4.2496 1.65427 4.17936 1.82384 4.17936 2.00065V2.66732H3.5127C2.98226 2.66732 2.47355 2.87803 2.09848 3.2531C1.72341 3.62818 1.5127 4.13688 1.5127 4.66732V12.6673C1.5127 13.1978 1.72341 13.7065 2.09848 14.0815C2.47355 14.4566 2.98226 14.6673 3.5127 14.6673H12.846C13.3765 14.6673 13.8852 14.4566 14.2602 14.0815C14.6353 13.7065 14.846 13.1978 14.846 12.6673V4.66732C14.846 4.13688 14.6353 3.62818 14.2602 3.2531C13.8852 2.87803 13.3765 2.66732 12.846 2.66732ZM13.5127 12.6673C13.5127 12.8441 13.4425 13.0137 13.3174 13.1387C13.1924 13.2637 13.0228 13.334 12.846 13.334H3.5127C3.33588 13.334 3.16632 13.2637 3.04129 13.1387C2.91627 13.0137 2.84603 12.8441 2.84603 12.6673V6.66732H13.5127V12.6673ZM13.5127 5.33398H2.84603V4.66732C2.84603 4.49051 2.91627 4.32094 3.04129 4.19591C3.16632 4.07089 3.33588 4.00065 3.5127 4.00065H12.846C13.0228 4.00065 13.1924 4.07089 13.3174 4.19591C13.4425 4.32094 13.5127 4.49051 13.5127 4.66732V5.33398ZM4.84603 12.0007C4.97788 12.0007 5.10678 11.9616 5.21641 11.8883C5.32604 11.815 5.41149 11.7109 5.46195 11.5891C5.51241 11.4673 5.52561 11.3332 5.49989 11.2039C5.47416 11.0746 5.41067 10.9558 5.31743 10.8626C5.2242 10.7693 5.10541 10.7059 4.97609 10.6801C4.84677 10.6544 4.71272 10.6676 4.59091 10.7181C4.46909 10.7685 4.36497 10.854 4.29172 10.9636C4.21846 11.0732 4.17936 11.2021 4.17936 11.334C4.17936 11.5108 4.2496 11.6804 4.37462 11.8054C4.49965 11.9304 4.66922 12.0007 4.84603 12.0007Z"
                                    fill="var(--color-text-main)"/>
                            </svg>
                            <div>{dayjs(coupon.expiry_time).format('MMM DD, YYYY')}</div>

                            <DatePicker
                                minDate={new Date()}
                                value={new Date(coupon.expiry_time)}
                                onChange={({date}) => {
                                    setCoupon({
                                        ...coupon,
                                        expiry_time: dayjs(date).toISOString()
                                    })
                                }
                                }/>
                        </div>
                    </div>
                </div>

                <div style={{marginTop: '30px', marginBottom: '12px'}}>
                    <div className={styles['title']}>{lang['Label_Optional']}</div>
                </div>
                <AppInput
                    placeholder={'Memo will show on the generate discount code List'}
                    value={coupon.label}
                    onChange={e => {
                        setCoupon({
                            ...coupon,
                            label: e.target.value
                        })
                    }}/>

                <div style={{marginTop: '30px'}}>
                    <AppButton kind={'primary'}
                               onClick={handleGenerate}
                               isLoading={busy}
                    >{lang['Generate']}</AppButton>
                </div>
            </div>
        </div>
    </div>
}
