import {useContext, useEffect, useState} from 'react'
import styles from './SelectorMarkerType.module.scss'
import langContext from "@/components/provider/LangProvider/LangContext";
import {useParams, useRouter} from "next/navigation";

export const markerTypeList: any = {
    'Event': '/images/map_marker.png#/images/map_marker.png',
    'Share': '/images/marker/Vision Spot.png#/images/marker/Vision Spot_checked.png',
    'Zugame': '/images/marker/Zugame.png#/images/marker/Zugame_checked.png#/images/marker/Zugame_checked_a.png#/images/marker/Zugame_checked_b.png#/images/marker/Zugame_checked_c.png',
    'Utility Table': '/images/marker/Utility Table.png#/images/marker/Utility Table_checked.png',
    'Merkle training ground': '/images/marker/Merkle training ground.png#/images/marker/Merkle training ground_checked.png',
    'Hacker House': '/images/marker/Hacker House.png#/images/marker/Hacker House_checked.png',
    'Vision Spot': '/images/marker/Vision Spot.png#/images/marker/Vision Spot_checked.png',
    'Mempool Bottle': '/images/marker/Mempool Bottle.png#/images/marker/Mempool Bottle_checked.png',
    }

    function SelectorMarkerType(props: { value?: string, onChange?: (value: string[]) => any }) {
    const {lang} = useContext(langContext)
    const router = useRouter()
    const params = useParams()

    return (<div className={styles['marker-type-selector']}>
        <div className={styles['title']}>{lang['Form_Marker_Category']}</div>
        <div className={styles['list']}>
            {
                Object.keys(markerTypeList).map((item, index) => {
                    return <div
                        onClick={() => {
                            props.onChange && props.onChange([item, (markerTypeList as any)[item]])
                            if (item.toLowerCase() === 'event') {
                                router.push(`/event/${params?.groupname}/create`)
                            } else {
                                router.push(`/event/${params?.groupname}/create-marker?type=${item}`)
                            }
                        }}
                        className={`${styles['item']} ${item=== props.value ? styles['item-active'] : ''}`}
                        key={item}>{item}</div>
                })
            }
        </div>
    </div>)
}

export default SelectorMarkerType
