import {useEffect} from 'react'
import styles from './CardPopupCity.module.scss'
import ImgLazy from "@/components/base/ImgLazy/ImgLazy";
import Link from 'next/link'

function CardPopupCity() {

    useEffect(() => {

    }, [])

    return (<div className={styles['card-popup-city']}>
        <div className={styles['citizens']}>321 citizens joined</div>
        <div className={styles['cover']}>
            <ImgLazy src="https://ik.imagekit.io/soladata/h8s2pg0i_3DVNxGY9z" alt="" width={220} height={148}/>
        </div>
        <div className={styles['time']}>Oct 15 - Oct 30, 2024</div>
        <div className={styles['title']}>Vitalia 2024</div>

        <div className={styles['detail']}>
            <div className={styles['items']}>
                <div className={styles['item']}>
                    <i className={'icon-Outline'}></i>
                   <div> Shanghai Shanghai Shanghai Shanghai</div>
                </div>
                <div className={styles['item']}>
                    <img src="https://ik.imagekit.io/soladata/h8s2pg0i_3DVNxGY9z" alt=""/>
                   <div>by Shanghai</div>
                </div>
            </div>
            <Link href={'/'} className={styles['link']}>{'View events'}</Link>
        </div>
    </div>)
}

export default CardPopupCity
