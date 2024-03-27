import html2canvas from "html2canvas";
import {useParams, useRouter} from 'next/navigation'
import Link from 'next/link'
import {useContext, useEffect, useRef, useState} from 'react'
import {Event, queryEventDetail} from "@/service/solas";
import LangContext from "@/components/provider/LangProvider/LangContext";
import {formatTime, formatTimeWithTimezone, useTime4} from "@/hooks/formatTime";
import QRcode from "@/components/base/QRcode";
import AppButton from "@/components/base/AppButton/AppButton";
import saveCard from "@/utils/html2png";
import copy from "@/utils/copy";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import EventHomeContext from "@/components/provider/EventHomeProvider/EventHomeContext";
import useGetMeetingName from "@/hooks/getMeetingName";
import {mapTimezone} from '@/components/base/AppEventTimeInput/AppEventTimeInput'
import Empty from "@/components/base/Empty";
import {useConnect} from "wagmi";

function CreateEventSuccess() {
    const router = useRouter()
    const [event, setEvent] = useState<Event | null>(null)
    const params = useParams()
    const {lang} = useContext(LangContext)
    const formatTime3 = useTime4
    const card = useRef<any>()
    const {showToast, showLoading} = useContext(DialogsContext)
    const {availableList, setEventGroup, eventGroup} = useContext(EventHomeContext)
    const {getMeetingName} = useGetMeetingName()
    const {connectors} = useConnect()

    const [coverUrl, setCoverUrl] = useState('')
    const [ready, setReady] = useState(false)

    useEffect(() => {
        async function fetchData() {
            const unload = showLoading()
            const res = await queryEventDetail({id: Number(params?.eventid)})

            if (!res) {
                unload()
                // router.push('/error')
                setReady(true)
                return
            }

            setEvent(res)
            setReady(true)

            if (res!.cover_url) {
                const image = new Image();
                image.crossOrigin = 'Anonymous'
                image.src = res!.cover_url
                image.onload = function () {
                    image.onload = function () {
                    }
                    const canvas = document.createElement('canvas')
                    canvas.width = image.width
                    canvas.height = image.height
                    const context = canvas.getContext('2d')
                    context!.drawImage(image, 0, 0)
                    setCoverUrl(canvas.toDataURL())
                    unload()
                }

                image.onerror = function () {
                    unload()
                }
            } else {
                const image = new Image();
                image.crossOrigin = 'Anonymous'
                image.src = '/images/default_event_cover.jpg'
                image.onload = () => {
                    const div1 = document.createElement('div')
                    div1.className = 'default-post'

                    if (res?.start_time && res.end_time) {
                        const div2 = document.createElement('dev')
                        div2.className = 'time'
                        const timeInfo = formatTime3(res!.start_time!, res!.end_time!, res!.timezone!)
                        div2.innerHTML = `${timeInfo.data} <br /> ${timeInfo.time}`
                        div1.appendChild(div2)
                    }

                    if (res!.location) {
                        const div3 = document.createElement('div')
                        div3.className = 'location'
                        div3.innerHTML = `${res!.location}`
                        div1.appendChild(div3)
                    }

                    if (res!.title) {
                        const div4 = document.createElement('div')
                        div4.className = 'title'
                        div4.innerText = res!.title
                        div1.appendChild(div4)
                    }

                    document.querySelector('body')!.appendChild(div1)

                    html2canvas(div1, {
                        useCORS: true, // 【重要】开启跨域配置
                        scale: 1,
                        allowTaint: true,
                        width: 452,
                        height: 452,
                        backgroundColor: null
                    }).then((canvas: HTMLCanvasElement) => {
                        canvas.style.background = 'transparent'
                        const imgData = canvas.toDataURL('image/jpeg')
                        div1.remove()
                        unload()
                        setCoverUrl(imgData)
                    })
                        .catch(function (e: any) {
                            unload()
                            console.error('oops, something went wrong!', e)
                        })
                }
            }
        }

        if (params?.eventid) {
            fetchData()
        }
    }, [params])

    useEffect(() => {
        if (event && availableList.length) {
            const eventGroup = availableList.find(i => i.id === event.group_id)
            if (eventGroup) {
                setEventGroup(eventGroup)
            }
        }
    }, [event, availableList])

    const isMobile = () => {
        return connectors.length && !!window.navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i);
    }

    const downloadCard = () => {
        if (card.current || event) {
            const height = card.current.getBoundingClientRect().height
            saveCard(card.current, event?.title || '', [335, height])
        }
    }

    const copyLink = () => {
        const link = `${window.location.origin}/event/detail/${event?.id}`
        copy(link)
        showToast(lang['Dialog_Copy_Title'])
    }

    return (<>
        <div className={'create-event-success-page'}>
            {ready && event &&
                <>
                    <div className={'center'}>
                        <Link className={'done'} href={eventGroup?.username === 'web3festival' ? `/event/${eventGroup.username}` : `/event/detail/${params?.eventid}`}>Done</Link>
                    </div>
                    <div className={'title'}>{lang['IssueFinish_Title']}</div>
                </>
            }

            {event && coverUrl &&
                <>
                    <div className={'event-share-card-wrapper'}>
                        <div className={'event-share-card'} ref={card}>
                            <img src={coverUrl!} className={'cover'}></img>
                            <div className={'name'}>{event.title}</div>
                            {!!event.start_time &&
                                <div className={'time'}>
                                    <i className={'icon-calendar'}/>
                                    <div className={'start-time'}>
                                        {event.timezone ?
                                            formatTimeWithTimezone(event.start_time, event.timezone)
                                            : formatTime(event.start_time)
                                        }
                                    </div>
                                    {
                                        event.end_time &&
                                        <>
                                            <span>—</span>
                                            <div className={'end-time'}> {
                                                event.timezone ?
                                                    formatTimeWithTimezone(event.end_time, event.timezone)
                                                    : formatTime(event.end_time)
                                            }</div>
                                        </>
                                    }
                                </div>
                            }
                            {!!event.timezone &&
                                <div className={'time'}>
                                    <div className={'event-timezone'}>{mapTimezone(event.timezone).label}</div>
                                </div>
                            }
                            {
                                !!event.location && <div className={'time location'}>
                                    <i className={'icon-Outline'}/>
                                    <div>{event.location}
                                        <br/> {event.formatted_address ? `${event.formatted_address}` : ''}</div>
                                </div>
                            }
                            {
                                !!event.meeting_url && <div className={'time'}>
                                    <i className={'icon-link'}/>
                                    <div>{getMeetingName(event.meeting_url)}</div>
                                </div>
                            }

                            <div className={'card-footer'}>
                                <div className={'left'}>
                                    <div>{lang['Card_Event_Success_1']} <br/>{lang['Card_Event_Success_2']}</div>
                                    <img src="/images/logo.svg" alt=""/>
                                </div>
                                <QRcode size={[63, 63]}
                                        text={'https://' + window.location.host + `/event/detail/${params?.eventid}`}/>
                            </div>
                        </div>
                    </div>

                    <div className={'center'}>
                        <AppButton special onClick={e => {
                            if (eventGroup) {
                                router.push(`/event/${eventGroup.username}`)
                            } else {
                                router.push('/')
                            }
                        }}>{lang['Back_To_Event_Home']}</AppButton>

                    </div>

                    {!isMobile() &&
                        <div className={'center'}>
                            <AppButton onClick={e => {
                                downloadCard()
                            }}>{lang['Save_Card']}</AppButton>
                        </div>}

                    <div className={'center'}>
                        <AppButton onClick={e => {
                            copyLink()
                        }}>{lang['IssueFinish_CopyLink']}</AppButton>

                    </div>
                </>
            }
            {!event && ready &&
                <div className={'center'}>
                    <Empty/>
                    <div style={{textAlign: 'center'}}><b>Event cancelled or not exist </b> <br/><Link href="/">back to
                        home</Link></div>
                </div>
            }
        </div>
    </>)
}

export default CreateEventSuccess
