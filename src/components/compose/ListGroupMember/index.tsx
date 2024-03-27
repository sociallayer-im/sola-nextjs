import React, {useContext, useEffect, useState} from 'react'
import solas, {Group, Membership, Profile} from '../../../service/solas'
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
    isSidebar?: boolean
}

interface ProfileWithRole extends Profile {
    isManager?: boolean
}

function ListGroupMember(props: ListGroupMemberProps) {
    const {lang} = useContext(LangContext)
    const {user} = useContext(UserContext)
    const [members, setMembers] = useState<Profile[]>([])
    const [managers, setManagers] = useState<Profile[]>([])
    const [issuer, setIssuer] = useState<Profile[]>([])
    const [isManager, setIsManager] = useState(false)
    const [listToShow, setListToShow] = useState<ProfileWithRole[]>([])
    const [owner, setOwner] = useState<Profile | null>(null)
    const {showToast, showLoading, openConfirmDialog, openDialog} = useContext(DialogsContext)
    const [currUserJoinedGroup, setCurrUserJoinedGroup] = useState(false)
    const [groupOwnerId, setGroupOwnerId] = useState((props.group as Group).creator.id!)
    const {defaultAvatar} = usePicture()
    const router = useRouter()

    const [compact, setCompact] = useState(props.isSidebar || false)

    async function init() {
        await getOwner()
        await getMemberShips()
    }

    useEffect(() => {
        init()
    }, [props.group, user.id])


    const getOwner = async () => {
        setOwner((props.group as Group).creator as Profile)
    }

    const getMemberShips = async () => {
        const _memberships = await solas.getGroupMemberShips({group_id: props.group.id})
        let memberships: Membership[] = []
        _memberships.forEach((membership: any) => {
            if (!memberships.find((m: any) => m.profile.id === membership.profile.id)) {
                memberships.push(membership)
            }
        })

        const _members = memberships.filter((manager) => manager.role === 'member').map((manager) => manager.profile) as any
        const _managers = memberships.filter((manager) => manager.role === 'manager').map((manager) => manager.profile) as any
        const _issuer = memberships.filter((manager) => manager.role === 'issuer').map((manager) => manager.profile) as any

        setManagers(_managers)
        setMembers(_members)
        setIssuer(_issuer)
        setCurrUserJoinedGroup(memberships.some((member) => member.profile.id === user.id))
        setIsManager(memberships.some((member) => member.profile.id === user.id && member.role === 'manager'))
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
                members={[...managers, ...issuer, ...members]}
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
        const dialog = openDialog({
            content: (close: any) => <DialogGroupManagerEdit
                group={props.group as any}
                members={[...members, ...issuer]}
                managers={managers}
                handleClose={() => {
                    close()
                    init()
                }}/>,
            size: ['100%', '100%']
        })
    }

    const PreEnhancer = () => {
        return <>
            {
                (user.id === groupOwnerId || isManager)
                && process.env.NEXT_PUBLIC_SPECIAL_VERSION !== 'seedao'
                && <CardInviteMember groupId={props.group.id}/>
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
                        <span>{owner.nickname || owner.username}</span>
                        <span className={'role'}>{lang['Group_Role_Owner']}</span>
                        {owner.id === user.id && <div className={'you-tag'}>
                            You
                        </div>
                        }
                    </div>
                </div>
            }
        </>
    }

    const MemberAction = <>
        {
            process.env.NEXT_PUBLIC_SPECIAL_VERSION !== 'seedao' ?
                <StatefulPopover
                    placement={PLACEMENT.bottom}
                    popoverMargin={0}
                    content={({close}) => <MenuItem onClick={() => {
                        showLeaveGroupConfirm();
                        close()
                    }}>{lang['Relation_Ship_Action_Leave']}</MenuItem>}>
                    <div className='member-list-joined-label'>Joined</div>
                </StatefulPopover>
                : <div className='member-list-joined-label'>Joined</div>
        }
    </>

    const OwnerAction = <StatefulPopover
        placement={PLACEMENT.bottom}
        popoverMargin={0}
        content={({close}) => {
            return <div>
                {
                    process.env.NEXT_PUBLIC_SPECIAL_VERSION !== 'seedao' &&
                    <MenuItem onClick={() => {
                        showMemberManageDialog();
                        close()
                    }}>{lang['Group_Member_Manage_Dialog_Title']}</MenuItem>
                }
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

    const Action = (groupOwnerId === user.id)
        ? OwnerAction
        : currUserJoinedGroup
            ? MemberAction
            : <div></div>

    return <div className='list-group-member'>
        <div className={'title-member'}>
            <div className={'action-left'}><span>{lang['Group_detail_tabs_member']}</span>
                {!props.isSidebar ? Action : <div></div>}
            </div>
            {!props.isSidebar ?
                <div className={'action'}>
                    {members.length + managers.length + issuer.length + 1}
                    <span> {lang['Group_detail_tabs_member']}</span>
                </div> :
                <div className={'action'}>
                    {Action}
                </div>
            }
        </div>
        <div className={'address-list'}>
            <PreEnhancer/>
            {
                managers.map((member, index) => {
                    return <div className={'list-item'}
                                key={index}
                                onClick={(e) => {
                                    gotoProfile(member)
                                }}>
                        <div className={'left'}>
                            <img src={member.image_url || defaultAvatar(member.id)} alt=""/>
                            <span className={'name'}>{member.nickname || member.username || member.domain?.split('.')[0]}</span>
                            <span className={'role'}>{lang['Group_Role_Manager']}</span>
                            {member.id === user.id && <div className={'you-tag'}>
                                You
                            </div>
                            }
                        </div>
                    </div>
                })
            }
            {
                issuer.map((member, index) => {
                    return <div className={'list-item'}
                                key={index}
                                onClick={(e) => {
                                    gotoProfile(member)
                                }}>
                        <div className={'left'}>
                            <img src={member.image_url || defaultAvatar(member.id)} alt=""/>
                            <span>{member.nickname || member.username || member.domain?.split('.')[0]}</span>
                            <span className={'role'}>{lang['Issuer']}</span>
                            {member.id === user.id && <div className={'you-tag'}>
                                You
                            </div>
                            }
                        </div>
                    </div>
                })
            }

            { members
                .filter((item, index)=> {
                    if (!compact) {
                        return true
                    } else {
                        const length = managers.length + issuer.length + 1
                        if (length < 10) {
                            return length + index < 10
                        } else return false
                    }
                })
                .map((member, index) => {
                    return <div className={'list-item'}
                                key={index}
                                onClick={(e) => {
                                    gotoProfile(member)
                                }}>
                        <div className={'left'}>
                            <img src={member.image_url || defaultAvatar(member.id)} alt=""/>
                            <span>{member.nickname || member.username || member.domain?.split('.')[0]}</span>
                            {member.id === user.id && <div className={'you-tag'}>
                                You
                            </div>
                            }
                        </div>
                    </div>
                })
            }

            {
                props.isSidebar && <div className={'side-member-count'}
                                        onClick={() => {setCompact(!compact)}}
                >{`${members.length + managers.length + issuer.length + 1} ${lang['Group_detail_tabs_member']}`} </div>
            }
        </div>
    </div>
}

export default ListGroupMember
