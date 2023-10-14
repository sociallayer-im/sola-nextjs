import {useEffect, useRef, useState} from 'react'
import { Slider } from 'baseui/slider'

const overrides = {
    InnerThumb: () => null,
    ThumbValue: () => null,
    TickBar: () => null,
    InnerTrack: {
        style: {
            height: '4px',
            borderTopLeftRadius: '2px',
            borderTopRightRadius: '2px',
            borderBottomRightRadius: '2px',
            borderBottomLeftRadius: '2px',
            background: '#ECF2EE'
        }
    },
    Thumb: {
        style: () => ({
            height: '20px',
            width: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            borderBottomRightRadius: '20px',
            borderBottomLeftRadius: '20px',
            borderLeftStyle: 'solid',
            borderRightStyle: 'solid',
            borderTopStyle: 'solid',
            borderBottomStyle: 'solid',
            borderLeftWidth: '3px',
            borderTopWidth: '3px',
            borderRightWidth: '3px',
            borderBottomWidth: '3px',
            borderLeftColor: `#fff`,
            borderTopColor: `#fff`,
            borderRightColor: `#fff`,
            borderBottomColor: `#fff`,
            boxShadow: '0px 1.9878px 18px rgba(0, 0, 0, 0.2)',
            background: 'linear-gradient(88.02deg, #BAFFAD -2.09%, #A1F4E6 62.09%, #80F8C0 97.29%)',
        }),
    }}

interface AppSliderProp {
    value: number[]
    max:number
    min:number
    step: number
    onChange?: (res: number[]) => any
    onFinalChange?: (res: number[]) => any

}

function AppSlider(props: AppSliderProp) {
    return <div className='app-slider' data-testid='AppSlider'>
        <img className='icon-1' src="/images/image_icon.png" alt=""/>
        <Slider
            overrides={ overrides }
            value={ props.value }
            min={ props.min }
            max={ props.max }
            step={ props.step }
            onChange={({ value }) => { value && props.onChange && props.onChange(value) } }
            onFinalChange={({ value }) => { return value && props.onFinalChange && props.onFinalChange(value)} }
        />
        <img className='icon-2' src="/images/image_icon.png" alt=""/>
    </div>
}

export default AppSlider
