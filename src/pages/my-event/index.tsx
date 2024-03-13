import React, {useContext, useEffect, useState} from 'react'
import styles from './MyEvent.module.scss'
import ListMyEvent from "@/components/compose/ListMyEvent/ListMyEvent";
import ListPendingEvent from "@/components/compose/ListPendingEvent/ListPendingEvent";
import AppButton from "@/components/base/AppButton/AppButton";
import UserContext from "@/components/provider/UserProvider/UserContext";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import LangContext from "@/components/provider/LangProvider/LangContext";
import {PopupCity, queryPopupCity, userManageGroups, Group, memberCount} from "@/service/solas";
import ImgLazy from "@/components/base/ImgLazy/ImgLazy";
import Link from "next/link";
import {useTime3} from "@/hooks/formatTime";
import EventHomeContext from "@/components/provider/EventHomeProvider/EventHomeContext";
import usePicture from "@/hooks/pictrue";

export interface GroupWithMemberCount extends Group {
    member_count: number
}


function MyEvent() {
    const {user} = useContext(UserContext)
    const {openConnectWalletDialog} = useContext(DialogsContext)
    const {lang} = useContext(LangContext)
    const {eventGroups} = useContext(EventHomeContext)
    const {defaultAvatar} = usePicture()


    const [tab, setTab] = useState<'attended' | 'created' | 'requests'>('attended')
    const [myGroup, setMyGroup] = useState<number[]>([])
    const [createdGroup, setCreatedGroup] = useState<GroupWithMemberCount[]>([])
    const [joinedGroup, setJoinedGroup] = useState<GroupWithMemberCount[]>([])


    useEffect(() => {
        if (user.userName) {
            userManageGroups(user.id!).then(res => {
                setMyGroup(res)
            })
        }
    }, [user.userName])

    useEffect(() => {
        if (eventGroups.length && myGroup.length && user.id) {
            const created = (eventGroups as Group[]).filter((group: Group) => group.creator.id === user.id)
            const joined = (eventGroups as Group[]).filter((group: Group) => group.creator.id !== user.id && myGroup.includes(group.id))
            memberCount(eventGroups.map(group => group.id)).then((members ) => {
                setCreatedGroup(created.map((group: Group) => {
                    return {
                        ...group,
                        member_count: members.find(member => member.group_id === group.id)?.count || 0
                    }
                }
                ))

                setJoinedGroup(joined.map((group: Group) => {
                        return {
                            ...group,
                            member_count: members.find(member => member.group_id === group.id)?.count || 0
                        }
                    }
                ))
            })
        }
    }, [eventGroups, myGroup, user])

    return (<div className={styles['my-event-page']}>
        <div className={styles['inner']}>
            <div className={styles['main']}>
                <div className={styles['page-title']}>{lang['My_Events']}</div>

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

                {user.userName &&
                    <>
                        <div className={styles['page-tab']}>
                            <div className={tab === 'attended' ? styles['active'] : ''} onClick={e => {
                                setTab('attended')
                            }}>{lang['Attended']}</div>
                            <div className={tab === 'created' ? styles['active'] : ''} onClick={e => {
                                setTab('created')
                            }}>{lang['Activity_State_Created']}</div>
                            <div className={tab === 'requests' ? styles['active'] : ''} onClick={e => {
                                setTab('requests')
                            }}>{lang['Pending_Requests']}</div>
                        </div>


                        <div className={(tab === 'attended' || tab === 'created') ? styles['tab-show'] : styles['tab-hide']}>
                            <ListMyEvent tab={tab as any}/>
                        </div>

                        <div className={ tab === 'requests' ? styles['tab-show'] : styles['tab-hide']}>
                            <ListPendingEvent groupIds={myGroup}/>
                        </div>
                    </>
                }
            </div>

            {user.userName &&
            <div className={styles['side']}>

                <div className={styles['page-title']}>{lang['My_Communities']}</div>
                {
                    createdGroup.map((group, index) => {
                        return <Link href={`/event/${group.username}/`}  className={styles['popup-cities']} key={group.id}>
                            <div className={styles['cover']}>
                                <ImgLazy src={group.image_url || defaultAvatar(group.id)} width={300} />
                            </div>
                            <div>
                                <div className={styles['title']}>{group.nickname || group.username}</div>
                                <div className={styles['detail']}> {group.member_count} {lang['Group_detail_tabs_member']}</div>
                            </div>
                        </Link>
                    })
                }

                <div className={styles['page-title']}>{lang['My_Subscriptions']}</div>
                {
                    joinedGroup.map((group, index) => {
                        return <Link href={`/event/${group.username}/`}  className={styles['popup-cities']} key={group.id}>
                            <div className={styles['cover']}>
                                <ImgLazy src={group.image_url || defaultAvatar(group.id)} width={300} />
                            </div>
                            <div>
                                <div className={styles['title']}>{group.nickname || group.username}</div>
                                <div className={styles['detail']}> {group.member_count} {lang['Group_detail_tabs_member']}</div>
                            </div>
                        </Link>
                    })
                }
            </div>
            }
        </div>
    </div>)
}

export default MyEvent
