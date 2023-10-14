import { ReactNode } from 'react'
import AppButton, { BTN_KIND } from '../../AppButton/AppButton'

export interface DialogConfirmDomainProps {
    confirmLabel?: string,
    cancelLabel?: string,
    title?: string
    content?: string | ((...props: any[]) => ReactNode)
    onConfirm?: (close: () => any ) => any
    onCancel?: (...props: any[]) => any
    red?: boolean
}

function DialogConfirmDomain (props: DialogConfirmDomainProps) {
    return (
        <div className='dialog-confirm-domain'>
            <div className='title'>{ props.title }</div>
            { props.content &&
                <div className='content'>
                    { typeof props.content === 'string' ? props.content : props.content() }
                </div>
            }
            <div className='btns'>
                <AppButton
                    onClick={ () => { props.onCancel && props.onCancel() } }>
                    { props.cancelLabel || 'Cancel' }
                </AppButton>
                <AppButton
                    style={{backgroundColor: props.red ? '#FF4D4F' : undefined}}
                    onClick={ () => { props.onConfirm && props.onConfirm( props.onCancel! ) } }
                    kind={ BTN_KIND.primary }>
                    { props.confirmLabel || 'Confirm' }
                </AppButton>
            </div>
        </div>)
}

export default DialogConfirmDomain
