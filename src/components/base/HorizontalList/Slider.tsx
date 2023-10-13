import React, {useState, useEffect, useRef } from 'react'
import { useSwiper } from 'swiper/react'
import Swiper from 'swiper'

interface SliderProps {
    position: 'left' | 'right'
}

function Slider (props: SliderProps) {
    const [swiper, setSwiper] = useState<typeof Swiper>(useSwiper())
    const [hide, setHide] = useState(true)

    const timer = useRef<any>(null)

    const checkHide = () => {
        const condition = swiper.isEnd && swiper.isBeginning
            || props.position === 'left' && swiper.isBeginning
            || props.position === 'right' && swiper.isEnd

        if (condition) {
            // 延迟隐藏，防止不小心点开弹窗
            clearTimeout(timer.current)
            timer.current = setTimeout(() => {
                setHide(true)
            }, 400)
        } else {
            setHide(false)
        }
    }

    useEffect(() => {
        // 无法通过swiper的事件来判断，因为swiper的事件是在touchend之后触发的, 所以用定时器来判断
        // 希望有更好的方法节约性能
        const interval = setInterval(() => {
            checkHide()
        }, 600)

        return () => {
            clearInterval(interval)
        }
    }, [])

    const handleClick = () => {
        if (props.position === 'left') {
            swiper.slidePrev()
        } else {
            swiper.slideNext()
        }
    }

    return hide
        ? null
        : <div className={ props.position === 'left' ? 'left-size-gradient' : 'right-size-gradient'}>
            <img src='/images/slide.png' onClick={ () => { handleClick() }}  alt='' />
        </div>
}

export default Slider
