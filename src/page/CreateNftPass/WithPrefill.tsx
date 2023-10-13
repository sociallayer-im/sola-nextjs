import { useNavigate, useSearchParams } from 'react-router-dom'
import { useState, useContext, useEffect } from 'react'
import Layout from '../../components/Layout/Layout'
import PageBack from '../../components/base/PageBack'
import './CreateNftPass.less'
import LangContext from '../../components/provider/LangProvider/LangContext'
import AppButton, { BTN_KIND } from '../../components/base/AppButton/AppButton'
import solas, {Badge, Group, Profile} from '../../service/solas'
import DialogsContext from '../../components/provider/DialogProvider/DialogsContext'
import ReasonInput from '../../components/base/ReasonInput/ReasonInput'
import DetailPrefillBadge from '../../components/base/DetailPrefillBadge/DetailPrefillBadge'
import UserContext from '../../components/provider/UserProvider/UserContext'
import IssueTypeSelectorNftPass from "../../components/compose/IssueTypeSelectorNftPass/IssueTypeSelectorNftPass";

interface CreateBadgeWithPrefillProp {
    nftPassId: number
}
function CreateBadgeWithPrefill(props: CreateBadgeWithPrefillProp) {
    const navigate = useNavigate()
    const [reason, setReason] = useState('')
    const { showLoading, showToast } = useContext(DialogsContext)
    const { user } = useContext(UserContext)
    const [searchParams, _] = useSearchParams()
    const [preFillBadge,setPreFillBadge] = useState<Badge | null>(null)
    const presetAcceptor = searchParams.get('to')

    const { lang } = useContext(LangContext)

    useEffect(() => {
        async function getBadgeDetail () {
           const unload = showLoading()
           try {
               const badge = await solas.queryBadgeDetail({ id: props.nftPassId })
               setPreFillBadge(badge)
               setReason(badge.content || '')
           } finally {
               unload()
           }
        }

        getBadgeDetail()
    }, [])

    const send = async (acceptorDomain: string) => {
        const unload = showLoading()
        try {
            const nftPass = await solas.issueBatch({
                badgeId: preFillBadge?.id!,
                reason: reason || '',
                issues: [acceptorDomain],
                auth_token: user.authToken || ''
            })
            unload()
            navigate(`/issue-success?nftpass=${nftPass[0].id}`)
        } catch (e: any) {
            console.log('[handleCreateIssue]: ', e)
            unload()
            showToast(e.message || 'Issue fail')
        }
    }

    const handleCreate = async () => {
        if (presetAcceptor) {
            navigate( `/issue-nftpass/${props.nftPassId}?to=${presetAcceptor}`, { state: { reason: reason }})
        } else {
            navigate( `/issue-nftpass/${props.nftPassId}`, { state: { reason: reason }})
        }
    }

    return (
        <Layout>
            {  !!preFillBadge &&
                <div className='create-badge-page'>
                    <div className='create-badge-page-wrapper'>
                        <PageBack title={ lang['MintBadge_Title'] }/>
                        <DetailPrefillBadge badge={preFillBadge} />
                        <div className='create-badge-page-form'>
                            <div className='input-area'>
                                <div className='input-area-title'>{ lang['Create_NFT_Name_Des'] }</div>
                                <ReasonInput value={ reason }  onChange={ (value) => { setReason(value) }} />
                            </div>
                            <AppButton kind={ BTN_KIND.primary }
                                       special
                                       onClick={ () => { handleCreate() } }>
                                { presetAcceptor
                                    ? lang['MintBadge_Submit_To']([presetAcceptor.split('.')[0]])
                                    :lang['MintBadge_Next']
                                }
                            </AppButton>
                        </div>
                    </div>
                </div>
            }
        </Layout>
    )
}

export default CreateBadgeWithPrefill
