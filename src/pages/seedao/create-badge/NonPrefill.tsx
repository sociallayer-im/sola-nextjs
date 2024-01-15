import {useRouter} from "next/navigation";
import {useContext, useEffect, useState} from 'react'
import PageBack from '@/components/base/PageBack'
import LangContext from '@/components/provider/LangProvider/LangContext'
import UploadImage from '@/components/compose/UploadBadgeImage/UploadBadgeImage'
import AppInput from '@/components/base/AppInput'
import UserContext from '@/components/provider/UserProvider/UserContext'
import AppButton, {BTN_KIND} from '@/components/base/AppButton/AppButton'
import {createBadge, CreateBadgeProps, Group, uploadImage} from '@/service/solas'
import DialogsContext from '@/components/provider/DialogProvider/DialogsContext'
import ReasonInput from '@/components/base/ReasonInput/ReasonInput'
import {Select} from "baseui/select";
import styles from './IssueBadge.module.scss'
import usePicture from "@/hooks/pictrue";
import SelectImgTemp from "@/components/compose/SelectImgTemp/SelectPointCover";
import html2canvas from 'html2canvas'

const sections = [
    {id: '第一季度', label: '第一季度'},
    {id: '第二季度', label: '第二季度'},
    {id: '第三季度', label: '第三季度'},
    {id: '第四季度', label: '第四季度'},
    {id: '第五季度', label: '第五季度'},
    {id: '第六季度', label: '第六季度'},
]

const institutions = [
    {id: '节点共识大会', label: '节点共识大会'},
    {id: '市政厅', label: '市政厅'},
    {id: '孵化器', label: '孵化器'},
    {id: '翻译公会', label: '翻译公会'},
    {id: '研发公会', label: '研发公会'},
    {id: '投研公会', label: '投研公会'},
    {id: '公共项目', label: '公共项目'},
    {id: 'P3 提案', label: 'P3 提案'},
    {id: 'P2 提案', label: 'P2 提案'},
    {id: 'P1 提案', label: 'P1 提案'},
]

const coverTemp = [
    '/images/img_temp/tmp_1.png',
    '/images/img_temp/tmp_2.png',
    '/images/img_temp/tmp_3.png',
    '/images/img_temp/tmp_4.png',
    '/images/img_temp/tmp_5.png',
]

const roles = ['节点', '财务官', '治理伙伴', '成员', '负责人', '平面设计师', '开发者', '主持人', '活动外联']


function CreateBadgeNonPrefill({group}: { group: Group }) {
    const router = useRouter()
    const [cover, setCover] = useState('')
    const [cover2, setCover2] = useState(coverTemp[0])
    const [reason, setReason] = useState('')
    const [role, setRole] = useState('')
    const [roleErr, setRoleErr] = useState('')
    const [section, setSection] = useState([sections[0]])
    const [institution, setInstitution] = useState([institutions[0]])

    const [coverType, setCoverType] = useState(0)


    const {user} = useContext(UserContext)
    const {showLoading, showToast} = useContext(DialogsContext)
    const {defaultAvatar} = usePicture()

    const {lang} = useContext(LangContext)

    const genCover = (): Promise<string> => {
        return new Promise((resolve, reject) => {
            const dom = document.createElement('div')
            dom.className = styles['seedao-text-img']
            dom.innerHTML = `<div>${section[0].label}</div><div>${institution[0].label}</div><div>${role}</div>`
            dom.style.background = `url(${cover2}) center no-repeat`
            dom.style.backgroundSize = `100% 100%`
            document.querySelector('body')?.append(dom)
            html2canvas(dom).then(canvas => {
                dom.remove()
                const base64 = canvas.toDataURL()
                const upload = uploadImage({
                    file: base64,
                    auth_token: user.authToken || '',
                    uploader: group.username
                })
                    .then(res => {
                        resolve(res)
                    })
                    .catch(err => {
                        reject(err)
                    })
            })
        })
    }

    const handleCreate = async () => {
        if ((coverType === 0 && !cover) || (coverType === 1 && !cover2)) {
            showToast('Please upload badge cover')
            document.querySelector('#PageContent')?.scrollTo({top: 0, behavior: 'smooth'})
            return
        }

        if (!role) {
            setRoleErr('Please input role')
            document.querySelector('#PageContent')?.scrollTo({top: 0, behavior: 'smooth'})
            return
        }

        const unload = showLoading()

        let coverUrl = ''
        if (coverType === 1) {
            coverUrl = await genCover()
        } else {
            coverUrl = cover
        }

        const createBadgeProps: CreateBadgeProps = {
            name: `${section[0].id}-${institution[0].id}-${role}`,
            title: `${section[0].id}-${institution[0].id}-${role}`,
            image_url: coverUrl,
            auth_token: user.authToken || '',
            content: reason,
            group_id: group.id,
            badge_type: 'badge',
            metadata: JSON.stringify({
                name: `${section[0].id}-${institution[0].id}-${role}`,
                image: coverUrl,
                description: reason,
                attributes: [
                    {
                        trait_type: 'section',
                        value: section[0].id
                    },
                    {
                        trait_type: 'role',
                        value: role
                    },
                    {
                        trait_type: 'institution',
                        value: institution[0].id
                    },
                    {
                        trait_type: 'type',
                        value: 'SeedDao SBT'
                    },
                    {
                        trait_type: 'issuer',
                        value: user.userName || ''
                    }
                ]
            })
        }

        try {
            const badge = await createBadge(createBadgeProps)
            unload()
            showToast('Create badge success')
            router.push(`/issue-badge/${badge.id}`)
        } catch (e: any) {
            unload()
            console.error(e)
            showToast(e.message)
        }
    }

    useEffect(() => {
        document.querySelector('body')?.classList.add('seeda0-create-badge-page')

        document.querySelectorAll('.input-disable input').forEach((input) => {
            input.setAttribute('readonly', 'readonly')
        })

        return () => {
            document.querySelector('body')?.classList.remove('seeda0-create-badge-page')
        }
    }, [])

    return (
        <div className='create-badge-page'>
            <div className='create-badge-page-wrapper'>
                <PageBack title={lang['MintBadge_Title']}/>

                <div className='create-badge-page-form'>
                    <div className='input-area'>
                        <div className='input-area-title'>{lang['MintBadge_Upload']}</div>
                        <div className={styles['cover-type']}>
                            <div
                                onClick={() => {
                                    setCoverType(0)
                                }}
                                className={coverType === 0 ? styles['cover-type-item-active'] : styles['cover-type-item']}>
                                {'Upload image'}
                            </div>
                            <div
                                onClick={() => {
                                    setCoverType(1)
                                }}
                                className={coverType === 1 ? styles['cover-type-item-active'] : styles['cover-type-item']}>
                                {'Template'}
                            </div>
                        </div>
                        {coverType === 0 ?
                            <UploadImage
                                imageSelect={cover}
                                confirm={(coverUrl) => {
                                    setCover(coverUrl)
                                }}/>

                            : <SelectImgTemp
                                temps={coverTemp}
                                textTemp={() => {
                                    return (<div className={styles['seedao-text-temp']}>
                                        <div>{section[0].label}</div>
                                        <div>{institution[0].label}</div>
                                        <div>{role}</div>
                                    </div>)
                                }
                                }
                                value={cover2}
                                onChange={(value) => {
                                    setCover2(value)
                                }}/>
                        }
                    </div>

                    <div className='input-area'>
                        <div className='input-area-title'>{lang['Seedao_Issue_Badge_Role']}</div>
                        <AppInput
                            clearable
                            value={role}
                            errorMsg={roleErr}
                            placeholder={lang['Seedao_Issue_Badge_Role']}
                            onChange={(e) => {
                                setRole(e.target.value)
                            }}/>
                        <div className={styles['label-list']}>
                            {
                                roles.map((item, index) => {
                                    return <div key={item} className={styles['label-item']}
                                                onClick={e => {
                                                    setRole(item)
                                                }}>{item}</div>
                                })
                            }
                        </div>
                    </div>

                    <div className={'input-area input-disable'}>
                        <div className='input-area-title'>{lang['Seedao_Issue_Badge_Section']}</div>
                        <Select
                            searchable={false}
                            clearable={false}
                            creatable={false}
                            options={sections}
                            onChange={({value}) => {
                                setSection(value as any)
                            }}
                            value={section}/>
                    </div>

                    <div className={'input-area input-disable'}>
                        <div className='input-area-title'>{lang['Seedao_Issue_Badge_Institution']}</div>
                        <Select
                            searchable={false}
                            clearable={false}
                            creatable={false}

                            options={institutions}
                            onChange={({value}) => {
                                setInstitution(value as any)
                            }}
                            value={institution}/>
                    </div>

                    <div className='input-area'>
                        <div className='input-area-title'>{lang['IssueBadge_Reason']}</div>
                        <ReasonInput value={reason} onChange={(value) => {
                            setReason(value)
                        }}/>
                    </div>


                    {!!group &&
                        <div className='input-area'>
                            <div className='input-area-title'>{lang['BadgeDialog_Label_Creator']}</div>
                            <div className={styles['creator']}>
                                <img className={styles['avatar']} src={group.image_url || defaultAvatar(group.id)}
                                     alt=""/>
                                {group.username}</div>
                        </div>
                    }

                    <AppButton kind={BTN_KIND.primary}
                               special
                               onClick={() => {
                                   handleCreate()
                               }}>
                        {lang['MintBadge_Next']}
                    </AppButton>
                </div>
            </div>
        </div>
    )
}

export default CreateBadgeNonPrefill
