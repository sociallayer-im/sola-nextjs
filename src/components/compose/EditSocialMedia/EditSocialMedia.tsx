import {ReactNode, useContext, useEffect, useRef, useState} from 'react'
import langContext from '../../provider/LangProvider/LangContext'
import DialogsContext from '../../provider/DialogProvider/DialogsContext'
import {OpenDialogProps} from '../../provider/DialogProvider/DialogProvider'
import { Delete } from 'baseui/icon'
import AppButton, {BTN_KIND, BTN_SIZE} from '../../base/AppButton/AppButton'
import useSocialMedia from "../../../hooks/socialMedia";

export interface EditSocialMediaProps {
    value: string,
    onChange?: (value: string) => any
    preEnhancer?: () => ReactNode | string
    type?: string
    title: string
    icon: string
}

export interface EditDialogProps {
    title: string,
    value: string,
    onConfirm: (value: string) => any
    handleClose: () => any
}

const MediaTitle = function (props: { title: string, icon: string }) {
    return <div className='edit-media-title'>
        <i className={props.icon} />
        <span>{props.title}</span>
    </div>
}

function EditDialog(props: EditDialogProps) {
    const input = useRef<HTMLInputElement| null >(null)
    const { lang } = useContext(langContext)
    const [value, setValue] = useState(props.value)

    useEffect(() => {
        if (input.current) {
            input.current.focus()
        }
    }, [input.current])

    const handleConfirm = () => {
        props.onConfirm(value)
        props.handleClose()
    }

    return <div className='edit-media-edit-dialog'>
        <div className='dialog-title'>
            <span>{lang['Profile_Edit_Social_Media_Edit_Dialog_Title']}{props.title}</span>
            <div className='dialog-close-title' onClick={() => {props.handleClose() }}><Delete size={30}/></div>
        </div>
        <input type="text" ref={ input } value={ value } onChange={(e) => {
            setValue(e.target.value.trim())
        }}/>
        <AppButton
            special
            onClick={ handleConfirm }
            disabled={!value }
            size={BTN_SIZE.compact}>{lang['Profile_Edit_Social_Confirm']}</AppButton>
    </div>
}

function EditSocialMedia(props: EditSocialMediaProps) {
    const {lang} = useContext(langContext)
    const {openDialog} = useContext(DialogsContext)
    const {url2Id} = useSocialMedia()

    useEffect(() => {

    }, [])

    const showEditDialog = () => {
        const dialogProp: OpenDialogProps = {
            content: (close: any) => <EditDialog
                title={props.title}
                value={props.value}
                onConfirm={(value) => {
                    !!props.onChange && props.onChange(value)
                }}
                handleClose={close}/>,
            size: [350, 'auto']
        }

        openDialog(dialogProp)
    }

    return (<div className='edit-media-item' onClick={() => {
        showEditDialog()
    }}>
        <div className='media-title'>
            <MediaTitle title={props.title} icon={props.icon} />
        </div>
        {props.value
            ? <div className='media-value'>{url2Id(props.value, props.type || '')}</div>
            : <div className='media-edit-btn'>{lang['Profile_Edit_Social_Media_Edit']}</div>
        }
    </div>)
}

export default EditSocialMedia
