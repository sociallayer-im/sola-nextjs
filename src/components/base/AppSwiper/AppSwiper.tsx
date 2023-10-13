import { ReactNode } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Virtual } from 'swiper'

interface AppSwiperProps {
    items: ReactNode[]
    space: number,
    itemWidth: number
}

function AppSwiper(props: AppSwiperProps) {
    return (<Swiper
        data-testid='AppSwiper'
        modules={[Virtual]}
        spaceBetween={ props.space }
        freeMode={ true }
        slidesPerView={'auto'} >
        { props.items.map((item, index) => {
            return <SwiperSlide style={{width: props.itemWidth + 'px'}} key={index}>{ item }</SwiperSlide>
        })}
    </Swiper>)
}

export default AppSwiper
