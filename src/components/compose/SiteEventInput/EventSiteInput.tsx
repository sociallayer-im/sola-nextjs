import {useContext, useEffect, useRef, useState} from 'react'
import {EventSites} from "@/service/solas";
import AppInput from "../../base/AppInput";
import {Delete} from "baseui/icon";
import DialogsContext from "../../provider/DialogProvider/DialogsContext";
import langContext from "../../provider/LangProvider/LangContext";
import MapContext from "../../provider/MapProvider/MapContext";

export interface GMapSearchResult {
    description: string,
    place_id: string,
    structured_formatting: {
        main_text: string,
        secondary_text: string
    }
}

export interface LocationInputProps {
    index?: number,
    initValue: EventSites,
    onChange?: (value: EventSites) => any
    error?: boolean,
    onDelete?: (index: number) => any
}

function EventSiteInput(props: LocationInputProps) {
    const {showToast, showLoading} = useContext(DialogsContext)
    const {langType, lang} = useContext(langContext)
    const {AutoComplete, Section, MapLibReady, MapReady, MapError} = useContext(MapContext)


    const [searchKeyword, setSearchKeyword] = useState('')
    const [GmapSearchResult, setGmapSearchResult] = useState<GMapSearchResult[]>([])
    const [searching, setSearching] = useState(false)
    const [showSearchRes, setShowSearchRes] = useState(false)

    const [newEventSite, setNewEventSite] = useState<EventSites | undefined>(props?.initValue)
    const [customLocationDetail, setCustomLocationDetail] = useState<any>(props?.initValue.formatted_address || null)


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
        console.log('searchKeyword===', searchKeyword)
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
        if (props.onChange && newEventSite) {
            props.onChange(newEventSite)
        }
    }, [
        newEventSite
    ])

    useEffect(() => {
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
        setNewEventSite(props.initValue)
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
                setCustomLocationDetail(place.formatted_address)
                setSearchKeyword('')
                setNewEventSite(
                    {
                        ...newEventSite!,
                        formatted_address: place.formatted_address,
                        title: newEventSite!.title || place.name,
                        location: newEventSite!.title || place.name,
                        geo_lng: place.geometry.location.lng(),
                        geo_lat: place.geometry.location.lat()
                    }
                )
                unload()
            })
        } catch (e) {
            console.error(e)
            unload()
        }
    }

    return (<div className={'input-area event-site-input'}>
        <input type="text" id={'map'}/>
        <div className={'input-area-sub-title'}>
            <div>{lang['Event_Site_Title']}{props.index || null}</div>
            <div className={'remove-btn'} onClick={e => {
                props.onDelete && props.onDelete(props.index || 0)
            }}>
                {lang['Event_Site_Remove']}
            </div>
        </div>
        <AppInput
            startEnhancer={() => <i className={'icon-edit'}/>}
            endEnhancer={() => <Delete size={24} onClick={reset} className={'delete'}/>}
            placeholder={'Enter location'}
            value={newEventSite!.title}
            onChange={(e) => {
                setNewEventSite({
                    ...newEventSite!,
                    title: e.target.value,
                    location: e.target.value
                })
            }
            }
        />

        {MapReady &&
            <>
                <div className={'input-area-sub-title'}>{lang['Event_Site_Location_title']([props.index || ''])}</div>
                <div className={'custom-selector'}>
                    {
                        showSearchRes && <div className={'shell'} onClick={e => {
                            setShowSearchRes(false)
                        }}/>
                    }
                    <AppInput
                        readOnly
                        errorMsg={props.error ? 'please select location' : undefined}
                        onFocus={(e) => {
                            setSearchKeyword(newEventSite?.title || '');
                            setShowSearchRes(true)
                        }}
                        startEnhancer={() => <i className={'icon-Outline'}/>}
                        endEnhancer={() => <Delete size={24} onClick={resetSelect} className={'delete'}/>}
                        placeholder={'Select location'}
                        value={customLocationDetail || ''}
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

        <div className={'input-area-sub-title'}>
            <div>{lang['Vote_Create_Des']}</div>
        </div>
        <AppInput
            placeholder={'Enter description'}
            value={newEventSite!.about || ''}
            onChange={(e) => {
                setNewEventSite({
                    ...newEventSite!,
                    about: e.target.value
                })
            }
            }
        />
    </div>)
}

export default EventSiteInput
