import {useState, useContext, useRef, useEffect} from 'react'
import LangContext from '../../provider/LangProvider/LangContext'
import ReasonText from '../ReasonText/ReasonText'

export interface ReasonInputProps {
    value: string,
    unlimited?: boolean,
    onChange: (value: string) => any
}

function ReasonInput(props: ReasonInputProps) {
    const [value, setValue] = useState(props.value || '')
    const { lang } = useContext(LangContext)
    const showTextDom = useRef<HTMLDivElement | null>(null)
    const editTextDom = useRef<HTMLTextAreaElement | null>(null)

    const mapInput = (value: string) => {
        scroll()
        if (!props.unlimited) {
            value = value.substr(0, 200)
        }
        setValue(value)
        props.onChange(value)
    }

    useEffect(() => {
        setValue(props.value)
    }, [props.value])

    const addTag = () => {
        mapInput(value ? value + ' #': '#')

        editTextDom!.current!.focus()
    }

    const addLink = () => {
        mapInput(value ? value + ' @': '@')
        editTextDom!.current!.focus()
    }

    const scroll = () => {
        showTextDom.current!.scrollTop = editTextDom.current!.scrollTop
    }

    useEffect(() => {
        if (showTextDom.current && editTextDom.current) {
            editTextDom.current?.addEventListener('scroll', scroll, false)
        }

        return () => {
            editTextDom.current?.removeEventListener('scroll', scroll, false)
        }
    }, [showTextDom.current, editTextDom.current])

    return (<div className='reason-input'>
        <ReasonText ref={showTextDom} text={ value } className={'editor'} />
        <textarea
            ref={ editTextDom }
            value={ value }
            className='editor textarea'
            onChange={ (e) => { mapInput(e.target.value)} }/>
        <div className='action-bar'>
            <div className='btns'>
                {/*<div className='btn' onClick={() => { addTag() }}>*/}
                {/*    <i className='icon icon-hash'></i>*/}
                {/*    { lang['IssueBadge_Eventbtn'] }*/}
                {/*</div>*/}
                <div className='btn' onClick={() => { addLink() }}>
                    <i className='icon icon-link'></i>
                    { lang['IssueBadge_linkbtn'] }
                </div>
            </div>
            { !props.unlimited && <div>{ value ? value.length : 0 }/200</div> }

        </div>
    </div>)
}

export default ReasonInput
