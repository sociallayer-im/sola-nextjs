import {useContext, useEffect, useRef, useState} from 'react'
import {EventSites, VenueOverride} from "@/service/solas";
import AppInput from "../../base/AppInput";
import {Delete} from "baseui/icon";
import DialogsContext from "../../provider/DialogProvider/DialogsContext";
import langContext from "../../provider/LangProvider/LangContext";
import MapContext from "../../provider/MapProvider/MapContext";
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
    index?: number,
    initValue: EventSites,
    onChange?: (value: EventSites) => any
    error?: boolean,
    onDelete?: (index: number) => any
}

function EventSiteInput(props: LocationInputProps) {
    const {showToast, showLoading, openDialog} = useContext(DialogsContext)
    const {langType, lang} = useContext(langContext)
    const {AutoComplete, Section, MapLibReady, MapReady, MapError} = useContext(MapContext)


    const [searchKeyword, setSearchKeyword] = useState('')
    const [GmapSearchResult, setGmapSearchResult] = useState<GMapSearchResult[]>([])
    const [searching, setSearching] = useState(false)
    const [showSearchRes, setShowSearchRes] = useState(false)

    const [newEventSite, setNewEventSite] = useState<EventSites | undefined>(props?.initValue)
    const [customLocationDetail, setCustomLocationDetail] = useState<any>(props?.initValue.formatted_address || null)
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
                    geo_lat: result.customLatlng[0] + ''
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

    }

    const showEditTimeSlotDialog = () => {
        openDialog({
            content: (close: any) => {
                return <DialogTimeSlotEdit
                    onConfirm={(value) => {
                        if (value) {
                            console.log('time slot value', value)
                            setNewEventSite({
                                ...newEventSite!,
                                timeslots: null,
                                venue_timeslots: value
                            })
                        }
                    }}
                    value={newEventSite!.venue_timeslots}
                    close={close}/>
            },
            size: ['100%', '100%']
        })
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
            disabled: true,
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
                    options={[{id: null, label: 'All'}, {id: 'manager', label: 'Manager'}] as any}
                    value={newEventSite!.visibility ? [{
                        id: newEventSite!.visibility,
                        label: newEventSite!.visibility
                    }] : [{id: null, label: 'All'}] as any}
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
                    type={'number'}
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

        <div className={'input-area-sub-title'} style={{cursor: 'pointer', marginBottom: '24px'}} onClick={e => {
            showEditTimeSlotDialog()
        }}>
            <div style={{whiteSpace: 'nowrap', flex: '1', display: 'flex', alignItems: 'center'}}>{'Time Slot'}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                     style={{marginLeft: '8px'}}
                     viewBox="0 0 16 16" fill="none">
                    <path
                        d="M3.3335 12.0001H6.16016C6.2479 12.0006 6.33488 11.9838 6.4161 11.9506C6.49733 11.9175 6.5712 11.8686 6.6335 11.8068L11.2468 7.18679L13.1402 5.33346C13.2026 5.27148 13.2522 5.19775 13.2861 5.11651C13.3199 5.03527 13.3374 4.94813 13.3374 4.86012C13.3374 4.77211 13.3199 4.68498 13.2861 4.60374C13.2522 4.5225 13.2026 4.44876 13.1402 4.38679L10.3135 1.52679C10.2515 1.4643 10.1778 1.41471 10.0965 1.38086C10.0153 1.34702 9.92817 1.32959 9.84016 1.32959C9.75216 1.32959 9.66502 1.34702 9.58378 1.38086C9.50254 1.41471 9.42881 1.4643 9.36683 1.52679L7.48683 3.41346L2.86016 8.03346C2.79838 8.09575 2.74949 8.16963 2.71632 8.25085C2.68314 8.33208 2.66632 8.41905 2.66683 8.50679V11.3335C2.66683 11.5103 2.73707 11.6798 2.86209 11.8049C2.98712 11.9299 3.15669 12.0001 3.3335 12.0001ZM9.84016 2.94012L11.7268 4.82679L10.7802 5.77346L8.8935 3.88679L9.84016 2.94012ZM4.00016 8.78012L7.9535 4.82679L9.84016 6.71346L5.88683 10.6668H4.00016V8.78012ZM14.0002 13.3335H2.00016C1.82335 13.3335 1.65378 13.4037 1.52876 13.5287C1.40373 13.6537 1.3335 13.8233 1.3335 14.0001C1.3335 14.1769 1.40373 14.3465 1.52876 14.4715C1.65378 14.5966 1.82335 14.6668 2.00016 14.6668H14.0002C14.177 14.6668 14.3465 14.5966 14.4716 14.4715C14.5966 14.3465 14.6668 14.1769 14.6668 14.0001C14.6668 13.8233 14.5966 13.6537 14.4716 13.5287C14.3465 13.4037 14.177 13.3335 14.0002 13.3335Z"
                        fill="#272928"/>
                </svg>
            </div>
        </div>

        <div className={'input-area-sub-title'} style={{cursor: 'pointer'}} onClick={e => {
            showEditTimeSlotDialog()
        }}>
            <div style={{whiteSpace: 'nowrap', flex: '1', display: 'flex', alignItems: 'center'}}>{'Overrides'}

            </div>
        </div>
        <div>Add dates when your availability changes from your daily hours.</div>
        <div>
            {(newEventSite?.venue_overrides || []).map((o, index) => {
                return o._destroy ?
                    null :
                    <div key={index} className={'override-item'}>
                    <div className={'info'} onClick={(e) => {showEditOverride(index)}}>
                        <div>
                            <div>{dayjs(new Date(o.day)).format('dddd, DD MMM')}</div>
                            <div style={{fontSize: '12px', color: '#7B7C7B'}}>
                                {o.disabled ? 'Unavailable' : 'Available'}
                            </div>
                        </div>
                        <i className={'icon-edit'}/>
                    </div>
                    <svg onClick={e => {handleRemoveOverride(index)}}
                        width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </div>)
}

export default EventSiteInput
