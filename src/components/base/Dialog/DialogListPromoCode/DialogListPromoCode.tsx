import styles from './DialogListPromoCode.module.scss';
import PageBack from "@/components/base/PageBack";
import {getCoupon, Coupon, queryTicketItems} from "@/service/solas"
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import React, {useContext} from "react";
import DialogPromoDetail from "@/components/base/Dialog/DialogPromoDetail/DialogPromoDetail"
import * as dayjsLib from "dayjs";
import userContext from "@/components/provider/UserProvider/UserContext";
import Empty from "@/components/base/EmptySmall";
import LangContext from "@/components/provider/LangProvider/LangContext";

const dayjs: any = dayjsLib

export default function DialogListPromoCode(props: {
    close: () => any,
    coupons: Coupon[],
    selected?: Coupon
}) {
    const {showToast, openDialog, showLoading} = useContext(DialogsContext)
    const {user} = useContext(userContext)
    const {lang} = useContext(LangContext)

    const openDialogPromoDetail = async (code: Coupon) => {
        const unload = showLoading()
        try {
            const codeStr = await getCoupon({id: code.id!, auth_token: user.authToken || ''})
            const history = await queryTicketItems({coupon_id: code.id!})

            openDialog({
                content: (close: any) => {
                    return <DialogPromoDetail history={history} coupon={code} close={close} code={codeStr}/>
                },
                size: ['100%', '100%']
            })
        } catch (e: any) {
            console.error(e)
            showToast('Access denied')
        } finally {
            unload()
        }
    }


    return <div className={styles['dialog']}>
        <div className={styles['center']}>
            <PageBack title={lang['Generated_History']}
                      onClose={props.close}/>

            <div className={styles['body']}>
                <div className={styles['list']}>
                    {props.coupons.map(p => {
                        let discount = ''
                        if (p.discount_type === 'ratio') {
                            discount = `${100 - p.discount / 100}% off`
                        } else {
                            discount = `$${p.discount / 100} USD off`
                        }

                        return <div className={styles['item']} key={p.id} onClick={e => {
                            openDialogPromoDetail(p)
                        }}>
                            <div>
                                <div
                                    className={styles['info']}>{discount}, {dayjs(p.expires_at).format('MMM DD, YYYY')}</div>
                                <div className={styles['memo']}>{p.label}</div>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                 fill="none">
                                <path
                                    d="M17.92 11.6202C17.8724 11.4974 17.801 11.3853 17.71 11.2902L12.71 6.29019C12.6168 6.19695 12.5061 6.12299 12.3842 6.07253C12.2624 6.02207 12.1319 5.99609 12 5.99609C11.7337 5.99609 11.4783 6.10188 11.29 6.29019C11.1968 6.38342 11.1228 6.49411 11.0723 6.61594C11.0219 6.73776 10.9959 6.86833 10.9959 7.00019C10.9959 7.26649 11.1017 7.52188 11.29 7.71019L14.59 11.0002H7C6.73478 11.0002 6.48043 11.1055 6.29289 11.2931C6.10536 11.4806 6 11.735 6 12.0002C6 12.2654 6.10536 12.5198 6.29289 12.7073C6.48043 12.8948 6.73478 13.0002 7 13.0002H14.59L11.29 16.2902C11.1963 16.3831 11.1219 16.4937 11.0711 16.6156C11.0203 16.7375 10.9942 16.8682 10.9942 17.0002C10.9942 17.1322 11.0203 17.2629 11.0711 17.3848C11.1219 17.5066 11.1963 17.6172 11.29 17.7102C11.383 17.8039 11.4936 17.8783 11.6154 17.9291C11.7373 17.9798 11.868 18.006 12 18.006C12.132 18.006 12.2627 17.9798 12.3846 17.9291C12.5064 17.8783 12.617 17.8039 12.71 17.7102L17.71 12.7102C17.801 12.6151 17.8724 12.5029 17.92 12.3802C18.02 12.1367 18.02 11.8636 17.92 11.6202Z"
                                    fill="black"/>
                            </svg>
                        </div>
                    })}
                </div>

                { !props.coupons.length &&
                    <div className={styles['empty']}>
                        <Empty text={'No data'}/>
                    </div>
                }
            </div>
        </div>
    </div>
}
