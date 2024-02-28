import React, {useContext, useEffect, useState} from 'react'
import styles from './MyEvent.module.scss'
import ListMyEvent from "@/components/compose/ListMyEvent/ListMyEvent";
import ListPendingEvent from "@/components/compose/ListPendingEvent/ListPendingEvent";
import AppButton from "@/components/base/AppButton/AppButton";
import UserContext from "@/components/provider/UserProvider/UserContext";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import LangContext from "@/components/provider/LangProvider/LangContext";
import {PopupCity, queryPopupCity, userManageGroups} from "@/service/solas";
import ImgLazy from "@/components/base/ImgLazy/ImgLazy";
import Link from "next/link";
import {useTime3} from "@/hooks/formatTime";

function MyEvent({popupCities}: {popupCities: PopupCity[]}) {
    const {user} = useContext(UserContext)
    const {openConnectWalletDialog} = useContext(DialogsContext)
    const {lang} = useContext(LangContext)
    const formatTime = useTime3()

    const [showTime, setShowTime] = useState(false)

    const [tab, setTab] = useState<'attended' | 'created' | 'requests'>('attended')
    const [myGroup, setMyGroup] = useState<number[]>([])


    useEffect(() => {
        if (user.userName) {
            userManageGroups(user.id!).then(res => {
                setMyGroup(res)
            })
        }
    }, [user.userName])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setShowTime(true)
        }
    }, [])

    return (<div className={styles['my-event-page']}>
        <div className={styles['inner']}>
            <div className={styles['main']}>
                <div className={styles['page-title']}>My Event</div>

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
                            }}>{'Attended'}</div>
                            <div className={tab === 'created' ? styles['active'] : ''} onClick={e => {
                                setTab('created')
                            }}>{'Created'}</div>
                            <div className={tab === 'requests' ? styles['active'] : ''} onClick={e => {
                                setTab('requests')
                            }}>{'Pending requests'}</div>
                        </div>

                        {(tab === 'attended' || tab === 'created') &&
                            <ListMyEvent tab={tab}/>
                        }

                        {tab === 'requests' &&
                            <ListPendingEvent groupIds={myGroup}/>
                        }
                    </>
                }
            </div>
            <div className={styles['side']}>
                <div className={styles['page-title']}>Pop-up Cities</div>
                {
                    popupCities.map((city, index) => {
                        return <Link href={`/popup-city/${city.id}`}  className={styles['popup-cities']} key={city.id}>
                            <div className={styles['cover']}>
                                <ImgLazy src={city.image_url!} width={300} />
                            </div>
                            <div>
                                <div className={styles['title']}>{city.title}</div>
                                { showTime &&
                                    <div className={styles['detail']}>
                                        <i className={'icon-calendar'}/>
                                        {formatTime(city.start_date!, city.end_date!, Intl.DateTimeFormat().resolvedOptions().timeZone).data}
                                    </div>
                                }
                                <div className={styles['detail']}>
                                    <i className={'icon-Outline'} />
                                    {city.location}</div>
                            </div>
                        </Link>
                    })
                }
            </div>
        </div>
    </div>)
}

export default MyEvent

export const getServerSideProps = async (context: any) => {
    const popupCities = await queryPopupCity({page: 1, page_size: 5})

    return {
        props: {
            popupCities
        }
    }
}
