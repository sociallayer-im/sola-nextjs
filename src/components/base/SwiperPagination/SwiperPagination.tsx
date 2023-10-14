import {useState, useEffect, useRef} from 'react'
import { useSwiper } from 'swiper/react'

interface SwiperPaginationProps {
    total: number,
    showNumber?: number
}

function SwiperPagination({ total, showNumber = 3 }: SwiperPaginationProps) {
    const swiper = useSwiper()
    const [currIndex, setCurrIndex] = useState(0)
    const [leftAmount, setLeftAmount] = useState(0)
    const [rightAmount, setRightAmount] = useState(showNumber - 1)
    const [firstClose, setFirstClose] = useState(false)
    const [animate, setAnimate] = useState(true)
    const history = useRef(currIndex)

    const actualShowNumber = total > showNumber ? showNumber : total

    useEffect(() => {
        swiper.on('slideChange', (swiper) => {
            setCurrIndex(swiper.realIndex)
        })
    }, [swiper])

    useEffect(() => {
        async function slide () {
            const isFirstPage = currIndex < actualShowNumber
            const isLastPage = currIndex > total - actualShowNumber
            const isForward = currIndex > history.current
            const isBackward = currIndex < history.current


            if (isForward) {
                // 下一页
                const animate = (newLeftAmount: number) => {
                    setTimeout(() => {
                        setAnimate(true)
                        setFirstClose(true)
                        setRightAmount(1)

                        setTimeout(() => {
                            setAnimate(false)
                            setFirstClose(false)
                            setLeftAmount(newLeftAmount ? newLeftAmount - 1 : 0)
                        }, 200)
                    }, 200)
                }

                if (isFirstPage) {
                    const newLeftAmount = currIndex % actualShowNumber
                    const newRightAmount = actualShowNumber - newLeftAmount - 1
                    setLeftAmount(newLeftAmount)
                    setRightAmount(newRightAmount)
                    if (newRightAmount === 0 && currIndex !== total - 1) {
                        animate(newLeftAmount)
                    }
                } else if (isLastPage) {
                    if (currIndex === total - 1) {
                        setLeftAmount(actualShowNumber - 1)
                        setRightAmount(0)

                    } else {
                        setLeftAmount(actualShowNumber - 1)
                        setRightAmount(0)
                        animate(actualShowNumber - 1)
                    }
                } else {
                    const newLeftAmount = actualShowNumber - 1
                    setLeftAmount(newLeftAmount)
                    setRightAmount(0)
                    animate(newLeftAmount)
                }

            }

            if (isBackward) {
                // 上一页
                const animate = (newRightAmount: number) => {
                    setTimeout(() => {
                        setLeftAmount(1)
                        setFirstClose(true)
                        setAnimate(true)
                        setTimeout(() => {
                            setFirstClose(false)
                            setTimeout(() => {
                                setAnimate(false)
                            },200)
                        }, 200)
                    }, 100)
                }

                if (isLastPage) {
                    const newRightAmount = total - currIndex - 1
                    const newLeftAmount = actualShowNumber - newRightAmount - 1
                    setRightAmount(newRightAmount)
                    setLeftAmount(newLeftAmount)
                } else if (isFirstPage){
                    if (currIndex === 0) {
                        setLeftAmount(0)
                        setRightAmount(actualShowNumber - 1)
                    } else {
                        setRightAmount(actualShowNumber - 1)
                        setLeftAmount(0)
                        animate(actualShowNumber - 1)
                    }
                } else {
                    const newRightAmount = actualShowNumber - 1
                    setRightAmount(newRightAmount)
                    setLeftAmount(0)
                    animate(newRightAmount)
                }
            }

            history.current = currIndex
        }

        slide()
    }, [currIndex])

    return <>
        { total > 1 &&
            <div className= { animate ? 'app-swiper-pagination animate' : 'app-swiper-pagination'}
                 style={{width: (actualShowNumber * 20 + (actualShowNumber - 1) * 8) + 'px'}}>
                {
                    new Array(leftAmount).fill('1').map((item, i) => {
                        return <div key={i} className={ i===0 && firstClose ? 'swiper-pagination-dot close' : 'swiper-pagination-dot'} />
                    })
                }
                <div className='swiper-pagination-dot active' />
                {
                    new Array(rightAmount).fill('1').map((item, i) => {
                        return <div key={i} className='swiper-pagination-dot' />
                    })
                }
            </div>
        }
    </>
}

export default SwiperPagination
