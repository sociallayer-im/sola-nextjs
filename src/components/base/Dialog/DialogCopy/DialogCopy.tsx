import AppButton, { BTN_KIND, BTN_SIZE } from '../../AppButton/AppButton'
import LangContext from '../../../provider/LangProvider/LangContext'
import { useContext } from 'react'

interface DialogCopyProps {
    handleClose?: () => any
    message?: string
}

function DialogCopy (props: DialogCopyProps) {
    const { lang } = useContext(LangContext)

    return <div className='dialog-copy'>
        <svg width="36" height="35" viewBox="0 0 36 35" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" width="35" height="35" rx="17.5" fill="black"/>
            <path d="M12 17.5L15.9677 21.5L25 12.5" stroke="url(#paint0_linear_4339_84760)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <defs>
                <linearGradient id="paint0_linear_4339_84760" x1="12" y1="27.125" x2="25.3317" y2="26.4598" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#BAFFAD"/>
                    <stop offset="0.645833" stop-color="#A1F4E6"/>
                    <stop offset="1" stop-color="#80F8C0"/>
                </linearGradient>
            </defs>
        </svg>
        <div className='dialog-copy-title'>{ lang['Dialog_Copy_Title'] }</div>
        <div className='dialog-copy-message'>{ props.message }</div>
        <AppButton special kind={BTN_KIND.primary} size={ BTN_SIZE.compact } onClick={() => { !!props.handleClose && props.handleClose() }}>
            { lang['Dialog_Copy_Btn']}
        </AppButton>
    </div>
}

export default DialogCopy
