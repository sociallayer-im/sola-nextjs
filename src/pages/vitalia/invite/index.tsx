import {useRouter, useParams} from "next/navigation";
import { useState, useContext, useEffect } from 'react'
import PageBack from '@/components/base/PageBack'
import LangContext from '@/components/provider/LangProvider/LangContext'
import AppInput from '@/components/base/AppInput'
import AppButton, { BTN_KIND } from '@/components/base/AppButton/AppButton'
import solas, {Group, sendInvite, queryGroupDetail, sendInviteByEmail} from '@/service/solas'
import DialogsContext from '@/components/provider/DialogProvider/DialogsContext'
import UserContext from '@/components/provider/UserProvider/UserContext'
import ReasonInput from '@/components/base/ReasonInput/ReasonInput'
import IssuesInput from '@/components/base/IssuesInput/IssuesInput'
import usePicture from '@/hooks/pictrue'
import { Select, StyledControlContainer } from 'baseui/select'

function Invite() {
    const { lang } = useContext(LangContext)
    const [group, setGroup] = useState<Group | null>(null)
    const [reason, setReason,] = useState('')
    const { user } = useContext(UserContext)
    const { showToast, showLoading } = useContext(DialogsContext)
    const params = useParams()
    const [issues, setIssues] = useState<string[]>([''])
    const [role, setRole] = useState<any>([{id: 'member', label: 'Member'}])
    const router = useRouter()
    const { defaultAvatar } = usePicture()

    useEffect(() => {
        async function getGroupDetail () {
            const group = await solas.queryGroupDetail(Number(params!.groupId))
            const prefill = lang['Group_invite_default_reason']([group!.username, role[0].id])
            setReason(prefill)
            setGroup(group)
        }

        if (params?.groupId) {
            getGroupDetail()
        }
    }, [params, role])

    const handleInvite = async () => {
        if (!reason) {
            showToast('Please type in reason')
        }

        const checkedIssues = issues.filter(item => !!item)

        if (!checkedIssues.length) {
            showToast('Please type in receiver')
            return
        }

        const unload = showLoading()

        const emails = checkedIssues.filter(item => item.includes('@'))
        const usernames = checkedIssues.filter(item => !item.includes('@'))

        try {
            if (emails.length && usernames.length) {
              const tasks = [
                    await sendInviteByEmail({
                        group_id: group?.id!,
                        auth_token: user.authToken || '',
                        receivers: emails,
                        message: reason,
                        role: role[0].id
                    }),

                    await sendInvite({
                        group_id: group?.id!,
                        auth_token: user.authToken || '',
                        receivers: usernames,
                        message: reason,
                        role: role[0].id
                    }),

                ]

                const [invites1, invites2] = await Promise.all(tasks)
                const invites = [...invites1, ...invites2]

                unload()
                if (invites.length === 0) {
                    showToast('The user(s) you invited has already joined the group')
                    return
                }

                router.push(`/issue-success?invite=${invites[0].id}`)
            } else if (emails.length) {
                const invites = await sendInviteByEmail({
                    group_id: group?.id!,
                    auth_token: user.authToken || '',
                    receivers: emails,
                    message: reason,
                    role: role[0].id
                })

                unload()
                if (invites.length === 0) {
                    showToast('The user(s) you invited has already joined the group')
                    return
                }

                router.push(`/issue-success?invite=${invites[0].id}`)
            } else if (usernames.length) {
                const invites  = await sendInvite({
                    group_id: group?.id!,
                    auth_token: user.authToken || '',
                    receivers: usernames,
                    message: reason,
                    role: role[0].id
                })

                unload()
                if (invites.length === 0) {
                    showToast('The user(s) you invited has already joined the group')
                    return
                }

                router.push(`/issue-success?invite=${invites[0].id}`)
            } else {
                showToast('Please type in receiver')
                return
            }
        } catch (e: any) {
            unload()
            console.log('[handleInvite]: ', e)
            showToast(e.message || 'Invite Fail')
        }
    }

    const uploadFile = async () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.csv'
        input.onchange = async (e: any) => {
            const file = e.target.files[0]
            if (!file) return

            return new Promise((resolve, reject) => {
                const selectedFile = file
                const nameArry = selectedFile.name.split('.')
                const name = nameArry[nameArry.length - 1].toLowerCase()

                if (name !== 'csv') {
                    reject(new Error('Invalid file type'))
                }

                const reader = new FileReader()
                reader.readAsText(selectedFile)

                reader.onload = () => {
                    const str: string = reader.result as string
                    let rows = str.split('\n')
                    rows = rows.map(item => {
                        return item.replace('\r', '')
                    })

                    rows = rows.filter(item => {
                        return !!item
                    })

                    setIssues([...rows, ...issues])
                    resolve(rows)
                }
            })
        }

        input.click()
    }

    return (
        <>
            <div className='issue-page'>
                <div className='issue-page-wrapper'>
                    <PageBack />
                    <div className='issue-title'>{ lang['Group_invite_title'] }</div>
                    <div className='info'>
                        <img src={ group?.image_url || defaultAvatar(group?.id) } alt=""/>
                        <div className='name'>{ lang['Group_invite_badge_name']([group?.username, role[0].label]) }</div>
                    </div>

                    <div className='input-area'>
                        <div className='input-area-title'>{ lang['IssueBadge_Reason'] }</div>
                        <ReasonInput value={ reason }  onChange={ (value) => { setReason(value) }} />
                    </div>

                    <div className='input-area'>
                        <div className='input-area-title'>{ 'Role' }</div>
                        <Select
                            searchable={false}
                            clearable={false}
                            creatable={false}
                            options={[
                                {id: 'member', label: 'Member'},
                                {id: 'issuer', label: 'Issuer'},
                                {id: 'manager', label: 'Manager'}
                            ]}
                            onChange={({value}) => {
                                setRole(value)
                            }}
                            value={role} />
                    </div>

                    <div className='input-area'>
                        <div className='input-area-title'>{ lang['IssueBadge_Issuees'] }</div>

                        <div className='issues-des'>
                            { `Input the domain/username/email address of the receiver can receive the invite.` }
                            <span onClick={e => {uploadFile()}}>Import from CSV file</span>
                        </div>
                        <IssuesInput value={ issues }
                                     allowSearch={true}
                                     allowAddressList={true}
                                     placeholder={'Input domain/username/email'}
                                     onChange={ (newIssues) => { setIssues(newIssues) } } />
                    </div>

                    <AppButton kind={ BTN_KIND.primary }
                               onClick={ handleInvite }>
                        { lang['MintBadge_Submit'] }
                    </AppButton>
                </div>
            </div>
        </>
    )
}

export default Invite
