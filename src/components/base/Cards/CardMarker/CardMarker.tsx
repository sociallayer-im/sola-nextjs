import {useEffect, useState} from 'react'
import styles from './CardMarker.module.scss'
import {Event} from '@/service/solas'
import useTime from "@/hooks/formatTime";

function CardMarker(props: { item: Event, type: 'marker' | 'event' }) {
    const [a, seta] = useState('')
    const formatTime = useTime()

    useEffect(() => {

    }, [])

    return (<div className={styles['marker-card']}>
        {props.type === 'event' &&
            <>
                <div className={styles['left']}>
                    <div className={styles['title']}>{props.item.title}</div>
                    <div className={styles['des']}>{props.item.content}</div>
                    <div className={styles['info']}>
                        {props.item.start_time &&
                            <div className={styles['detail']}>
                                <i className={`icon-calendar ${styles.icon}`}/>
                                <span>{formatTime(props.item.start_time)}</span>
                            </div>
                        }
                        {props.item.location &&
                            <div className={styles['detail']}>
                                <i className={`icon-Outline ${styles.icon}`}/>
                                <span>{props.item.location}</span>
                            </div>
                        }
                    </div>
                </div>
                <div className={styles['right']}>
                    <div className={styles['cover']}>
                        <img className={styles['img']} src={props.item.cover} alt=""/>
                    </div>
                </div>
            </>
        }
    </div>)
}

export default CardMarker
