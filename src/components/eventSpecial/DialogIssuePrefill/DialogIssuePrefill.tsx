import {ReactNode, useContext, useEffect, useState} from 'react'
import AppSwiper from '../AppSwiper/AppSwiper'
import {Delete} from 'baseui/icon'
import LangContext from '@/components/provider/LangProvider/LangContext'
import {Badge} from '@/service/solas'
import {useRouter} from "next/navigation";

export type CreateType = 'badge' | 'point' | 'nftpass' | 'private' | 'gift'

export interface BadgeBookDialogRes {
    badgeId?: number
    badgebookId?: number
    type: CreateType
}

interface DialogIssuePrefillProps {
    badges: Badge[]
    groupBadges?: { groupName: string, badges: Badge[] }[]
    handleClose: () => any
    profileId: number
    onSelect?: (res: BadgeBookDialogRes) => any
}


function DialogIssuePrefill(props: DialogIssuePrefillProps) {
    const [showCreateOption] = useState(false)
    const {lang} = useContext(LangContext)
    const router = useRouter()

    const gotoCreateBadge = (type: CreateType) => {
        !!props.onSelect && props.onSelect({type})
        router.push('/create-badge')
        props.handleClose()
    }

    const badgeItems = (badges: Badge[]) => {
        const handleClick = (item: Badge) => {
            !!props.onSelect && props.onSelect({badgeId: item.id, type: 'badge'})
            props.handleClose()
        }

        return badges.map((item, index) => {
            return (
                <div className='prefill-item' title={item.title} key={index} onClick={() => {
                    handleClick(item)
                }}>
                    <img src={item.image_url} alt=""/>
                </div>
            )
        }) as ReactNode[]
    }

    return (<div className='dialog-issue-prefill'>
        {showCreateOption ?
            <>
                <div className='create-badge-btn' onClick={e => {
                    gotoCreateBadge('badge')
                }}>
                    <img src="/images/badge_type/basic.png" alt=""/>
                    <div>
                        <div>{lang['Badgebook_Dialog_Recognition_Badge']}</div>
                        <div className={'des'}>{lang['Badgebook_Dialog_Recognition_Des']}</div>
                    </div>
                </div>
                <div className='create-badge-btn' onClick={e => {
                    gotoCreateBadge('nftpass')
                }}>
                    <img src="/images/badge_type/nftpass.png" alt=""/>
                    <div>
                        <div>{lang['Badgebook_Dialog_NFT_Pass']} <span className={'new-mark'}>NEW</span></div>
                        <div className={'des'}>{lang['Badgebook_Dialog_NFT_Pass_Des']}</div>
                    </div>
                </div>
                <div className='create-badge-btn' onClick={e => {
                    gotoCreateBadge('point')
                }}>
                    <img src="/images/badge_type/point.png" alt=""/>
                    <div>
                        <div>{lang['Badgebook_Dialog_Points']} <span className={'new-mark'}>NEW</span></div>
                        <div className={'des'}>{lang['Badgebook_Dialog_Points_Des']}</div>
                    </div>
                </div>
                <div className='create-badge-btn' onClick={e => {
                    gotoCreateBadge('private')
                }}>
                    <img src="/images/badge_type/private.png" alt=""/>
                    <div>
                        <div>{lang['Badgebook_Dialog_Privacy']} <span className={'new-mark'}>NEW</span></div>
                        <div className={'des'}>{lang['Badgebook_Dialog_Privacy_Des']}</div>
                    </div>
                </div>
                <div className='create-badge-btn' onClick={e => {
                    gotoCreateBadge('gift')
                }}>
                    <img src="/images/badge_type/gift.png" alt=""/>
                    <div>
                        <div>{lang['Badgebook_Dialog_Gift']} <span className={'new-mark'}>NEW</span></div>
                        <div className={'des'}>{lang['Badgebook_Dialog_Gift_Des']}</div>
                    </div>
                </div>
            </>
            : <>
                {props.badges.length > 0 &&
                    <div className='prefill-module'>
                        <div className='prefill-module-title'>{lang['Badgebook_Dialog_Choose_Badge']}</div>
                        <div className='prefill-module-items'>
                            <AppSwiper items={badgeItems(props.badges)} space={6} itemWidth={68}/>
                        </div>
                    </div>
                }
                {props.groupBadges && props.groupBadges.length > 0 &&
                    <>
                        { props.groupBadges.map((item, index) => {
                            return <div className='prefill-module' key={item.groupName}>
                                <div className='prefill-module-title'>{lang['Badgebook_Dialog_Choose_Group_Badge']([item.groupName])}</div>
                                <div className='prefill-module-items'>
                                    <AppSwiper items={badgeItems(item.badges)} space={6} itemWidth={68}/>
                                </div>
                            </div>
                        })
                        }
                    </>
                }
                <div className='create-badge-btn' onClick={event => {
                    // setShowCreateOption(true)
                    gotoCreateBadge('badge')
                }}>
                    <img src="/images/create_badge_icon.png" alt=""/>
                    <span>{lang['Badgebook_Dialog_Cetate_Badge']}</span>
                </div>
            </>
        }
        <div className='close-dialog' onClick={() => {
            props.handleClose()
        }}><Delete size={20} title='Close'/></div>
    </div>)
}

export default DialogIssuePrefill
