import {Swiper, SwiperSlide} from 'swiper/react'
import {Mousewheel} from "swiper";


function HorizontalScrolling({items, itemWidth, space = 12}: { items: any[], space: number, itemWidth: number }) {
    return (<Swiper
        modules={[Mousewheel]}
        mousewheel={true}
        spaceBetween={space}
        slidesPerView={'auto'}>
        {
            items.map((item, index) => {
                return <SwiperSlide className='badge-detail-swiper-slide' key={index} style={{width: `${itemWidth}px`}}>
                    {item}
                </SwiperSlide>
            })
        }

    </Swiper>)
}

export default HorizontalScrolling
