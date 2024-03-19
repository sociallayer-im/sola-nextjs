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
    initValue?: {
        lat?: number,
        lng?: number,
        eventSite: EventSites | null,
        location: string,
        formatted_address: string
    },
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

    const historyRef = useRef('')

    const [eventSiteList, setEventSiteList] = useState<EventSites[]>([])
    const [isCustom, setIsCustom] = useState(!!props?.initValue?.location && !!props.initValue.formatted_address && !props?.initValue?.eventSite)

    const [eventSite, setEventSite] = useState<{ id: number, title: string, isCreatable?: boolean, formatted_address: string }[]>(props?.initValue?.eventSite ? [{
        id: props?.initValue.eventSite.id,
        title: props.initValue.eventSite.title,
        formatted_address: props.initValue.eventSite.formatted_address
    }] : [] as any)
    const [customLocation, setCustomLocation] = useState(props?.initValue?.location || '')

    const [searchKeyword, setSearchKeyword] = useState('')
    const [customLocationDetail, setCustomLocationDetail] = useState<any>(null)
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
       if (eventSite.length && eventSiteList.length) {
           const target = eventSiteList.find((site) => site.id === eventSite[0]?.id)
           const res = {
               customLocation: '',
               eventSite: target || null,
               metaData: null
           }
           props.onChange &&  props.onChange(res)
       } else {
              const res = {
                customLocation,
                eventSite: null,
                metaData: customLocationDetail ? JSON.stringify(customLocationDetail) : null
              }
              props.onChange &&  props.onChange(res)
       }
    }, [
        eventSite, eventSiteList, customLocation, customLocationDetail
    ])

    useEffect(() => {
        // 285 -338
        if (showSearchRes) {
            // document.body.style.overflow = 'hidden';
            const target = document.querySelector('.search-res') as HTMLElement
            target.querySelector('input')?.focus()
            const position = target.getBoundingClientRect()
            if (window.innerHeight - position.top < 285) {
               target.style.marginTop = `-338px`
            } else {
                // target.style.top = '0px'
            }
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

    useEffect(() => {
        if (isCustom && MapReady && !historyRef.current) {
            setCustomLocationDetail({
                formatted_address: props.initValue?.formatted_address,
                geometry: {
                    location: {
                        lat: props.initValue?.lat,
                        lng: props.initValue?.lng
                    }
                },
                name: props.initValue?.formatted_address
            })
            historyRef.current = props.initValue?.formatted_address!
        }
    }, [isCustom, MapReady])

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
                    getOptionLabel={(option: any) => <div style={{padding: '7px'}}>
                        <div style={{fontSize: '16px', color: '#272928'}}><span>{option.option.isCreatable ? 'Create: ' : ''}</span> {option.option.title}</div>
                        <div style={{fontSize: '14px', color: '#7B7C7B', fontWeight: 'normal', whiteSpace: 'pre-wrap'}}>{option.option.about}</div>
                    </div> }
                    options={eventSiteList}
                    value={eventSite}
                    onChange={(params) => {
                        if (params.type === 'clear') {
                            reset()
                            return
                        }

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
                                value={customLocationDetail?.formatted_address || ''}
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
                                    {!GmapSearchResult.length &&
                                        <div className={'empty-list'}>
                                            No result
                                        </div>
                                    }
                                </div>
                            }
                        </div>
                    </>
                }

            </>
        }

        <div className={'error'}>{props.errorMsg || ''}</div>
    </div>)
}

export default LocationInput
