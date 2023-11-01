import {useContext, useEffect, useState} from 'react'
import EventHomeContext from "@/components/provider/EventHomeProvider/EventHomeContext";
import Link from 'next/link'
import {usePathname, useRouter} from "next/navigation";
import styles from './MapEntry.module.scss'
import MapContext from "@/components/provider/MapProvider/MapContext";

function MapEntry() {
    const [isMobile, setIsMobile] = useState(false)
    const [selected, setSelected] = useState(false)
    const {MapReady} = useContext(MapContext)
    const {eventGroup} = useContext(EventHomeContext)
    const router = useRouter()
    const pathname = usePathname()

    const setMobile = () => {
        setIsMobile(window.innerWidth <= 450)
    }

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setMobile()
            window.addEventListener('resize', setMobile, false)
            return () => {
                window.removeEventListener('resize', setMobile, false)
            }
        }
    }, [])

    useEffect(() => {
       setSelected(pathname?.includes('map'))
    }, [pathname])

    return (
        <>
            {MapReady
                && process.env.NEXT_PUBLIC_SPECIAL_VERSION !== 'maodao'
                && eventGroup?.group_map_enabled
                && (pathname?.includes('map') || pathname?.includes('event')) &&
                <Link href={`/event/${eventGroup.username}/map/`} className={`${styles['map-entry']} ${selected ? styles['map-entry-active'] : ''}`}>
                    <i className={`icon-location`}></i>
                   {isMobile ? '' : <span className={styles.text}>Map</span>}
                </Link>
            }
        </>
    )
}

export default MapEntry
