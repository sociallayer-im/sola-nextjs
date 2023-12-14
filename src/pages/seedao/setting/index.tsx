import {useParams, useRouter} from "next/navigation"
import React, {useContext, useEffect, useState} from 'react'
import PageBack from "@/components/base/PageBack";
import EventHomeContext from "@/components/provider/EventHomeProvider/EventHomeContext";
import {getGroupMemberShips, getGroups, Membership, Group, Profile} from "@/service/solas";
import LangContext from "@/components/provider/LangProvider/LangContext";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import UserContext from "@/components/provider/UserProvider/UserContext";
import DialogGroupManagerEdit from "@/components/base/Dialog/DialogGroupManagerEdit/DialogGroupManagerEdit";
import DialogTransferGroupOwner from "@/components/base/Dialog/DialogTransferGroupOwner/DialogTransferGroupOwner";
import DialogGroupIssuer from "@/components/base/Dialog/DialogGroupIssuer/DialogGroupIssuer";


function Dashboard({group, members}: { group: Group, members: Membership[] }) {
    const {eventGroup, availableList, findGroup, setEventGroup, reload} = useContext(EventHomeContext)
    const params = useParams()
    const {lang} = useContext(LangContext)
    const {openDialog} = useContext(DialogsContext)
    const {user} = useContext(UserContext)
    const router = useRouter()


    const [role, setRole] = useState('')
    const [managers, setManagers] = useState(members.filter(item => item.role === 'manager').map(item => item.profile) as Profile[])
    const [issuers, setIssuers] = useState(members.filter(item => item.role === 'issuer').map(item => item.profile) as Profile[])
    const [membersShips, setMemberShips] = useState(members)


    useEffect(() => {
        const roleTarget = membersShips.find(item => {
            return item.profile.id === user.id
        })

        if (roleTarget) {
            setRole(roleTarget.role)
        }

        if (group.creator.id === user.id) {
            setRole('owner')
        }
    }, [user.id, membersShips])

    const showChangeOwnerDialog = () => {
        const dialog = openDialog({
            content: (close: any) => <DialogTransferGroupOwner
                group={group as any}
                members={membersShips.map(item => item.profile) as Profile[]}
                handleClose={(newOwner) => {
                    if (newOwner) {
                        router.push(`/`)
                    }
                    close()
                }}/>,
            size: ['100%', '100%']
        })
    }

    useEffect(() => {
        if (availableList.length && params?.groupname) {
            const group = findGroup(params?.groupname as string)
            setEventGroup(group)
        }
    }, [availableList, params])

    const refresh = async () => {
        const members = await getGroupMemberShips({group_id: group.id})
        setManagers(members.filter(item => item.role === 'manager').map(item => item.profile) as Profile[])
        setIssuers(members.filter(item => item.role === 'issuer').map(item => item.profile) as Profile[])
        setMemberShips(members)
    }

    const showManagerDialog = () => {
        const membersProfile = membersShips.map(item => item.profile) as Profile[]
        const dialog = openDialog({
            content: (close: any) => <DialogGroupManagerEdit
                group={group}
                members={membersProfile}
                managers={managers}
                handleClose={() => {close(); refresh()}} />,
            size: ['100%', '100%']
        })
    }

    const showIssuerDialog = () => {
        const MemberProfile = membersShips.filter(i => i.role === 'member').map(item => item.profile) as Profile[]
        console.log('MemberProfile')
        const dialog = openDialog({
            content: (close: any) => <DialogGroupIssuer
                group={group}
                members={MemberProfile}
                issuers={issuers}
                handleClose={() => {close(); refresh()}} />,
            size: ['100%', '100%']
        })
    }

    return (<>
        <div className={'dashboard-page'}>
            <div className={'center'}>
                <PageBack title={lang['Setting']}/>
                <div className={'setting-form'}>

                    { role === 'owner' &&
                        <div className={'setting-form-item'} onClick={e => {
                            showManagerDialog()
                        }}>
                            <div className={'label'}>{lang['Group_Role_Manager']}</div>
                            <div className={'value'}>
                                <span>{managers.length}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                     fill="none">
                                    <path
                                        d="M17.92 11.62C17.8724 11.4973 17.801 11.3851 17.71 11.29L12.71 6.29C12.6168 6.19676 12.5061 6.1228 12.3842 6.07234C12.2624 6.02188 12.1319 5.99591 12 5.99591C11.7337 5.99591 11.4783 6.1017 11.29 6.29C11.1968 6.38324 11.1228 6.49393 11.0723 6.61575C11.0219 6.73758 10.9959 6.86814 10.9959 7C10.9959 7.2663 11.1017 7.5217 11.29 7.71L14.59 11H7C6.73478 11 6.48043 11.1054 6.29289 11.2929C6.10536 11.4804 6 11.7348 6 12C6 12.2652 6.10536 12.5196 6.29289 12.7071C6.48043 12.8946 6.73478 13 7 13H14.59L11.29 16.29C11.1963 16.383 11.1219 16.4936 11.0711 16.6154C11.0203 16.7373 10.9942 16.868 10.9942 17C10.9942 17.132 11.0203 17.2627 11.0711 17.3846C11.1219 17.5064 11.1963 17.617 11.29 17.71C11.383 17.8037 11.4936 17.8781 11.6154 17.9289C11.7373 17.9797 11.868 18.0058 12 18.0058C12.132 18.0058 12.2627 17.9797 12.3846 17.9289C12.5064 17.8781 12.617 17.8037 12.71 17.71L17.71 12.71C17.801 12.6149 17.8724 12.5028 17.92 12.38C18.02 12.1365 18.02 11.8635 17.92 11.62Z"
                                        fill="#272928"/>
                                </svg>
                            </div>
                        </div>
                    }

                    { (role === 'manager' ||  role === 'owner') &&
                        <div className={'setting-form-item'} onClick={e => {
                            showIssuerDialog()
                        }}>
                            <div className={'label'}>{lang['Issuer']}</div>
                            <div className={'value'}>
                                <span>{issuers.length}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                     fill="none">
                                    <path
                                        d="M17.92 11.62C17.8724 11.4973 17.801 11.3851 17.71 11.29L12.71 6.29C12.6168 6.19676 12.5061 6.1228 12.3842 6.07234C12.2624 6.02188 12.1319 5.99591 12 5.99591C11.7337 5.99591 11.4783 6.1017 11.29 6.29C11.1968 6.38324 11.1228 6.49393 11.0723 6.61575C11.0219 6.73758 10.9959 6.86814 10.9959 7C10.9959 7.2663 11.1017 7.5217 11.29 7.71L14.59 11H7C6.73478 11 6.48043 11.1054 6.29289 11.2929C6.10536 11.4804 6 11.7348 6 12C6 12.2652 6.10536 12.5196 6.29289 12.7071C6.48043 12.8946 6.73478 13 7 13H14.59L11.29 16.29C11.1963 16.383 11.1219 16.4936 11.0711 16.6154C11.0203 16.7373 10.9942 16.868 10.9942 17C10.9942 17.132 11.0203 17.2627 11.0711 17.3846C11.1219 17.5064 11.1963 17.617 11.29 17.71C11.383 17.8037 11.4936 17.8781 11.6154 17.9289C11.7373 17.9797 11.868 18.0058 12 18.0058C12.132 18.0058 12.2627 17.9797 12.3846 17.9289C12.5064 17.8781 12.617 17.8037 12.71 17.71L17.71 12.71C17.801 12.6149 17.8724 12.5028 17.92 12.38C18.02 12.1365 18.02 11.8635 17.92 11.62Z"
                                        fill="#272928"/>
                                </svg>
                            </div>
                        </div>
                    }

                    { role === 'owner' &&
                        <div className={'setting-form-item'} onClick={e => {
                            showChangeOwnerDialog()
                        }}>
                            <div className={'label'}>{lang['Transfer_Owner']}</div>
                            <div className={'value'}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                     fill="none">
                                    <path
                                        d="M17.92 11.62C17.8724 11.4973 17.801 11.3851 17.71 11.29L12.71 6.29C12.6168 6.19676 12.5061 6.1228 12.3842 6.07234C12.2624 6.02188 12.1319 5.99591 12 5.99591C11.7337 5.99591 11.4783 6.1017 11.29 6.29C11.1968 6.38324 11.1228 6.49393 11.0723 6.61575C11.0219 6.73758 10.9959 6.86814 10.9959 7C10.9959 7.2663 11.1017 7.5217 11.29 7.71L14.59 11H7C6.73478 11 6.48043 11.1054 6.29289 11.2929C6.10536 11.4804 6 11.7348 6 12C6 12.2652 6.10536 12.5196 6.29289 12.7071C6.48043 12.8946 6.73478 13 7 13H14.59L11.29 16.29C11.1963 16.383 11.1219 16.4936 11.0711 16.6154C11.0203 16.7373 10.9942 16.868 10.9942 17C10.9942 17.132 11.0203 17.2627 11.0711 17.3846C11.1219 17.5064 11.1963 17.617 11.29 17.71C11.383 17.8037 11.4936 17.8781 11.6154 17.9289C11.7373 17.9797 11.868 18.0058 12 18.0058C12.132 18.0058 12.2627 17.9797 12.3846 17.9289C12.5064 17.8781 12.617 17.8037 12.71 17.71L17.71 12.71C17.801 12.6149 17.8724 12.5028 17.92 12.38C18.02 12.1365 18.02 11.8635 17.92 11.62Z"
                                        fill="#272928"/>
                                </svg>
                            </div>
                        </div>
                    }
                </div>
            </div>
        </div>
    </>)
}

export default Dashboard

export const getServerSideProps: any = (async (context: any) => {
    if (process.env.NEXT_PUBLIC_LEADING_EVENT_GROUP_ID) {
        const group = await getGroups({id: Number(process.env.NEXT_PUBLIC_LEADING_EVENT_GROUP_ID)})
        const members = await getGroupMemberShips({group_id: group[0].id})
        return {props: {group: group[0], members}}
    } else {
        const group = await getGroups({username: 'playground2'})
        const members = await getGroupMemberShips({group_id: group[0].id})
        return {props: {group: group[0], members}}
    }
})
