import {useContext, useEffect, useRef, useState} from 'react'
import {EventSites, getEventSide, Group, Event} from "@/service/solas";
import {Select} from "baseui/select";
import AppInput from "../../base/AppInput";
import {Delete} from "baseui/icon";
import DialogsContext from "../../provider/DialogProvider/DialogsContext";
import langContext from "../../provider/LangProvider/LangContext";
import MapContext from "../../provider/MapProvider/MapContext";
import * as dayjsLib from "dayjs";
import fa from "@walletconnect/legacy-modal/dist/cjs/browser/languages/fa";

const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const isSameOrAfter = require('dayjs/plugin/isSameOrAfter')
const dayjs: any = dayjsLib
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(isSameOrAfter)


export interface LocationInputValue {
    geo_lat: number | null,
    geo_lng: number | null,
    location: string | null,
    formatted_address: string | null,
    place_id?: string | null
}

export interface GMapPlaceRes {
    name: string
    place_id: string,
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
    },
    customLatlng?: [number, number]
}

export interface LocationInputProps {
    initValue?: LocationInputValue,
    eventGroup: Group,
    onChange?: (value: LocationInputValue) => any,
}


function LocationInput(props: LocationInputProps) {
    const {showLoading} = useContext(DialogsContext)
    const {langType, lang} = useContext(langContext)
    const {AutoComplete, Section, MapLibReady, MapReady, MapError} = useContext(MapContext)

    const [searchKeyword, setSearchKeyword] = useState('')
    const [GmapSearchResult, setGmapSearchResult] = useState<GMapSearchResult[]>([])
    const [searching, setSearching] = useState(false)
    const [showSearchRes, setShowSearchRes] = useState(false)
    const [createMode] = useState(true)


    const mapService = useRef<any>(null)
    const delay = useRef<any>(null)
    const sessionToken = useRef<any>(null)


    useEffect(() => {
        function initGoogleMap() {
            if (!MapReady) return
            mapService.current = new AutoComplete!()
        }

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
                console.log('searchKeyword', searchKeyword)
                console.log('mapService.current', mapService.current)
                console.log('searching',  searching)
                console.log('change search keyword', searchKeyword && mapService.current && searching)
                if (searchKeyword && mapService.current && !searching) {
                    console.log('inner search')
                    setSearching(true)
                    const rex = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/;
                    let latlng: GMapSearchResult | null = null
                    if (rex.test(searchKeyword)) {
                        const [lat, lng] = searchKeyword.split(',')
                        latlng = {
                            description: `${lat},${lng}`,
                            place_id: '',
                            structured_formatting: {
                                main_text: `Custom location (${lat}, ${lng})`,
                                secondary_text: ''
                            },
                            customLatlng: [Number(lat), Number(lng)]
                        }
                    }


                    const token = new Section!()
                    mapService.current.getQueryPredictions({
                        input: searchKeyword,
                        token: token,
                        language: langType === 'cn' ? 'zh-CN' : 'en'
                    } as any, (predictions: any, status: any) => {
                        setSearching(false)
                        sessionToken.current = token
                        const searchRes = predictions?.filter((r: any) => !!r.place_id)
                        if (searchRes?.length && !!latlng) {
                            const res = [latlng, ...searchRes]
                            setGmapSearchResult(res)
                        } else if (!!latlng && !searchRes?.length) {
                            setGmapSearchResult([latlng])
                        } else if (!!searchRes?.length) {
                            setGmapSearchResult(searchRes)
                        } else {
                            setGmapSearchResult([])
                        }
                    });
                }
            }, 200)
        }
        search()
    }, [searchKeyword, showSearchRes])


    const handleSelectSearchRes = async (result: GMapSearchResult) => {
        if (result.customLatlng) {
            setShowSearchRes(false)
            props.onChange && props.onChange({
                geo_lat: result.customLatlng[0],
                geo_lng: result.customLatlng[1],
                formatted_address: `${result.customLatlng[0]},${result.customLatlng[1]}`,
                location: result.structured_formatting.main_text,
                place_id: null
            } as any)
            setSearchKeyword(`${result.customLatlng[0]},${result.customLatlng[1]}`)
        } else {
            const unload = showLoading()
            try {
                const lang = langType === 'cn' ? 'zh-CN' : 'en'
                const placesList = document.getElementById("map") as HTMLElement
                const map = new (window as any).google.maps.Map(placesList)
                const service = new (window as any).google.maps.places.PlacesService(map)
                service.getDetails({
                    sessionToken: sessionToken.current,
                    fields: ['geometry', 'formatted_address', 'name', 'place_id'],
                    placeId: result.place_id
                }, (place: any, status: string) => {
                    const placeInfo = place as GMapPlaceRes
                    setShowSearchRes(false)
                    props.onChange && props.onChange({
                        geo_lat: placeInfo.geometry.location.lat(),
                        geo_lng: placeInfo.geometry.location.lng(),
                        formatted_address: placeInfo.formatted_address,
                        location: placeInfo.name,
                        place_id: placeInfo.place_id
                    } as any)
                    setSearchKeyword(placeInfo.formatted_address)
                    unload()
                })
            } catch (e) {
                console.error(e)
                unload()
            }
        }
    }

    useEffect(() => {
        if (props.initValue?.location) {
            setSearchKeyword(props.initValue.formatted_address || '')
        }
    }, [props.initValue])

    return (<div className={'input-area event-location-input'}>
        <input type="text" id={'map'}/>

        {createMode &&
            <>
                <div className={'search-input'}>
                    <AppInput
                        onFocus={e => {
                            setShowSearchRes(true)
                        }}
                        placeholder={'Input address or geo point like 40.7128,-74.0060'}
                        endEnhancer={() => <Delete size={24} className={'delete'} onClick={() => {
                            props.onChange && props.onChange({
                                geo_lat: null,
                                geo_lng: null,
                                formatted_address: null,
                                location: null,
                                place_id: null
                            })
                            setSearchKeyword('')
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
            </>
        }
    </div>)
}

export default LocationInput
