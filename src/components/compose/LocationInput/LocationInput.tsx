import {useContext, useEffect, useRef, useState} from 'react'
import {EventSites, getEventSide, Profile} from "@/service/solas";
import {Select} from "baseui/select";
import AppInput from "../../base/AppInput";
import {Delete} from "baseui/icon";
import DialogsContext from "../../provider/DialogProvider/DialogsContext";
import langContext from "../../provider/LangProvider/LangContext";
import MapContext from "../../provider/MapProvider/MapContext";

export interface LocationInputValue {
    customLocation: string,
    eventSite: EventSites | null
    metaData: string | null
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
    eventGroup: Profile,
    onChange?: (value: LocationInputValue) => any,
    arrowAlias?: boolean,
    errorMsg?: string,
    cleanable?: boolean,
}

function LocationInput({arrowAlias = true, cleanable = true, ...props}: LocationInputProps) {
    const {showToast, showLoading} = useContext(DialogsContext)
    const {langType, lang} = useContext(langContext)
    const {AutoComplete, Section, MapLibReady, MapReady, MapError} = useContext(MapContext)


    const [eventSiteList, setEventSiteList] = useState<EventSites[]>([])
    const [isCustom, setIsCustom] = useState(!!props?.initValue?.customLocation || false)
    const [eventSite, setEventSite] = useState<{ id: number, title: string, isCreatable?: boolean }[]>(props?.initValue?.eventSite ? [{
        id: props?.initValue.eventSite.id,
        title: props.initValue.eventSite.title
    }] : [])
    const [customLocation, setCustomLocation] = useState(props?.initValue?.customLocation || '')

    const [searchKeyword, setSearchKeyword] = useState('')
    const [customLocationDetail, setCustomLocationDetail] = useState<any>(props?.initValue?.metaData ? JSON.parse(props.initValue.metaData) : null)
    const [GmapSearchResult, setGmapSearchResult] = useState<GMapSearchResult[]>([])
    const [searching, setSearching] = useState(false)
    const [showSearchRes, setShowSearchRes] = useState(false)


    const mapService = useRef<any>(null)
    const delay = useRef<any>(null)
    const sessionToken = useRef<any>(null)

    // useEffect(() => {
    //     setIsCustom(!!props?.initValue?.customLocation || false)
    //     setEventSite(props?.initValue?.eventSite ? [{id: props?.initValue.eventSite.id, title: props.initValue.eventSite.title}] : [])
    //     setCustomLocation(props?.initValue?.customLocation || '')
    //     setCustomLocationDetail(props?.initValue?.metaData ? JSON.parse(props.initValue.metaData) : null)
    // }, [props.initValue])

    useEffect(() => {
        async function fetchLocation() {
            if (props.eventGroup) {
                const locations = await getEventSide(props.eventGroup.id)
                setEventSiteList(locations)
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
                    console.log('SectionSectionSection Section', Section)
                    const token = new Section!()
                    mapService.current.getQueryPredictions({
                        input: searchKeyword,
                        token: token,
                        language: langType === 'cn' ? 'zh-CN' : 'en'
                    } as any, (predictions: any, status: any) => {
                        setSearching(false)
                        console.log('predictions', predictions)
                        console.log('status', status)
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

    useEffect(() => {
        const res = {
            customLocation,
            eventSite: eventSiteList.find((site) => site.id === eventSite[0]?.id) || null,
            metaData: customLocationDetail ? JSON.stringify(customLocationDetail) : null
        }
        console.log('location value', res)
        if (props.onChange) {
            props.onChange(res)
        }
    }, [
        eventSite,
        customLocation,
        customLocationDetail
    ])

    useEffect(() => {
        if (showSearchRes) {
            document.body.style.overflow = 'hidden';
            (document.querySelector('.search-res input') as HTMLInputElement).focus()
        } else {
            document.body.style.overflow = 'auto'
        }
    }, [showSearchRes])

    const reset = () => {
        setEventSite([])
        setIsCustom(false)
        setCustomLocation('')
        resetSelect()
    }

    const resetSelect = () => {
        setSearchKeyword('')
        setGmapSearchResult([])
        setShowSearchRes(false)
        setCustomLocationDetail(null)
    }

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
                console.log('placeplace detail', place)
                setShowSearchRes(false)
                setCustomLocationDetail(place)
                setSearchKeyword('')
                unload()
            })
        } catch (e) {
            console.error(e)
            unload()
        }
    }

    return (<div className={'input-area event-location-input'}>
        <input type="text" id={'map'}/>
        {arrowAlias &&
            <>
                <div className={'input-area-title'}>{lang['Activity_Form_Where']}</div>
                <div className={'input-area-sub-title'}>{lang['Activity_Detail_Offline_location']}</div>
            </>
        }

        {!isCustom && arrowAlias &&
            <div className={'selector'}>
                <i className={'icon-Outline'}/>
                <Select
                    labelKey={'title'}
                    valueKey={'id'}
                    clearable
                    creatable
                    options={eventSiteList}
                    value={eventSite}
                    onChange={(params) => {
                        if (params.value.length && params.value[0].isCreatable) {
                            setIsCustom(true)
                            setEventSite([])
                            setCustomLocation(params.value[0].title)
                            if (MapReady) {
                                setSearchKeyword(params.value[0].title)
                                setTimeout(() => {
                                    setShowSearchRes(true)
                                }, 100)
                            }
                            return
                        }

                        setEventSite(params.value as any)
                    }}
                />
            </div>
        }

        {(isCustom || !arrowAlias) &&
            <>
                {arrowAlias &&
                    <AppInput
                        startEnhancer={() => <i className={'icon-edit'}/>}
                        endEnhancer={() => cleanable ? <Delete size={24} onClick={reset} className={'delete'}/> : <></>}
                        placeholder={'Enter location'}
                        value={customLocation}
                        onChange={(e) => setCustomLocation(e.currentTarget.value)}
                    />
                }

                {MapReady &&
                    <>
                        {arrowAlias &&
                            <div
                                className={'input-area-sub-title'}>{lang['Activity_Detail_Offline_location_Custom']}</div>
                        }
                        <div className={'custom-selector'}>
                            {
                                showSearchRes && <div className={'shell'} onClick={e => {
                                    setShowSearchRes(false)
                                }}/>
                            }
                            <AppInput
                                readOnly
                                onFocus={(e) => {
                                    setSearchKeyword(e.target.value);
                                    setShowSearchRes(true)
                                }}
                                errorMsg={props.errorMsg || ''}
                                startEnhancer={() => <i className={'icon-Outline'}/>}
                                endEnhancer={() => cleanable ?
                                    <Delete size={24} onClick={reset} className={'delete'}/> : <></>}
                                placeholder={'Select location'}
                                value={customLocationDetail ? customLocationDetail.name : ''}
                            />

                            {showSearchRes &&
                                <div className={'search-res'}>
                                    <AppInput
                                        value={searchKeyword}
                                        onChange={e => setSearchKeyword(e.currentTarget.value)}
                                        placeholder={'Search location'}
                                    />
                                    {!!GmapSearchResult.length &&
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
                                    }
                                </div>
                            }
                        </div>
                    </>
                }

            </>
        }
    </div>)
}

export default LocationInput
