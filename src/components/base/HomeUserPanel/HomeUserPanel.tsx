import {useRouter} from 'next/navigation'
import Link from 'next/link'
import React, {useContext, useEffect, useState} from 'react'
import LangContext from '@/components/provider/LangProvider/LangContext'
import UserContext from "@/components/provider/UserProvider/UserContext";
import usePicture from "@/hooks/pictrue";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import AppButton from "@/components/base/AppButton/AppButton";
import EventHomeContext from "@/components/provider/EventHomeProvider/EventHomeContext";
import {Badge, Membership, queryBadge, Group} from "@/service/solas";
import ImgLazy from "@/components/base/ImgLazy/ImgLazy";

function HomeUserPanel({showSchedule=true, ...props}: {
    membership: Membership[],
    isSide?: boolean
    slot?: any
    badges?: Badge[]
    group?: Group,
    showSchedule?: boolean
}) {
    const router = useRouter()
    const {lang, langType} = useContext(LangContext)
    const {user} = useContext(UserContext)
    const {defaultAvatar} = usePicture()
    const {openConnectWalletDialog} = useContext(DialogsContext)
    const {eventGroup, findGroup} = useContext(EventHomeContext)

    const [groupMembers, setGroupMembers] = useState<Membership[]>([])
    const [groupBadges, setGroupBadges] = useState<Badge[]>([])
    const [compact, setCompact] = useState(props.isSide || false)

    useEffect(() => {
        const owner = props.membership.find((item: Membership) => item.role === 'owner')!
        const manager = props.membership.filter((item: Membership) => item.role === 'manager')
        const issuer = props.membership.filter((item: Membership) => item.role === 'issuer')
        let member = props.membership.filter((item: Membership) => item.role === 'member')

        if (compact) {
            const length = manager.length  + issuer.length + 1
            if (length < 10) {
                member = member.slice(0, 10 - length)
            } else {
                member = []
            }
        }

        const list = [owner, ...manager, ...member]
        list.forEach((item: Membership) => {
            if (!list.some((i: any) => i.profile.id === item.profile.id)) {
                list.push(item)
            }
        })
        setGroupMembers(list)
    }, [props.membership, compact])

    useEffect(() => {
        if (props.badges && props.badges.length > 0) {
            setGroupBadges(props.badges.slice(0, 5))
        }
    }, [props.badges])

    return <div className={`home-user-panel ${props.isSide ? 'side' : ''}`}>

        {!!eventGroup &&
            <div className={'center'}>
                <div className={'group-card'}>
                    {
                        process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'maodao' ?
                            <Link href={`/group/${eventGroup.username}`} className={'center'}>
                                <div className={'left'}>
                                    <img className={'avatar'}
                                         src={eventGroup?.image_url || defaultAvatar(eventGroup?.id)} alt=""/>
                                    <span>{eventGroup?.nickname || eventGroup?.username || '--'}</span>
                                </div>
                                <svg className={'right'} xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                     viewBox="0 0 16 16" fill="none">
                                    <path
                                        d="M11.9467 7.74664C11.9149 7.6648 11.8674 7.59004 11.8067 7.52664L8.47333 4.1933C8.41117 4.13114 8.33738 4.08184 8.25617 4.0482C8.17495 4.01456 8.08791 3.99724 8 3.99724C7.82247 3.99724 7.6522 4.06777 7.52667 4.1933C7.46451 4.25546 7.4152 4.32926 7.38156 4.41047C7.34792 4.49168 7.33061 4.57873 7.33061 4.66664C7.33061 4.84417 7.40113 5.01443 7.52667 5.13997L9.72667 7.3333H4.66667C4.48986 7.3333 4.32029 7.40354 4.19526 7.52857C4.07024 7.65359 4 7.82316 4 7.99997C4 8.17678 4.07024 8.34635 4.19526 8.47137C4.32029 8.5964 4.48986 8.66664 4.66667 8.66664H9.72667L7.52667 10.86C7.46418 10.9219 7.41459 10.9957 7.38074 11.0769C7.34689 11.1582 7.32947 11.2453 7.32947 11.3333C7.32947 11.4213 7.34689 11.5084 7.38074 11.5897C7.41459 11.6709 7.46418 11.7447 7.52667 11.8066C7.58864 11.8691 7.66238 11.9187 7.74362 11.9526C7.82486 11.9864 7.91199 12.0038 8 12.0038C8.08801 12.0038 8.17515 11.9864 8.25638 11.9526C8.33762 11.9187 8.41136 11.8691 8.47333 11.8066L11.8067 8.4733C11.8674 8.4099 11.9149 8.33514 11.9467 8.2533C12.0133 8.091 12.0133 7.90894 11.9467 7.74664Z"
                                        fill="#7B7C7B"/>
                                </svg>
                            </Link>
                            :
                            <div className={'center'}>
                                <Link href={`/group/${eventGroup.username}`} className={'left'}>
                                    <img className={'avatar'}
                                         src={eventGroup?.image_url || defaultAvatar(eventGroup?.id)} alt=""/>
                                    <span>{eventGroup?.nickname || eventGroup?.username || '--'}</span>
                                </Link>
                                <Link href={`/group/${eventGroup.username}`} className={'right'}>
                                    {props.membership.length} {lang['Group_detail_tabs_member'].toLowerCase()}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"
                                         fill="none">
                                        <path
                                            d="M11.9467 7.74664C11.9149 7.6648 11.8674 7.59004 11.8067 7.52664L8.47333 4.1933C8.41117 4.13114 8.33738 4.08184 8.25617 4.0482C8.17495 4.01456 8.08791 3.99724 8 3.99724C7.82247 3.99724 7.6522 4.06777 7.52667 4.1933C7.46451 4.25546 7.4152 4.32926 7.38156 4.41047C7.34792 4.49168 7.33061 4.57873 7.33061 4.66664C7.33061 4.84417 7.40113 5.01443 7.52667 5.13997L9.72667 7.3333H4.66667C4.48986 7.3333 4.32029 7.40354 4.19526 7.52857C4.07024 7.65359 4 7.82316 4 7.99997C4 8.17678 4.07024 8.34635 4.19526 8.47137C4.32029 8.5964 4.48986 8.66664 4.66667 8.66664H9.72667L7.52667 10.86C7.46418 10.9219 7.41459 10.9957 7.38074 11.0769C7.34689 11.1582 7.32947 11.2453 7.32947 11.3333C7.32947 11.4213 7.34689 11.5084 7.38074 11.5897C7.41459 11.6709 7.46418 11.7447 7.52667 11.8066C7.58864 11.8691 7.66238 11.9187 7.74362 11.9526C7.82486 11.9864 7.91199 12.0038 8 12.0038C8.08801 12.0038 8.17515 11.9864 8.25638 11.9526C8.33762 11.9187 8.41136 11.8691 8.47333 11.8066L11.8067 8.4733C11.8674 8.4099 11.9149 8.33514 11.9467 8.2533C12.0133 8.091 12.0133 7.90894 11.9467 7.74664Z"
                                            fill="#7B7C7B"/>
                                    </svg>
                                </Link>
                            </div>
                    }
                    { !!eventGroup && groupBadges.length > 0 &&
                        <div className={'group-badge'}>
                            <div className={'left'}>
                                {
                                    groupBadges.map((badge, index) => {
                                        return <Link href={`/badge/${badge.id}`} key={index}>
                                            <ImgLazy key={index} src={badge.image_url} alt="" width={24} height={24}/>
                                        </Link>
                                    })
                                }
                                {`Issued recently`}
                            </div>
                        </div>
                    }
                    <div>
                        {
                            groupMembers.map((membership, index) => {
                                return <Link key={membership.profile.id}
                                             className={'group-card-member-list'}
                                             href={`/profile/${membership.profile.username}`}>
                                    <img className={'avatar'}
                                         src={membership.profile.image_url || defaultAvatar(membership.profile.id)}
                                         alt=""/>
                                    <span className={'name'}>{membership.profile.nickname || membership.profile.username}</span>
                                    { membership.role !== 'member' &&
                                        <div className={'role'}>
                                            {membership.role}
                                        </div>
                                    }
                                </Link>
                            })
                        }

                        { props.membership.length > 0 &&
                           <div className={'side-member-count'} onClick={e => {setCompact(!compact)}}>{`${props.membership.length} ${lang['Group_detail_tabs_member']}`} </div>
                        }
                    </div>
                </div>
            </div>
        }

        {eventGroup?.banner_image_url &&
            <a href={eventGroup?.banner_link_url || undefined} className={'beast-banner'} target={'_blank'}>
                <ImgLazy src={eventGroup?.banner_image_url} width={600} alt=""/>
            </a>
        }

        { (props.group || eventGroup) && showSchedule &&
            <Link href={`/event/${props.group?.username || eventGroup?.username}/schedule`} className={'calendar-btn'}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                        d="M16 14H8C7.73478 14 7.48043 14.1054 7.29289 14.2929C7.10536 14.4804 7 14.7348 7 15C7 15.2652 7.10536 15.5196 7.29289 15.7071C7.48043 15.8946 7.73478 16 8 16H16C16.2652 16 16.5196 15.8946 16.7071 15.7071C16.8946 15.5196 17 15.2652 17 15C17 14.7348 16.8946 14.4804 16.7071 14.2929C16.5196 14.1054 16.2652 14 16 14ZM16 10H10C9.73478 10 9.48043 10.1054 9.29289 10.2929C9.10536 10.4804 9 10.7348 9 11C9 11.2652 9.10536 11.5196 9.29289 11.7071C9.48043 11.8946 9.73478 12 10 12H16C16.2652 12 16.5196 11.8946 16.7071 11.7071C16.8946 11.5196 17 11.2652 17 11C17 10.7348 16.8946 10.4804 16.7071 10.2929C16.5196 10.1054 16.2652 10 16 10ZM20 4H17V3C17 2.73478 16.8946 2.48043 16.7071 2.29289C16.5196 2.10536 16.2652 2 16 2C15.7348 2 15.4804 2.10536 15.2929 2.29289C15.1054 2.48043 15 2.73478 15 3V4H13V3C13 2.73478 12.8946 2.48043 12.7071 2.29289C12.5196 2.10536 12.2652 2 12 2C11.7348 2 11.4804 2.10536 11.2929 2.29289C11.1054 2.48043 11 2.73478 11 3V4H9V3C9 2.73478 8.89464 2.48043 8.70711 2.29289C8.51957 2.10536 8.26522 2 8 2C7.73478 2 7.48043 2.10536 7.29289 2.29289C7.10536 2.48043 7 2.73478 7 3V4H4C3.73478 4 3.48043 4.10536 3.29289 4.29289C3.10536 4.48043 3 4.73478 3 5V19C3 19.7956 3.31607 20.5587 3.87868 21.1213C4.44129 21.6839 5.20435 22 6 22H18C18.7956 22 19.5587 21.6839 20.1213 21.1213C20.6839 20.5587 21 19.7956 21 19V5C21 4.73478 20.8946 4.48043 20.7071 4.29289C20.5196 4.10536 20.2652 4 20 4ZM19 19C19 19.2652 18.8946 19.5196 18.7071 19.7071C18.5196 19.8946 18.2652 20 18 20H6C5.73478 20 5.48043 19.8946 5.29289 19.7071C5.10536 19.5196 5 19.2652 5 19V6H7V7C7 7.26522 7.10536 7.51957 7.29289 7.70711C7.48043 7.89464 7.73478 8 8 8C8.26522 8 8.51957 7.89464 8.70711 7.70711C8.89464 7.51957 9 7.26522 9 7V6H11V7C11 7.26522 11.1054 7.51957 11.2929 7.70711C11.4804 7.89464 11.7348 8 12 8C12.2652 8 12.5196 7.89464 12.7071 7.70711C12.8946 7.51957 13 7.26522 13 7V6H15V7C15 7.26522 15.1054 7.51957 15.2929 7.70711C15.4804 7.89464 15.7348 8 16 8C16.2652 8 16.5196 7.89464 16.7071 7.70711C16.8946 7.51957 17 7.26522 17 7V6H19V19Z"
                        fill="#7492EF"/>
                </svg>
                {lang['Activity_Calendar']}
            </Link>
        }

        {
            props.slot && <>{props.slot()}</>
        }


        {
            !user.userName &&
            <div className={'center'}>
                <div className={'home-login-panel'}>
                    <img src="/images/balloon.png" alt=""/>
                    <div className={'text'}>{lang['Activity_login_des']}</div>
                    <AppButton onClick={e => {
                        openConnectWalletDialog()
                    }} special size={'compact'}>{lang['Activity_login_btn']}</AppButton>
                </div>
            </div>
        }
    </div>

}

export default HomeUserPanel
