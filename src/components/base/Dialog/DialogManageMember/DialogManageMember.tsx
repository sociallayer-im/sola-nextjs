import { useState, useContext, useEffect } from 'react'
import PageBack from '../../PageBack';
import langContext from '../../../provider/LangProvider/LangContext'
import UserContext from '../../../provider/UserProvider/UserContext'
import solas, {Group, leaveGroup, Profile} from '../../../../service/solas'
import AddressList from '../../AddressList/AddressList'
import Empty from '../../Empty'
import AppButton, { BTN_KIND, BTN_SIZE } from '../../AppButton/AppButton'
import DialogsContext from '../../../provider/DialogProvider/DialogsContext'

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
        display: 'flex'
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
    handleClose: () => any
    groupId: number
}

function DialogManageMember(props: AddressListProps) {
    const { lang } = useContext(langContext)
    const { user } = useContext(UserContext)
    const { showToast, openConfirmDialog } = useContext(DialogsContext)

    const [groupsMember, setGroupsMember] = useState<Profile[]>([])
    const [selected, setSelected] = useState<Profile[]>([])
    const [groupsMemberEmpty, setGroupsMemberEmpty] = useState(false)

    const getMember = async (groupId: number) => {
        setGroupsMemberEmpty(false)
        setTimeout(async () => {
            setGroupsMember([])
            const members = await solas.getGroupMembers({ group_id: groupId })
            setGroupsMember(members)
            setGroupsMemberEmpty(!members.length)
        }, 100)
    }

    const addAddress = (domain: string) => {
        // const index = selected.indexOf(domain)
        // if (index === -1) {
        //     const newData = [domain, ...selected]
        //     setSelected(newData)
        // } else {
        //     const newData = [...selected]
        //     newData.splice(index,1)
        //     setSelected(newData)
        // }

        const target = groupsMember.find(item => item.domain === domain)
        if (!target) return

        if (selected.length && target.domain === selected[0].domain) {
            setSelected([])
        } else {
            setSelected([target])
        }
    }

    const removeMember = async () => {
        if (!selected.length) return

        const dialog = openConfirmDialog({
            confirmTextColor: '#fff',
            confirmBtnColor: '#F64F4F!important',
            content: '',
            title: selected.length > 1
                ? lang['Group_Member_Manage_Dialog_Confirm_Dialog_des']([selected[0].username])
            : lang['Group_Member_Manage_Dialog_Confirm_Dialog_des']([selected[0].username]),
            confirmText: lang['Group_Member_Manage_Dialog_Confirm_Dialog_Confirm'],
            cancelText: lang['Group_Member_Manage_Dialog_Confirm_Dialog_Cancel'],
            onConfirm: async (close: any) => {
                console.log('selected', selected)
                const remove = await solas.leaveGroup({
                    group_id: props.groupId,
                    profile_id: selected[0].id,
                    auth_token: user.authToken || ''
                })
                close()
                getMember(props.groupId)
            }
        })
    }

    useEffect(() => {
        getMember(props.groupId)
    },[props.groupId])

    return (<div className='member-manage-dialog'>
       <div className='top-side'>
           <div className='list-header'>
               <div className='center'>
                   <PageBack onClose={ () => { props.handleClose() } } title={lang['Group_Member_Manage_Dialog_Title']}/>
               </div>
           </div>
           <div className='content'>
               <div className='center'>
                   { groupsMemberEmpty && <Empty text={'no data'} /> }
                   <AddressList selected={ selected.length ?  [ selected[0].domain || '' ]: [] } data= { groupsMember } onClick={(profile) => { addAddress(profile.domain!)} } />
               </div>
           </div>
           <div className='dialog-bottom center'>
               <AppButton
                   onClick={() => { removeMember() }}
                   size={ BTN_SIZE.compact }
                    style={{
                        backgroundColor: '#fff',
                        border: '1px solid #F64F4F',
                        color: '#F64F4F'
                    }}>
                   { lang['Group_Member_Manage_Dialog_Confirm_Btn'] }
               </AppButton>
           </div>
       </div>
    </div>)
}

export default DialogManageMember
