import React, {useEffect, useState} from 'react'
import {useInView} from "react-intersection-observer";


function ImgLazy(props: React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>) {
    const {ref, inView} = useInView({
        threshold: 0
    })

    const [src, setSrc] = useState(props.src)

    useEffect(() => {
        if (props.src?.includes('imagekit') && (props.width || props.height)) {
            if (props.width && !props.height ) {
                setSrc(props.src + `?tr=w-${props.width}`)
                return
            }
            if (props.height && !props.width) {
                setSrc(props.src + `?tr=h-${props.height}`)
                return
            }

            if (props.height && props.width) {
                setSrc(props.src + `?tr=w-${props.width},h-${props.height}`)
                return
            }
        }
    }, [])

    return (inView
        ? <div {...props} ref={ref}>New Component</div>
        : <img {...props} src={src} />)
}

export default ImgLazy
