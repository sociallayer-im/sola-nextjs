import {ReactDOM, ReactNode, useEffect, useRef, useState} from 'react'
import {Swiper, SwiperSlide} from 'swiper/react'
import styles from './SelectImgTemp.module.scss'


export interface SelectPointCoverProps {
    textTemp?: () => ReactNode,
    temps: string[],
    value: string,
    onChange: (value: string) => any
}

function SelectImgTemp(props: SelectPointCoverProps) {

    const initIndex = props.temps.findIndex(item => item === props.value)
    const [switchIndex, setSwitchIndex] = useState(initIndex < 0 ? 0 : initIndex)
    const swiperRef = useRef<any>(null)

    useEffect(() => {
        if (!!swiperRef.current) {
            swiperRef.current!.slideTo(switchIndex, 0)
        }
    }, [switchIndex, swiperRef.current])

    return (<div className={'point-cover-selector'}>
        <Swiper
            className={'point-cover-swiper'}
            slidesPerView={'auto'}
            freeMode={true}
            spaceBetween={20}
            onSwiper={(swiper) => {
                swiperRef.current = swiper
            }}
            onSlideChange={(swiper) => {
                setSwitchIndex(swiper.activeIndex)
                props.onChange(props.temps[swiper.activeIndex])
            }}
            centeredSlides={true}>
            {
                props.temps.map((item, index) => {
                    return <SwiperSlide key={index}
                                        style={{position: 'relative'}}
                                        className={switchIndex === index ? 'point-cover active' : 'point-cover'}>
                       <>
                           <img className={styles['cover']} src={item} alt={'cover'} title={'cover'}/>
                           { props.textTemp &&
                               <div className={styles['temp']}>{ props.textTemp() }</div>
                           }
                       </>
                    </SwiperSlide>
                })
            }
        </Swiper>
    </div>)
}

export default SelectImgTemp
