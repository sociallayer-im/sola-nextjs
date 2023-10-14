import {useContext, useEffect, useState} from 'react'
import PageBack from '../../PageBack';
import langContext from '../../../provider/LangProvider/LangContext'
import UserContext from '../../../provider/UserProvider/UserContext'
import solas, {Badge, badgeBurn, Badgelet, badgeRevoke, ProfileSimple} from '../../../../service/solas'
import AddressList from '../../AddressList/AddressList'
import Empty from '../../Empty'
import AppButton, {BTN_KIND, BTN_SIZE} from '../../AppButton/AppButton'
import DialogsContext from '../../../provider/DialogProvider/DialogsContext'
import useEvent, {EVENT} from "../../../../hooks/globalEvent";

const overrides = {
    TabBar: {
        paddingTop: '20px',
        paddingBottom: '20px',
        backgroundColor: '#fff',
        maxWidth: '450px',
        width: '100%',
        boxSizing: 'border-box',
        marginLeft: 'auto',
        marginRight: 'auto',
        display: 'flex',
    },
    TabContent: {
        background: '#f8f8f8',
        width: '100%',
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingTop: '12px',
    },
    Tab: {
        flex: 1,
        textAlign: 'center'
    }
}
const overridesSubTab = {
    TabContent: {
        paddingLeft: '0',
        paddingRight: '0'
    }
}

export interface AddressListProps {
    handleClose?: () => any
    badge: Badge
}

function DialogBurn(props: AddressListProps) {
    const {lang} = useContext(langContext)
    const {user} = useContext(UserContext)
    const {showToast, showLoading} = useContext(DialogsContext)
    const [selectedBadgeletId, setselectedBadgeletId] = useState<number[]>([])
    const [selectedProfileId, setSelectedProfileId] = useState<number[]>([])
    const [data, setData] = useState<Badgelet[]>([])
    const [_, emitUpdate] = useEvent(EVENT.badgeDetailUpdate)

    const addVale = (profileId: number) => {
        const index = selectedProfileId.indexOf(profileId)
        let newData: number[] = []
        if (index === -1) {
            newData = [profileId, ...selectedProfileId]
            setSelectedProfileId(newData as any[])
        } else {
            const newData: any[] = [...selectedProfileId]
            newData.splice(index, 1)
        }
        setSelectedProfileId(newData)
        let badgeletId: number[] = []
        newData.map(item => {
            const list = data.filter(badgelet => {
                return badgelet.owner.id === item
            })

            badgeletId = badgeletId.concat(list.map(item => item.id))
        })

        setselectedBadgeletId(badgeletId)
    }

    const handleConfirm = async () => {
        const unloading = showLoading()
        try {
            const task: any[] = []
            selectedBadgeletId.map(item => {
                task.push(badgeRevoke({
                    badgelet_id: item,
                    auth_token: user?.authToken || ''
                }))
            })
            await Promise.all(task)
            unloading()
            showToast('Revoke success')
            emitUpdate()
            props.handleClose?.()
        } catch (e: any) {
            unloading()
            console.error(e)
            showToast(e.message || 'Revoke failed')
        }
    }

    const profileList: ProfileSimple[] = data.map(item => {
        return item.owner
    })

    //profileList 去重
    const profileList2: any[] = []
    profileList.map(item => {
        const index = profileList2.findIndex(item2 => {
            return item.id === item2.id
        })

        if (index === -1) {
            profileList2.push(item)
        }
    })


    const getBadgelet = async () => {
        const res = await solas.queryBadgeDetail({id: props.badge.id})
        const list = res.badgelets.filter(item => {
            return item.status === 'accepted'
        })

        setData(list)
    }
    useEffect(() => {
        getBadgelet()
    }, [])

    return (<div className='address-list-dialog'>
        <div className='top-side'>
            <div className='list-header'>
                <div className='center'>
                    <PageBack onClose={() => {
                        props.handleClose?.()
                    }}
                              title={lang['Dialog_Revoke_Title']}/>
                </div>
            </div>
            <div className={'user-search-result'}>
                <div className={'center'}>
                    {data.length ?
                        <AddressList selected={selectedProfileId} data={profileList2} onClick={(item) => {
                            addVale(item.id)
                        }}/>
                        : <Empty text={'no data'}/>
                    }
                </div>
            </div>


            <div className='dialog-bottom'>
                <div className={'center'}>
                    <AppButton
                        special
                        disabled={selectedBadgeletId.length === 0}
                        onClick={() => {
                            handleConfirm()
                        }}
                        kind={BTN_KIND.primary}
                        size={BTN_SIZE.compact}>
                        {lang['Dialog_Revoke_Confirm']}
                    </AppButton>
                </div>
            </div>
        </div>
    </div>)
}

export default DialogBurn
