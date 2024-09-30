import styles from './EventFilter.module.scss';
import {EventSites, Track} from "@/service/solas";
import AppInput from "@/components/base/AppInput";
import {useMemo, useState} from "react";
import Empty from "@/components/base/Empty";
import AppButton from "@/components/base/AppButton/AppButton";


export default function EventFilter(props: {
    close: () => any,
    venues: EventSites[],
    tracks: Track[],
    currTrackId: number | undefined,
    currVenueIds: number[],
    time: '' | 'coming' | 'past' | 'today' | 'week' | 'month',
    onConfirm?: (res: { venueIds: number[], time: '' | 'coming' | 'past' | 'today' | 'week' | 'month', trackId: number | undefined }) => any
}) {
    const [venueSearchKeyword, setVenueSearchKeyword] = useState('')
    const [currVenueIds, setCurrVenueIds] = useState(props.currVenueIds)
    const [time, setTime] = useState(props.time)
    const [trackId, setTrackId] = useState(props.currTrackId)

    const handleSelectVenue = (venueId: number) => {
        if (currVenueIds.includes(venueId)) {
            setCurrVenueIds(currVenueIds.filter(id => id !== venueId))
        } else {
            setCurrVenueIds([...currVenueIds, venueId])
        }
    }

    const venueToShow = useMemo(() => {
        return props.venues.filter(v => {
            return v.title.toLowerCase().includes(venueSearchKeyword.toLowerCase())
        })
    }, [venueSearchKeyword, props.venues])

    const handleConfirm = () => {
        !!props.onConfirm && props.onConfirm({
            venueIds: currVenueIds,
            time: time,
            trackId
        })
        props.close()
    }

    const handleReset = () => {
        setTime('')
        setCurrVenueIds([])
        setTrackId(undefined)
    }

    return <div className={styles['dialog']}>
        <div className={styles['title']}>
            <div className={styles['text']}>Filters</div>
            <div className={styles['reset']} onClick={handleReset}>Reset</div>
        </div>

        <div className={styles['item-title']}>Event Track</div>
        <div className={styles['times']}>
            {
                props.tracks.map((track, index) => {
                    return <div key={index} className={trackId === track.id ? styles['active'] : ''} onClick={e => {
                        setTrackId(track.id)
                    }}>{track.tag || track.title}
                    </div>
                })
            }
        </div>


        <div className={styles['item-title']}>Venues</div>
        <AppInput
            clearable={true}
            onChange={e => {
                setVenueSearchKeyword(e.target.value)
            }}
            placeholder={'Search venue'}
            startEnhancer={() => <i className={'icon-search'}/>}
            value={venueSearchKeyword}/>

        <div className={styles['venue-list']}>
            <div className={styles['scroll']}>
                <div className={styles['venue-list-item']}>
                    <div><strong>All venue</strong></div>
                    <div className={styles['select']} onClick={(e) => {
                        setCurrVenueIds([])
                    }}>
                        {
                            !currVenueIds.length ?
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                     fill="none">
                                    <path fillRule="evenodd" clipRule="evenodd"
                                          d="M1 5.125C1 2.84683 2.84683 1 5.125 1H18.875C21.1532 1 23 2.84683 23 5.125V18.875C23 21.1532 21.1532 23 18.875 23H5.125C2.84683 23 1 21.1532 1 18.875V5.125ZM7.5 10.5C6.67157 10.5 6 11.1716 6 12C6 12.8284 6.67157 13.5 7.5 13.5H16.5C17.3284 13.5 18 12.8284 18 12C18 11.1716 17.3284 10.5 16.5 10.5H7.5Z"
                                          fill="#6CD7B2"/>
                                </svg> :
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                     fill="none">
                                    <path fillRule="evenodd" clipRule="evenodd"
                                          d="M1 5.125C1 2.84683 2.84683 1 5.125 1H18.875C21.1532 1 23 2.84683 23 5.125V18.875C23 21.1532 21.1532 23 18.875 23H5.125C2.84683 23 1 21.1532 1 18.875V5.125ZM7.5 10.5C6.67157 10.5 6 11.1716 6 12C6 12.8284 6.67157 13.5 7.5 13.5H16.5C17.3284 13.5 18 12.8284 18 12C18 11.1716 17.3284 10.5 16.5 10.5H7.5Z"
                                          fill="#E8E9E8"/>
                                </svg>
                        }
                    </div>
                </div>
                {!venueToShow.length && <div className={styles['empty']}>
                    <Empty/>
                </div>}
                {
                    venueToShow.map((venue, index) => {
                        return <div className={styles['venue-list-item']} key={index}>
                            <div className={styles['venue-title']}>{venue.title}</div>
                            <div className={styles['select']} onClick={(e) => {
                                handleSelectVenue(venue.id)
                            }}>
                                {currVenueIds.includes(venue.id) ?
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                         fill="none">
                                        <path fillRule="evenodd" clipRule="evenodd"
                                              d="M5.125 1C2.84683 1 1 2.84683 1 5.125V18.875C1 21.1532 2.84683 23 5.125 23H18.875C21.1532 23 23 21.1532 23 18.875V5.125C23 2.84683 21.1532 1 18.875 1H5.125ZM6.90273 11.0277C7.4397 10.4908 8.3103 10.4908 8.84727 11.0277L10.625 12.8055L15.1527 8.27773C15.6897 7.74076 16.5603 7.74076 17.0973 8.27773C17.6342 8.8147 17.6342 9.6853 17.0973 10.2223L11.5973 15.7223C11.0603 16.2592 10.1897 16.2592 9.65273 15.7223L6.90273 12.9723C6.36576 12.4353 6.36576 11.5647 6.90273 11.0277Z"
                                              fill="#6CD7B2"/>
                                    </svg> :
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                         fill="none">
                                        <path fillRule="evenodd" clipRule="evenodd"
                                              d="M5.125 1C2.84683 1 1 2.84683 1 5.125V18.875C1 21.1532 2.84683 23 5.125 23H18.875C21.1532 23 23 21.1532 23 18.875V5.125C23 2.84683 21.1532 1 18.875 1H5.125ZM6.90273 11.0277C7.4397 10.4908 8.3103 10.4908 8.84727 11.0277L10.625 12.8055L15.1527 8.27773C15.6897 7.74076 16.5603 7.74076 17.0973 8.27773C17.6342 8.8147 17.6342 9.6853 17.0973 10.2223L11.5973 15.7223C11.0603 16.2592 10.1897 16.2592 9.65273 15.7223L6.90273 12.9723C6.36576 12.4353 6.36576 11.5647 6.90273 11.0277Z"
                                              fill="#E8E9E8"/>
                                    </svg>
                                }
                            </div>
                        </div>
                    })
                }
            </div>
        </div>

        <div className={styles['item-title']}>Times</div>
        <div className={styles['times']}>
            <div className={time === '' ? styles['active'] : ''} onClick={e => {
                setTime('')
            }}>All Time
            </div>
            <div className={time === 'today' ? styles['active'] : ''} onClick={e => {
                setTime('today')
            }}>Today
            </div>
            <div className={time === 'week' ? styles['active'] : ''} onClick={e => {
                setTime('week')
            }}>Week
            </div>
            <div className={time === 'month' ? styles['active'] : ''} onClick={e => {
                setTime('month')
            }}>Month
            </div>
        </div>

        <div className={styles['btns']}>
            <AppButton onClick={props.close}>Cancel</AppButton>
            <AppButton onClick={handleConfirm} kind={'primary'}>Show events</AppButton>
        </div>
    </div>
}
