import {useRouter, useParams} from "next/navigation";
import { useState, useContext, useEffect } from 'react'
import PageBack from '@/components/base/PageBack'
import LangContext from '@/components/provider/LangProvider/LangContext'
import AppInput from '@/components/base/AppInput'
import AppButton, { BTN_KIND } from '@/components/base/AppButton/AppButton'
import solas, {Group, sendInvite} from '@/service/solas'
import DialogsContext from '@/components/provider/DialogProvider/DialogsContext'
import UserContext from '@/components/provider/UserProvider/UserContext'
import ReasonInput from '@/components/base/ReasonInput/ReasonInput'
import IssuesInput from '@/components/base/IssuesInput/IssuesInput'
import usePicture from '@/hooks/pictrue'

function Invite() {
    const { lang } = useContext(LangContext)
    const [group, setGroup] = useState<Group | null>(null)
    const [reason, setReason,] = useState('')
    const { user } = useContext(UserContext)
    const { showToast, showLoading } = useContext(DialogsContext)
    const params = useParams()
    const [issues, setIssues] = useState<string[]>([''])
    const router = useRouter()
    const { defaultAvatar } = usePicture()



    useEffect(() => {
        async function getGroupDetail () {
            const group = await solas.queryGroupDetail(Number(params.groupId))
            const prefill = lang['Group_invite_default_reason']([group.username])
            setReason(prefill)
            setGroup(group)
        }

        if (params.groupId) {
            getGroupDetail()
        }
    }, [params])

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
            const invites = await solas.sendInvite({
                group_id: group?.id!,
                auth_token: user.authToken || '',
                receivers: checkedIssues,
                message: reason
            })

            unload()
            if (invites.length === 0) {
                showToast('The user(s) you invited has already joined the group')
                return
            }

            router.push(`/issue-success?invite=${invites[0].id}&amount=${invites.length}&group=${group?.id}`)
        } catch (e: any) {
            unload()
            console.log('[handleInvite]: ', e)
            showToast(e.message || 'Invite Fail')
        }
    }

    return (
        <>
            <div className='issue-page'>
                <div className='issue-page-wrapper'>
                    <PageBack />
                    <div className='issue-title'>{ lang['Group_invite_title'] }</div>
                    <div className='info'>
                        <img src={ group?.image_url || defaultAvatar(group?.id) } alt=""/>
                        <div className='name'>{ lang['Group_invite_badge_name']([group?.username]) }</div>
                    </div>

                    <div className='input-area'>
                        <div className='input-area-title'>{ lang['IssueBadge_Domain'] }</div>
                        <AppInput readOnly value={ 'member.' + group?.domain || '' } />
                    </div>

                    <div className='input-area'>
                        <div className='input-area-title'>{ lang['IssueBadge_Reason'] }</div>
                        <ReasonInput value={ reason }  onChange={ (value) => { setReason(value) }} />
                    </div>

                    <div className='input-area'>
                        <div className='input-area-title'>{ lang['IssueBadge_Issuees'] }</div>

                        <div className='issues-des'>
                            { lang['IssueBadge_Input_Des'] }
                        </div>
                        <IssuesInput value={ issues }
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
