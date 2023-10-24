import {useEffect, useState} from 'react'
import {Swiper, SwiperSlide} from 'swiper/react';
import {FreeMode, Mousewheel, Scrollbar} from "swiper";
import ChevronDown from 'baseui/icon/chevron-down';
import {ChevronUp} from "baseui/icon";

const dayName = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MouthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function getCalendarData(date: Date) {
    const year = date.getFullYear()
    const month = date.getMonth()

    // 获取该月第一天
    const firstDate = new Date(year, month, 1, 0, 0, 0, 0)
    // 获取该月最后一天
    const lastDate = new Date(year, month + 1, 0, 0, 0, 0, 0)

    // 将这个月的每一天放入星期数组, 从星期天开始, 不足一周的位置补null
    let currDate = firstDate
    let currWeek = Array(7).fill(null)
    let weeks = []
    let dates = []
    while (currDate.getTime() <= lastDate.getTime()) {
        const weekIndex = currDate.getDay()
        currWeek[weekIndex] = currDate
        dates.push(currDate)

        if (weekIndex === 6 || currDate.getTime() === lastDate.getTime()) {
            weeks.push(currWeek)
            currWeek = Array(7).fill(null)
        }

        currDate = new Date(year, month, currDate.getDate() + 1, 0, 0, 0, 0)
    }

    return {dates, weeks, month, year}
}

function getWeek(date: Date) {
    // 通过时间戳，获得时间戳所在的星期的7天的时间戳，返回一个数组
    const week = []
    const day = date.getDay()
    const time = date.getTime()
    const oneDay = 24 * 60 * 60 * 1000
    for (let i = 0; i < 7; i++) {
        week.push(new Date(time - (day - i) * oneDay))
    }

    return week
}

export interface EventCalendarProps {
    selectedDate?: Date
    hasEventDates?: Date[]
    onSelectedDate?: (date: Date) => any
    onMonthChange?: (date: Date) => any
}

function EventCalendar(props: EventCalendarProps) {
    const [today, setToday] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0, 0))
    const [selected, setSelected] = useState(props.selectedDate || today)
    const [week, setWeek] = useState(getWeek(today))
    const [compactMode, setCompactMode] = useState(true)
    const [fixed, setFixed] = useState(false)
    const [calendarDate, setCalendarDate] = useState([
        getCalendarData(new Date(selected.getFullYear(), selected.getMonth() - 1, 1, 0, 0, 0, 0)),
        getCalendarData(selected),
        getCalendarData(new Date(selected.getFullYear(), selected.getMonth() + 1, 1, 0, 0, 0, 0))
    ])

    useEffect(() => {
        getWeek(today)


        const listener = (e: any) => {
            const ifFixed = e.target.scrollTop > 103
            setFixed(ifFixed)
        }

        const pagerContent = document.querySelector('#layout-content')
        if (pagerContent) {
            pagerContent.addEventListener('scroll', listener, false)
            return () => {
                pagerContent.removeEventListener('scroll', listener, false)
            }
        }
    }, [])

    useEffect(() => {
        setWeek(getWeek(selected))
        setCompactMode(true)

        props.onSelectedDate && props.onSelectedDate(selected)
    }, [selected])

    let wrapperClass = 'event-calendar'

    if (!compactMode) {
        wrapperClass = wrapperClass + ' active'
    }


    return (<div className={wrapperClass}>
      <div className={fixed ? 'fixed-bar fixed' : 'fixed-bar'}>
          <div className={'inner'}>
              <div className={'action-bar'}>
                  <div className={'month-date'}> {MouthName[calendarDate[1].month]} {calendarDate[1].year}</div>
                  <div></div>
              </div>
              <div className={'day-name calendar-row'}>
                  {
                      dayName.map((item, index) => {
                          return <div className={'day-item'} key={index}>{item}</div>
                      })
                  }
              </div>

              {compactMode &&
                  <div className={'week-mode calendar-row'}>
                      {
                          week.map((date, index) => {
                              let className = 'day-item'
                              if (date && selected.getTime() === date.getTime()) {
                                  className = className + ' active'
                              }

                              if (date && today.getTime() === date.getTime()) {
                                  className = className + ' curr'
                              }

                              if (props.hasEventDates && props.hasEventDates.find(item => {
                                  return item.getFullYear() === date.getFullYear()
                                      && item.getMonth() === date.getMonth()
                                      && item.getDate() === date.getDate()
                              })) {
                                  className = className + ' has-event'
                              }

                              return <div
                                  onClick={() => {
                                      !!date && setSelected(date!)
                                  }}
                                  className={className}
                                  key={index}>{date.getDate()}</div>
                          })
                      }
                  </div>
              }

              {!compactMode &&
                  <div className={''}>
                      <Swiper
                          modules={[Scrollbar, FreeMode, Mousewheel]}
                          slidesPerView={'auto'}
                          mousewheel={true}
                          scrollbar={true}
                          direction={'vertical'}
                          observeSlideChildren
                          onSwiper={(swiper) => {
                              swiper.slideTo(1, 0, false)
                          }}
                          onSlideChange={(swiper) => {
                              if (swiper.activeIndex === 1) return
                              const currCalendarDate = calendarDate[swiper.activeIndex]
                              const res = [
                                  getCalendarData(new Date(currCalendarDate.year, currCalendarDate.month - 1, 1, 0, 0, 0, 0)),
                                  getCalendarData(new Date(currCalendarDate.year, currCalendarDate.month, 1, 0, 0, 0, 0)),
                                  getCalendarData(new Date(currCalendarDate.year, currCalendarDate.month + 1, 1, 0, 0, 0, 0))
                              ]
                              props.onMonthChange && props.onMonthChange(currCalendarDate.dates[0])

                              setTimeout(() => {
                                  setCalendarDate(res)
                                  swiper.slideTo(1, 0, false)
                              }, 100)
                          }}>
                          {calendarDate.map((mouth: any, i) => {
                              return <SwiperSlide key={new Date().getTime() + i}
                                                  className={`swiper-slide ${mouth.month}`}>
                                  <div className={'event-calendar-mouth'}>
                                      {
                                          mouth.weeks.map((week: Date[], index: number) => {
                                              return <div className={'calendar-row'} key={index}>
                                                  {
                                                      week.map((date, index2) => {
                                                          let className = 'day-item'
                                                          if (date && selected.getTime() === date.getTime()) {
                                                              className = className + ' active'
                                                          }

                                                          if (date && today.getTime() === date.getTime()) {
                                                              className = className + ' curr'
                                                          }

                                                          if (date && props.hasEventDates && props.hasEventDates.find(item => {
                                                              return item.getFullYear() === date.getFullYear()
                                                                  && item.getMonth() === date.getMonth()
                                                                  && item.getDate() === date.getDate()
                                                          })) {
                                                              className = className + ' has-event'
                                                          }

                                                          return <div
                                                              className={className}
                                                              onClick={() => {
                                                                  !!date && setSelected(date!)
                                                              }}
                                                              key={index2}>
                                                              {date ? date.getDate() : ''}
                                                          </div>
                                                      })
                                                  }
                                              </div>
                                          })
                                      }
                                  </div>
                              </SwiperSlide>
                          })
                          }
                      </Swiper>
                  </div>
              }

              <div className={'toggle-btn'} onClick={() => {
                  setCompactMode(!compactMode)
              }}>
                  {
                      compactMode ? <ChevronDown size={24}/> : <ChevronUp size={24}/>
                  }
              </div>
          </div>
      </div>
    </div>)
}

export default EventCalendar
