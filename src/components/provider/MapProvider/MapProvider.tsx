import {useEffect, useRef, useState} from 'react'
import MapContext from "./MapContext";
import {usePathname} from "next/navigation";

const routerWhiteList = [
    '/event/',
    '/map',
    '/'
]

function MapProvider(props: { children: any }) {
    const [MapLibReady, setMapLibReady] = useState(false)
    const [MapReady, setMapReady] = useState(false)
    const [MapError, setMapError] = useState('')
    const initZoom = useRef(14);
    const listenTimes = useRef(30);
    const pathname = usePathname()

    const map = useRef<typeof google.maps.Map | null>(null)
    const Marker = useRef<typeof google.maps.marker.AdvancedMarkerElement | null>(null)
    const MapEvent = useRef<typeof google.maps.event | null>(null)
    const AutoComplete = useRef<typeof google.maps.places.AutocompleteService | null>(null)
    const Place = useRef<typeof google.maps.places.PlacesService | null>(null)
    const Section = useRef<typeof google.maps.places.AutocompleteSessionToken | null>(null)


    const interVal = useRef<any>(null)

    const Timing = () => {
        let count = 2
        let interval: any
        return new Promise((resolve, _reject) => {
            interval = setInterval(() => {
                count--
                if (count === 0) {
                    clearInterval(interval)
                    resolve(count)
                }
            }, 1000)
        })
    }

    async function initMap() {
        const {Map} = await google.maps.importLibrary("maps") as google.maps.MapsLibrary
        const {AdvancedMarkerElement} = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary
        const {event} = await google.maps.importLibrary("core") as google.maps.CoreLibrary
        const {
            AutocompleteService,
            PlacesService,
            AutocompleteSessionToken
        } = await google.maps.importLibrary("places") as google.maps.PlacesLibrary
        map.current = Map
        Marker.current = AdvancedMarkerElement
        MapEvent.current = event
        AutoComplete.current = AutocompleteService
        Place.current = PlacesService
        Section.current = AutocompleteSessionToken
        console.log(AutocompleteSessionToken)
        setMapReady(true)
        return 1
    }

    useEffect(() => {
        if (
            !routerWhiteList.some((path) => pathname?.includes(path))
            && !process.env.NEXT_PUBLIC_LEADING_EVENT_GROUP_ID
        ) {
            return
        }

        console.log('load map: ', pathname)
        const lib = document.querySelector('#gmaplib')
        if (!lib) {
            const script = document.createElement('script')
            script.id = 'gmaplib'
            script.src = '/jslib/google.map.js'
            script.async = true
            document.head.appendChild(script)
        }

        interVal.current = setInterval(() => {
            if (window.google && window.google.maps) {
                setMapLibReady(true)
                clearInterval(interVal.current)
            } else {
                listenTimes.current -= 1
                if (listenTimes.current <= 0) {
                    setMapError('Map load timeout')
                    clearInterval(interVal.current)
                }
            }
        }, 500)
    }, [pathname])

    useEffect(() => {
        if (MapLibReady) {
            Promise.race([Timing(), initMap()])
                .then((res) => {

                if (res === 1) {
                    console.log('Map load success')
                } else {
                    setMapError('Load map fail')
                }
            }).catch(e => {
                console.log(e)
                setMapError('Load map fail')
            })
        }
    }, [MapLibReady])

    return (<MapContext.Provider value={{
        Map: map.current,
        Marker: Marker.current,
        MapEvent: MapEvent.current,
        AutoComplete: AutoComplete.current,
        Place: Place.current,
        Section: Section.current,
        MapLibReady, MapError, MapReady, zoom: initZoom.current
    }}>
        {props.children}
    </MapContext.Provider>)
}

export default MapProvider
