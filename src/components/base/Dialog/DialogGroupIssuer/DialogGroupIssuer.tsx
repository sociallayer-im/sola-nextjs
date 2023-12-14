import {useContext, useState} from 'react'
import PageBack from '../../PageBack';
import langContext from '../../../provider/LangProvider/LangContext'
import UserContext from '../../../provider/UserProvider/UserContext'
import {addIssuer, Group, Profile, removeIssuer} from '../../../../service/solas'
import AddressList from '../../AddressList/AddressList'
import Empty from '../../Empty'
import AppButton, {BTN_KIND, BTN_SIZE} from '../../AppButton/AppButton'
import DialogsContext from '../../../provider/DialogProvider/DialogsContext'
import styles from './DialogGroupIssuer.module.scss'

export interface AddressListProps<T> {
    handleClose?: () => any
    issuers: Profile[]
    group: Group
    members: Profile[]
}

function DialogGroupIssuer<T>(props: AddressListProps<T>) {
    const {lang} = useContext(langContext)
    const {user} = useContext(UserContext)
    const {showToast, showLoading} = useContext(DialogsContext)

    const [groupsIssuers, setGroupsIssuers] = useState<Profile[]>(props.issuers || [])
    const [groupsMember, setGroupsMember] = useState<Profile[]>(props.members || [])
    const [selected, setSelected] = useState<Profile[]>([])

    const [action, setAction] = useState<'display' | 'add' | 'remove'>('display')

    const handleAdd = async () => {
        if (!selected.length) {
            showToast('Please select a issuer')
            return
        }

        const unload = showLoading()
        try {
            const res = await addIssuer({
                group_id: props.group.id,
                auth_token: user.authToken || '',
                profile_id: selected[0].id
            })
            unload()
            showToast('Add success')
            setGroupsIssuers([...groupsIssuers, selected[0]])
            setGroupsMember(groupsMember.filter(item => item.id !== selected[0].id))
            setAction('display')
            setSelected([])
        } catch (e: any) {
            showToast(e.message)
        }
    }

    const handleRemove = async () => {
        if (!selected.length) {
            showToast('Please select a issuer')
            return
        }

        const unload = showLoading()
        try {
            const res = await removeIssuer({
                group_id: props.group.id,
                auth_token: user.authToken || '',
                profile_id: selected[0].id
            })
            unload()
            showToast('Remove success')
            setGroupsMember([selected[0], ...groupsMember])
            setGroupsIssuers(groupsIssuers.filter(item => item.id !== selected[0].id))
            setSelected([])
            setAction('display')
        } catch (e: any) {
            showToast(e.message)
        }
    }

    const title = action === 'display' ?
        lang['Issuer'] :
        action === 'add' ?
            lang['Select_From_Members']
            : lang['Remove_Issuer']

    return (<div data-testid='DialogAddressList' className='address-list-dialog'>
        <div className='top-side'>
            <div className='list-header'>
                <div className='center'>
                    <PageBack onClose={() => {
                        props.handleClose?.()
                    }}
                              title={title}/>
                </div>
            </div>

            {action === 'display' &&
                <>
                    <div className={styles['center']}>
                        {!groupsIssuers.length && <Empty text={'no data'}/>}
                        {!!groupsIssuers.length &&
                            <>
                                <AddressList
                                    selected={[] as any}
                                    data={groupsIssuers}
                                    onClick={(target) => {}}/>
                            </>
                        }
                    </div>
                    <div className='dialog-bottom'>
                        <div className={`center ${styles['btns']}`}>
                            <div onClick={() => { setAction('remove')}}>
                                {lang['Group_Member_Manage_Dialog_Confirm_Dialog_Confirm']}
                            </div>
                            <AppButton
                                special
                                onClick={() => {
                                    setAction('add')
                                    setSelected([])
                                }}
                                kind={BTN_KIND.primary}
                                size={BTN_SIZE.compact}>
                                {lang['Add_Issuer']}
                            </AppButton>
                        </div>
                    </div>
                </>
            }

            { action === 'add' &&
                <>
                    <div className={styles['center']}>
                        {!groupsMember.length && <Empty text={'no data'}/>}
                        {!!groupsMember.length &&
                            <>
                                <AddressList
                                    selected={selected.map(item => item.id) as any}
                                    data={groupsMember}
                                    onClick={(target) => {
                                        const ifSelected = selected.find(item => item.id === target.id)
                                        if (ifSelected) {
                                            setSelected(selected.filter(item => item.id !== target.id))
                                            return
                                        } else {
                                            setSelected([target])
                                        }
                                    }}/>
                            </>
                        }
                    </div>
                    <div className='dialog-bottom'>
                        <div className={`center ${styles['btns']}`}>
                            <div onClick={e => {
                                setAction('display')
                                setSelected([])
                            }}>{lang['Group_Member_Manage_Dialog_Confirm_Dialog_Cancel']}</div>
                            <AppButton
                                special
                                disabled={!selected.length}
                                onClick={() => {
                                    handleAdd()
                                }}
                                kind={BTN_KIND.primary}
                                size={BTN_SIZE.compact}>
                                {lang['Set_As_Issuer']}
                            </AppButton>
                        </div>
                    </div>
                </>
            }

            { action === 'remove' &&
                <>
                    <div className={styles['center']}>
                        {!groupsIssuers.length && <Empty text={'no data'}/>}
                        {!!groupsIssuers.length &&
                            <>
                                <AddressList
                                    selected={selected.map(item => item.id) as any}
                                    data={groupsIssuers}
                                    onClick={(target) => {
                                        const ifSelected = selected.find(item => item.id === target.id)
                                        if (ifSelected) {
                                            setSelected(selected.filter(item => item.id !== target.id))
                                            return
                                        } else {
                                            setSelected([target])
                                        }
                                    }}/>
                            </>
                        }
                    </div>
                    <div className='dialog-bottom'>
                        <div className={`center ${styles['btns-alert']}`}>
                            <div onClick={e => {
                                setAction('display')
                                setSelected([])
                            }}>{lang['Group_Member_Manage_Dialog_Confirm_Dialog_Cancel']}</div>
                            <AppButton
                                disabled={!selected.length}
                                onClick={() => {
                                    handleRemove()
                                }}
                                size={BTN_SIZE.compact}>
                                {lang['Group_Member_Manage_Dialog_Confirm_Dialog_Confirm']}
                            </AppButton>
                        </div>
                    </div>
                </>
            }
        </div>
    </div>)
}

export default DialogGroupIssuer
