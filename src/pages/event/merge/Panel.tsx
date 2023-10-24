import {useEffect, ReactNode} from 'react'

function Panel(props: {title: string | ReactNode, children?: ReactNode}) {
    useEffect(() => {

    }, [])

    return (<div className={'merge-panel'}>
        <div className={'panel-top'}>
            <div className={'title-text'}>{props.title}</div>
        </div>
        <div className={'panel-center'}>{props.children}</div>
        <div className={'panel-bottom'}></div>
    </div>)
}

export default Panel
