import React, {useState, useEffect} from 'react'
import {useInView} from "react-intersection-observer";


function ImgLazy(props: React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>) {
    const {ref, inView} = useInView({
        threshold: 0
    })

    const [ready, setReady] = useState(false)

    useEffect(() => {
        if (inView) {
            setReady(true)
        }

        setReady(true)
    }, [inView])

    const getSrc = (src?: string) => {
        if (!src) return '/images/loading_image.jpg'

        if (src.includes('imagekit') && !src.includes('thumbnail') && (props.width || props.height)) {
            if (props.width && !props.height) {
                return src + `?tr=w-${props.width}`
            }

            if (props.height && !props.width) {
                return src + `?tr=h-${props.height}`
            }

            if (props.height && props.width) {
                return src +`?tr=w-${props.width},h-${props.height}`
            }
        } else {
            return src
        }
    }

    return (<img ref={ref} {...props} src={ready ? getSrc(props.src) : '/images/loading_image.jpg'} />)
}

export default ImgLazy
