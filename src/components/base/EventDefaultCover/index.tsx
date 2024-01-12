import {Event} from '@/service/solas'
import {useTime4} from "@/hooks/formatTime";

export default function EventDefaultCover({event, height, width}: { event: Event, width: number, height: number }) {
    const formatTime = useTime4

    const timeInfo = event.start_time && event.end_time ? formatTime(event.start_time!, event.end_time!, event.timezone!): undefined

    const scale = width / 452
    return <div style={{width, height, overflow: "hidden"}}>
        <div className={'default-post'} style={{transform: `scale(${scale}) translate(${Math.round((width - 452) / 2 * (1 / scale) )}px, ${Math.round((width - 452) / 2 * (1 / scale))}px)`}}>
            <div className={'title'}>{event.title} </div>
            <div className={'time'}>{timeInfo?.data} <br/> {timeInfo?.time}</div>
            <div className={'location'}>{event.location}</div>
        </div>
    </div>
}
