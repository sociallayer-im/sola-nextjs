import {Track} from "@/service/solas";
import styles from './TrackSelect.module.scss'
import {getLabelColor} from "@/hooks/labelColor";

export default function TrackSelect(props: {value: number[],
    multi: boolean,
    tracks: Track[],
    showAll?: boolean,
    onwrap?: boolean,
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


    return <div className={`${styles['track-select']} ${props.onwrap ? styles['track-select'] : ''}`}>
        {
            !!props.showAll && <div
            onClick={e => handleClick(0)}
            className={`${styles['item']} ${!props.value.length ? styles['all-active'] : ''}`}>
                All Tracks</div>
        }
        {
            props.tracks.map(item => {
                const color = getLabelColor(item.title!)
                const style = props.value.includes(item.id!) ? {
                    borderColor: color,
                    color: color,
                }: undefined

                return <div key={item.id!}
                            onClick={e => handleClick(item.id!)}
                            style={style}
                            className={`${styles['item']}`}>
                   <div>{ item.tag || item.title}</div>
                   <div className={styles['permission-item']}>{ item.kind === 'private' ? 'Private' : 'Public'}</div>
                </div>
            })
        }
    </div>
}
