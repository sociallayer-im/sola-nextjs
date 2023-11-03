import {useStyletron} from 'baseui'
import {useContext, useEffect, useState} from 'react'
import {Group, Profile, removeManager} from "../../../../service/solas";
import PageBack from "../../PageBack";
import usePicture from "../../../../hooks/pictrue";
import {CheckIndeterminate, Plus} from "baseui/icon";
import DialogAddManager from "../DialogAddManager/DialogAddManager";
import DialogsContext from "../../../provider/DialogProvider/DialogsContext";
import userContext from "../../../provider/UserProvider/UserContext";
import useEvent, {EVENT} from "../../../../hooks/globalEvent";

interface DialogGroupManagerEditProp {
    group: Group
    managers: Array<Profile>,
    members: Array<Profile>,
    handleClose?: () => any
}

function DialogGroupManagerEdit(props: DialogGroupManagerEditProp) {
    const [css] = useStyletron()
    const [a, seta] = useState('')
    const {defaultAvatar} = usePicture()
    const {openDialog, showLoading, showToast, openConfirmDialog} = useContext(DialogsContext)
    const {user} = useContext(userContext)
    const [managers, setManagers] = useState(props.managers)
    const [newManager, emitUpdate] = useEvent(EVENT.managerListUpdate)

    const showAddressList = () => {
        const notManagers = props.members.filter(item => {
            return !managers.find(manager => manager.id === item.id)
        })

        const dialog = openDialog({
            content: (close: any) => <DialogAddManager
                group={props.group}
                members={notManagers}
                managers={props.managers}
                handleClose={close}/>,
            size: ['100%', '100%']
        })
    }

    const handleRemove = async (profile_id: number) => {
        const dialog = openConfirmDialog({
            confirmLabel: 'remove',
            confirmTextColor: '#fff',
            confirmBtnColor: '#F64F4F',
            cancelLabel: 'cancel',
            title: 'Are you sure you to remove the manager？',
            onConfirm: async (close: any) => {
                const unload = showLoading()
                try {
                    const remove = await removeManager({
                        auth_token: user.authToken || '',
                        group_id: props.group.id,
                        member_profile_id: profile_id
                    })
                    unload()
                    const index = managers.findIndex(item => item.id === profile_id)
                    emitUpdate(managers[index] || null)

                    // 这里弹出toast 会导致列表更新不及时，目前不知道为什么,
                    // 修改为在监听newManager的useEffect中弹出
                    // showToast('Remove manager success')
                    close()
                } catch (e: any) {
                    console.error(e)
                    showToast(e.message)
                    unload()
                }
            }
        })
    }

    useEffect(() => {
        setManagers(props.managers)
    }, [props.managers])

    useEffect(() => {
        if (newManager) {
            const index = managers.findIndex(item => item.id === newManager.id)
            if (index > -1) { // 是删除
                managers.splice(index, 1)
                showToast('Remove manager success')
            } else {
                // 是添加
                setManagers([newManager, ...managers])
            }
        }
    }, [newManager])

    return (<div className={'dialog-manager-edit'}>
        <div className='top-side'>
            <div className='list-header'>
                <div className='center'>
                    <PageBack onClose={() => {
                        props.handleClose?.()
                    }}
                              title={'Group managers'}/>
                </div>
            </div>
            <div className={'managers'}>
                <div className={'center'}>
                    <div className={'des'}>
                        <div>The group manager has the following permissions:</div>
                        <div>1. Send the created badge to others</div>
                        <div>2. Manage the badge of group</div>
                        <div>3. Edit the group profile</div>
                        <div>4. Remove group member</div>
                    </div>
                    {
                        managers.map(item => {
                            return <div className={'manager-item'} key={item.id}>
                                <div className={'label'}>
                                    <img src={item.image_url || defaultAvatar(item.id)}/>
                                    <span>{item.nickname || item.username || item.domain?.split('.')[0]}</span>
                                </div>
                                <div className={'del-btn'} onClick={e => {
                                    handleRemove(item.id)
                                }}><CheckIndeterminate/></div>
                            </div>
                        })
                    }

                    <div className={'add-btn'} onClick={e => {
                        showAddressList()
                    }}>
                        <div className={'icon'}>
                            <Plus/>
                        </div>
                        <span className={'text'}>Add a manager</span>
                    </div>
                </div>
            </div>
        </div>
    </div>)
}

export default DialogGroupManagerEdit
