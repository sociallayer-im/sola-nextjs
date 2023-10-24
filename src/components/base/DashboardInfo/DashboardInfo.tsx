import {useState, useContext, useEffect} from 'react'
import {EventStats, getEventStats} from "@/service/solas";
import {Select} from "baseui/select";
import LangContext from "../../provider/LangProvider/LangContext";

const daysOptions = [
    {label: 'Last 24 hours', id: 1},
    {label: 'Last 7 days', id: 7},
    {label: 'Last 30 days', id: 30},
    {label: 'Last 3 months', id: 90},
    {label: 'Last 1 year', id: 365},
]

function DashboardInfo(props: {groupid: number}) {
    const [days, setDays] = useState<{label: string, id: number}[]>([daysOptions[0]])
    const [info, setInfo] = useState<EventStats | null>(null)
    const {lang} = useContext(LangContext)

    useEffect(() => {
        getEventStats({id: props.groupid, days: days[0].id}).then((res) => {
            setInfo(res)
        })
    }, [props.groupid, days])

    return (<>
        { !!info &&
            <div className={'dashboard-info'}>
                <div className={'dashboard-title'}>
                    <div>{lang['Setting_Dashboard']}</div>
                    <Select
                        value={days}
                        clearable={false}
                        searchable={false}
                        options={daysOptions}
                        onChange={(params) => {
                            setDays(params.value as any)
                        }}
                    />
                </div>
                <div className={'dashboard-info-item'}>
                    <div className={'label'}>{lang['Setting_Participants']}</div>
                    <div className={'value'}>{info.total_participants}</div>
                </div>
                <div className={'dashboard-info-item'}>
                    <div className={'label'}>{lang['Setting_Hosts']}</div>
                    <div className={'value'}>{info.total_event_hosts}</div>
                </div>
                <div className={'dashboard-info-item'}>
                    <div className={'label'}>{lang['Setting_Events']}</div>
                    <div className={'value'}>{info.total_events}</div>
                </div>
                <div className={'dashboard-info-item'}>
                    <div className={'label'}>{lang['Setting_Badge']}</div>
                    <div className={'value'}>{info.total_issued_badges}</div>
                </div>
            </div>
        }
    </>)
}

export default DashboardInfo
