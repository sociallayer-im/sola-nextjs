import {useEffect, useState} from "react";
import LangContext from "@/components/provider/LangProvider/LangContext";
import {useContext} from "react";
import EventHomeContext from "@/components/provider/EventHomeProvider/EventHomeContext";
import {Profile} from "@/service/solas";

export interface EventLabelsProps {
    onChange?: (value:Profile) => any,
}

function MaodaoSelectGroup(props: EventLabelsProps) {
    const {availableList, eventGroup} = useContext(EventHomeContext)
    const [selected, setSelected] = useState<number | null>(null)

    useEffect(() => {
        if (eventGroup) {
            if (!selected) {
                setSelected(eventGroup.id)
            }
        }
    }, [eventGroup])


    return (<div className={'event-label-list nowrap'}>
        {
            availableList.map((item, index) => {
                const isSelected = selected === item.id
                const style_1 = isSelected ? {
                        color: '#0D0D0D',
                        borderColor: '#DAD6D7',
                        background: '#DAD6D7'
                    } :
                    {
                        color: 'var(--color-text-main)',
                        borderColor: 'var(--color-item-border)',
                    }

                return <div
                    style={style_1}
                    onClick={() => {
                        setSelected(item.id)
                        props.onChange && props.onChange(item)
                    }}
                    className={'event-label-item'}
                    key={index.toString()}>
                    <span>{item.nickname || item.username}</span>
                </div>
            })
        }
    </div>)
}

export default MaodaoSelectGroup
