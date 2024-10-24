import {useContext} from 'react'
import styles from './SelectorMarkerType.module.scss'
import langContext from "@/components/provider/LangProvider/LangContext";
import {useParams, useRouter} from "next/navigation";

export interface MarkerType {
    label: string,
    category: string
    pin: string,
    pin_checked: string,
}

export const markerTypeList2: MarkerType[] = [
    {
        label: 'Event',
        category: 'event',
        pin: '/images/map_marker.png',
        pin_checked: '/images/map_marker.png',
    },
    {
        label: 'Share',
        category: 'share',
        pin: '/images/marker/Vision Spot.png',
        pin_checked: '/images/marker/Vision Spot_checked.png',
    },
    {
        label: 'Food & Drink',
        category: 'food',
        pin: '/images/marker/Utility Table.png',
        pin_checked: '/images/marker/Utility Table_checked.png',
    },
    {
        label: 'Attractions',
        category: 'attractions',
        pin: '/images/marker/Vision Spot.png',
        pin_checked: '/images/marker/Vision Spot_checked.png',
    },
    {
        label: 'Co-working',
        category: 'co-working',
        pin: '/images/map_marker.png',
        pin_checked: '/images/map_marker.png',
    },
    {
        label: 'Community',
        category: 'community',
        pin: '/images/map_marker.png',
        pin_checked: '/images/map_marker.png',
    },
    {
        label: 'Book & Zine',
        category: 'book-zine',
        pin: '/images/map_marker.png',
        pin_checked: '/images/map_marker.png',
    },
    {
        label: 'Music & Club',
        category: 'music-club',
        pin: '/images/map_marker.png',
        pin_checked: '/images/map_marker.png',
    }
]

export const markerTypeList: any = {
    'Event': '/images/map_marker.png#/images/map_marker.png',
    'Share': '/images/marker/Vision Spot.png#/images/marker/Vision Spot_checked.png',
    // 'Zugame': '/images/marker/Zugame.png#/images/marker/Zugame_checked.png#/images/marker/Zugame_checked_a.png#/images/marker/Zugame_checked_b.png#/images/marker/Zugame_checked_c.png',
    'Food & Drink': '/images/marker/Utility Table.png#/images/marker/Utility Table_checked.png',
    // 'Merkle training ground': '/images/marker/Merkle training ground.png#/images/marker/Merkle training ground_checked.png',
    // 'Hacker House': '/images/marker/Hacker House.png#/images/marker/Hacker House_checked.png',
    'Attractions': '/images/marker/Vision Spot.png#/images/marker/Vision Spot_checked.png',
    // 'Mempool Bottle': '/images/marker/Mempool Bottle.png#/images/marker/Mempool Bottle_checked.png',
}

function SelectorMarkerType(props: { value?: string, exclude?: string[], onChange?: (value: MarkerType) => any }) {
    const {lang} = useContext(langContext)
    const router = useRouter()
    const params = useParams()

    return (<div className={styles['marker-type-selector']}>
        <div className={styles['title']}>{lang['Form_Marker_Category']}</div>
        <div className={styles['list']}>
            {
                markerTypeList2.filter(t => t.category !== 'event').map((item, index) => {
                    if (!props.exclude?.includes(item.category)) {
                        return <div
                            onClick={() => {
                                props.onChange && props.onChange(item)
                            }}
                            className={`${styles['item']} ${item.category === props.value ? styles['item-active'] : ''}`}
                            key={item.category}>{item.label}</div>
                    } else {
                        return null
                    }
                })
            }
        </div>
    </div>)
}

export default SelectorMarkerType
