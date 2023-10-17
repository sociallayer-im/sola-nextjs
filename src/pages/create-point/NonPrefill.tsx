import {useRouter, useSearchParams} from "next/navigation";
import {useContext, useEffect, useState} from "react";
import {createPoint, Group, Profile} from "../../service/solas";
import UserContext from "../../components/provider/UserProvider/UserContext";
import DialogsContext from "../../components/provider/DialogProvider/DialogsContext";
import LangContext from "../../components/provider/LangProvider/LangContext";
import PageBack from "../../components/base/PageBack";
import AppInput from "../../components/base/AppInput";
import ReasonInput from "../../components/base/ReasonInput/ReasonInput";
import SelectCreator from "../../components/compose/SelectCreator/SelectCreator";
import AppButton, {BTN_KIND} from "../../components/base/AppButton/AppButton";
import SelectPointCover, {covers} from "../../components/compose/SelectPointCover/SelectPointCover";
import useVerify from "../../hooks/verify";
import AppTips from "../../components/base/AppTips/AppTips";
import Toggle from "../../components/base/Toggle/Toggle";

function CreateBadge() {
    const router = useRouter()
    const [cover, setCover] = useState(covers[0])
    const [name, setName] = useState('')
    const [domain, setDomain] = useState('')
    const [nameError, setNameError] = useState('')
    const [domainError, setDomainError] = useState('')
    const [transferable, setTransferable] = useState(true)
    const [symbol, setSymbol] = useState('')
    const [symbolError, setSymbolError] = useState('')
    const [reason, setReason] = useState('')
    const [creator, setCreator] = useState<Group | Profile | null>(null)
    const {user} = useContext(UserContext)
    const {showLoading, showToast} = useContext(DialogsContext)
    const searchParams = useSearchParams()
    const presetAcceptor = searchParams.get('to')
    const {lang} = useContext(LangContext)
    const enhancer = process.env.NEXT_PUBLIC_SOLAS_DOMAIN
    const {verifyDomain} = useVerify()

    useEffect(() => {
        if (!domain.length) {
            setDomainError('')
            return
        }

        const errorMsg = verifyDomain(domain, [4, 16])
        setDomainError(errorMsg || '')
    }, [domain])

    const handleCreate = async () => {
        console.log('cover', cover)
        console.log('name', name)
        console.log('creator', creator)

        if (!name) {
            setNameError('please input a name')
            return
        }

        if (!domain) {
            setDomainError('please input a name')
            return
        }

        if (!symbol) {
            setSymbolError('please input a symbol')
            return
        }

        const unload = showLoading()
        try {
            const newPoint = await createPoint({
                name: domain,
                title: name,
                content: reason,
                image_url: cover,
                auth_token: user.authToken || '',
                group_id: creator?.is_group ? creator.id : undefined,
                sym: symbol
            })
            router.push(`/issue-point/${newPoint.id}`)
        } catch (e: any) {
            console.error(e)
            showToast(e.message)
        } finally {
           unload()
        }
    }

    return (
        <>
            <div className='create-point-page'>
                <div className='create-badge-page-wrapper'>
                    <PageBack title={lang['Create_Point_Title']}/>

                    <div className='create-badge-page-form'>
                        <div className='input-area'>
                            <div className='input-area-title'>{lang['Create_Point_Image']}</div>
                            <SelectPointCover
                                value={cover}
                                onChange={(value) => {
                                    setCover(value)
                                }}/>
                        </div>

                        <div className='input-area'>
                            <div className='input-area-title'>{lang['Create_Point_Name']}</div>
                            <AppInput
                                errorMsg={nameError}
                                clearable
                                maxLength={30}
                                value={name}
                                endEnhancer={() => <span style={{fontSize: '12px', color: '#999'}}>
                                    {`${name.length}/30`}
                                </span>
                                }
                                placeholder={lang['Create_Point_Name_Placeholder']}
                                onChange={(e) => {
                                    setName(e.target.value.trim())
                                }}/>
                        </div>

                        <div className='input-area'>
                            <div className='input-area-title'>{lang['Create_Point_Symbol']}</div>
                            <AppInput
                                clearable
                                value={symbol}
                                errorMsg={symbolError}
                                placeholder={lang['Create_Point_Symbol_Placeholder']}
                                onChange={(e) => {
                                    setSymbol(e.target.value.toLowerCase())
                                }}/>
                        </div>

                        <div className='input-area'>
                            <div className='input-area-title'>{lang['MintBadge_Domain_Label']}</div>
                            <AppInput
                                clearable
                                value={domain}
                                errorMsg={domainError}
                                placeholder={lang['MintBadge_Domain_Placeholder']}
                                endEnhancer={() => <span style={{fontSize: '13px'}}>.{user.userName}{enhancer}</span>}
                                onChange={(e) => {
                                    setDomain(e.target.value.toLowerCase())
                                }}/>
                            <div className='input-area-des'
                                 dangerouslySetInnerHTML={{__html: lang['MintBadge_Domain_Rule']}}/>
                        </div>

                        <div className='input-area'>
                            <div className='input-area-title'>{lang['Create_Point_Des']}</div>
                            <ReasonInput value={reason} onChange={(value) => {
                                setReason(value)
                            }}/>
                        </div>

                        <div className='input-area'>
                            <div className={'toggle-item'}>
                                <div className={'label'}>
                                    <span> {lang['Create_Point_Transferable']}</span>
                                    <AppTips text={lang['Create_Point_Transferable_Tips']} />
                                </div>
                                <Toggle checked={transferable} onChange={(e) => {setTransferable(!transferable)}}/>
                            </div>
                        </div>

                        <div className='input-area'>
                            <div className='input-area-title'>{lang['BadgeDialog_Label_Creator']}</div>
                            <SelectCreator value={creator} onChange={(res) => {
                                console.log('resres', res);
                                setCreator(res)
                            }}/>
                        </div>

                        <AppButton kind={BTN_KIND.primary}
                                   special
                                   onClick={() => {
                                       handleCreate()
                                   }}>
                            {presetAcceptor
                                ? lang['MintBadge_Submit_To']([presetAcceptor.split('.')[0]])
                                : lang['MintBadge_Next']
                            }
                        </AppButton>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CreateBadge
