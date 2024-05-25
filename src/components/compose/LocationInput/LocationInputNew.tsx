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
    event_site_id: number | null,
    location: string | null,
    formatted_address: string | null,
    event_site?: EventSites | null
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
    event?: Event
}


function LocationInput(props: LocationInputProps) {
    const {showToast, showLoading} = useContext(DialogsContext)
    const {langType, lang} = useContext(langContext)
    const {AutoComplete, Section, MapLibReady, MapReady, MapError} = useContext(MapContext)

    const [eventSiteList, setEventSiteList] = useState<Partial<EventSites>[]>([
        {
            id: 0,
            title: '+ Other Location',
            capacity: null,
            require_approval: false,
            timeslots: null,
            start_date: null,
            end_date: null,
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

    const checkAvailable = (option: Partial<EventSites>, start_time: string, end_time: string, timezone: string) => {
        if (!!option && !!option.timeslots && start_time && end_time) {
            const day = dayjs.tz(new Date(start_time).getTime(), timezone).day()
            const dayFullName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
            const target: any = JSON.parse(option.timeslots!).find((item: { day: string, disable: boolean }) => item.day === dayFullName[day])

            const startTime = dayjs.tz(start_time, timezone)
            const endTime = dayjs.tz(start_time, timezone)
            const availableStart = option.start_date ? dayjs.tz(option.start_date, timezone) : null
            const availableEnd = option.end_date ? dayjs.tz(option.end_date, timezone).hour(23).minute(59) : null

            let available = true
            if (availableStart && !availableEnd) {
                available = startTime.isSameOrAfter(availableStart)
            } else if (!availableStart && availableEnd) {
                available = endTime.isBefore(availableEnd)
            } else if (availableStart && availableEnd) {
                console.log('here', startTime.isSameOrAfter(availableStart), endTime.isBefore(availableEnd))
                available = startTime.isSameOrAfter(availableStart) && endTime.isBefore(availableEnd)
            }

            if (option.overrides) {
                const overrides = option.overrides
                const override = overrides.find((item: string) => {
                    return item === startTime.format('YYYY/MM/DD') || item === endTime.format('YYYY/MM/DD')
                })

                if (override) {
                    available = false
                }
            }

            return !(target.disable || !available);
        } else {
            return  true
        }
    }

    useEffect(() => {
        if (!!eventSiteList.length && !!props.initValue?.event_site_id) {
            const eventSite = eventSiteList.find(e => e.id === props.initValue?.event_site_id)
            eventSite && setEventSite([eventSite] as any)
        }

    }, [eventSiteList, props.initValue?.event_site_id])

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
                    geo_lat: placeInfo.geometry.location.lat(),
                    geo_lng: placeInfo.geometry.location.lng(),
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
        if (props.initValue?.location && !props.initValue.event_site_id) {
            setCreateMode(true)
            setSearchKeyword(props.initValue.formatted_address || '')
        }
    }, [props.initValue])

    return (<div className={'input-area event-location-input'}>
        <input type="text" id={'map'}/>
        <div className={'input-area-title'}>{lang['Activity_Form_Where']}</div>
        <div className={'input-area-sub-title'}>{lang['Activity_Detail_Offline_location']}</div>

        {!createMode &&
            <div className={'selector venue'}>
                <i className={'icon-Outline'}/>
                <Select
                    placeholder={'Select an venue...'}
                    labelKey={'title'}
                    valueKey={'id'}
                    clearable={false}
                    creatable={false}
                    searchable={false}
                    getOptionLabel={(option: any) => {
                        const width = document.querySelector('.selector.venue')?.clientWidth
                        const available = checkAvailable(option.option, props.event!.start_time!, props.event!.end_time!, props.event!.timezone!)

                        return <div
                            style={{padding: '7px', width: width ? `${width - 60}px`: 'auto', opacity: available ? 1: 0.3}}>
                            <div style={{fontSize: '16px', color: '#272928', whiteSpace: 'pre-wrap'}}>
                                {option.option.title}
                                {
                                    !!option.option.link &&
                                    <a href={option.option.link} target={'_blank'} style={{marginLeft: '6px'}}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                                            <path d="M11.2941 6.93176C11.1069 6.93176 10.9274 7.00613 10.795 7.13851C10.6626 7.27089 10.5882 7.45044 10.5882 7.63765V9.88235C10.5882 10.0696 10.5139 10.2491 10.3815 10.3815C10.2491 10.5139 10.0696 10.5882 9.88235 10.5882H2.11765C1.93044 10.5882 1.75089 10.5139 1.61851 10.3815C1.48613 10.2491 1.41176 10.0696 1.41176 9.88235V2.11765C1.41176 1.93044 1.48613 1.75089 1.61851 1.61851C1.75089 1.48613 1.93044 1.41176 2.11765 1.41176H4.36235C4.54956 1.41176 4.72911 1.3374 4.86149 1.20502C4.99387 1.07264 5.06824 0.893094 5.06824 0.705882C5.06824 0.518671 4.99387 0.339127 4.86149 0.206748C4.72911 0.0743697 4.54956 0 4.36235 0H2.11765C1.55601 0 1.01738 0.223109 0.620244 0.620245C0.223108 1.01738 0 1.55601 0 2.11765V9.88235C0 10.444 0.223108 10.9826 0.620244 11.3798C1.01738 11.7769 1.55601 12 2.11765 12H9.88235C10.444 12 10.9826 11.7769 11.3798 11.3798C11.7769 10.9826 12 10.444 12 9.88235V7.63765C12 7.45044 11.9256 7.27089 11.7933 7.13851C11.6609 7.00613 11.4813 6.93176 11.2941 6.93176ZM11.9435 0.437647C11.8719 0.265165 11.7348 0.1281 11.5624 0.0564705C11.4775 0.0203004 11.3864 0.00111529 11.2941 0H7.05882C6.87161 0 6.69207 0.0743695 6.55969 0.206748C6.42731 0.339127 6.35294 0.518671 6.35294 0.705882C6.35294 0.893094 6.42731 1.07264 6.55969 1.20502C6.69207 1.3374 6.87161 1.41176 7.05882 1.41176H9.59294L4.44 6.55765C4.37384 6.62327 4.32133 6.70134 4.28549 6.78736C4.24965 6.87338 4.2312 6.96564 4.2312 7.05882C4.2312 7.15201 4.24965 7.24427 4.28549 7.33029C4.32133 7.41631 4.37384 7.49438 4.44 7.56C4.50562 7.62616 4.58369 7.67867 4.66971 7.71451C4.75573 7.75035 4.84799 7.7688 4.94118 7.7688C5.03436 7.7688 5.12662 7.75035 5.21264 7.71451C5.29866 7.67867 5.37673 7.62616 5.44235 7.56L10.5882 2.40706V4.94118C10.5882 5.12839 10.6626 5.30793 10.795 5.44031C10.9274 5.57269 11.1069 5.64706 11.2941 5.64706C11.4813 5.64706 11.6609 5.57269 11.7933 5.44031C11.9256 5.30793 12 5.12839 12 4.94118V0.705882C11.9989 0.61364 11.9797 0.52251 11.9435 0.437647Z" fill="#7492EF"/>
                                        </svg>
                                    </a>
                                }
                            </div>
                            { option.option.require_approval &&
                                <div className={'approval-tag'}>
                                    Require Approval
                                </div>
                            }
                            <div style={{
                                fontSize: '14px',
                                color: '#7B7C7B',
                                fontWeight: 'normal',
                                whiteSpace: 'pre-wrap'
                            }}>{option.option.about}
                            </div>
                            { !!option.option.capacity  &&
                                <div style={{
                                    fontSize: '14px',
                                    color: '#7B7C7B',
                                    fontWeight: 'normal',
                                    whiteSpace: 'pre-wrap'
                                }}>{option.option.capacity} seats</div>
                            }
                        </div>
                    }}
                    options={eventSiteList}
                    value={eventSite as any}
                    onChange={(params: any) => {
                        if (params.value[0].id) {
                            setEventSite(params.value as any)
                            props.onChange && props.onChange({
                                geo_lat: params.value[0].geo_lat,
                                geo_lng: params.value[0].geo_lng,
                                event_site_id: params.value[0].id,
                                location: params.value[0].title,
                                formatted_address: params.value[0].formatted_address,
                                event_site: params.value[0]
                            })
                        } else {
                            setCreateMode(true)
                            setSearchKeyword('')
                            setGmapSearchResult([])
                            setEventSite(null)
                            props.onChange && props.onChange({
                                geo_lat: null,
                                geo_lng: null,
                                event_site_id: null,
                                formatted_address: null,
                                location: null,
                                event_site: null
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
                                geo_lat: null,
                                geo_lng: null,
                                event_site_id: null,
                                formatted_address: null,
                                location: null,
                                event_site: null
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
