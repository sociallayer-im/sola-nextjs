import {useParams, useRouter} from "next/navigation";
import {useContext, useEffect, useState} from 'react'
import PageBack from '@/components/base/PageBack'
import LangContext from '@/components/provider/LangProvider/LangContext'
import AppButton, {BTN_KIND} from '@/components/base/AppButton/AppButton'
import {Group, queryGroupDetail, sendInvite, sendInviteByEmail} from '@/service/solas'
import DialogsContext from '@/components/provider/DialogProvider/DialogsContext'
import UserContext from '@/components/provider/UserProvider/UserContext'
import ReasonInput from '@/components/base/ReasonInput/ReasonInput'
import IssuesInput from '@/components/base/IssuesInput/IssuesInput'
import usePicture from '@/hooks/pictrue'
import {Select} from 'baseui/select'

function Invite() {
    const {lang} = useContext(LangContext)
    const [group, setGroup] = useState<Group | null>(null)
    const [reason, setReason,] = useState('')
    const {user} = useContext(UserContext)
    const {showToast, showLoading} = useContext(DialogsContext)
    const params = useParams()
    const [issues, setIssues] = useState<string[]>([''])
    const [role, setRole] = useState<any>([{id: 'member', label: 'Member'}])
    const router = useRouter()
    const {defaultAvatar} = usePicture()

    useEffect(() => {
        async function getGroupDetail() {
            const group = await queryGroupDetail(Number(params!.groupId))
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
        try {
            const emails = checkedIssues.filter(item => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(item))
            const others = checkedIssues.filter(item => !emails.includes(item))

            let tasks: any[] = []

            if (others.length) {
                tasks = [await sendInvite({
                    group_id: group?.id!,
                    auth_token: user.authToken || '',
                    receivers: others,
                    message: reason,
                    role: role[0].id
                })]
            }

            if (emails.length) {
                tasks = [...tasks,  await sendInviteByEmail({
                    group_id: group?.id!,
                    auth_token: user.authToken || '',
                    receivers: emails,
                    message: reason,
                    role: role[0].id
                })]
            }

            const invites = await Promise.all(tasks)
            const firstInvite = invites[0]?.[0]

            unload()
            if (!firstInvite) {
                showToast('The user(s) you invited has already joined the group')
                return
            }
            router.push(`/issue-success?invite=${firstInvite.id}`)
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
                    <PageBack/>
                    <div className='issue-title'>{lang['Group_invite_title']}</div>
                    <div className='info'>
                        <img src={group?.image_url || defaultAvatar(group?.id)} alt=""/>
                        <div className='name'>{lang['Group_invite_badge_name']([group?.username, role[0].label])}</div>
                    </div>

                    <div className='input-area'>
                        <div className='input-area-title'>{lang['IssueBadge_Reason']}</div>
                        <ReasonInput value={reason} onChange={(value) => {
                            setReason(value)
                        }}/>
                    </div>

                    <div className='input-area'>
                        <div className='input-area-title'>{'Role'}</div>
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
                            value={role}/>
                    </div>

                    <div className='input-area'>
                        <div className='input-area-title'>{lang['IssueBadge_Issuees']}</div>

                        <div className='issues-des'>
                            {`Input the username/domain/email address of the receiver can receive the invite.`}
                            <span onClick={e => {uploadFile()}}>Import from CSV file</span>
                        </div>
                        <IssuesInput value={issues}
                                     onChange={(newIssues) => {
                                         setIssues(newIssues)
                                     }}/>
                    </div>

                    <AppButton kind={BTN_KIND.primary}
                               onClick={handleInvite}>
                        {lang['MintBadge_Submit']}
                    </AppButton>
                </div>
            </div>
        </>
    )
}

export default Invite
