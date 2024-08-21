import styles from './DialogPromoDetail.module.scss';
import PageBack from "@/components/base/PageBack";
import {PromoCode} from "@/service/solas"
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import React, {useContext, useEffect, useMemo} from "react";
import useCopy from "@/hooks/copy";
import * as dayjsLib from "dayjs";
import Empty from "@/components/base/EmptySmall";

const dayjs: any = dayjsLib


export default function DialogPromoDetail(props: {
    close: () => any,
    promoCode: PromoCode,
}) {
    const {showToast, showLoading} = useContext(DialogsContext)
    const {copy} = useCopy()

    const handleCopy = (code: string) => {
        copy(code)
        showToast('Copied')
    }

    const discountType = useMemo(() => {
        let txt = ''
        if (props.promoCode.discount_type === 'ratio') {
            txt = `${(10000 - props.promoCode.discount) / 100}% off`
        } else {
            txt = `${props.promoCode.discount / 100} USD off`
        }
        return txt
    }, [props.promoCode])

    return <div className={styles['dialog']}>
        <div className={styles['center']}>
            <PageBack title={'Generated History'}
                      onClose={props.close}/>

            <div className={styles['body']}>
                {
                    <div className={styles['show-detail']}>
                        <div className={styles['title']}>You’ve generated a {discountType} promo code</div>
                        <div className={styles['des']}>Please sending to your guest until <span style={{fontWeight: '600'}}>{dayjs(props.promoCode.expiry_time).format('MMM DD, YYYY')}</span></div>
                        <div className={styles['des']}>Remaining uses: <span style={{fontWeight: '600'}}>{props.promoCode.max_allowed_usages - props.promoCode.order_usage_count}</span>
                        </div>

                        <div className={styles['show-code']}>
                            <div>Code</div>
                            <div className={styles['code']}>{props.promoCode.code}</div>
                            <div className={styles['copy']} onClick={e => {
                                handleCopy(props.promoCode.code)
                            }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                     viewBox="0 0 24 24"
                                     fill="none">
                                    <path fillRule="evenodd" clipRule="evenodd"
                                          d="M11 10C10.4477 10 10 10.4477 10 11V20C10 20.5523 10.4477 21 11 21H20C20.5523 21 21 20.5523 21 20V11C21 10.4477 20.5523 10 20 10H11ZM8 11C8 9.34315 9.34315 8 11 8H20C21.6569 8 23 9.34315 23 11V20C23 21.6569 21.6569 23 20 23H11C9.34315 23 8 21.6569 8 20V11Z"
                                          fill="#6CD7B2"/>
                                    <path fillRule="evenodd" clipRule="evenodd"
                                          d="M4 3C3.73478 3 3.48043 3.10536 3.29289 3.29289C3.10536 3.48043 3 3.73478 3 4V13C3 13.2652 3.10536 13.5196 3.29289 13.7071C3.48043 13.8946 3.73478 14 4 14H5C5.55228 14 6 14.4477 6 15C6 15.5523 5.55228 16 5 16H4C3.20435 16 2.44129 15.6839 1.87868 15.1213C1.31607 14.5587 1 13.7956 1 13V4C1 3.20435 1.31607 2.44129 1.87868 1.87868C2.44129 1.31607 3.20435 1 4 1H13C13.7956 1 14.5587 1.31607 15.1213 1.87868C15.6839 2.44129 16 3.20435 16 4V5C16 5.55228 15.5523 6 15 6C14.4477 6 14 5.55228 14 5V4C14 3.73478 13.8946 3.48043 13.7071 3.29289C13.5196 3.10536 13.2652 3 13 3H4Z"
                                          fill="#6CD7B2"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                }

                { false &&
                    <div className={styles['list']}>
                        <div className={styles['list-title']}>History</div>
                        {
                            !!props.promoCode.ticket_item_ids
                            && !!props.promoCode.ticket_item_ids!.length
                            && props.promoCode.ticket_item_ids!.map((id, index) => {
                                return <div className={styles['code-item']} key={index}>
                                    <div>
                                        <span className={styles['code']}>123123</span>
                                        <svg onClick={e => {
                                            handleCopy('123')
                                        }}
                                             xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                                             viewBox="0 0 24 24"
                                             fill="none">
                                            <path fillRule="evenodd" clipRule="evenodd"
                                                  d="M11 10C10.4477 10 10 10.4477 10 11V20C10 20.5523 10.4477 21 11 21H20C20.5523 21 21 20.5523 21 20V11C21 10.4477 20.5523 10 20 10H11ZM8 11C8 9.34315 9.34315 8 11 8H20C21.6569 8 23 9.34315 23 11V20C23 21.6569 21.6569 23 20 23H11C9.34315 23 8 21.6569 8 20V11Z"
                                                  fill="#6CD7B2"/>
                                            <path fillRule="evenodd" clipRule="evenodd"
                                                  d="M4 3C3.73478 3 3.48043 3.10536 3.29289 3.29289C3.10536 3.48043 3 3.73478 3 4V13C3 13.2652 3.10536 13.5196 3.29289 13.7071C3.48043 13.8946 3.73478 14 4 14H5C5.55228 14 6 14.4477 6 15C6 15.5523 5.55228 16 5 16H4C3.20435 16 2.44129 15.6839 1.87868 15.1213C1.31607 14.5587 1 13.7956 1 13V4C1 3.20435 1.31607 2.44129 1.87868 1.87868C2.44129 1.31607 3.20435 1 4 1H13C13.7956 1 14.5587 1.31607 15.1213 1.87868C15.6839 2.44129 16 3.20435 16 4V5C16 5.55228 15.5523 6 15 6C14.4477 6 14 5.55228 14 5V4C14 3.73478 13.8946 3.48043 13.7071 3.29289C13.5196 3.10536 13.2652 3 13 3H4Z"
                                                  fill="#6CD7B2"/>
                                        </svg>
                                    </div>
                                    <div className={styles['right']}>
                                        <div className={styles['time']}>2044/12/01</div>
                                        <div className={styles['usages']}>0/1</div>
                                    </div>
                                </div>
                            })
                        }

                        {

                            !props.promoCode.ticket_item_ids
                            && <div className={styles['empty']}>
                                <Empty text={'No data'}/>
                            </div>
                        }
                    </div>
                }
            </div>
        </div>
    </div>
}
