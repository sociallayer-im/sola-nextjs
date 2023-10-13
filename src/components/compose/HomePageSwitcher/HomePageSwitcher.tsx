import {useContext, useEffect, useState} from 'react'
import langContext from "../../provider/LangProvider/LangContext";
import './HomePageSwitcher.sass'
import TriangleDown from "baseui/icon/triangle-down";
import {getEventGroup, Profile, queryUserGroup} from "../../../service/solas";
import userContext from "../../provider/UserProvider/UserContext";
import DialogsContext from "../../provider/DialogProvider/DialogsContext";
import Link from 'next/link'

const leadingEvent = {
    id: 1572,
    username: 'muchiangmai',
    logo: 'https://ik.imagekit.io/soladata/iosjmr58_gFa04c32n'
}

function HomePageSwitcher() {
    const {lang, langType} = useContext(langContext)
    const [showList, setShowList] = useState(false)
    const {user} = useContext(userContext)
    const {showToast, showLoading} = useContext(DialogsContext)
    const [groupList, setGroupList] = useState<Profile[]>([])
    const [availableList, setAvailableList] = useState<Profile[]>([])

    useEffect(() => {
        async function getAvailableList() {
            if (groupList.length) {
                if (user.id) {
                    const userGroup = await queryUserGroup({profile_id: user.id})
                    const res = groupList.filter(g => {
                        return g.group_event_visibility !== 'private' ||
                            userGroup.find(ug => ug.id === g.id)
                    })
                    setAvailableList(res as Profile[])
                } else {
                    const res = groupList.filter(g => {
                        return g.group_event_visibility !== 'private'
                    })
                    setAvailableList(res as Profile[])
                }
            }
        }

        getAvailableList()
    }, [groupList])

    useEffect(() => {
        const getEventGroupList = async () => {
            const eventGroup: any = await getEventGroup()

            if (leadingEvent) {
                const leading = eventGroup.find((g: any) => g.id === leadingEvent.id)
                const listWithoutLeading = eventGroup.filter((g: any) => g.id !== leadingEvent.id)
                const toTop = [leading, ...listWithoutLeading]
                setGroupList(toTop as Profile[])
            } else {
                setGroupList(eventGroup as Profile[])
            }
        }
        getEventGroupList()
    }, [])


    const switchList = () => {
        if (showList) {
            document.querySelector('body')!.style.overflow = 'auto'
        } else {
            document.querySelector('body')!.style.overflow = 'hidden'
        }
        setShowList(!showList)
    }

    const setSelect = async (group: Profile) => {
        window.location.href = `https://event.sola.day/${group.username}`
    }

    return (<div className={'home-page-switcher'}>
        <Link href={'/'} className={'badge-page'}>{lang['Nav_Badge_Page']}</Link>
        <div className={ 'group-page' } onClick={switchList}>
            <div>{lang['Nav_Event_Page']}</div>
            <TriangleDown/>
        </div>
        {showList &&
            <div className={'group-list'}>
                <div className={'shell'} onClick={switchList}/>
                <div className={'list-content'}>
                    {
                        availableList.map((group, index) => {
                            return <div className={'list-item'}
                                        key={index}
                                        onClick={() => {
                                            setSelect(group)
                                            switchList()
                                        }}>
                                { leadingEvent?.id === group.id ?
                                    <img src={leadingEvent.logo} alt={''} />
                                    :  (group.nickname || group.username)}
                            </div>
                        })
                    }
                </div>
            </div>
        }
    </div>)
}

export default HomePageSwitcher
