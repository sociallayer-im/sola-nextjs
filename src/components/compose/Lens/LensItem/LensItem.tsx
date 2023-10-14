import {useEffect, useState} from 'react'
import {LensPublication, getPublicationDetail} from "../../../../service/lens";
import LensIcons from "../LensIcons/LensIcons";
import Player from "../Player/Player";


export interface LensItemProps {
    item: LensPublication
    isQuote?: boolean
}

function LensItem(props: LensItemProps) {
    // 被引用的引用item
    const [subItem, setSubItem] = useState<LensPublication | null>(null)

    const {item} = props

    let images: string[] = []
    let video: string[] = []

    if (images.length > 3) {
        images = images.slice(0, 3)
    }

    const getSubItem = async function (id: string) {
        const subItem = await getPublicationDetail(id)
        setSubItem(subItem)
    }

    useEffect(() => {
        const attributes = item.metadata.attributes
        if (attributes.length) {
            const isQuote= attributes.find(item => {
                console.log('quotedPublicationIdquotedPublicationIdquotedPublicationId', item)
                return item.traitType === 'quotedPublicationId'
            })

            if (isQuote) {
                getSubItem(isQuote.value)
            }
        }
    }, [
        item.metadata.attributes,
    ])

    // 转换图片url的函数
    // 如果是ipfs的url，转换为https,否则不变
    function convertUrl(url: string) {
        if (url.includes('ipfs')) {
            return url.replace('ipfs://', 'https://ipfs.io/ipfs/')
        } else {
            return url
        }
    }

    if (item.metadata.media.length > 0) {
        item.metadata.media.forEach((media) => {
            if (media.original.mimeType.includes('image')) {
                images.push(convertUrl(media.original.url))
            } else if (media.original.mimeType.includes('video')) {
                if (!media.original.url.startsWith('ar')) {
                    video.push(convertUrl(media.original.url))
                }
            }
        })
    }

    images = subItem ? images.slice(0, 2) : images.slice(0, 3)

    // 显示时间的函数，传入Date对象,返回字符串
    // 小于24小时，显示小时
    // 小于7天返回天数
    // 大于7天返回日期
    function showTime(dateStr: string) {
        const now = new Date()
        const date = new Date(dateStr)
        const time = now.getTime() - date.getTime()
        const hours = time / 1000 / 60 / 60
        const days = time / 1000 / 60 / 60 / 24
        if (hours < 24) {
            return `${Math.floor(hours)} hours ago`
        } else if (days < 7) {
            return `${Math.floor(days)} days ago`
        } else {
            return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
        }
    }

    return (<div className={'lens-item'}>
        {
            !!item.mirrorOf && <div className={'is-mirrored'}>
                <LensIcons kind={'mirrored'}/>
                {item.profile.name || item.profile.id} mirrored
            </div>
        }
        <div className={props.isQuote ? 'lens-content quote-item' : 'lens-content'}>
            <img className={'avatar'} src={item.mirrorOf?.profile.picture.original?.url || item.profile.picture.original?.url || '/images/lens/logo.svg'} alt=""/>
            <div className={'ids'}>
                <a className={'name'} href={`https://lenster.xyz/posts/${item.id}`} target={'_blank'}>
                    <img className={'avatar'} src={item.mirrorOf?.profile.picture.original?.url || item.profile.picture.original?.url || '/images/lens/logo.svg'} alt=""/>
                    {item.mirrorOf?.profile.name || item.mirrorOf?.profile.id || item.profile.name || item.profile.id}
                </a>
                <div className={'handle-time'}>
                    <div>@{item.mirrorOf?.profile.handle || item.profile.handle}</div>
                    <div>{showTime(item.mirrorOf?.createdAt ||item.createdAt)}</div>
                </div>
                <a className={'content'} href={`https://lenster.xyz/posts/${item.id}`} target={'_blank'}>
                    {item.metadata.content.slice(0, 250)} {item.metadata.content.length > 300 && '...'}
                </a>

                { !!subItem && <div className={'qrcode'}>
                    <LensItem item={subItem} isQuote />
                </div>}

                {item.metadata.content.length > 300 &&
                    <a className={'show-more'} href={`https://lenster.xyz/posts/${item.id}`} target={'_blank'}>
                        <LensIcons kind={'look'}/>
                        {'show more'}
                    </a>
                }

                <div className={'media'}>
                    {images.length > 1 &&
                        <a className={'images'} href={`https://lenster.xyz/posts/${item.id}`} target={'_blank'}>
                            {
                                images.map((img, index) => {
                                    return <div key={index} >
                                        <img src={img} alt=""/>
                                    </div>
                                })
                            }
                        </a>
                    }

                    {images.length === 1 &&
                        <a className={'image'} href={`https://lenster.xyz/posts/${item.id}`} target={'_blank'}>
                            <img src={images[0]} alt=""/>
                        </a>
                    }

                    {video.length > 0
                        && <Player src={video[0]} poster={item.metadata.cover?.original?.url ? convertUrl(item.metadata.cover?.original?.url) : undefined}></Player>
                    }
                </div>
                <a className={'stats'} href={`https://lenster.xyz/posts/${item.id}`} target={'_blank'}>
                    <div>
                        <LensIcons kind={"comment"} color={'#64748B'}/> {item.stats.commentsTotal || item.mirrorOf?.stats.commentsTotal || ''}
                    </div>
                    <div>
                        <LensIcons kind={"mirrored"} color={'#64748B'}/> {item.stats.totalAmountOfMirrors || item.mirrorOf?.stats.totalAmountOfMirrors || ''}
                    </div>
                    <div>
                        <LensIcons kind={"like"} color={'#64748B'} /> {item.stats.totalUpvotes || item.mirrorOf?.stats.totalUpvotes || ''}
                    </div>
                </a>
            </div>
        </div>
    </div>)
}

export default LensItem
