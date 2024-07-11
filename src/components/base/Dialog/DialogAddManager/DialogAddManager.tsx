import {useContext, useEffect, useMemo, useState} from 'react'
import PageBack from '../../PageBack';
import langContext from '../../../provider/LangProvider/LangContext'
import UserContext from '../../../provider/UserProvider/UserContext'
import {Badge, Badgelet, badgeRevoke, ProfileSimple, Group, Profile, addManager} from '../../../../service/solas'
import AddressList from '../../AddressList/AddressList'
import Empty from '../../Empty'
import AppButton, {BTN_KIND, BTN_SIZE} from '../../AppButton/AppButton'
import DialogsContext from '../../../provider/DialogProvider/DialogsContext'
import useEvent, {EVENT} from "../../../../hooks/globalEvent";
import AppInput from "@/components/base/AppInput"

export interface AddressListProps {
    handleClose?: () => any
    managers: Profile[]
    members: Profile[]
    group: Group
}

function DialogAddManager(props: AddressListProps) {
    const {lang} = useContext(langContext)
    const {user} = useContext(UserContext)
    const {showToast, showLoading} = useContext(DialogsContext)
    const [selectedProfileId, setSelectedProfileId] = useState<number[]>([])
    const [_, emitUpdate] = useEvent(EVENT.managerListUpdate)
    const [search, setSearch] = useState('')


    const addVale = (profileId: number) => {
        const index = selectedProfileId.indexOf(profileId)
        let newData: number[] = []
        if (index === -1) {
            newData = [profileId]
        }

        setSelectedProfileId(newData as any[])
    }

    const handleConfirm = async () => {
        const unloading = showLoading()
        try {
            const add = await addManager({
                auth_token: user.authToken || '',
                group_id: props.group.id,
                profile_id: selectedProfileId[0]
            })
            unloading()
            showToast('Add manager success')
            props.handleClose?.()
            const member = props.members.find((item) => {
                return item.id === selectedProfileId[0]
            })

            emitUpdate(member)
        } catch (e: any) {
            unloading()
            console.error(e)
            showToast(e.message)
        }
    }

    const profileList = useMemo(() => {
        const members = props.members.filter((item) => {
            return !props.managers.find((manager) => {
                return manager.id === item.id
            })
        })
        if (search === '') {
            return members
        } else {
            return members.filter((item) => {
                return item.nickname?.toLowerCase().includes(search.toLowerCase()) || item.username!.toLowerCase().includes(search.toLowerCase())
            })
        }

    }, [props.managers, props.members, search])

    return (<div className='address-list-dialog'>
        <div className='top-side'>
            <div className='list-header'>
                <div className='center'>
                    <PageBack onClose={() => {
                        props.handleClose?.()
                    }}
                              title={'Add a manager'}/>
                </div>
            </div>
            <div className={'user-search-result'}>

                <div className={'center'}>
                   <div className={'profile-search'} style={{margin: '12px 0'}}>
                       <AppInput
                           startEnhancer={() => <i  className={'icon-search'}/>}
                           placeholder={'Search...'}
                           value={search}
                           onChange={e => {setSearch(e.target.value)}} />
                   </div>

                    {profileList.length ?
                        <AddressList selected={selectedProfileId} data={profileList} onClick={(item) => {
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
                        disabled={!selectedProfileId.length}
                        onClick={() => {
                            handleConfirm()
                        }}
                        kind={BTN_KIND.primary}
                        size={BTN_SIZE.compact}>
                        {'Add'}
                    </AppButton>
                </div>
            </div>
        </div>
    </div>)
}

export default DialogAddManager
