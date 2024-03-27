import {useState, useContext, useEffect} from 'react'
import styles from './SeedaoHome.module.scss'
import Link from 'next/link'
import EventHomeContext from "@/components/provider/EventHomeProvider/EventHomeContext";
import usePicture from "@/hooks/pictrue";
import LangContext from "@/components/provider/LangProvider/LangContext";
import {getGroupMembers, getGroupMemberShips, getGroups, Group, Membership, Profile, queryBadge} from "@/service/solas";
import userContext from "@/components/provider/UserProvider/UserContext";
import AppButton from "@/components/base/AppButton/AppButton";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import useIssueBadge from "@/hooks/useIssueBadge";
import DialogRequestTobeIssuer from "@/components/base/Dialog/DialogRequestTobeIssuer/DialogRequestTobeIssuer";
import NotificationsContext from "@/components/provider/NotificationsProvider/NotificationsContext";
import {useRouter} from "next/navigation";

function SeedaoHome({group, members} : {group: Group, members: Membership[]}) {
    const router = useRouter()
    const {eventGroup} = useContext(EventHomeContext)
    const {defaultAvatar} = usePicture()
    const {lang} = useContext(LangContext)
    const {user} = useContext(userContext)
    const {openConnectWalletDialog, openDialog} = useContext(DialogsContext)
    const issueBadge = useIssueBadge()
    const {showNotification} = useContext(NotificationsContext)
    const [role, setRole] = useState('')



    useEffect(() => {
        const roleTarget = members.find(item => {
            return  item.profile.id === user.id
        })

        if (roleTarget) {
            setRole(roleTarget.role)
        }

        if (group.creator.id === user.id) {
            setRole('owner')
        }
    }, [user.id])

    const startIssueBadge = async () => {
        const badges = (await queryBadge({group_id: group.id, page: 1})).data

        issueBadge({
            badges: badges,
            group_id: group.id
        })
    }

    const requestToBeIssuer = () => {
        openDialog({
            content: (close: any) => <DialogRequestTobeIssuer close={close} group_id={group!.id}/>,
            size: [360, 'auto'],
        })
    }

    return (<div className={styles['seedao-home-page']}>
        { !!eventGroup &&
            <Link className={styles['group-card']} href={`/group/${group.username}`}>
                <div className={styles['info']}>
                    <div className={styles['name']}>
                        <img className={styles['group-avatar']} src={group.image_url || defaultAvatar(group.id)} alt=""/>
                        <div>{group.nickname || group.username}</div>
                    </div>
                    <div className={styles['member']}>
                        {members.length} {lang['Group_detail_tabs_member']}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M11.9467 7.74646C11.9149 7.66463 11.8674 7.58987 11.8067 7.52646L8.47333 4.19313C8.41117 4.13097 8.33738 4.08167 8.25617 4.04803C8.17495 4.01438 8.08791 3.99707 8 3.99707C7.82247 3.99707 7.6522 4.0676 7.52667 4.19313C7.46451 4.25529 7.4152 4.32908 7.38156 4.4103C7.34792 4.49151 7.33061 4.57856 7.33061 4.66646C7.33061 4.844 7.40113 5.01426 7.52667 5.1398L9.72667 7.33313H4.66667C4.48986 7.33313 4.32029 7.40337 4.19526 7.52839C4.07024 7.65342 4 7.82299 4 7.9998C4 8.17661 4.07024 8.34618 4.19526 8.4712C4.32029 8.59623 4.48986 8.66646 4.66667 8.66646H9.72667L7.52667 10.8598C7.46418 10.9218 7.41459 10.9955 7.38074 11.0767C7.34689 11.158 7.32947 11.2451 7.32947 11.3331C7.32947 11.4211 7.34689 11.5083 7.38074 11.5895C7.41459 11.6708 7.46418 11.7445 7.52667 11.8065C7.58864 11.8689 7.66238 11.9185 7.74362 11.9524C7.82486 11.9862 7.91199 12.0037 8 12.0037C8.08801 12.0037 8.17515 11.9862 8.25638 11.9524C8.33762 11.9185 8.41136 11.8689 8.47333 11.8065L11.8067 8.47313C11.8674 8.40973 11.9149 8.33497 11.9467 8.25313C12.0133 8.09082 12.0133 7.90877 11.9467 7.74646Z" fill="#7B7C7B"/>
                        </svg>
                    </div>
                </div>
                { !!user.id && role &&
                    <div className={styles['role']}>
                    <svg className={styles['icon-1']} xmlns="http://www.w3.org/2000/svg" width="9" height="11" viewBox="0 0 9 11" fill="none">
                        <path fillRule="evenodd" clipRule="evenodd" d="M4.32916 5.41095C5.82336 5.41095 7.03464 4.19967 7.03464 2.70548C7.03464 1.21128 5.82336 0 4.32916 0C2.83497 0 1.62369 1.21128 1.62369 2.70548C1.62369 4.19967 2.83497 5.41095 4.32916 5.41095ZM7.14456 5.23903C7.25282 5.11877 7.4413 5.10371 7.54946 5.22407C8.23837 5.99068 8.65752 7.00459 8.65752 8.11641C8.65752 9.58934 6.71947 10.1304 4.32876 10.1304C1.93805 10.1304 0 9.58934 0 8.11641C0 7.00464 0.419122 5.99076 1.10798 5.22416C1.21613 5.1038 1.40462 5.11885 1.51289 5.23911C2.20619 6.00921 3.21089 6.49341 4.32868 6.49341C5.44652 6.49341 6.45125 6.00917 7.14456 5.23903Z" fill="#C6C9C5"/>
                    </svg>
                    {lang['Seedao_Role_Text']([role])}
                </div>}
            </Link>
        }

        {
            !user.userName ?
            <div className={'center'}>
                <div className={'home-login-panel'}>
                    <img src="/images/balloon.png" alt=""/>
                    <div className={'text'}>{lang['Activity_login_des']}</div>
                    <AppButton onClick={e => {
                        openConnectWalletDialog()
                    }} special size={'compact'}>{lang['Activity_login_btn']}</AppButton>
                </div>
            </div>
            : <div className={styles['menu']}>
                    <Link className={styles['btn']} href={`/profile/${user.userName}`}>
                        {lang['UserAction_MyProfile']}
                    </Link>

                    { (role=== 'issuer' || role=== 'owner' || role=== 'manager') &&
                        <div className={styles['btn']} onClick={e => { router.push('/seedao/create-badge')}}>
                            {lang['Seedao_Send_Badges']}
                        </div>
                    }

                    { (role=== 'owner') &&
                        <Link href={'/seedao/setting'} className={styles['btn']}>
                            {lang['Activity_Setting_Btn']} <br/>
                            {lang['Seedao_Issuer_Manager_Whitelist']}
                        </Link>
                    }

                    { (role=== 'manager') &&
                        <Link href={'/seedao/setting'} className={styles['btn']}>
                            {lang['Activity_Setting_Btn']} <br/>
                            {lang['Seedao_Issuer_Whitelist']}
                        </Link>
                    }

                    <div className={styles['btn']} onClick={e=> {showNotification()}}>
                        {lang['Seedao_Notification']}
                        <div className={styles['is-new']} />
                    </div>

                    <div className={styles['btn']} onClick={e=> { requestToBeIssuer()}}>
                        request to be issuer
                        <div className={styles['is-new']} />
                    </div>
            </div>
        }
    </div>)
}

export default SeedaoHome

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
