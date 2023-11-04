import {useRouter, useSearchParams} from "next/navigation";
import { useState, useContext, useEffect } from 'react'
import PageBack from '../../components/base/PageBack'
import LangContext from '../../components/provider/LangProvider/LangContext'
import UploadImage from '../../components/compose/UploadImage/UploadImage'
import AppInput from '../../components/base/AppInput'
import UserContext from '../../components/provider/UserProvider/UserContext'
import AppButton, { BTN_KIND } from '../../components/base/AppButton/AppButton'
import useVerify from '../../hooks/verify'
import solas, { Group, Profile } from '../../service/solas'
import DialogsContext from '../../components/provider/DialogProvider/DialogsContext'
import ReasonInput from '../../components/base/ReasonInput/ReasonInput'
import SelectCreator from '../../components/compose/SelectCreator/SelectCreator'

function CreateBadgeNonPrefill() {
    const router = useRouter()
    const [cover, setCover] = useState('')
    const [domain, setDomain,] = useState('')
    const [domainError, setDomainError,] = useState('')
    const [badgeName, setBadgeName] = useState('')
    const [reason, setReason] = useState('')
    const [creator, setCreator] = useState<Group | Profile | null>(null)
    const [badgeNameError, setBadgeNameError] = useState('')
    const enhancer = process.env.NEXT_PUBLIC_SOLAS_DOMAIN
    const { user } = useContext(UserContext)
    const { showLoading, showToast } = useContext(DialogsContext)
    const { verifyDomain } = useVerify()
    const searchParams = useSearchParams()
    const presetAcceptor = searchParams.get('to')

    const { lang } = useContext(LangContext)

    useEffect(() => {
        if (!domain.length) {
            setDomainError('')
            return
        }

        const errorMsg = verifyDomain(domain, [4, 16])
        setDomainError(errorMsg || '')
    }, [domain])

    const handleCreate = async () => {
        setDomainError('')
        setBadgeNameError('')

        if (!badgeName) {
            setBadgeNameError('badge name must not empty')
            return
        }

        if (!domain) {
            setDomainError('badge domain must not empty')
            return
        }

        if (!cover) {
            showToast('please upload a badge picture')
            return
        }

        const unload = showLoading()
        try {
            let groupId = 0
            if (searchParams.get('group')) {
                const group = await solas.getProfile({ domain: searchParams.get('group')! })
                groupId = group!.id
            }

            if (creator?.group_owner_id) {
                groupId = creator.id
            }

            const newBadge = await solas.createBadge({
                name: badgeName,
                title: badgeName,
                domain: domain + enhancer,
                image_url: cover,
                auth_token: user.authToken || '',
                content: reason || '',
                group_id:  groupId || undefined,
                badge_type: 'badge'
            })

            if (presetAcceptor) {
                const badgelets = await solas.issueBatch({
                    badgeId: newBadge.id!,
                    reason: reason || '',
                    issues: [presetAcceptor],
                    auth_token: user.authToken || ''
                })
                unload()
                router.push(`/issue-success?badgelet=${badgelets[0].id}`)
            } else {
                router.push(`/issue-badge/${newBadge.id}?reason=${encodeURI(reason)}`)
            }
            unload()
        } catch (e: any) {
            unload()
            console.log('[handleCreate]: ', e)
            showToast(e.message || 'Create fail')
        }
    }

    return (
        <div className='create-badge-page'>
            <div className='create-badge-page-wrapper'>
                <PageBack title={ lang['MintBadge_Title'] }/>

                <div className='create-badge-page-form'>
                    <div className='input-area'>
                        <div className='input-area-title'>{ lang['MintBadge_Upload'] }</div>
                        <UploadImage
                            imageSelect={ cover }
                            confirm={(coverUrl) => { setCover(coverUrl) } }/>
                    </div>

                    <div className='input-area'>
                        <div className='input-area-title'>{ lang['MintBadge_Name_Label'] }</div>
                        <AppInput
                            clearable
                            maxLength={ 30 }
                            value={ badgeName }
                            errorMsg={ badgeNameError }
                            endEnhancer={() => <span style={ { fontSize: '12px', color: '#999' } }>
                                    { `${badgeName.length}/30` }
                                </span>
                            }
                            placeholder={ lang['MintBadge_Name_Placeholder'] }
                            onChange={ (e) => { setBadgeName(e.target.value) } } />
                    </div>

                    <div className='input-area'>
                        <div className='input-area-title'>{ lang['MintBadge_Domain_Label'] }</div>
                        <AppInput
                            clearable
                            value={ domain }
                            errorMsg={ domainError }
                            placeholder={ lang['MintBadge_Domain_Placeholder'] }
                            endEnhancer={() => <span style={{ fontSize: '13px' }}>.{user.userName}{ enhancer }</span>}
                            onChange={ (e) => { setDomain(e.target.value.toLowerCase()) } } />
                        <div className='input-area-des' dangerouslySetInnerHTML={{__html: lang['MintBadge_Domain_Rule']}} />
                    </div>

                    <div className='input-area'>
                        <div className='input-area-title'>{ lang['IssueBadge_Reason'] }</div>
                        <ReasonInput value={reason}  onChange={ (value) => { setReason(value) }} />
                    </div>

                    <div className='input-area'>
                        <div className='input-area-title'>{ lang['BadgeDialog_Label_Creator'] }</div>
                        <SelectCreator value={ creator } onChange={(res) => { console.log('resres', res);setCreator(res) }}/>
                    </div>

                    <AppButton kind={ BTN_KIND.primary }
                               special
                               onClick={ () => { handleCreate() } }>
                        { presetAcceptor
                            ? lang['MintBadge_Submit_To']([presetAcceptor.split('.')[0]])
                            : lang['MintBadge_Next']
                        }
                    </AppButton>
                </div>
            </div>
        </div>
    )
}

export default CreateBadgeNonPrefill
