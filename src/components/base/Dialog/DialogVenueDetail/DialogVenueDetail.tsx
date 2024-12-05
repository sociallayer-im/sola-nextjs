import styles from './DialogVenueDetail.module.scss'
import {EventSites} from "@/service/solas";
import AppButton from "@/components/base/AppButton/AppButton"

export default function DialogVenueDetail({venue, close}: {venue: EventSites, close: () => void}) {

    return <div className={styles['dialog']}>
        <div className={styles['title']}>Venue Timeslots</div>


        {!venue.venue_timeslots.length &&
            <div className={styles['col']}>
                <div className={styles['left']}>Timeslot</div>
                <div className={styles['right']}>7*24 Hours</div>
            </div>
        }

        {!!venue.venue_timeslots.length &&
            <div>
                <div className={styles['row']}>
                    <div className={styles['left']}>Timeslots</div>
                </div>
                <div className={styles['timeslot']}>
                    {venue.venue_timeslots.map((timeslot, idx) => {
                        return !timeslot.disabled ? <div key={idx} className={styles['row']}>
                            <div className={styles['left']}>{timeslot.day_of_week}</div>
                            <div className={styles['right']}>{timeslot.start_at} - {timeslot.end_at}</div>
                        </div> : null
                    })}
                </div>
            </div>
        }

        {!!venue.venue_overrides.length &&
            <div>
                <div className={styles['row']}>
                    <div className={styles['left']}>Overrides</div>
                </div>
                <div className={styles['timeslot']}>
                    {venue.venue_overrides.map((timeslot, idx) => {
                        return !timeslot.disabled ? <div key={idx} className={styles['row']}>
                            <div className={styles['left']}>{!timeslot.disabled ? 'Available' : 'Unavailable'}</div>
                            <div className={styles['right']}> {timeslot.day}, {timeslot.start_at}-{timeslot.end_at}</div>
                        </div> : null
                    })}
                </div>
            </div>
        }

        {!venue.venue_overrides.length &&
            <div>
                <div className={styles['col']}>
                    <div className={styles['left']}>Overrides</div>
                    <div className={styles['right']}>No Overrides</div>
                </div>
            </div>
        }

        <AppButton size={'compact'} onClick={close} kind={'primary'} style={{marginTop: '30px'}}>Ok</AppButton>
    </div>
}
