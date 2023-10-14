import {ReactNode, useEffect, useRef, useState} from 'react'

export interface DialogProps {
    children?: (close: () => any) => ReactNode
    size?: (number | string)[]
    maxSize?: string[]
    minSize?: string[]
    noShell?: boolean
    handleClose?: (...rest: any[]) => any
    position?: 'center' | 'bottom' | ''
}

function Dialog ({ position = '', ...props }: DialogProps) {
    const { children } = props
    const dialogContent = useRef<HTMLDivElement | null>(null)
    const [contentClassName, setContentClassName] = useState('dialog-content' + ' ' + position)
    const [maxHeight, setMaxHeight] = useState(window.innerHeight + 'px')
    const [height, setHeight] = useState(window.innerHeight + 'px')

    let sizeStyle: any = { width: 'auto', height: 'auto', maxWidth: 'initial', maxHeight: 'initial', minWidth:'initial',  minHeight: 'initial' }

    if (props.size) {
        sizeStyle.width = typeof props.size[0] === 'string' ? props.size[0] :`${props.size[0]}px`
        sizeStyle.height = typeof props.size[1] === 'string' ?  props.size[1] : `${props.size[1]}px`
    }

    if (props.maxSize) {
        sizeStyle.maxWidth =  props.maxSize[0]
        sizeStyle.maxHeight =  props.maxSize[1]
    }

    if (props.minSize) {
        sizeStyle.maxWidth =  props.minSize[0]
        sizeStyle.maxHeight =  props.minSize[1]
    }

    const close = () => {
        console.log('close dialog dialogContent', dialogContent)
        if (props.handleClose && dialogContent && dialogContent.current) {
            dialogContent.current!.className = contentClassName.replace('active', '')
            setTimeout(() => {
               props.handleClose!()
            }, 200)
        }
    }

    useEffect(() => {
        if (position) {
            setTimeout(()=> {
                if (dialogContent && dialogContent.current) {
                    dialogContent.current!.className = contentClassName + ' active'
                }

            }, 200)
        }

        const resize = () => {
            setHeight(window.innerHeight + 'px')
            if (position === 'bottom') {
                setMaxHeight(window.innerHeight + 'px')
            }
        }

        resize()

        window.addEventListener('resize', resize, false)

        return () => { window.removeEventListener('resize', resize, false) }
    }, [])

    return (<div data-testid='AppDialog' className='dialog' style={{height: `${height}px`}}>
        <div className={ `dialog-shell ${ props.noShell ? 'light': '' }` } onClick={ close }></div>
        <div className={ contentClassName }  style={ sizeStyle } ref={ dialogContent! }>
            { children && children(close) }
        </div>
    </div>)
}

export default Dialog
