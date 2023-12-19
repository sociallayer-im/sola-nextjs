import {useRef} from 'react'
import AppInput from '@/components/base/AppInput'
import {CheckIndeterminate, Plus} from 'baseui/icon'

export interface IssuesInputProps {
    value: string[],
    onChange: (value: string[]) => any,
    placeholder?: string
}

function EventTagInput(props: IssuesInputProps) {
    const onChange = (newValue: string, index: number) => {
        const copyValue = [...props.value]
        copyValue[index] = newValue
        props.onChange(copyValue)
    }


    const addItem = () => {
        const copyValue = [...props.value]
        copyValue.push('')
        props.onChange(copyValue)
    }

    const removeItem = (index: number) => {
        if (props.value.length === 1) return
        const copyValue = [...props.value]
        copyValue.splice(index, 1)
        props.onChange(copyValue)
    }


    const InputItem = (value: string, index: number) => {
        return (
            <div className='issue-input-item' key={index.toString()}>
                <AppInput
                    placeholder={props.placeholder || ''}
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value, index)
                    }}
                    key={index.toString()}
                    onFocus={(e) => {
                        onChange(e.target.value, index)
                    }}
                />

                {index != props.value.length - 1 ?
                    <div className='issue-input-remove-btn' onClick={() => {
                        removeItem(index)
                    }}>
                        <CheckIndeterminate/>
                    </div> :
                    <div className='issue-input-add-btn' onClick={addItem}>
                        <Plus/>
                    </div>
                }
            </div>
        )
    }

    return (<div>
        {
            props.value.map((item, index) => {
                return InputItem(item, index)
            })
        }
    </div>)
}

export default EventTagInput
