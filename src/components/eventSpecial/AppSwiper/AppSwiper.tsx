import {ReactNode} from 'react'
import {Swiper, SwiperSlide, useSwiper} from 'swiper/react'
import {Virtual} from 'swiper'
import 'swiper/css/virtual';
import {Swiper as SwiperClass} from "swiper/types";

interface AppSwiperProps {
    items: ReactNode[]
    space: number,
    itemWidth: number,
    initIndex?: number,
    endEnhancer?: ReactNode,
    clickToSlide?: boolean,
    boxWidth?: number
}

function Wrapper(props: { children: ReactNode, index: number, width: number, space: number, clickToSlide: boolean, boxWidth?: number }) {
    const swiper = useSwiper()
    return <div className='swiper-inside-wrapper'  style={{width: props.width + 'px'}} onClick={e => {
        if (!props.clickToSlide) return
        setTimeout(() => {
            const windowWidth = window.innerWidth
            const offset = Math.floor((props.boxWidth || 375) / (props.width + props.space) / 2)
            const index = props.index - offset
            console.log('swiper', swiper)
            console.log('offset', offset)
            console.log('index', index)
            swiper.slideTo(index, 500, false)
        }, 0)
    }}>{props.children}</div>

}

function AppSwiper(props: AppSwiperProps) {
    return (<Swiper
        data-testid='AppSwiper'
        modules={[Virtual]}
        spaceBetween={props.space}
        freeMode={true}
        onSwiper={
            (swiper: SwiperClass) => {
                if (props.initIndex) {
                    const windowWidth = window.innerWidth
                    const offset = Math.floor(windowWidth / (props.itemWidth + props.space) / 2)
                    if (props.clickToSlide === undefined || props.clickToSlide) {
                        swiper.slideTo(props.initIndex! - (offset - 4), 0, false)
                    } else {
                        swiper.slideTo(props.initIndex, 0, false)
                    }

                }
            }
        }
        slidesPerView={'auto'}>
        {props.items.map((item, index) => {
            return <SwiperSlide style={{width: props.itemWidth + 'px'}} key={index} virtualIndex={index}>
                <Wrapper
                    boxWidth={props.boxWidth}
                    clickToSlide={props.clickToSlide === undefined ? true : props.clickToSlide}
                    space={props.space}
                    index={index}
                    width={props.itemWidth}>
                    {item}
                </Wrapper>
            </SwiperSlide>
        })}

        {
            <SwiperSlide style={{width: 10 + 'px'}}>{props.endEnhancer}</SwiperSlide>
        }
    </Swiper>)
}

export default AppSwiper
