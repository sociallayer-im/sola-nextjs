import {ReactNode, useEffect, useRef} from 'react'

interface AppFlexTextAreaProps {
    value: string,
    onChange?: (value: string) => any
    placeholder?: string
    icon?: ReactNode
    rows?: number
    maxHeight?: number,
    errorMsg?: string,
}

function AppFlexTextArea(props: AppFlexTextAreaProps) {
    const inputRef = useRef<any>(null)
    const lastValue = useRef<any>('')

    useEffect(function () {
        if (props.value !== inputRef.current.innerText) {
            inputRef.current.innerHTML = props.value
        }
    }, [props.value])

    const onChange = (e: any) => {
        // 除去换行
        const html = inputRef.current?.innerText.replace(/\n/g, '')
        if (props.onChange && html !== lastValue.current) {
            props.onChange(html);
            lastValue.current = html;
        }
    }

    return (
        <div className={'flex-text-area-wrapper'}>
            <div className={props.errorMsg ? 'flex-text-area error' : 'flex-text-area'}>
                {!!props.icon &&
                    <div className={'flex-text-area-icon'}>
                        {props.icon}
                    </div>
                }
                <div
                    data-placeholder={props.placeholder}
                    ref={inputRef}
                    className={props.value ? 'edit-box' : 'edit-box empty'}
                    contentEditable
                    onInput={onChange}
                    onPaste={onChange}
                    style={{maxHeight: props.maxHeight ? props.maxHeight + 'px' : 'initial'}}/>
            </div>
            <div>{props.errorMsg}</div>
        </div>
    )
}

export default AppFlexTextArea
