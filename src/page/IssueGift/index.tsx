import {useLocation, useNavigate, useParams, useSearchParams} from 'react-router-dom'
import {useContext, useEffect, useState} from 'react'
import Layout from '../../components/Layout/Layout'
import PageBack from '../../components/base/PageBack'
import './IssueGift.less'
import LangContext from '../../components/provider/LangProvider/LangContext'
import solas, {Badge} from '../../service/solas'
import DialogsContext from '../../components/provider/DialogProvider/DialogsContext'
import UserContext from '../../components/provider/UserProvider/UserContext'
import IssueTypeSelectorGift, {
    IssueType,
    IssueTypeSelectorData
} from "../../components/compose/IssueTypeSelectorGift/IssueTypeSelectorGift";

function Issue() {
    const {user} = useContext(UserContext)
    const {showToast, showLoading} = useContext(DialogsContext)
    const [badge, setBadge] = useState<Badge | null>(null)
    const params = useParams()
    const [SearchParams, _] = useSearchParams()
    const navigate = useNavigate()
    let {state} = useLocation()

    // 处理预填接受者
    const presetAcceptor = SearchParams.get('to')
    const initIssues = presetAcceptor ? [presetAcceptor, ''] : ['']


    state = state || {}

    const {lang} = useContext(LangContext)

    useEffect(() => {
        async function getBadgeInfo() {
            const badge = await solas.queryBadgeDetail({id: Number(params.giftId)})
            setBadge(badge)
        }

        if (params.giftId) {
            getBadgeInfo()
        }
    }, [params])

    const handleCreateIssue = async (data: IssueTypeSelectorData) => {
        const checkedIssues = data.issues.filter(item => !!item)
        if (!checkedIssues.length) {
            showToast('Please type in issues')
            return
        }

        console.log('checkedIssues', checkedIssues)

        const unload = showLoading()
        try {
            const badgelets = await solas.issueBatch({
                badgeId: badge?.id!,
                reason: state.reason || '',
                issues: checkedIssues,
                auth_token: user.authToken || '',
                value: !isNaN(Number(data.value)) ? Number(data.value) : null,
                starts_at: data.starts_at || undefined,
                expires_at: data.expires_at || undefined,
            })
            unload()
            navigate(`/issue-success?giftitem=${badgelets[0].id}`)
        } catch (e: any) {
            console.log('[handleCreateIssue]: ', e)
            unload()
            showToast(e.message || 'Issue fail')
        }
    }

    const handleCreate = async (data: IssueTypeSelectorData) => {
        console.log('data', data)
        await handleCreateIssue(data)
    }

    const fallBackPath = badge?.group
        ? `/group/${badge?.group.username}`
        : user.userName
            ? `/profile/${user.userName}`
            : '/'

    return (
        <Layout>
            <div className='issue-gift-page'>
                <div className='issue-page-wrapper'>
                    <PageBack historyReplace to={fallBackPath}/>
                    <div className={'issue-text'}>
                        <div className={'title'}>{lang['Create_gift_success']}</div>
                        <div className={'des'}>{lang['Create_gift_success_des']}</div>
                    </div>
                    <IssueTypeSelectorGift
                        initIssues={initIssues}
                        onConfirm={handleCreate}
                        onCancel={() => {
                            navigate(fallBackPath, {replace: true})
                        }}
                    />
                </div>
            </div>
        </Layout>
    )
}

export default Issue
