import {useContext, useEffect, useRef, useState} from 'react'
import {EventSites, getEventSide, Group} from "@/service/solas";
import {Select} from "baseui/select";
import AppInput from "../../base/AppInput";
import {Delete} from "baseui/icon";
import DialogsContext from "../../provider/DialogProvider/DialogsContext";
import langContext from "../../provider/LangProvider/LangContext";
import MapContext from "../../provider/MapProvider/MapContext";

export interface LocationInputValue {
    lat: number | null,
    lng: number | null,
    eventSiteId: number | null,
    location: string | null,
    formatted_address: string | null
}

export interface GMapPlaceRes {
    name: string
    formatted_address: string,
    geometry: {
        location: {
            lat: () => number,
            lng: () => number
        }
    },
}

export interface GMapSearchResult {
    description: string,
    place_id: string,
    structured_formatting: {
        main_text: string,
        secondary_text: string
    }
}

export interface LocationInputProps {
    initValue?: LocationInputValue,
    eventGroup: Group,
    onChange?: (value: LocationInputValue) => any,
}


function LocationInput(props: LocationInputProps) {
    const {showToast, showLoading} = useContext(DialogsContext)
    const {langType, lang} = useContext(langContext)
    const {AutoComplete, Section, MapLibReady, MapReady, MapError} = useContext(MapContext)

    const [eventSiteList, setEventSiteList] = useState<Partial<EventSites>[]>([
        {
            id: 0,
            title: '+ Other Location',
        }
    ])
    const [searchKeyword, setSearchKeyword] = useState('')
    const [GmapSearchResult, setGmapSearchResult] = useState<GMapSearchResult[]>([])
    const [searching, setSearching] = useState(false)
    const [showSearchRes, setShowSearchRes] = useState(false)
    const [eventSite, setEventSite] = useState<EventSites[] | null>(null)
    const [createMode, setCreateMode] = useState(false)


    const mapService = useRef<any>(null)
    const delay = useRef<any>(null)
    const sessionToken = useRef<any>(null)

    useEffect(() => {
        if (!!eventSiteList.length && !!props.initValue?.eventSiteId) {
            const eventSite = eventSiteList.find(e => e.id === props.initValue?.eventSiteId)
            eventSite && setEventSite([eventSite] as any)
        }

    }, [eventSiteList, props.initValue?.eventSiteId])

    useEffect(() => {
        async function fetchLocation() {
            if (props.eventGroup) {
                const locations = await getEventSide(props.eventGroup.id)
                setEventSiteList([ {
                    id: 0,
                    title: '+ Other Location',
                }, ...locations])
            }
        }

        function initGoogleMap() {
            if (!MapReady) return
            mapService.current = new AutoComplete!()
        }

        fetchLocation()
        initGoogleMap()

        return () => {
            mapService.current = null
        }
    }, [MapReady])

    useEffect(() => {
        const search = () => {
            if (!showSearchRes) {
                return
            }

            if (delay.current) {
                clearTimeout(delay.current)
            }
            delay.current = setTimeout(() => {
                if (searchKeyword && mapService.current && !searching) {
                    setSearching(true)
                    const token = new Section!()
                    mapService.current.getQueryPredictions({
                        input: searchKeyword,
                        token: token,
                        language: langType === 'cn' ? 'zh-CN' : 'en'
                    } as any, (predictions: any, status: any) => {
                        setSearching(false)
                        if (status !== 'OK') {
                            showToast('error', 'Google map search failed.')
                            return
                        }
                        sessionToken.current = token
                        setGmapSearchResult(predictions.filter((r: any) => !!r.place_id))
                    });
                }
            }, 200)
        }
        search()
    }, [searchKeyword, showSearchRes])


    const handleSelectSearchRes = async (result: GMapSearchResult) => {
        const unload = showLoading()
        try {
            const lang = langType === 'cn' ? 'zh-CN' : 'en'
            const placesList = document.getElementById("map") as HTMLElement
            const map = new (window as any).google.maps.Map(placesList)
            const service = new (window as any).google.maps.places.PlacesService(map)
            service.getDetails({
                sessionToken: sessionToken.current,
                fields: ['geometry', 'formatted_address', 'name'],
                placeId: result.place_id
            }, (place: any, status: string) => {
                const placeInfo = place as GMapPlaceRes
                setShowSearchRes(false)
                props.onChange && props.onChange({
                    lat: placeInfo.geometry.location.lat(),
                    lng: placeInfo.geometry.location.lng(),
                    formatted_address: placeInfo.formatted_address,
                    location: placeInfo.name
                } as any)
                setSearchKeyword(placeInfo.formatted_address)
                unload()
            })
        } catch (e) {
            console.error(e)
            unload()
        }
    }

    useEffect(() => {
        if (props.initValue?.location && !props.initValue.eventSiteId) {
            setCreateMode(true)
            setSearchKeyword(props.initValue.formatted_address || '')
        }
    }, [props.initValue])

    return (<div className={'input-area event-location-input'}>
        <input type="text" id={'map'}/>
        <div className={'input-area-title'}>{lang['Activity_Form_Where']}</div>
        <div className={'input-area-sub-title'}>{lang['Activity_Detail_Offline_location']}</div>

        {!createMode &&
            <div className={'selector'}>
                <i className={'icon-Outline'}/>
                <Select
                    placeholder={'Select an event site...'}
                    labelKey={'title'}
                    valueKey={'id'}
                    clearable={false}
                    creatable={false}
                    searchable={false}
                    getOptionLabel={(option: any) => <div style={{padding: '7px'}}>
                        <div style={{fontSize: '16px', color: '#272928'}}>{option.option.title}</div>
                        <div style={{
                            fontSize: '14px',
                            color: '#7B7C7B',
                            fontWeight: 'normal',
                            whiteSpace: 'pre-wrap'
                        }}>{option.option.about}</div>
                    </div>}
                    options={eventSiteList}
                    value={eventSite as any}
                    onChange={(params: any) => {
                        if (params.value[0].id) {
                            setEventSite(params.value as any)
                            props.onChange && props.onChange({
                                lat: params.value[0].geo_lat,
                                lng: params.value[0].geo_lng,
                                eventSiteId: params.value[0].id,
                                location: params.value[0].title,
                                formatted_address: params.value[0].formatted_address
                            })
                        } else {
                            setCreateMode(true)
                            setSearchKeyword('')
                            setGmapSearchResult([])
                            setEventSite(null)
                            props.onChange && props.onChange({
                                lat: null,
                                lng: null,
                                eventSiteId: null,
                                formatted_address: null,
                                location: null
                            })
                        }
                    }}
                />
            </div>
        }

        {createMode &&
            <>
                <div className={'search-input'}>
                    <AppInput
                        onFocus={e => {
                            setShowSearchRes(true)
                        }}
                        placeholder={'Enter the address...'}
                        endEnhancer={() => <Delete size={24} className={'delete'} onClick={() => {
                            setCreateMode(false)
                            props.onChange && props.onChange({
                                lat: null,
                                lng: null,
                                eventSiteId: null,
                                formatted_address: null,
                                location: null
                            })
                        }}/>}
                        onChange={e => {
                            setSearchKeyword(e.target.value)
                        }}
                        value={searchKeyword}/>
                    {!!GmapSearchResult.length && showSearchRes &&
                        <div className={'search-res'}>
                            <div className={'res-list'}>
                                {
                                    GmapSearchResult.map((result, index) => {
                                        const subtext = result.description
                                        const title = result.structured_formatting.main_text
                                        return <div className={'search-res-item'}
                                                    key={index}
                                                    onClick={e => {
                                                        handleSelectSearchRes(result)
                                                    }}>
                                            <div className={'search-title'}>{title}</div>
                                            <div className={'search-sub-title'}>{subtext}</div>
                                        </div>
                                    })
                                }
                            </div>
                        </div>
                    }
                </div>

                <div className={'input-area-title'} style={{marginTop: '12px'}}>{"Location Name"}</div>
                <div className={'search-input'}>
                    <AppInput
                        startEnhancer={() => <i className={'icon-Outline'}/>}
                        placeholder={'e.g. sport apace'}
                        onChange={e => {
                            props.onChange && props.onChange({
                                ...props.initValue,
                                location: e.target.value
                            } as any)
                        }}
                        value={props.initValue?.location || ''}/>
                </div>
            </>
        }
    </div>)
}

export default LocationInput
