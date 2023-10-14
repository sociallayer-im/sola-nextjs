import { createRef, ReactNode } from "react";

interface DetailScrollBoxProp {
    children?: ReactNode
    style?: any
}

function DetailScrollBox (props: DetailScrollBoxProp) {
    const div = createRef<any>()

    return <div ref={ div } className='detail-scroll-box' style={props.style ? props.style : {}}>
        { props.children }
    </div>
}

export default DetailScrollBox
