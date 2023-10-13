import {useNavigate} from 'react-router-dom'
import {useStyletron, withStyle} from 'baseui'
import React, {useEffect, useRef, useState} from 'react'
import './AppTextArea.sass'

export interface AppTextAreaProps  {
    value: string,
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => any
    placeholder?: string
    maxLength?: number
}

function AppTextArea({ maxLength = 200, ...props }: AppTextAreaProps) {
    const [css] = useStyletron()
    const navigate = useNavigate()
    const [a, seta] = useState('')
    const textarea = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (textarea.current) {
            const area = textarea.current.querySelector('textarea')
            const text = textarea.current.querySelector('span')
            area!.addEventListener('input', function(event) {
                text!.innerHTML = (event.target as any).value;
            })
        }
    }, [textarea.current])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (maxLength && e.target.value.length > maxLength) {
            return
        }

        !!props.onChange && props.onChange(e)
    }

    return (
        <div className='app-textarea' ref={ textarea }>
            <span></span>
            <textarea placeholder={ props.placeholder || ''} value={props.value} onChange={ handleChange } ></textarea>
        </div>
    )
}

export default AppTextArea
