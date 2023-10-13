import {useLocation, useNavigate, useParams, useSearchParams} from 'react-router-dom'
import {useContext, useEffect, useState} from 'react'
import Layout from '../../components/Layout/Layout'
import PageBack from '../../components/base/PageBack'
import './IssueNftPass.less'
import LangContext from '../../components/provider/LangProvider/LangContext'
import AppButton, {BTN_KIND} from '../../components/base/AppButton/AppButton'
import solas, {Badge, Presend} from '../../service/solas'
import DialogsContext from '../../components/provider/DialogProvider/DialogsContext'
import UserContext from '../../components/provider/UserProvider/UserContext'
import copy from '../../utils/copy'
import IssueTypeSelectorNftPass, {IssueTypeSelectorData, IssueType} from "../../components/compose/IssueTypeSelectorNftPass/IssueTypeSelectorNftPass";

function Issue() {
    const {user} = useContext(UserContext)
    const {showToast, showLoading} = useContext(DialogsContext)
    const [badge, setBadge] = useState<Badge | null>(null)
    const params = useParams()
    const [SearchParams, _] = useSearchParams()
    const navigate = useNavigate()
    let {state} = useLocation()
    const { lang } = useContext(LangContext)

    // 处理预填接受者
    const presetAcceptor = SearchParams.get('to')
    const initIssues = presetAcceptor ?[presetAcceptor, ''] : ['']


    state = state || {}

    useEffect(() => {
        async function getBadgeInfo() {
            const badge = await solas.queryBadgeDetail({id: Number(params.nftpassId)})
            setBadge(badge)
        }

        if (params.nftpassId) {
            getBadgeInfo()
        }
    }, [params])

    const handleIssue = async (data: IssueTypeSelectorData) => {
        const checkedIssues = data.issues.filter(item => !!item)
        if (!checkedIssues.length) {
            showToast('Please type in issues')
            return
        }

        console.log('checkedIssues', checkedIssues)

        const unload = showLoading()
        try {
            const nftpasslet = await solas.issueBatch({
                badgeId: badge?.id!,
                reason: state.reason || '',
                issues: checkedIssues,
                auth_token: user.authToken || '',
                expires_at: data.expires_at || undefined,
                starts_at: data.starts_at || undefined,
            })
            unload()
            navigate(`/issue-success?nftpasslet=${nftpasslet[0].id}`)
        } catch (e: any) {
            console.log('[handleCreateIssue]: ', e)
            unload()
            showToast(e.message || 'Issue fail')
        }
    }

    const fallBackPath = badge?.group
        ? `/group/${ badge?.group.username}`
        : `/profile/${user.userName}`

    return (
        <Layout>
            <div className='issue-nftpass-page'>
                <div className='issue-page-wrapper'>
                    <PageBack historyReplace to={fallBackPath}/>
                    <div className={'issue-text'}>
                        <div className={'title'}>{lang['Create_Nft_success']}</div>
                        <div className={'des'}>{lang['Create_Nft_success_des']}</div>
                    </div>
                    <IssueTypeSelectorNftPass
                        initIssues={initIssues}
                        onConfirm={handleIssue}
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
