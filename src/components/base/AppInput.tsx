import { Input, StyledRoot } from 'baseui/input'
import { withStyle, useStyletron } from 'baseui'
import {ReactNode} from "react";

const RootWithStyle = withStyle(StyledRoot, (props) => {
    const {
        $disabled,
        $error,
        $isFocused,
        $theme: { colors },
    } = props

    const borderColor = $disabled
        ? colors.borderTransparent
        : $error
            ? colors.inputBorderError
            : $isFocused
                ? colors.primaryB
                : 'rgba(0,0,0,0)'

    return {
        borderLeftColor: borderColor,
        borderRightColor: borderColor,
        borderTopColor: borderColor,
        borderBottomColor: borderColor,
        borderLeftWidth: '1px',
        borderRightWidth: '1px',
        borderTopWidth: '1px',
        borderBottomWidth: '1px',
        fontSize: '12px!important',
        borderBottomRightRadius: '16px',
        borderBottomLeftRadius: '16px',
        borderTopLeftRadius: '16px',
        borderTopRightRadius: '16px'
    }
})

/**
 * AppInputProps
 * @param value string 绑定值
 * @param onChange? function 修改事件
 * @param error? boolean 是否错误
 * @param errorMsg? string 错误信息
 * @param placeholder? string 提示
 * @param clearable? boolean 是否带清除按钮
 */

interface AppInputProps  {
    onChange?: (...rest: any[]) => any
    error?: boolean,
    errorMsg?: string,
    value: string,
    placeholder?: string,
    clearable?: boolean
    readOnly?: boolean
    endEnhancer?: () => ReactNode
    startEnhancer?: () => ReactNode,
    maxLength?: number,
    style?: any
    autoFocus?: boolean
}

/**
 * AppInput
 * @param props
 * @constructor
 */
export default function AppInput(props: AppInputProps) {
    const [css] = useStyletron()
    const inputStyle = {
        paddingTop: '12px',
        paddingBottom: '12px',
        paddingLeft: '10px',
        paddingRight: '10px',
        fontSize: '14px',
        '::placeholder' : {
            color: '#919191'
        }
    }

    const errorStyle = {
        fontSize: '12px',
        color: '#272928'
    }

    const clearBtnStyle = {
        color: '#c7c7c7'
    }

    const overrides = {
        Root: { component: RootWithStyle },
        Input: { style: {...inputStyle} },
        ClearIcon: { style: clearBtnStyle, props: { size: 26 } },
    }

    return (
        <>
            <Input
                value={ props.value }
                maxLength={ props.maxLength }
                readOnly={ props.readOnly || false }
                clearable={ props.clearable }
                error={ props.error || !!props.errorMsg }
                onChange={ (e) => { if (props.onChange) { props.onChange(e) } } }
                overrides={ overrides }
                placeholder={ props.placeholder || ''}
                startEnhancer={ props.startEnhancer }
                endEnhancer={ props.endEnhancer }
                autoFocus={ props.autoFocus || false }
                size={'compact'}
            />
            {   props.errorMsg ?
                <div className={css(errorStyle)}>{ props.errorMsg }</div>
                : false
            }
        </>
    );
}
