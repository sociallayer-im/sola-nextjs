import { useContext, useEffect, useRef, useState} from 'react'
import useBeastConfig, {BeastItemInfo, BeastInfo} from "./beastConfig";
import BeastBtn from "./BeastBtn";
import {Badgelet, divineBeastMerge, divineBeastRemerge, uploadImage } from "@/service/solas";
import UserContext from "../../../components/provider/UserProvider/UserContext";
import DialogsContext from "../../../components/provider/DialogProvider/DialogsContext";
import {useSwiper} from "swiper/react";
import useCopy from "../../../hooks/copy";

export interface BeastMetadata {
    category: number
    name: string
    description: string
    image: string,
    properties: {
        items: string,
        status: 'hide' | 'build' | 'complete',
    }
}

function DivineBeast(props: { badgelet?: Badgelet, hide?: number, poap?: number, host?: number, onMerge?: () => any }) {
    const svgRef = useRef<any>(null)
    const [selectedItem, setSelectedItem] = useState<BeastItemInfo[]>([])
    const {beastInfo} = useBeastConfig()
    const {user} = useContext(UserContext)
    const [loading, setLoading] = useState(false)
    const {showLoading, showToast} = useContext(DialogsContext)
    const [poap, setPoap] = useState(props.poap || 0)
    const [host, setHost] = useState(props.host || 0)
    const swiper = useSwiper()
    const [info, setInfo] = useState<BeastInfo | undefined>(undefined)
    const [badgelet, setBadgelet] = useState<Badgelet | undefined>(props.badgelet)
    const [status, setStatus] = useState<'hide' | 'build' | 'complete'>('hide')
    const [Post, setPost] = useState<any | null>(null)
    const [showSuccessAnimation, setSuccessAnimation] = useState(false)
    const {copy} = useCopy()

    const shareBeast = () => {
        const link = `https://app.sola.day/badgelet/${badgelet!.id}`
        copy(link)
        showToast('分享链接已复制到剪贴板')
    }

    const setSelected = (targetItem: BeastItemInfo) => {
        if (selectedItem.find(item => item.name === targetItem!.name)) {
            setSelectedItem(selectedItem
                .filter(i => i.position !== targetItem!.position)
                .filter(i => i.name !== targetItem!.name))
        } else {
            const newSelectedItem = selectedItem.filter(i => i.position !== targetItem!.position)
            setSelectedItem([...newSelectedItem, targetItem!])
        }
    }

    useEffect(() => {
        const metadata = props.badgelet ? JSON.parse(props.badgelet.metadata!) as BeastMetadata : null
        console.log('metadata',metadata)
        const status: 'hide' | 'build' | 'complete' = props.hide ? 'hide' : (metadata ? metadata.properties.status : 'hide')
        const info = metadata ? beastInfo.find(i =>  i.id === metadata!.category || i.category === metadata!.name)
            : beastInfo.find(i => i.id === props.hide)


        setInfo(info!)
        setStatus(status)
        setPost(info!.post)

        if(metadata && status==='complete' && metadata.properties.items) {
            const a = metadata.properties.items.split(',')
            const b = a.map(i => info!.items.find(j => j.name === i))
            setSelectedItem(b as BeastItemInfo[] || [])
        }
    }, [])

   useEffect(() => {
       if (props.host) {
           setHost(props.host)
       }
       if(props.poap) {
           setPoap(props.poap)
       }
   },[props.host, props.poap])

    const reMerge = () => {
        if (!info) return

        if (selectedItem.length === 0) {
            showToast('合成至少需要一个元素')
            return
        }

        if (poap < selectedItem.length) {
            showToast('POAP或HOST徽章不够哦~')
            return
        }

        setLoading(true)
        const unloading = showLoading()

        const bgImg = document.createElement('img')
        bgImg.crossOrigin = 'anonymous';
        bgImg.src = `/images/merge/beast_${info.id}_show.webp`

        const canvas = document.createElement('canvas')
        canvas.width = 286
        canvas.height = 272

        const ctx = canvas.getContext('2d')
        bgImg.onload = () => {
            ctx?.drawImage(bgImg, 0, 0, 286, 272)
            const ItemImg = document.createElement('img')
            ItemImg.crossOrigin = 'anonymous';
            ItemImg.src = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(svgRef.current.outerHTML)))
            ItemImg.onload = () => {
                ctx?.drawImage(ItemImg, 0, 0, 286, 272)
                // const a = document.createElement('a');
                // a.download = `beast_${new Date().getTime()}.jpg`;
                // a.href = canvas.toDataURL('image/jpeg', 1);
                // a.click();

                canvas.toBlob(async (blob) => {

                    try {
                        const newPic = await uploadImage({
                            file: blob!,
                            auth_token: user.authToken || '',
                            uploader: user.userName || '',
                        })

                        const reMerge = await divineBeastRemerge({
                            auth_token: user.authToken || '',
                            badgelet_id: badgelet!.id,
                            image_url: newPic,
                            value: selectedItem.length,
                            metadata: JSON.stringify({
                                category: info.id,
                                description: `你好奇于山海坞的神秘，已组织过1次山海坞探险并参加过3次坞中神兽的秘密聚会。现在，山民海民们邀请你加入他们，成为山海坞的一员，将象征身份的徽章，颁发给你。愿你：${info.description}。` + ' @https://event.sola.day/merge '  ,
                                name: info.complete,
                                image: newPic,
                                properties: {
                                    items: selectedItem.map(i => i.name).join(','),
                                    status: 'complete'
                                }
                            } as BeastMetadata)
                        })

                        const successAnimation = document.createElement('img')
                        successAnimation.src = '/images/merge/success_animation.gif'
                        successAnimation.onload = () => {
                            unloading()
                            setLoading(false)
                            setStatus('complete')
                            setSuccessAnimation(true)
                            props.onMerge && props.onMerge()
                            setTimeout(() => {
                                setSuccessAnimation(false)
                            }, 1000)
                        }
                    } catch (e) {
                        console.error('合成失败', e)
                        showToast('合成失败')
                        unloading()
                        setLoading(false)
                    }

                }, 'image/jpeg', 1)
            }
        }
    }


    const merge = () => {
        if (!props.hide) return

        if (poap < info!.cost[0] || host < info!.cost[1]) {
            showToast('POAP或HOST徽章不够哦~')
            return
        }

        const unloading = showLoading()
        setLoading(true)

        const bgImg = document.createElement('img')
        bgImg.crossOrigin = 'anonymous';
        bgImg.src = `/images/merge/beast_${props.hide}_show.webp`
        const canvas = document.createElement('canvas')
        canvas.width = 286
        canvas.height = 272
        const ctx = canvas.getContext('2d')
        bgImg.onload = () => {
            ctx?.drawImage(bgImg, 0, 0, 286, 272)
            canvas.toBlob(async (blob) => {
                try {
                    const pic = await uploadImage({
                        file: blob!,
                        auth_token: user.authToken || '',
                        uploader: user.userName || '',
                    })
                    const res = await divineBeastMerge({
                        auth_token: user.authToken || '',
                        content: `你好奇于山海坞的神秘，已组织过1次山海坞探险并参加过3次坞中神兽的秘密聚会。现在，山民海民们邀请你加入他们，成为山海坞的一员，将象征身份的徽章，颁发给你。愿你：${info!.description}。` + ' @https://event.sola.day/merge ',
                        image_url: pic,
                        metadata: JSON.stringify({
                            category: info!.id,
                            description: `你好奇于山海坞的神秘，已组织过1次山海坞探险并参加过3次坞中神兽的秘密聚会。现在，山民海民们邀请你加入他们，成为山海坞的一员，将象征身份的徽章，颁发给你。愿你：${info!.description}。` + ' @https://event.sola.day/merge ',
                            name: info!.category,
                            image: pic,
                            properties: {
                                items: [],
                                status: 'build'
                            }
                        })
                    })

                    const successAnimation = document.createElement('img')
                    successAnimation.src = '/images/merge/success_animation.gif'
                    successAnimation.onload = () => {
                        unloading()
                        setLoading(false)
                        setBadgelet(res)
                        setStatus('build')
                        setSuccessAnimation(true)
                        props.onMerge && props.onMerge()
                        setTimeout(() => {
                            setSuccessAnimation(false)
                        }, 1000)
                    }
                } catch (e) {
                    unloading()
                    setLoading(false)
                    showToast('生成失败')
                    console.error(e)
                }
            }, 'image/jpeg', 1)
        }
    }

    return (<div className={'divine-beast'}>
        { showSuccessAnimation && <img className={'success-animation'} src="/images/merge/success_animation.gif" alt=""/>}
        <div className={'border border-complete'}>
            {
                !!info &&  <div className={'window'}>
                    {
                        status === 'complete' &&
                        <img className={'complete-title'} src="/images/merge/complete.png" alt=""/>
                    }
                    <div className={'post'}>
                        {  !!Post && <Post ref={svgRef} status={status} items={selectedItem.map(i => i.name)}/>
                        }
                    </div>
                    <div className={'options'}>
                        {status === 'hide' &&
                            <div className={'des'}>
                                <div className={'left'}>
                                    <div className={'title'}>神兽类型</div>
                                    <div className={'value'}>{info!.category}</div>
                                </div>
                                <div className={'right'}>
                                    <div className={'title'}>特征</div>
                                    <div className={'value'}>{info!.description}</div>
                                </div>
                            </div>
                        }
                        {status === 'build' &&
                            <div className={'beast-item-list swiper-no-swiping'}>
                                {info!.items.map(item => {
                                    const targetItem = item
                                    return <div key={targetItem!.name}
                                                className={!!selectedItem.find(i => i.name === targetItem!.name) ? 'beast-item active' : 'beast-item'}
                                                onClick={() => setSelected(targetItem!)}>
                                        <div className={'icon'}>
                                            <img src={targetItem!.icon} alt=""/>
                                        </div>
                                        <div className={'item-name'}>{targetItem!.name}</div>
                                    </div>
                                })}
                            </div>
                        }
                        {
                            status === 'complete' &&
                            <div className={'complete'}>
                                <div className={'beast-name'}>{info!.complete}</div>
                                <BeastBtn><a href={`https://app.sola.day/badgelet/${badgelet!.id}`} target={'_blank'}>查看徽章详情</a></BeastBtn>
                                <div className={'share-beast'} onClick={() => {shareBeast()}}>分享神兽 <i className={'icon-icon_share'}></i></div>
                            </div>
                        }
                    </div>
                    {status !== 'complete' && status === 'hide' &&
                        <div className={'btns'}>
                            <BeastBtn
                                loading={loading}
                                background={'#F99351'}
                                onClick={e => {
                                    merge()
                                }}>消耗 Host × 1 + POAP × 3 生成</BeastBtn>
                        </div>
                    }

                    {status !== 'complete' && status === 'build' &&
                        <div className={'btns'}>
                            <BeastBtn loading={loading} background={'#DFC84E'} onClick={e => {
                                reMerge()
                            }}>{ selectedItem.length ? `消耗 POAP × ${selectedItem.length} 合成神兽` : '选择元素合成神兽'}</BeastBtn>
                            <a className={'to-detail'} href={`https://app.sola.day/badgelet/${badgelet!.id}`} target={'_blank'}>{'查看徽章详情 >'}</a>
                        </div>
                    }
                </div>
            }
        </div>
    </div>)
}

export default DivineBeast
