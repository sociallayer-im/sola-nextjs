import {useEffect, useState} from 'react'
import styles from './CardPopupCity.module.scss'
import ImgLazy from "@/components/base/ImgLazy/ImgLazy";
import Link from 'next/link'
import {PopupCity} from "@/service/solas";
import usePicture from "@/hooks/pictrue";
import {useTime3, useTimePopupCity} from "@/hooks/formatTime";

function CardPopupCity({popupCity}: { popupCity: PopupCity }) {
    const {defaultAvatar} = usePicture()
    const formatTime = useTimePopupCity()
    const [timeStr, setTimeString] = useState('')

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // 获得浏览器时区
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
            console.log('timezone', timezone, popupCity.start_date, popupCity.end_date)
            setTimeString(formatTime(popupCity.start_date!, popupCity.end_date!).data)
        } else {
            setTimeString(formatTime(popupCity.start_date!, popupCity.end_date!).data)
        }
    }, [])

    return (<Link href={`/event/${popupCity.group.username || popupCity.group.handle}`} className={styles['card-popup-city']}>
        {/*<div className={styles['citizens']}>321 citizens joined</div>*/}
        <div className={styles['cover']}>
            {!!popupCity.image_url ?
                <ImgLazy src={popupCity.image_url} alt="" width={440} height={296}/> :
                <div className={styles['default-cover']}><span>{popupCity.title}</span></div>
            }
        </div>
        <div className={styles['time']}>{timeStr}</div>
        <div className={styles['title']}>{popupCity.title}</div>

        <div className={styles['detail']}>
            <div className={styles['items']}>
                <div className={styles['item']}>
                    <i className={'icon-Outline'}></i>
                    <div>{popupCity.location}</div>
                </div>
                <div className={styles['item']}>
                    <img src={popupCity.group.image_url || defaultAvatar(popupCity.group_id)} alt=""/>
                    <div>by {popupCity.group.nickname || popupCity.group.username || popupCity.group.handle}</div>
                </div>
            </div>
            <div className={styles['link']}>{'View events'}</div>
        </div>
    </Link>)
}

export default CardPopupCity
