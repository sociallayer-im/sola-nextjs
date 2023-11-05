import styles from './CardMarker.module.scss'
import {getFollowings, joinEvent, Marker, Participants, queryEventDetail} from '@/service/solas'
import {useRouter} from "next/navigation";
import Image from "next/image";
import usePicture from "@/hooks/pictrue";
import {useContext, useEffect, useState} from "react";
import userContext from "@/components/provider/UserProvider/UserContext";
import useMarkerCheckIn from "@/hooks/markerCheckIn";
import useEvent, {EVENT} from "@/hooks/globalEvent";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";

function CardMarker(props: { item: Marker, participants?: Participants[] }) {
    const router = useRouter()
    const {defaultAvatar} = usePicture()
    const {user} = useContext(userContext)
    const {scanQrcode} = useMarkerCheckIn()
    const [hasCheckin, setHasCheckin] = useState(!!props.item.checkin)
    const [hasJoin, setHasJoin] = useState(false)
    const [_, showFollowGuide] = useEvent(EVENT.showFollowGuide)
    const {showToast, showLoading} = useContext(DialogsContext)

    const handleJoin = async (e: any) => {
        e.stopPropagation()
        const eventDetail = await queryEventDetail({id: props.item.event_id!})
        const participantsAll = eventDetail.participants || []
        const participants = participantsAll.filter(item => item.status !== 'cancel')

        if (eventDetail?.max_participant !== null && eventDetail?.max_participant <= participants.length) {
            showToast('The event at full strength')
            return
        }

        const unload = showLoading()
        try {
            const join = await joinEvent({id: Number(eventDetail.id), auth_token: user.authToken || ''})
            unload()
            showToast('Apply success')
            setHasJoin(true)
        } catch (e: any) {
            console.error(e)
            unload()
            showToast(e.message)
        }
    }

    useEffect(() => {
        if (props.participants?.length) {
            setHasJoin(props.participants?.some(item => item.event.id === props.item.event_id))
        }
    }, [props.participants])


    return (<div className={styles['marker-card']} onClick={e => {
        if (props.item.marker_type === 'event') {
            router.push(`/event/detail/${props.item.event_id}`)
        } else {
            router.push(`/event/detail-marker/${props.item.id}`)
        }
    }}>
        <div className={styles['left']}>
            <div className={styles['title']}>{props.item.title}</div>
            <div className={styles['des']}>{props.item.about}</div>
            <div className={styles['creator']}>by <img
                alt=""
                className={styles['avatar']}
                src={props.item.owner.image_url || defaultAvatar(props.item.owner.id)} height={16} width={16}/></div>
            <div className={styles['info']}>
                {props.item.location &&
                    <div className={styles['detail']}>
                        <i className={`icon-Outline ${styles.icon}`}/>
                        <span>{props.item.location}</span>
                    </div>
                }
                {
                    props.item.checkins_count > 0 &&
                    <div className={styles['detail']}>
                        <span>{` ${props.item.checkins_count} people checked in`}</span>
                    </div>
                }
            </div>
        </div>
        <div className={styles['right']}>
            <div className={styles['cover']}>
                {!!props.item.cover_url &&
                    <img className={styles['img']} src={props.item.cover_url} alt=""/>
                }
            </div>
            {props.item.marker_type !== 'event' &&
                <>
                    {hasCheckin ?
                        <div className={styles['checked']}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"
                                 fill="none">
                                <path
                                    d="M9.81338 5.86065L6.95338 8.72732L5.85338 7.62732C5.79361 7.55753 5.72007 7.50085 5.63736 7.46083C5.55465 7.42082 5.46456 7.39833 5.37275 7.39479C5.28093 7.39124 5.18938 7.40671 5.10383 7.44023C5.01828 7.47374 4.94058 7.52458 4.87561 7.58955C4.81064 7.65452 4.7598 7.73222 4.72629 7.81777C4.69277 7.90332 4.6773 7.99487 4.68084 8.08669C4.68439 8.1785 4.70688 8.26859 4.74689 8.3513C4.78691 8.43401 4.84359 8.50755 4.91338 8.56732L6.48004 10.1407C6.54234 10.2024 6.61621 10.2513 6.69744 10.2845C6.77866 10.3177 6.86564 10.3345 6.95338 10.334C7.12827 10.3332 7.29587 10.2638 7.42004 10.1407L10.7534 6.80732C10.8159 6.74534 10.8655 6.67161 10.8993 6.59037C10.9332 6.50913 10.9506 6.42199 10.9506 6.33398C10.9506 6.24598 10.9332 6.15884 10.8993 6.0776C10.8655 5.99636 10.8159 5.92263 10.7534 5.86065C10.6285 5.73648 10.4595 5.66679 10.2834 5.66679C10.1073 5.66679 9.93829 5.73648 9.81338 5.86065ZM8.00004 1.33398C6.6815 1.33398 5.39257 1.72498 4.29624 2.45752C3.19991 3.19006 2.34543 4.23125 1.84085 5.44943C1.33626 6.6676 1.20424 8.00805 1.46148 9.30125C1.71871 10.5945 2.35365 11.7823 3.286 12.7147C4.21835 13.647 5.40624 14.282 6.69944 14.5392C7.99265 14.7965 9.33309 14.6644 10.5513 14.1598C11.7694 13.6553 12.8106 12.8008 13.5432 11.7045C14.2757 10.6081 14.6667 9.31919 14.6667 8.00065C14.6667 7.12517 14.4943 6.25827 14.1592 5.44943C13.8242 4.64059 13.3331 3.90566 12.7141 3.28661C12.095 2.66755 11.3601 2.17649 10.5513 1.84145C9.74243 1.50642 8.87552 1.33398 8.00004 1.33398ZM8.00004 13.334C6.94521 13.334 5.91406 13.0212 5.037 12.4352C4.15994 11.8491 3.47635 11.0162 3.07269 10.0416C2.66902 9.06709 2.5634 7.99474 2.76919 6.96017C2.97498 5.9256 3.48293 4.9753 4.22881 4.22941C4.97469 3.48354 5.925 2.97558 6.95956 2.7698C7.99413 2.56401 9.06648 2.66963 10.041 3.07329C11.0156 3.47696 11.8485 4.16055 12.4345 5.03761C13.0206 5.91467 13.3334 6.94582 13.3334 8.00065C13.3334 9.41514 12.7715 10.7717 11.7713 11.7719C10.7711 12.7721 9.41453 13.334 8.00004 13.334Z"
                                    fill="#38E699"/>
                            </svg>
                            <span style={{color: '#38E699', fontSize: '12px', marginLeft: '4px'}}>Checked</span>
                        </div>
                        : <div className={styles['checkin-btn']}
                               onClick={(e) => {
                                   e.stopPropagation()

                                   const isHost = user && user.id === props.item.owner.id
                                   if (isHost) {
                                       router.push(`/event/checkin-marker/${props.item.id}`)
                                   } else {
                                       scanQrcode(props.item, (checked) => {
                                           if (checked) {
                                               setHasCheckin(true)
                                               getFollowings(user.id!).then(res => {
                                                   const ifFollow = res.find(item => item.id === props.item.owner.id)
                                                   if (!ifFollow) {
                                                       showFollowGuide(props.item.owner)
                                                   }
                                               })
                                           }
                                       })
                                   }
                               }}>
                            Check in
                        </div>
                    }
                </>
            }
            {props.item.marker_type === 'event' &&
                <>
                    {hasJoin ?
                        <div className={styles['checked']}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"
                                 fill="none">
                                <path
                                    d="M9.81338 5.86065L6.95338 8.72732L5.85338 7.62732C5.79361 7.55753 5.72007 7.50085 5.63736 7.46083C5.55465 7.42082 5.46456 7.39833 5.37275 7.39479C5.28093 7.39124 5.18938 7.40671 5.10383 7.44023C5.01828 7.47374 4.94058 7.52458 4.87561 7.58955C4.81064 7.65452 4.7598 7.73222 4.72629 7.81777C4.69277 7.90332 4.6773 7.99487 4.68084 8.08669C4.68439 8.1785 4.70688 8.26859 4.74689 8.3513C4.78691 8.43401 4.84359 8.50755 4.91338 8.56732L6.48004 10.1407C6.54234 10.2024 6.61621 10.2513 6.69744 10.2845C6.77866 10.3177 6.86564 10.3345 6.95338 10.334C7.12827 10.3332 7.29587 10.2638 7.42004 10.1407L10.7534 6.80732C10.8159 6.74534 10.8655 6.67161 10.8993 6.59037C10.9332 6.50913 10.9506 6.42199 10.9506 6.33398C10.9506 6.24598 10.9332 6.15884 10.8993 6.0776C10.8655 5.99636 10.8159 5.92263 10.7534 5.86065C10.6285 5.73648 10.4595 5.66679 10.2834 5.66679C10.1073 5.66679 9.93829 5.73648 9.81338 5.86065ZM8.00004 1.33398C6.6815 1.33398 5.39257 1.72498 4.29624 2.45752C3.19991 3.19006 2.34543 4.23125 1.84085 5.44943C1.33626 6.6676 1.20424 8.00805 1.46148 9.30125C1.71871 10.5945 2.35365 11.7823 3.286 12.7147C4.21835 13.647 5.40624 14.282 6.69944 14.5392C7.99265 14.7965 9.33309 14.6644 10.5513 14.1598C11.7694 13.6553 12.8106 12.8008 13.5432 11.7045C14.2757 10.6081 14.6667 9.31919 14.6667 8.00065C14.6667 7.12517 14.4943 6.25827 14.1592 5.44943C13.8242 4.64059 13.3331 3.90566 12.7141 3.28661C12.095 2.66755 11.3601 2.17649 10.5513 1.84145C9.74243 1.50642 8.87552 1.33398 8.00004 1.33398ZM8.00004 13.334C6.94521 13.334 5.91406 13.0212 5.037 12.4352C4.15994 11.8491 3.47635 11.0162 3.07269 10.0416C2.66902 9.06709 2.5634 7.99474 2.76919 6.96017C2.97498 5.9256 3.48293 4.9753 4.22881 4.22941C4.97469 3.48354 5.925 2.97558 6.95956 2.7698C7.99413 2.56401 9.06648 2.66963 10.041 3.07329C11.0156 3.47696 11.8485 4.16055 12.4345 5.03761C13.0206 5.91467 13.3334 6.94582 13.3334 8.00065C13.3334 9.41514 12.7715 10.7717 11.7713 11.7719C10.7711 12.7721 9.41453 13.334 8.00004 13.334Z"
                                    fill="#38E699"/>
                            </svg>
                            <span style={{color: '#38E699', fontSize: '12px', marginLeft: '4px'}}>Applied</span>
                        </div>
                        : <div className={styles['checkin-btn']} onClick={e => {handleJoin(e)}}>
                            Apply
                        </div>
                    }
                </>
            }
        </div>
    </div>)
}

export default CardMarker
