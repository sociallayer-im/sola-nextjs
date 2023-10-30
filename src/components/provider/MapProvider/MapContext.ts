import { createContext } from 'react'

interface MapContextType {
    Map: typeof google.maps.Map | null
    Marker: typeof google.maps.marker.AdvancedMarkerElement | null
    MapEvent: typeof google.maps.event | null,
    AutoComplete: typeof google.maps.places.AutocompleteService | null,
    Place: typeof google.maps.places.PlacesService | null,
    Section: typeof google.maps.places.AutocompleteSessionToken | null,
    MapLibReady: boolean,
    MapReady: boolean,
    MapError: string,
    zoom: number,
}

const EventHomeContext = createContext<MapContextType>({
    Map: null,
    Marker: null,
    MapEvent: null,
    AutoComplete: null,
    Section: null,
    Place: null,
    MapLibReady: false,
    MapReady: false,
    MapError: '',
    zoom: 14,
})

export default EventHomeContext
