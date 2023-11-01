import {useContext, useEffect, useState} from 'react'
import styles from './SelectorMarkerType.module.scss'
import langContext from "@/components/provider/LangProvider/LangContext";
import {useParams, useRouter} from "next/navigation";
import EventHomeContext from "@/components/provider/EventHomeProvider/EventHomeContext";

export const markerTypeList = {
    'Event': '',
    'Utility Table': '/images/marker/Utility Table.png',
    'Merkle training ground': '/images/marker/Merkle training ground.png',
    'Hacker House': '/images/marker/Hacker House.png',
    'Vision Spot': '/images/marker/Vision Spot.png',
    'Mempool Bottle': '/images/marker/Mempool Bottle.png',
    }

    function SelectorMarkerType(props: { value?: string, onChange?: (value: string[]) => any }) {
    const [a, seta] = useState('')
    const {lang} = useContext(langContext)
    const router = useRouter()
    const params = useParams()
    const {eventGroup} = useContext(EventHomeContext)

    useEffect(() => {

    }, [])

    return (<div className={styles['marker-type-selector']}>
        <div className={styles['title']}>{lang['Form_Marker_Category']}</div>
        <div className={styles['list']}>
            {
                Object.keys(markerTypeList).map((item, index) => {
                    return <div
                        onClick={() => {
                            props.onChange && props.onChange([item, markerTypeList[item]])
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
