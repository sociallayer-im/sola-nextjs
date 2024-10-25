import {useMemo, useState} from 'react'
import PageBack from '../../PageBack';
import {Profile} from '../../../../service/solas'
import AddressList from '../../AddressList/AddressList'
import Empty from '../../Empty'
import AppButton, {BTN_KIND, BTN_SIZE} from '../../AppButton/AppButton'
import AppInput from "@/components/base/AppInput"

export interface AddressListProps {
    handleClose?: () => any
    onConfirm?: (profile: Profile) => any
    managers: Profile[]
    members: Profile[]
}

function DialogAddTrackManager(props: AddressListProps) {
    const [selectedProfileId, setSelectedProfileId] = useState<Profile[]>(props.managers)
    const [search, setSearch] = useState('')


    const addVale = (profile: Profile) => {
        const index = selectedProfileId.findIndex((item) => {
            return item.id === profile.id
        })
        let newData: Profile[] = []
        if (index === -1) {
            newData = [profile]
        }

        setSelectedProfileId(newData as any[])
    }

    const handleConfirm = async () => {
        props.onConfirm?.(selectedProfileId[0])
        props.handleClose && props.handleClose()
    }

    const profileList = useMemo(() => {
        const list = props.members.filter((item) => {
            return !props.managers.find((manager) => {
                return manager.id === item.id
            })
        })

        if (search === '') {
            return list
        } else {
            return list.filter((item) => {
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
                              title={'Add a track manager'}/>
                </div>
            </div>
            <div className={'user-search-result'}>

                <div className={'center'}>
                    <div className={'profile-search'} style={{margin: '12px 0'}}>
                        <AppInput
                            startEnhancer={() => <i className={'icon-search'}/>}
                            placeholder={'Search...'}
                            value={search}
                            onChange={e => {
                                setSearch(e.target.value)
                            }}/>
                    </div>

                    {profileList.length ?
                        <AddressList selected={selectedProfileId.map(i=> i.id)} data={profileList} onClick={(item) => {
                            addVale(item)
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

export default DialogAddTrackManager
