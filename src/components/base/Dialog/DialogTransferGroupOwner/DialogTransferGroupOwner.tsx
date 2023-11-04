import {useContext, useEffect, useState} from 'react'
import PageBack from '../../PageBack';
import langContext from '../../../provider/LangProvider/LangContext'
import UserContext from '../../../provider/UserProvider/UserContext'
import {
    Badge,
    Badgelet,
    badgeRevoke,
    ProfileSimple,
    Group,
    Profile,
    addManager,
    transferGroupOwner
} from '@/service/solas'
import AddressList from '../../AddressList/AddressList'
import Empty from '../../Empty'
import AppButton, {BTN_KIND, BTN_SIZE} from '../../AppButton/AppButton'
import DialogsContext from '../../../provider/DialogProvider/DialogsContext'
import styles from './DialogTransferGroupOwner.module.scss'

export interface AddressListProps {
    handleClose?: (newOwner?: Profile) => any
    members: Profile[]
    group: Group
}

function DialogTransferGroupOwner(props: AddressListProps) {
    const {lang} = useContext(langContext)
    const {user} = useContext(UserContext)
    const {showToast, showLoading} = useContext(DialogsContext)
    const [selectedProfileId, setSelectedProfileId] = useState<number[]>([])

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
            const newOwner = props.members.find((item) => {
                return selectedProfileId[0] === item.id
            })
            const transfer = await transferGroupOwner({
                auth_token: user.authToken || '',
                id: props.group.id,
                new_owner_username: newOwner!.username!
            })
            unloading()
            showToast('Change owner success')
            props.handleClose && props.handleClose(newOwner!)
        } catch (e: any) {
            unloading()
            console.error(e)
            showToast(e.message)
        }
    }

    return (<div className={'address-list-dialog'}>
        <div className='top-side'>
            <div className='list-header'>
                <div className='center'>
                    <PageBack onClose={() => {
                        props.handleClose?.()
                    }}
                              title={'Change group owner'}/>
                </div>
            </div>
            <div className={'user-search-result'}>
                <div className={'center'}>
                    {props.members.length ?
                        <AddressList selected={selectedProfileId} data={props.members} onClick={(item) => {
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
                        {'Change'}
                    </AppButton>
                </div>
            </div>
        </div>
    </div>)
}

export default DialogTransferGroupOwner
