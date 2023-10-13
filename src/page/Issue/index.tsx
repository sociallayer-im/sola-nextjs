import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom'
import { useState, useContext, useEffect } from 'react'
import Layout from '../../components/Layout/Layout'
import PageBack from '../../components/base/PageBack'
import './Issue.less'
import LangContext from '../../components/provider/LangProvider/LangContext'
import AppButton, { BTN_KIND } from '../../components/base/AppButton/AppButton'
import solas, {Badge, Presend} from '../../service/solas'
import DialogsContext from '../../components/provider/DialogProvider/DialogsContext'
import UserContext from '../../components/provider/UserProvider/UserContext'
import IssueTypeTabs from '../../components/base/IssueTypeTabs'
import { Tab } from 'baseui/tabs'
import AmountInput from '../../components/base/AmountInput/AmountInput'
import IssuesInput from '../../components/base/IssuesInput/IssuesInput'
import GenFaceToFace from '../../components/base/GenFaceToFace/GenFaceToFace'
import PresendQrcode from '../../components/compose/PresendQrcode/PresendQrcode'
import copy from '../../utils/copy'

function Issue() {
    const { user } = useContext(UserContext)
    const { showToast, showLoading } = useContext(DialogsContext)
    const [badge, setBadge] = useState<Badge | null>(null)
    const params = useParams()
    const [SearchParams, _] = useSearchParams()
    const [presendAmount, setPresendAmount] = useState<number | string>(0)
    const [face2facePresend, setFace2facePresend] = useState<Presend | null>(null)
    const [face2faceShareLink, setFace2faceShareLink] = useState('')
    const [issueType, setIssueType] = useState('face2face')
    const [issues, setIssues] = useState<string[]>([''])
    const navigate = useNavigate()
    const { state } = useLocation()

    const { lang } = useContext(LangContext)

    useEffect(() => {
        async function getBadgeInfo () {
            const badge = await solas.queryBadgeDetail({ id: Number(params.badgeId) })
            setBadge(badge)
        }

        if (params.badgeId) {
            getBadgeInfo()
        }
    }, [params])

    useEffect(() => {
        try {
            console.log('[issue reason]:', state.reason)
            const presetAcceptor = SearchParams.get('to')
            if (presetAcceptor) {
                setIssues([presetAcceptor, ''])
                setIssueType('domain')
            }
        } catch (e) {
            navigate('/error')
        }
    }, [])

    const handleCreatePresend = async () => {
        if (!presendAmount) {
            showToast('Please type in quantity')
            return
        }

        const unload = showLoading()
        try {
            const presend = await solas.createPresend({
                badge_id: badge?.id!,
                message: state.reason || '',
                counter: presendAmount,
                auth_token: user.authToken || ''
            })
            unload()
            navigate(`/issue-success?presend=${presend.id}`)
        } catch (e: any) {
            console.log('[handleCreatePresend]: ', e)
            unload()
            showToast(e.message || 'Create presend fail')
        }
    }

    const handleCreateIssue = async () => {
        const checkedIssues = issues.filter(item => !!item)
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
                auth_token: user.authToken || ''
            })
            unload()
            navigate(`/issue-success?badgelet=${badgelets[0].id}&amount=${badgelets.length}`)
        } catch (e: any) {
            console.log('[handleCreateIssue]: ', e)
            unload()
            showToast(e.message || 'Issue fail')
        }
    }

    const handleCreateFace2Face = async () => {
        const unload = showLoading()
        try {
            const presend = await solas.createPresend({
                badge_id: badge?.id!,
                message: state.reason || '',
                counter: 1,
                auth_token: user.authToken || ''
            })
            unload()
            setFace2facePresend(presend)
            const link = `${window.location.origin}/presend/${presend.id}_${presend.code}`
            const description = lang['IssueFinish_share']
                .replace('#1',  user.domain!)
                .replace('#2', badge?.name || '')
                .replace('#3', link)
            // setFace2faceShareLink(description)
            setFace2faceShareLink(link)
        } catch (e: any) {
            console.log('[handleCreatePresend]: ', e)
            unload()
            showToast(e.message || 'Create presend fail')
        }
    }

    const handleCreate = async () => {
        if (issueType === 'presend') {
            handleCreatePresend()
        }

        if (issueType === 'domain') {
            handleCreateIssue()
        }

        if (issueType === 'face2face') {
            handleCreateFace2Face()
        }
    }
    const handleCopy = () => {
        copy(face2faceShareLink)
        showToast('Copied')
    }

    return (
        <Layout>
            <div className='issue-page'>
                <div className='issue-page-wrapper'>
                    <PageBack title={ lang['IssueBadge_Title'] }  historyReplace  to={`/profile/${user.userName}`}/>
                    {  !!badge &&
                        <div className='issue-page-form'>
                            <IssueTypeTabs activeKey={issueType}
                                           onChange={ (key) => { setIssueType(key.activeKey.toString()) } }>

                                <Tab key='face2face' title={ lang['IssueBadge_By_QRcode'] }>
                                    {  face2facePresend
                                        ? <>
                                            <PresendQrcode presend={ face2facePresend } />
                                            <AppButton
                                                style={{marginTop: '15px'}}
                                                special
                                                onClick={ () => { handleCopy() } }>
                                                <i className='icon-copy' style={{marginRight: '10px'}}></i>
                                                <span>{ lang['IssueFinish_CopyLink'] }</span>
                                            </AppButton>
                                        </>
                                        : <GenFaceToFace
                                        onConfirm={ handleCreate }
                                        badge={ badge }
                                        reason={ state.reason } />
                                    }
                                </Tab>

                                <Tab key='presend' title={ lang['IssueBadge_Sendwithlink'] }>
                                    <div className='input-area'>
                                        <div className='issues-des' dangerouslySetInnerHTML={{__html: lang['Presend_step']}} />
                                        <AmountInput value={ presendAmount }
                                                     onChange={ (newValue) => { setPresendAmount(newValue) } }/>
                                    </div>
                                    <AppButton kind={ BTN_KIND.primary }
                                               special
                                               onClick={ () => { handleCreate() } }>
                                        { lang['IssueBadge_Mint'] }
                                    </AppButton>
                                </Tab>

                                <Tab key='domain' title={ lang['IssueBadge_Sendwithdomain'] }>
                                    <div className='input-area'>
                                        <div className='issues-des'>
                                            { lang['IssueBadge_Input_Des'] }
                                        </div>
                                        <IssuesInput value={ issues }
                                                     onChange={ (newIssues) => { setIssues(newIssues) } } />
                                    </div>
                                    <AppButton kind={ BTN_KIND.primary }
                                               special
                                               onClick={ () => { handleCreate() } }>
                                        { lang['IssueBadge_Mint'] }
                                    </AppButton>
                                </Tab>
                            </IssueTypeTabs>
                        </div>
                    }
                </div>
            </div>
        </Layout>
    )
}

export default Issue
