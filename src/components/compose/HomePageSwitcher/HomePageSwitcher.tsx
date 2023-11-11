import {useContext, useEffect, useState} from 'react'
import langContext from "../../provider/LangProvider/LangContext";
import TriangleDown from "baseui/icon/triangle-down";
import {Profile} from "@/service/solas";
import {useParams, usePathname, useRouter} from "next/navigation";
import EventHomeContext from "../../provider/EventHomeProvider/EventHomeContext";

function HomePageSwitcher() {
    const {lang} = useContext(langContext)
    const [showList, setShowList] = useState(false)
    const params = useParams()
    const router = useRouter()
    const location = usePathname()
    const {
        eventGroups: groupList,
        ready,
        setEventGroup,
        findGroup,
        eventGroup,
        availableList,
        leadingEvent
    } = useContext(EventHomeContext)

    useEffect(() => {
        if (ready && location === '/event' || ready && location === '/') {
            if (process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'zumap') {
                router.push(`/event/${groupList[0].username}/map`)
            } else {
                router.push(`/event/${groupList[0].username}`)
            }
            return
        }

        if (ready && params?.groupname) {
            if (location.includes('event')) {
                const group = findGroup(params?.groupname as string)
                if (!group && location.includes('event')) {
                    router.push('/event')
                    return
                }
                setEventGroup(group)
                return
            } else {
                setEventGroup(groupList[0])
            }
        } else {
            if (!eventGroup) {
                setEventGroup(groupList[0])
            }
        }
    }, [ready, params, groupList, eventGroup])


    const switchList = () => {
        if (showList) {
            document.querySelector('body')!.style.overflow = 'auto'
        } else {
            document.querySelector('body')!.style.overflow = 'hidden'
        }
        setShowList(!showList)
    }

    const setSelect = async (group: Profile) => {
        router.push(`/event/${group.username}`)
    }

    return (<>
        {process.env.NEXT_PUBLIC_SPECIAL_VERSION !== 'zumap' &&
            <div className={'home-page-switcher'}>
                <div className={'group-page active'}>
                    <div onClick={
                        e => {
                            if (eventGroup) {
                                setSelect(eventGroup)
                            }
                        }
                    }>
                        {eventGroup ?
                            leadingEvent?.id === eventGroup.id ?
                                leadingEvent.logo ? <img src={leadingEvent.logo} alt={''}/>
                                    : (eventGroup.nickname || eventGroup.username)
                                : (eventGroup.nickname || eventGroup.username)
                            : lang['Nav_Event_Page']
                        }
                    </div>
                    <TriangleDown className={'toggle'} onClick={switchList} size={18}/>
                </div>
                {showList &&
                    <div className={'group-list'}>
                        <div className={'shell'} onClick={switchList}/>
                        <div className={'list-content'}>
                            {
                                availableList.map((group, index) => {
                                    return <div
                                        className={group.id === eventGroup?.id ? 'list-item active' : 'list-item'}
                                        key={index}
                                        onClick={() => {
                                            setSelect(group)
                                            switchList()
                                        }}>
                                        {leadingEvent?.id === group.id ?
                                            leadingEvent.logo ? <img src={leadingEvent.logo} alt={''}/>
                                                : (group.nickname || group.username)
                                            : (group.nickname || group.username)}
                                    </div>
                                })
                            }
                        </div>
                    </div>
                }
            </div>
        }
    </>)
}

export default HomePageSwitcher
