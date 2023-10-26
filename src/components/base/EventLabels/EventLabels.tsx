import {getLabelColor} from "@/hooks/labelColor";
import LangContext from "@/components/provider/LangProvider/LangContext";
import {useContext} from "react";

export interface EventLabelsProps {
    data: string[]
    value: string[]
    onChange?: (value: string[]) => any,
    disabled?: boolean,
    single?: boolean,
    showRecommend?: boolean,
    showAll?: boolean,
}

function EventLabels({showAll=false, ...props}: EventLabelsProps) {
    let list = props.data
    const {lang} = useContext(LangContext)

    if (!props.showRecommend) {
        list = list.filter(item => item !== 'Recommended')
    }

    return (<div className={props.disabled ? 'event-label-list disabled': 'event-label-list'}>
        { showAll &&
            <div
                onClick={() => {
                    if (props.disabled) return
                    props.onChange && props.onChange([])
                }}
                className={'event-label-item'}>
                <span>{lang['Event_Label_All']}</span>
            </div>
        }
        {
            list.map((item, index) => {
                const isSelected = props.value.includes(item)
                const color = getLabelColor(item)
                const style_1 = isSelected ? {
                        color: color,
                        borderColor: color,
                    } :
                    {
                        color: 'var(--color-text-main)',
                        borderColor: 'var(--color-item-border)',
                    }
                const style_2 = {background: isSelected ? color : '#c4c4c4'}

                return <div
                    style={style_1}
                    onClick={() => {
                        if (props.disabled) return

                        if (isSelected) {
                            props.onChange && props.onChange(props.value.filter(i => i !== item))
                        } else {
                            props.onChange && props.onChange(props.single ? [item]: [...props.value, item])
                        }
                    }}
                    className={'event-label-item'}
                    key={index.toString()}>
                    {
                        isSelected && <i style={style_2}/>
                    }
                    <span>{item}</span>
                </div>
            })
        }
    </div>)
}

export default EventLabels
