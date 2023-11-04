import React, {useContext, useEffect, useState} from 'react'
import solas, {checkIsManager, getGroupMembers, Profile} from '../../../service/solas'
import LangContext from '../../provider/LangProvider/LangContext'
import UserContext from '../../provider/UserProvider/UserContext'
import CardInviteMember from '../../base/Cards/CardInviteMember/CardInviteMember'
import {PLACEMENT, StatefulPopover} from 'baseui/popover'
import MenuItem from "../../base/MenuItem";
import DialogsContext from "../../provider/DialogProvider/DialogsContext";
import {Overflow} from 'baseui/icon'
import DialogManageMember from '../../base/Dialog/DialogManageMember/DialogManageMember'
import DialogGroupManagerEdit from "@/components/base/Dialog/DialogGroupManagerEdit/DialogGroupManagerEdit";
import {useRouter} from "next/navigation";
import usePicture from "@/hooks/pictrue";
import DialogTransferGroupOwner from "@/components/base/Dialog/DialogTransferGroupOwner/DialogTransferGroupOwner";


interface ListGroupMemberProps {
    group: Profile
}

interface ProfileWithRole extends Profile {
    isManager?: boolean
}

function ListGroupMember(props: ListGroupMemberProps) {
    const {lang} = useContext(LangContext)
    const {user} = useContext(UserContext)
    const [members, setMembers] = useState<Profile[]>([])
    const [managers, setManagers] = useState<Profile[]>([])
    const [isManager, setIsManager] = useState(false)
    const [listToShow, setListToShow] = useState<ProfileWithRole[]>([])
    const [owner, setOwner] = useState<Profile | null>(null)
    const {showToast, showLoading, openConfirmDialog, openDialog} = useContext(DialogsContext)
    const [currUserJoinedGroup, setCurrUserJoinedGroup] = useState(false)
    const [groupOwnerId, setGroupOwnerId] = useState(props.group.group_owner_id!)
    const {defaultAvatar} = usePicture()
    const router = useRouter()

    async function init() {
        await getOwner()
        await getManager()
        await getMember(1)

        if (user.id) {
            checkIsManager({group_id: props.group.id, profile_id: user.id})
                .then(res => {
                    setIsManager(res)
                })
        }
    }

    useEffect(() => {
        init()
    }, [props.group, user.id])

    useEffect(() => {
            const listWithoutManager = members.filter((member) => {
                return !managers.find((manager) => manager.id === member.id)
            })

            const MemberListWithRole = listWithoutManager.map((member) => {
                return {
                    ...member,
                    isManager: false
                }
            })
            const managerListWithRole = managers.map((manager) => {
                return {
                    ...manager,
                    isManager: true
                }
            })
        setListToShow([...managerListWithRole, ...MemberListWithRole])
        }, [managers, members]
    )

    const getOwner = async () => {
        const owner = await solas.getProfile({id: groupOwnerId})
        setOwner(owner)
        await checkUserJoinedGroup()
    }

    const checkUserJoinedGroup = async () => {
        if (!user.id) return
        const userJoinedGroups = await solas.queryGroupsUserJoined({
            profile_id: user.id!,
        })
        if (userJoinedGroups && userJoinedGroups.length) {
            const target = userJoinedGroups.find((group) => {
                return group.id === props.group.id
            })
            setCurrUserJoinedGroup(!!target)
        }
    }

    const getMember = async (page: number) => {
        if (page > 1) return []

        const members = await solas.getGroupMembers({
            group_id: props.group.id
        })

        const deleteOwner = members.filter((member) => member.id !== groupOwnerId)
        setMembers(deleteOwner)
    }

    const getManager = async () => {
        const managerlist = await solas.getGroupMembers({group_id: props.group.id, role: 'group_manager'})
        setManagers(managerlist)
    }

    const leaveGroup = async () => {
        const unload = showLoading()
        try {
            const res = await solas.leaveGroup({
                group_id: props.group.id,
                auth_token: user.authToken || '',
                profile_id: user.id!
            })
            unload()
            showToast('You have left the group')
        } catch (e: any) {
            unload()
            console.log('[handleUnJoin]: ', e)
            showToast(e.message || 'Unjoin fail')
        }
    }

    const showLeaveGroupConfirm = () => {
        openConfirmDialog({
            confirmText: 'Leave',
            cancelText: 'Cancel',
            confirmBtnColor: '#F64F4F!important',
            confirmTextColor: '#fff!important',
            title: 'Are you sure to leave the group?',
            content: '',
            onConfirm: (close: any) => {
                close();
                leaveGroup()
            }
        })
    }

    const showMemberManageDialog = () => {
        const dialog = openDialog({
            content: (close: any) => <DialogManageMember
                groupId={props.group.id}
                handleClose={() => {
                    init()
                    close()
                }}/>,
            size: ['100%', '100%']
        })
    }

    const showChangeOwnerDialog = () => {
        const dialog = openDialog({
            content: (close: any) => <DialogTransferGroupOwner
                group={props.group as any}
                members={members}
                handleClose={(newOwner) => {
                    if (newOwner) {
                        setGroupOwnerId(newOwner.id)
                        const newMembers = listToShow.filter((member) => member.id !== newOwner.id)
                        newMembers.push(owner!)
                        setListToShow(newMembers)
                        setOwner(newOwner)
                    }
                    close()
                }}/>,
            size: ['100%', '100%']
        })
    }

    const showManagerDialog = async () => {
        const unload = showLoading()
        const res2 = await getGroupMembers({group_id: props.group.id, role: 'group_manager'})
        unload()
        const dialog = openDialog({
            content: (close: any) => <DialogGroupManagerEdit
                group={props.group as any}
                members={members}
                managers={res2}
                handleClose={()=> {
                    close()
                    init()
                }} />,
            size: ['100%', '100%']
        })
    }

    const PreEnhancer = () => {
        return <>
            {
                (user.id === groupOwnerId || isManager) && <CardInviteMember groupId={props.group.id}/>
            }
            {
                !!owner &&
                <div className={'list-item'}
                     onClick={(e) => {
                         gotoProfile(owner!)
                     }}>
                    <div className={'left'}>
                        <img className={'owner-marker'} src='/images/icon_owner.png'/>
                        <img src={owner.image_url || defaultAvatar(owner.id)} alt=""/>
                        <span>{owner.nickname || owner.username || owner.domain?.split('.')[0]}</span>
                        <span className={'role'}>{lang['Group_Role_Owner']}</span>
                    </div>
                </div>
            }
        </>
    }

    const MemberAction = <StatefulPopover
        placement={PLACEMENT.bottom}
        popoverMargin={0}
        content={({close}) => <MenuItem onClick={() => {
            showLeaveGroupConfirm();
            close()
        }}>{lang['Relation_Ship_Action_Leave']}</MenuItem>}>
        <div className='member-list-joined-label'>Joined</div>
    </StatefulPopover>

    const OwnerAction = <StatefulPopover
        placement={PLACEMENT.bottom}
        popoverMargin={0}
        content={({close}) => {
            return <div>
                <MenuItem onClick={() => {
                    showMemberManageDialog();
                    close()
                }}>{lang['Group_Member_Manage_Dialog_Title']}</MenuItem>
                <MenuItem onClick={() => {
                    showManagerDialog();
                    close()
                }}>{lang['Group_Manager_Setting']}</MenuItem>
                <MenuItem onClick={() => {
                    showChangeOwnerDialog();
                    close()
                }}>{lang['Group_Change_Owner']}</MenuItem>
            </div>
        }}>
        <Overflow size={20} title={'action'}/>
    </StatefulPopover>

    const gotoProfile = (profile: Profile) => {
        router.push(`/profile/${profile.username}`, {scroll: false})
    }

    const Action = (groupOwnerId === user.id || isManager)
        ? OwnerAction
        : currUserJoinedGroup
            ? MemberAction
            : <div></div>

    return <div className='list-group-member'>
        <div className={'title-member'}>
            <div className={'action-left'}><span>{lang['Group_detail_tabs_member']}</span>
                {Action}
            </div>
            <div className={'action'}>
                {members.length} <span> {lang['Group_detail_tabs_member']}</span>
            </div>
        </div>
        <div className={'address-list'}>
            <PreEnhancer/>
            {
                listToShow.map((member, index) => {
                    return <div className={'list-item'}
                                key={index}
                                onClick={(e) => {
                                    gotoProfile(member)
                                }}>
                        <div className={'left'}>
                            <img src={member.image_url || defaultAvatar(member.id)} alt=""/>
                            <span>{member.nickname || member.username || member.domain?.split('.')[0]}</span>
                            {
                                member.isManager && <span className={'role'}>{lang['Group_Role_Manager']}</span>
                            }
                        </div>
                    </div>
                })
            }
        </div>
    </div>
}

export default ListGroupMember
