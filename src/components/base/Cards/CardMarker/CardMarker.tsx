import styles from './CardMarker.module.scss'
import {getFollowings, getProfile, joinEvent, Marker, Participants, Profile, queryEventDetail} from '@/service/solas'
import {useRouter} from "next/navigation";
import usePicture from "@/hooks/pictrue";
import {useContext, useEffect, useState} from "react";
import userContext from "@/components/provider/UserProvider/UserContext";
import useMarkerCheckIn from "@/hooks/markerCheckIn";
import useEvent, {EVENT} from "@/hooks/globalEvent";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";

export const genGoogleMapUrl = (marker: Marker) => {
    if (marker.location_detail && marker.location !== 'Custom location') {
        const json = JSON.parse(marker.location_detail)
        return `https://www.google.com/maps/search/?api=1&query=${json.name.split('').join('+')}`
    } else {
        return `https://www.google.com/maps/search/?api=1&query=${marker.lat}%2C${marker.lng}`
    }
}

function CardMarker(props: { item: Marker, participants?: Participants[], isActive?: boolean}){
    const router = useRouter()
    const {defaultAvatar} = usePicture()
    const {user} = useContext(userContext)
    const {scanQrcode} = useMarkerCheckIn()
    const [hasCheckin, setHasCheckin] = useState(!!props.item.checkin)
    const [hasJoin, setHasJoin] = useState(false)
    const [_, showFollowGuide] = useEvent(EVENT.showFollowGuide)
    const {showToast, showLoading} = useContext(DialogsContext)
    const [groupHost, setGroupHost] = useState<Profile | null>(null)

    const showBg = typeof window !== 'undefined'
        && (window.location.hostname.includes('zumap') || window.location.hostname.includes('localhost'))
        && props.isActive

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

    useEffect(() => {
        if (props.item.host_info) {
            getProfile({id: Number(props.item.host_info)}).then(res => {
                if (res) {
                    setGroupHost(res)
                }
            })
        }
    }, [props.item.host_info])


    return (<div className={showBg ? styles['marker-card-bg'] : styles['marker-card']} onClick={e => {
        if (props.item.marker_type === 'event') {
            router.push(`/event/detail/${props.item.event_id}`)
        } else {
            router.push(`/event/detail-marker/${props.item.id}`)
        }
    }}>
        <div className={styles['left']}>
            <div className={styles['title']}>{props.item.title}</div>
            <div className={styles['des']}>{props.item.about}</div>
            {groupHost &&
                <div className={styles['creator']}>by <img
                    alt=""
                    className={styles['avatar']}
                    src={groupHost.image_url || defaultAvatar(groupHost.id)} height={16} width={16}/>
                </div>
            }
            {!props.item.host_info &&
                <div className={styles['creator']}>by <img
                    alt=""
                    className={styles['avatar']}
                    src={props.item.owner.image_url || defaultAvatar(props.item.owner.id)} height={16} width={16}/>
                </div>
            }

            <div className={styles['info']}>
                {props.item.location &&
                    <a className={styles['detail']}
                       onClick={e => {e.stopPropagation()}}
                       href={genGoogleMapUrl(props.item)} target={'_blank'}>
                        <i className={`icon-Outline ${styles.icon}`}/>
                        <span>{props.item.location}</span>
                        <svg className={styles['link-icon']} xmlns="http://www.w3.org/2000/svg" width="8" height="8"
                             viewBox="0 0 8 8" fill="none">
                            <path
                                d="M7.10418 0.861667C7.04498 0.71913 6.93171 0.60586 6.78918 0.546667C6.71905 0.516776 6.64374 0.500922 6.56751 0.5H0.734177C0.579467 0.5 0.431094 0.561458 0.321698 0.670854C0.212302 0.780251 0.150843 0.928624 0.150843 1.08333C0.150843 1.23804 0.212302 1.38642 0.321698 1.49581C0.431094 1.60521 0.579467 1.66667 0.734177 1.66667H5.16168L0.32001 6.5025C0.265335 6.55673 0.221939 6.62125 0.192323 6.69233C0.162708 6.76342 0.147461 6.83966 0.147461 6.91667C0.147461 6.99367 0.162708 7.06992 0.192323 7.141C0.221939 7.21209 0.265335 7.2766 0.32001 7.33083C0.374238 7.38551 0.438756 7.42891 0.50984 7.45852C0.580925 7.48814 0.65717 7.50338 0.734177 7.50338C0.811184 7.50338 0.887429 7.48814 0.958513 7.45852C1.0296 7.42891 1.09411 7.38551 1.14834 7.33083L5.98418 2.48917V6.91667C5.98418 7.07138 6.04563 7.21975 6.15503 7.32915C6.26443 7.43854 6.4128 7.5 6.56751 7.5C6.72222 7.5 6.87059 7.43854 6.97999 7.32915C7.08939 7.21975 7.15084 7.07138 7.15084 6.91667V1.08333C7.14992 1.0071 7.13407 0.931796 7.10418 0.861667Z"
                                fill="#272928"/>
                        </svg>
                    </a>
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
                        : <div className={styles['checkin-btn']} onClick={e => {
                            handleJoin(e)
                        }}>
                            Apply
                        </div>
                    }
                </>
            }
        </div>
    </div>)
}

export default CardMarker
