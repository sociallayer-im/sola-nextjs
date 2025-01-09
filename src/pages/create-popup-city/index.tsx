import styles from './CreatePopupCity.module.scss'
import PageBack from "@/components/base/PageBack";
import {useContext, useState, useEffect, useMemo, useRef} from "react";
import langContext from "@/components/provider/LangProvider/LangContext";
import AppButton from "@/components/base/AppButton/AppButton"
import userContext from "@/components/provider/UserProvider/UserContext";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import {Select} from "baseui/select";
import {Group} from "@/service/solas";
import usePicture from "@/hooks/pictrue";
import {useRouter} from "next/router";
import AppInput from "@/components/base/AppInput";
import { DatePicker } from "baseui/datepicker";
import UploadImage from "@/components/compose/UploadImage/UploadImage";
import * as dayjsLib from "dayjs";
import createPopupCityData from "@/data/create_popup_city.data";
const dayjs: any = dayjsLib


export default function CreatePopupCity() {
    const {lang} = useContext(langContext)
    const {user} = useContext(userContext)
    const {openConnectWalletDialog, showLoading} = useContext(DialogsContext)
    const {defaultAvatar} = usePicture()
    const router = useRouter()
    const uploadCoverRef = useRef<any>()

    const [error, setError] = useState('')
    const [allowGroups, setAllowGroup] = useState<Group[]>([])
    const [createForm, setCreateForm] = useState({
        group_id: 0,
        title: '',
        start_date: '',
        end_date: '',
        location: '',
        image_url: ''
    })

    const [step, setStep] = useState(1)

    const groupsOpt = useMemo(() => {
        return [{id: 0, handle: '+ Create Group'}, ...allowGroups] as Group[]
    }, [allowGroups])

    useEffect(() => {
        ;(async () => {
            if (user.id) {
                const unload = showLoading()
                const data = await createPopupCityData({userid: user.id})
                setAllowGroup(data.groups)
                unload()
            }
        })()
    }, [user]);

    useEffect(() => {
        console.log(createForm)
    }, [createForm]);

    const handleCreate = async () => {
        setError('')
        if (createForm.end_date <= createForm.start_date) {
            setError('End date must be greater than start date')
            return
        }

        const props = {
            ...createForm,
            start_date: dayjs(new Date(createForm.start_date).getTime()).format('YYYY/MM/DD'),
            end_date: dayjs(new Date(createForm.end_date).getTime()).format('YYYY/MM/DD')
        }
        console.log(props)
    }

    return <div className='regist-page'>
        <div className='regist-page-bg'></div>
        <div className='regist-page-wrapper'>
            <div className='regist-page-back'><PageBack/></div>
            <div className='regist-page-content'>
                <div className={styles['step-bar']}>
                    <div className={step >= 1 ? styles['active'] : ''}>1</div>
                    <i/>
                    <div className={step >= 2 ? styles['active'] : ''}>2</div>
                    <i/>
                    <div className={step >= 3 ? styles['active'] : ''}>3</div>
                    <i/>
                    <div className={step >= 4 ? styles['active'] : ''}>4</div>
                </div>

                {step === 1 &&
                    <>
                        <div className='title'>Select a group</div>
                        <div className='des'>Use this group as a community</div>
                        <div className={styles['form']}>
                            <Select
                                searchable={false}
                                clearable={false}
                                labelKey={'handle'}
                                getOptionLabel={({option}) => {
                                    return <div className={styles['group-opt']}>
                                        {!!option.id &&
                                            <img src={option.image_url || defaultAvatar(option.id)} alt=""/>}
                                        <div style={{fontWeight: option.id ? 'normal' : '600'}}>
                                            {option.handle || option.nickname}
                                        </div>
                                    </div>
                                }}
                                options={groupsOpt}
                                value={allowGroups.filter(item => item.id === createForm.group_id)}
                                onChange={({option}) => {
                                    if (option?.id) {
                                        setCreateForm({...createForm, group_id: option.id as number})
                                    } else {
                                        router.push('/create-group')
                                    }
                                }}
                                placeholder="Select Group"
                            />
                        </div>
                        {!user.id
                            ? <AppButton kind={'primary'} onClick={openConnectWalletDialog}>Connect Wallet</AppButton>
                            : <AppButton
                                kind={'primary'}
                                onClick={() => {
                                setStep(2)
                            }}
                                         disabled={!createForm.group_id}>
                                Next
                            </AppButton>
                        }
                    </>
                }

                {
                    step === 2 &&
                    <>
                        <div className='title'>Create a Pop-up city</div>
                        <div className='des'>Input the name of your Pop-up city</div>
                        <div className={styles['form']}>
                            <div className={styles['form-item']}>
                                <AppInput
                                    onChange={(e) => {setCreateForm({...createForm, title: e.target.value})}}
                                    value={createForm.title} />
                            </div>
                        </div>
                        <div className={styles['btns']}>
                            <AppButton onClick={() => {setStep(1)}}>
                                Back
                            </AppButton>
                            <AppButton
                                kind={'primary'}
                                onClick={() => {
                                setStep(3)
                            }}
                                       disabled={!createForm.title}>
                                Next
                            </AppButton>
                        </div>
                    </>
                }

                {
                    step === 3 &&
                    <>
                        <div className='title'>Post</div>
                        <div className='des'>Upload the image fo Pup-up city</div>

                        <div className={styles['form']}>
                            <div className={styles['form-item']}>
                                {!!createForm.image_url &&
                                    <div className={styles['post']}>
                                        <img src={createForm.image_url}
                                             alt=""/>
                                    </div>
                                }
                                <div style={{display: 'none'}}>
                                    <UploadImage
                                        ref={uploadCoverRef}
                                        cropper={false}
                                        imageSelect={createForm.image_url || undefined}
                                        confirm={(coverUrl) => {
                                            setCreateForm({...createForm, image_url: coverUrl})
                                        }}/>
                                </div>
                                <AppButton
                                    onClick={() => {
                                    uploadCoverRef.current?.selectFile()
                                }}>
                                    Upload Image
                                </AppButton>
                            </div>
                        </div>
                        <div className={styles['btns']}>
                            <AppButton onClick={() => {
                                setStep(2)
                            }}>
                                Back
                            </AppButton>
                            <AppButton
                                kind={'primary'}
                                onClick={() => {
                                    setStep(4)
                                }}
                                disabled={!createForm.image_url}>
                                Next
                            </AppButton>
                        </div>
                    </>
                }

                {step === 4 && <>
                    <div className='title'>More Details</div>
                    <div className='des'>Input more Pop-up city details</div>

                    <div className={styles['form']}>
                        <div className={styles['form-item']}>
                            <div className={styles['form-label']}>Location</div>
                            <AppInput
                                startEnhancer={() => <i className={'icon-Outline'}/>}
                                onChange={(e) => {
                                    setCreateForm({...createForm, location: e.target.value})
                                }}
                                value={createForm.location}/>
                        </div>
                        <div className={styles['form-item']}>
                            <div className={styles['form-label']}>Opening Date</div>
                            <div className={styles['row']}>
                                <div>Form</div>
                                <DatePicker
                                    value={createForm.start_date ? [new Date(createForm.start_date)] : undefined}
                                    onChange={({date}) => {
                                        const value = Array.isArray(date) ? date[0] : date
                                        if (value) {
                                            setCreateForm({...createForm, start_date: value.toISOString()})
                                        }
                                    }}/>
                                <div>To</div>
                                <DatePicker
                                    value={createForm.end_date ? [new Date(createForm.end_date)] : undefined}
                                    onChange={({date}) => {
                                        const value = Array.isArray(date) ? date[0] : date
                                        if (value) {
                                            setCreateForm({...createForm, end_date: value.toISOString()})
                                        }
                                    }}/>
                            </div>
                        </div>
                        <div className={styles['error']}>{error}</div>
                    </div>

                    <div className={styles['btns']}>
                        <AppButton onClick={() => {
                            setStep(3)
                        }}>
                            Back
                        </AppButton>
                        <AppButton
                            kind={'primary'}
                            onClick={handleCreate}
                            disabled={!createForm.location || !createForm.start_date || !createForm.end_date}>
                            Create
                        </AppButton>
                    </div>
                </>
                }
            </div>
        </div>
    </div>
}