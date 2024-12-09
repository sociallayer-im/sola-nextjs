import {useContext, useEffect, useRef, useState} from 'react'
import {EventSites, VenueOverride} from "@/service/solas";
import AppInput from "../../AppInput";
import {Delete} from "baseui/icon";
import DialogsContext from "../../../provider/DialogProvider/DialogsContext";
import langContext from "../../../provider/LangProvider/LangContext";
import MapContext from "../../../provider/MapProvider/MapContext";
import DialogTimeSlotEdit from "@/components/base/Dialog/DialogTimeSlotEdit";
import {Datepicker} from "baseui/datepicker";
import dayjs from "dayjs";
import Toggle from "@/components/base/Toggle/Toggle";
import {Select} from "baseui/select";
import DialogOverrideEdit from "@/components/base/Dialog/DialogOverrideEdit";

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
    initValue: EventSites,
    onChange?: (value: EventSites) => any
    locationError?: boolean
    titleError?: boolean
    hasTimeSlotError?: (hasError: boolean) => any
}

function DialogEventSiteInput(props: LocationInputProps) {
    const {showToast, showLoading, openDialog} = useContext(DialogsContext)
    const {langType, lang} = useContext(langContext)
    const {AutoComplete, Section, MapLibReady, MapReady, MapError} = useContext(MapContext)


    const [searchKeyword, setSearchKeyword] = useState('')
    const [GmapSearchResult, setGmapSearchResult] = useState<GMapSearchResult[]>([])
    const [searching, setSearching] = useState(false)
    const [showSearchRes, setShowSearchRes] = useState(false)

    const [newEventSite, setNewEventSite] = useState<EventSites>(props.initValue)
    const [customLocationDetail, setCustomLocationDetail] = useState<any>(props.initValue.formatted_address || null)
    const [enableAvailableDate, setEnableAvailableDate] = useState<boolean>(false)

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
                if (searchKeyword && mapService.current && !searching) {
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

    useEffect(() => {
        if (props.onChange && newEventSite) {
            props.onChange(newEventSite)
        }
        if (newEventSite?.end_date || newEventSite?.start_date) {
            setEnableAvailableDate(true)
        } else {
            setEnableAvailableDate(false)
        }
    }, [newEventSite])

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
        setNewEventSite({
            ...newEventSite,
            title: '',
        })
        setSearchKeyword('')
        setGmapSearchResult([])
        setShowSearchRes(false)
    }

    const resetSelect = () => {
        setSearchKeyword('')
        setGmapSearchResult([])
        setShowSearchRes(false)
        setCustomLocationDetail(null)
        setNewEventSite(
            {
                ...newEventSite!,
                formatted_address: ``,
                title: '',
                location: '',
                geo_lng: null,
                geo_lat: null,
                location_data: null
            }
        )
    }

    const handleSelectSearchRes = async (result: GMapSearchResult) => {
        if (result.customLatlng) {
            setShowSearchRes(false)
            setCustomLocationDetail(result.description)
            setSearchKeyword('')
            setNewEventSite(
                {
                    ...newEventSite!,
                    formatted_address: `${result.customLatlng[0]},${result.customLatlng[1]}`,
                    title: result.structured_formatting.main_text,
                    location: `${result.customLatlng[0]},${result.customLatlng[1]}`,
                    geo_lng: result.customLatlng[1] + '',
                    geo_lat: result.customLatlng[0] + '',
                    location_data: null
                }
            )
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
                            geo_lat: place.geometry.location.lat(),
                            location_data: place.place_id
                        }
                    )
                    unload()
                })
            } catch (e) {
                console.error(e)
                unload()
            }
        }

    }

    const getUnOverridedDate = () => {
        let start = dayjs()
        let target = null
        while (!target) {
            const day = start.format('YYYY/MM/DD')
            if (!newEventSite?.venue_overrides?.find(o => o.day === day)) {
                target = start
            }
            start = start.add(1, 'day')
        }

        return target
    }

    const showEditOverride = (index: number) => {
        openDialog({
            content: (close: any) => {
                return <DialogOverrideEdit
                    onConfirm={(value) => {
                        newEventSite!.venue_overrides![index] = value
                        setNewEventSite({
                            ...newEventSite!
                        })
                    }}
                    blockDate={newEventSite!.venue_overrides
                        .filter(o => !o._destroy)
                        .map(o => new Date(o.day))}
                    value={newEventSite!.venue_overrides![index]}
                    close={close}/>
            },
            size: ['100%', '100%']
        })
    }

    const addOverride = () => {
        const emptyOverride:VenueOverride = {
            day: getUnOverridedDate().format('YYYY/MM/DD'),
            start_at: '00:00',
            end_at: '23:59',
            disabled: false,
            role: 'all',
            venue_id: newEventSite!.id
        }

        openDialog({
            content: (close: any) => {
                return <DialogOverrideEdit
                    onConfirm={(value) => {
                        newEventSite!.venue_overrides!.push(value)
                        setNewEventSite({
                            ...newEventSite!
                        })
                    }}
                    blockDate={newEventSite!.venue_overrides
                        .filter(o => !o._destroy)
                        .map(o => new Date(o.day))
                }
                    value={emptyOverride}
                    close={close}/>
            },
            size: ['100%', '100%']
        })
    }

    const handleRemoveOverride = (index: number) => {
        newEventSite!.venue_overrides![index]!._destroy = '1'
        setNewEventSite({
            ...newEventSite!
        })
    }


    return (<div className={'input-area event-site-input'}>
        <input type="text" id={'map'}/>
        <div className={'input-area-sub-title'}>
            <div>Name of venue</div>
        </div>
        <AppInput
            errorMsg={props.titleError ? 'please input title' : undefined}
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
                <div className={'input-area-sub-title'}>{lang['Event_Site_Location_title']}</div>
                <div className={'custom-selector'}>
                    {
                        showSearchRes && <div className={'shell'} onClick={e => {
                            setShowSearchRes(false)
                        }}/>
                    }
                    <AppInput
                        readOnly
                        errorMsg={props.locationError ? 'please select location' : undefined}
                        onFocus={(e) => {
                            setSearchKeyword(newEventSite?.formatted_address || '');
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
                                placeholder={'Input location name to search or geo point like 40.7128,-74.0060'}
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

        <div className={'input-area-sub-title'}>
            <div>{lang['Form_Marker_Link_Label']}</div>
        </div>
        <AppInput
            placeholder={lang['Form_Marker_Link_Label']}
            value={newEventSite!.link || ''}
            onChange={(e) => {
                setNewEventSite({
                    ...newEventSite!,
                    link: e.target.value
                })
            }
            }
        />
        <div className={'input-area-sub-title'} style={{marginTop: '24px'}} onClick={e => {
            if (enableAvailableDate) {
                setNewEventSite({
                    ...newEventSite!,
                    start_date: null,
                    end_date: null
                })
            } else {
                setEnableAvailableDate(true)
            }
        }
        }>
            <div style={{whiteSpace: 'nowrap', flex: '1'}}>{'Available Date (Optional)'}</div>
        </div>
        <div className={'app-date-input-v2 second'}>
            <div className={'from-label'}>From</div>
            <div className={'slots'}>
                <Datepicker
                    clearable={true}
                    value={newEventSite!.start_date ? new Date(newEventSite!.start_date) : null}
                    onChange={({date}) => {
                        const time = Array.isArray(date) ? date : [date][0] as any
                        console.log('time', time)
                        if (!time) {
                            setNewEventSite({
                                ...newEventSite!,
                                start_date: null,
                            })
                        } else {
                            setNewEventSite({
                                ...newEventSite!,
                                start_date: dayjs(time.toISOString()).format('YYYY/MM/DD') || null,
                                end_date: dayjs(time.toISOString()).add(1, 'month').format('YYYY/MM/DD') || null
                            })
                        }
                    }
                    }
                />
            </div>
            <div className={'from-label'}>To</div>
            <div className={'slots'}>
                <Datepicker
                    clearable={true}
                    minDate={newEventSite!.start_date ? new Date(newEventSite!.start_date) : null}
                    value={newEventSite!.end_date ? new Date(newEventSite!.end_date) : null}
                    onChange={({date}) => {
                        const time = Array.isArray(date) ? date : [date][0] as any
                        if (!time) {
                            setNewEventSite({
                                ...newEventSite!,
                                end_date: null
                            })
                        } else {
                            setNewEventSite({
                                ...newEventSite!,
                                end_date: dayjs(time.toISOString()).format('YYYY/MM/DD') || null
                            })
                        }
                    }
                    }
                />
            </div>
        </div>

        <div className={'input-area-sub-title'} style={{marginTop: '24px', marginBottom: '24px'}}>
            <div style={{whiteSpace: 'nowrap', flex: '1'}}>
                {'Visibility'}
            </div>

            <div style={{width: '150px'}}>
                <Select
                    clearable={false}
                    searchable={false}
                    options={[{id: 'all', label: 'All'}, {id: 'manager', label: 'Manager'}] as any}
                    value={newEventSite!.visibility ? [{
                        id: newEventSite!.visibility,
                        label: newEventSite!.visibility
                    }] : [{id: 'all', label: 'All'}] as any}
                    onChange={({option}) => {
                        setNewEventSite({
                            ...newEventSite!,
                            visibility: option!.id as any
                        })
                    }}
                />
            </div>
        </div>


        <div className={'input-area-sub-title'} style={{marginTop: '24px'}}>
            <div style={{whiteSpace: 'nowrap', flex: '1'}}>
                {'Venue Capacity (Optional)'}
            </div>

            <div style={{width: '150px'}}>
                <AppInput
                    placeholder={'Unlimited'}
                    value={newEventSite!.capacity ? Number(newEventSite!.capacity) + '' : ''}
                    type={'tel'}
                    onChange={(e) => {
                        let value = e.target.value as any
                        if (isNaN(Number(value))) return
                        if (!value) {
                            value = 0
                        } else if (Number(value) < 0) {
                            value = 1
                        } else if (value.includes('.')) {
                            value = value.split('.')[0]
                        }

                        setNewEventSite({
                            ...newEventSite!,
                            capacity: Number(value) || null
                        })
                    }
                    }
                />
            </div>
        </div>

        <div className={'input-area-sub-title'} style={{marginTop: '24px', marginBottom: '24px'}}>
            <div style={{whiteSpace: 'nowrap', flex: '1'}}>
                {'Require Approval (Optional)'}
            </div>

            <Toggle checked={!!newEventSite?.require_approval}
                    onChange={(e) => {
                        setNewEventSite({
                            ...newEventSite!,
                            require_approval: !newEventSite!.require_approval
                        })
                    }}
            />
        </div>
            <div className={'input-area-sub-title'} style={{marginTop: '36px', marginBottom: '36px'}}>
                <div style={{whiteSpace: 'nowrap', flex: '1', display: 'flex', alignItems: 'center'}}>{'Time Slot'}</div>
            </div>

            <DialogTimeSlotEdit
                onChange={(value) => {
                    if (value) {
                        console.log('time slot value', value)
                        setNewEventSite({
                            ...newEventSite!,
                            timeslots: null,
                            venue_timeslots: value
                        })
                    }
                }}
                hasTimeSlotError ={(hasError) => {
                    !!props.hasTimeSlotError && props.hasTimeSlotError(hasError)
                }}
                value={newEventSite!.venue_timeslots}
                close={close}/>

            <div style={{padding: '0 12px'}}>
                <div className={'input-area-sub-title'} style={{cursor: 'pointer'}}>
                    <div style={{whiteSpace: 'nowrap', flex: '1', display: 'flex', alignItems: 'center'}}>{'Overrides'}
                    </div>
                </div>
                <div>Add dates when your availability changes from your daily hours.</div>
                <div>
                    {(newEventSite?.venue_overrides || []).map((o, index) => {
                        return o._destroy ?
                            null :
                            <div key={index} className={'override-item'}>
                                <div className={'info'} onClick={(e) => {
                                    showEditOverride(index)
                                }}>
                                    <div>
                                        <div>{dayjs(new Date(o.day)).format('dddd, DD MMM')}</div>
                                        <div style={{fontSize: '12px', color: '#7B7C7B'}}>
                                            {o.disabled ? 'Unavailable' : 'Available'} {o.role && !o.disabled  ? `for ${o.role}` : ''}
                                        </div>
                                    </div>
                                    <i className={'icon-edit'}/>
                                </div>
                                <svg onClick={e => {
                                    handleRemoveOverride(index)
                                }}
                                     width="32" height="32" viewBox="0 0 32 32" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <rect x="0.5" y="0.5" width="31" height="31" rx="15.5" fill="white"/>
                                    <rect x="0.5" y="0.5" width="31" height="31" rx="15.5" stroke="#7B7C7B"/>
                                    <path fillRule="evenodd" clipRule="evenodd"
                                          d="M19.5 15C19.7761 15 20 15.2239 20 15.5V16.5C20 16.7761 19.7761 17 19.5 17H12.5C12.2239 17 12 16.7761 12 16.5V15.5C12 15.2239 12.2239 15 12.5 15H19.5Z"
                                          fill="#7B7C7B"/>
                                </svg>
                            </div>
                    })}
                    <div className={'add-override-btn'} onClick={addOverride}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M9.1665 10.8332H4.1665V9.1665H9.1665V4.1665H10.8332V9.1665H15.8332V10.8332H10.8332V15.8332H9.1665V10.8332Z"
                                fill="#1D1B20"/>
                        </svg>
                        <div>Add override</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DialogEventSiteInput
