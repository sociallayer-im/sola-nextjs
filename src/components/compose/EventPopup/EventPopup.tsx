import {Event as SolarEvent} from "@/service/solas";
import usePicture from "@/hooks/pictrue";
import styles from "@/pages/event/[groupname]/schedule/schedulenew.module.scss";
import {getLabelColor} from "@/hooks/labelColor";
import EventDefaultCover from "@/components/base/EventDefaultCover";
import Displayer from "@/components/compose/RichTextEditor/Displayer";
import Link from "next/link";

import * as dayjsLib from "dayjs";
const dayjs: any = dayjsLib

export function EventPopup({event, timezone, close}: { event: SolarEvent, timezone: string, close: () => any }) {
    const {defaultAvatar} = usePicture()


    let host = event.owner.nickname || event.owner.username
    let avatar = event.owner.image_url || defaultAvatar(event.owner.id)

    if (event.host_info) {
        const _host = JSON.parse(event.host_info)
        if (_host.group_host) {
            host = _host.group_host.nickname || _host.group_host.username
            avatar = _host.group_host.image_url || defaultAvatar(_host.id)
        }
    }

    return <div className={`event-card ${styles['calendar-event-popup']}`} >
        <div className={'info'} style={{padding: '16px'}}>
            <div className={'left'} style={{marginLeft: 0}}>
                <div className={'details'} style={{margin: '0'}}>
                    <div className={'title'} style={{lineHeight: '20px'}}>
                        {event.title}
                    </div>

                    <div className={'tags'}>
                        {
                            event.tags?.map((tag: string) => {
                                return <div key={tag} className={'tag'}>
                                    <i className={'dot'}
                                       style={{background: getLabelColor(tag)}}/>
                                    {tag}
                                </div>
                            })
                        }
                    </div>
                    
                    <div className={'detail'} style={{fontSize: '12px'}}>
                        <img src={avatar} width={16} height={16} alt=""/>
                        <span>hosted by {host}</span>
                    </div>

                    <div className={'detail'}
                         style={{color: '#272928', fontSize: '12px'}}> <i className="icon-calendar" />
                        {`${formatDate(event.start_time!, timezone)}`}
                    </div>
                </div>
            </div>
            <div className={'post mobile'} style={{display: 'block', width: '100px', height: '100px'}}>
                {
                    event.cover_url ?
                        <img src={event.cover_url} width={100} alt=""/>
                        : <EventDefaultCover event={event} width={100} height={100} showLocation={event.group_id !== 3409}/>
                }
            </div>
        </div>

        { !!event.content ?
            <div className={styles['event-content']}>
                <Displayer markdownStr={event.content} />
            </div>:
            <div className={styles['no-event-content']}>No event content</div>
        }

        <div style={{margin: '16px'}} >
            <Link onClick={e => {
                close()
            }} className={styles['link']} href={`/event/detail/${event.id}`} target={location?.href.includes('iframe') ? '_blank': '_self'}>View Event</Link>
        </div>
    </div>
}

function formatDate(dateStr: string, timezone: string) {
    const mouthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const time = dayjs.tz(new Date(dateStr).getTime(), timezone)
    const date = time.date();
    const month = mouthName[time.month()];
    const hour = time.hour() + ''
    const minute = time.minute() + '';

    let suffix = 'th';

    if (date === 1 || date === 21 || date === 31) {
        suffix = 'st';
    } else if (date === 2 || date === 22) {
        suffix = 'nd';
    } else if (date === 3 || date === 23) {
        suffix = 'rd';
    }

    return `${month} ${date}${suffix} ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
}
