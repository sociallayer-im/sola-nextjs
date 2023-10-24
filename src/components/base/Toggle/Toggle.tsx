import {useEffect, useState} from 'react'
import {Checkbox, CheckboxProps, STYLE_TYPE, StyledToggle, StyledToggleTrack} from "baseui/checkbox";
import {withStyle} from "styletron-react";

const AppToggle = withStyle(StyledToggle, (props: any) => {
    const {
        $checked,
    } = props

    return {
        background: $checked ? '#fff!important' : '#fff',
        height: '16px',
        width: '16px',
    }
})

const AppToggleTrack = withStyle(StyledToggleTrack, (props: any) => {
    const {
        $checked,
    } = props

    return {
        background: $checked ? '#409EFF' : '#909399',
        height: '20px',
        width: '34px',
        paddingLeft: '2px',
        borderTopLeftRadius: '20px!important',
        borderTopRightRadius: '20px!important',
        borderBottomLeftRadius: '20px!important',
        borderBottomRightRadius: '20px!important',
    }
})

function Toggle(props: CheckboxProps) {

    const overrideProps = {
        Toggle: {
            component: AppToggle
        },
        ToggleTrack: {
            component: AppToggleTrack
        }
    }

    useEffect(() => {

    }, [])

    return (<Checkbox {...props}
                      overrides={overrideProps}
                      checkmarkType={STYLE_TYPE.toggle}/>)
}

export default Toggle
