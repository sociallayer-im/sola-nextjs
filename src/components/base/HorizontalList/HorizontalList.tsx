import React, { ReactNode, useEffect, useState, useImperativeHandle } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Virtual } from 'swiper'
import useScrollToLoad from '../../../hooks/scrollToLoad'
import Empty from '../EmptySmall'
import Slider from './Slider'

export interface HorizontalListMethods {
    refresh: () => void
}

export interface HorizontalList<T> {
    item: (itemData: T) => ReactNode
    space: number,
    itemWidth: number
    itemHeight?: number
    onRef?: React.RefObject<HorizontalListMethods>
    queryFunction?: (page: number) => Promise<T[]>
    sortFunction?: (list: T[]) => T[]
    emptyText?: string
    immediate?: boolean
    endEnhancer?: () => ReactNode
    preEnhancer?: () => ReactNode
    emptyComponent?: () => ReactNode
}

function HorizontalList<T>(props: HorizontalList<T>) {
    const { isEmpty, list, ref, refresh } = useScrollToLoad<T>({
        queryFunction: props.queryFunction || function (page: number) {
            return Promise.resolve([])
        },
        immediate: props.immediate
    })

    const [listData, setListData] = useState<T[]>(list)

    useEffect(() => {
        setListData(props.sortFunction ? props.sortFunction(list) : list)
    }, [list])

    useImperativeHandle(props.onRef, () => {
        // 需要将暴露的接口返回出去
        return { refresh }
    })

    return <>
        {isEmpty && !props.preEnhancer && !props.endEnhancer
            ? props.emptyComponent ? props.emptyComponent(): <Empty text={props.emptyText || 'No data'}/>
            : <div className='horizontal-list-swiper-wrapper'>
                <Swiper
                    data-testid='HorizontalList'
                    modules={[Virtual]}
                    spaceBetween={props.space}
                    freeMode={true}
                    style={{paddingLeft: '12px', paddingTop: '10px', height: props.itemHeight ? props.itemHeight + 10 + 'px' : 'auto'}}
                    slidesPerView={'auto'} >

                    <Slider position='left' />

                    {
                        !!props.preEnhancer &&
                        <SwiperSlide style={ { width: 'auto' } }>
                            { props.preEnhancer() }
                        </SwiperSlide>
                    }

                    {
                        listData.map((data: T, index) => {
                            return <SwiperSlide style={{width: props.itemWidth + 'px'}} key={index}>
                                {props.item(data)}
                            </SwiperSlide>
                        })
                    }

                    {
                        !!props.endEnhancer &&
                        <SwiperSlide style={ { width: 'auto' } }>
                            { props.endEnhancer() }
                        </SwiperSlide>
                    }
                    <SwiperSlide style={ {'maxWidth': '1px'} }>
                        <div ref={ref}></div>
                    </SwiperSlide>

                    <Slider position='right' />
                </Swiper>
            </div>
        }
    </>
}

export default HorizontalList
