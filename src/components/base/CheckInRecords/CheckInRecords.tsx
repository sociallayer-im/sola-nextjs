import {useEffect, useState} from 'react'
import {CheckIn, getProfile, ProfileSimple} from "../../../service/solas";
import usePicture from "../../../hooks/pictrue";
import useTime from "../../../hooks/formatTime";

export interface CheckInRecordsProps {
    data: CheckIn[]
    title?: string
}

function CheckInRecords(props: CheckInRecordsProps) {
    const {defaultAvatar} = usePicture()
    const formatTime = useTime()

    const Item = (props: { item: CheckIn}) => {
        return (
            <div className={'list-item'}>
                <div className={'list-item-left'}>
                    <img src={props.item.profile.image_url || defaultAvatar(props.item.profile.id)} alt=""/>
                    <span>{props.item.profile.domain?.split('.')[0]}</span>
                </div>
                <div className={'list-item-right'}>{formatTime(props.item.created_at)}</div>
            </div>
        )
    }

    return (<div className={'checkin-records'}>
        <div className={'list-title'}>{props.title}</div>
        <div className={'checkin-records-list'}>
            {props.data.map((item, index) => {
                return <Item key={index} item={item} />
            })
            }
            {
                !props.data.length && <div className={'no-data'}>No records</div>
            }
        </div>
    </div>)
}

export default CheckInRecords
