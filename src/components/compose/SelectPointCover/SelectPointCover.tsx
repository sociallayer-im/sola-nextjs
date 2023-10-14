import {useEffect, useState} from 'react'
import {Swiper, SwiperSlide} from 'swiper/react'

export const covers = [
    '/images/points/point_1.png',
    '/images/points/point_2.png',
    '/images/points/point_3.png',
    '/images/points/point_4.png',
    '/images/points/point_5.png',
    '/images/points/point_6.png'
]

export interface SelectPointCoverProps {
    value: string,
    onChange: (value: string) => any
}

function SelectPointCover(props: SelectPointCoverProps) {
    let init = 0
    try {
        init = Number(props.value.split('_')[1].split('.')[0]) - 1
    } catch (e: any) {
        console.log(e)
    }

    const [switchIndex, setSwitchIndex] = useState(init)

    useEffect(() => {

    }, [])

    return (<div className={'point-cover-selector'}>
        <Swiper
            className={'point-cover-swiper'}
            slidesPerView={'auto'}
            freeMode={true}
            spaceBetween={20}
            onSlideChange={(swiper) => {
                setSwitchIndex(swiper.activeIndex)
                props.onChange(covers[swiper.activeIndex])
            }}
            centeredSlides={true}>
            {
                covers.map((item, index) => {
                    return <SwiperSlide key={index}
                                        className={switchIndex === index ? 'point-cover active' : 'point-cover'}>
                        <img src={item} alt={'cover'} title={'cover'}/>
                        <div className={'value'}>Value</div>
                    </SwiperSlide>
                })
            }
        </Swiper>
    </div>)
}

export default SelectPointCover
