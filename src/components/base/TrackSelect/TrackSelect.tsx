import {Track} from "@/service/solas";
import styles from './TrackSelect.module.scss'

export default function TrackSelect(props: {value: number[],
    multi: boolean,
    tracks: Track[],
    showAll?: boolean,
    onChange: (value: number[]) => any}) {

    const handleClick = (id: number) => {
        if (props.multi) {
            if (props.value.includes(id)) {
                props.onChange(props.value.filter(item => item !== id))
            } else {
                props.onChange([...(props.value || []), id])
            }
        } else {
            if (props.value.includes(id)) {
                props.onChange([])
            } else {
                props.onChange([id])
            }
        }
    }


    return <div className={styles['track-select']}>
        {
            !!props.showAll && <div
            onClick={e => handleClick(0)}
            className={`${styles['item']}`}>
                All Tracks</div>
        }
        {
            props.tracks.map(item => {
                return <div key={item.id!}
                            onClick={e => handleClick(item.id!)}
                            className={`${styles['item']} ${props.value?.includes(item.id!) ? styles['active'] : ''}`}>
                    { item.tag || item.title}
                </div>
            })
        }
    </div>
}
