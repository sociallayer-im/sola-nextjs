import {useEffect, useRef, useState} from 'react'
import Hls from 'hls.js'
import DPlayer from 'dplayer'

interface PlayerProps {
    src: string,
    poster?: string,
}

function Player(props: PlayerProps) {
    const [src, setSrc] = useState<string | undefined>(undefined)
    const [ism3u8, setIsM3u8] = useState(false)
    const videoDom: any = useRef<HTMLDivElement>()

    useEffect(() => {
        if (!props.src.includes('m3u8')) {
            setSrc(props.src)
        } else {
            setIsM3u8(true)
            setTimeout(() => {
                const video = new DPlayer({
                    container: videoDom.current,  // 注意：这里一定要写div的dom
                    lang: 'zh-cn',
                    video: {
                        url: props.src,  // 这里填写.m3u8视频连接
                        type: 'customHls',
                        customType: {
                            customHls: function(video: any) {
                                const hls = new Hls()
                                hls.loadSource(video.src)
                                hls.attachMedia(video)
                            }
                        }
                    }
                })
                // video.play()
            }, 100)
        }
    }, [])

    return (<>
            {
                !ism3u8
                    ? <video className={'video'} src={src}
                                preload="metadata"
                                controls={true}
                                poster={props.poster}
                                data-controller-initialized="true">
                        Your browser doesn't support the HTML5 &lt;code&gt;video&lt;/code&gt; tag, or the video
                        format.</video>
                   : <div ref={videoDom}></div>
            }
        </>
    )
}

export default Player
