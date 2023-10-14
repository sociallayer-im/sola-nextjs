import {ReactNode} from 'react'
import AppButton, {BTN_KIND, BTN_SIZE} from '../../AppButton/AppButton'
import {Delete} from 'baseui/icon'

export interface DialogConfirmProps {
    confirmLabel?: string,
    confirmBtnColor?: string,
    confirmTextColor?: string,
    cancelLabel?: string,
    title?: string
    content?: string | ((...props: any[]) => ReactNode)
    onConfirm?: (close: () => any) => any
    onCancel?: (...props: any[]) => any
}

function DialogConfirm(props: DialogConfirmProps) {
    let override: any = {
        ':hover':{'opacity': '0.8'}
    }
    if (props.confirmTextColor) {
        override.color = props.confirmTextColor + '!important'
    }
    if (props.confirmBtnColor) {
        override.background = props.confirmBtnColor + '!important'
    }

    return (
        <div className='dialog-confirm'>
            <div className='title'>
                <span>{props.title}</span>
                <div className='dialog-close-btn'
                     onClick={() => {
                         props.onCancel && props.onCancel()
                     }}
                ><Delete size={18}/></div>
            </div>
            {props.content &&
                <div className='content'>
                    {typeof props.content === 'string' ? props.content : props.content()}
                </div>
            }
            <div className='btns'>
                <AppButton
                    size={BTN_SIZE.compact}
                    onClick={() => {
                        props.onCancel && props.onCancel()
                    }}>
                    {props.cancelLabel || 'Cancel'}
                </AppButton>
                <AppButton
                    special
                    style={ override }
                    size={BTN_SIZE.compact}
                    onClick={() => {
                        props.onConfirm && props.onConfirm(props.onCancel!)
                    }}
                    kind={BTN_KIND.primary}>
                    {props.confirmLabel || 'Confirm'}
                </AppButton>
            </div>
        </div>)
}

export default DialogConfirm
