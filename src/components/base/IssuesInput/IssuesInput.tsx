import {useContext, useRef, useState} from 'react'
import AppInput from '../AppInput'
import LangContext from '../../provider/LangProvider/LangContext'
import {CheckIndeterminate, Plus} from 'baseui/icon'
import DialogAddressList from '../Dialog/DialogAddressList/DialogAddressList'
import DialogsContext from '../../provider/DialogProvider/DialogsContext'
import usePicture from "../../../hooks/pictrue";
import {getProfile, Profile, searchDomain} from "@/service/solas";
import fetch from "@/utils/fetch";

export interface IssuesInputProps {
    value: string[],
    onChange: (value: string[]) => any,
    placeholder?: string
    allowAddressList?: boolean
    allowSearch?: boolean
    isSingle?: boolean
}

interface ProfileWithSns extends Profile {
    sns?: string
}

const getProfileBySNS = async (params: string): Promise<ProfileWithSns | null> => {
    params = params!.replace('.seedao', '') + '.seedao'
    try {
        const info = await fetch.get({
            url: `https://sola.deno.dev/seedao/resolve/${params}`,
            data: {}
        })

        if (info.data.address === '0x0000000000000000000000000000000000000000') {
            return null
        }

        const profile = await getProfile({address: info.data.address})

        return profile ? {
            ...profile,
            sns: params
        } : null
    } catch (e: any) {
        return null
    }
}

function IssuesInput({allowAddressList = true, allowSearch = true, isSingle = false, ...props}: IssuesInputProps) {
    const {lang} = useContext(LangContext)
    const {openDialog} = useContext(DialogsContext)
    const {defaultAvatar} = usePicture()
    const timeout = useRef<any>(null)
    const [showSearchRes, setShowSearchRes] = useState<null | number>(null)
    const [searchRes, setSearchRes] = useState<Profile[]>([])

    const onChange = (newValue: string, index: number) => {
        if (!newValue) {
            setShowSearchRes(null)
            setSearchRes([])
            if (timeout.current) {
                clearTimeout(timeout.current)
            }
        }


        const copyValue = [...props.value]
        copyValue[index] = newValue
        props.onChange(copyValue)


        if (!allowSearch) return

        setShowSearchRes(index)

        console.log('newValue', newValue)
        console.log('copyValue', copyValue)
        console.log('index', index)

        if (newValue.length >= 3) {
            if (timeout.current) {
                clearTimeout(timeout.current)
            }

            timeout.current = setTimeout(async () => {
                const task = [
                    searchDomain({username: newValue.split('.')[0], page: 1}),
                    getProfile({username: newValue.split('.')[0]}),
                    // getProfileBySNS(newValue)
                ]

                const fetch = await Promise.all(task)

                // const res1 = await searchDomain({username: newValue.split('.')[0], page: 1})
                // const res2 = await getProfile({domain: newValue.split('.')[0]})
                // const res3 = await getProfile({username: newValue.split('.')[0]})
                // const res4 = await getProfile({email: newValue})
                let res: Profile[] = [];
                [fetch[1], ...fetch[0] as any].map(item => {
                    if (item && !res.find(i => i.id === item.id)) {
                        res.push(item)
                    }
                })

                if (fetch[2]) {
                    const target: any = fetch[2]
                    let index = -1
                    res.forEach((item, i) => {
                        if (item.id === target.id) {
                            index = i
                        }
                    })

                    if (index !== -1) {
                        res.splice(index, 1)
                    }

                    res = [target, ...res]
                }

                setSearchRes(res || [])
            }, 200)
        }
    }

    const hideSearchRes = () => {
        setSearchRes([])
        setShowSearchRes(null)
    }

    const addItem = () => {
        const copyValue = [...props.value]
        copyValue.push('')
        props.onChange(copyValue)
    }

    const removeItem = (index: number) => {
        if (props.value.length === 1) return
        const copyValue = [...props.value]
        copyValue.splice(index, 1)
        props.onChange(copyValue)
    }

    const showAddressList = () => {
        openDialog({
            content: (close: () => any) => {
                const handleChange = (selected: string[]) => {
                    props.onChange(selected)
                }

                return <DialogAddressList
                    value={props.value}
                    onChange={(selected: string[]) => {
                        handleChange(selected)
                    }}
                    handleClose={close}/>
            },
            size: ['100%', '100%']
        })
    }

    const addressListBtn = () => {
        return <span onClick={showAddressList} className='icon-address-list'/>
    }

    const InputItem = (value: string, index: number) => {


        return (
            <div className='issue-input-item' key={index.toString()}>
                <AppInput
                    endEnhancer={allowAddressList ? addressListBtn : undefined}
                    placeholder={props.placeholder || lang['IssueBadge_IssueesPlaceholder']}
                    value={value.replace('.sociallayer.im', '')}
                    onChange={(e) => {
                        onChange(e.target.value, index)
                    }}
                    key={index.toString()}
                    onFocus={(e) => {
                        onChange(e.target.value, index)
                    }}
                />

                {!isSingle && <>
                    {index != props.value.length - 1 ?
                        <div className='issue-input-remove-btn' onClick={() => {
                            removeItem(index)
                        }}>
                            <CheckIndeterminate/>
                        </div> :
                        <div className='issue-input-add-btn' onClick={addItem}>
                            <Plus/>
                        </div>
                    }
                </>
                }


                {showSearchRes === index &&
                    <div className={'search-res'}>
                        <div className={'shell'} onClick={e => {
                            hideSearchRes()
                        }}></div>
                        {
                            searchRes.map((item, index2) => {
                                const username = item.username?.startsWith('0x') ?
                                    item.username!.substr(0, 6) + '...' + item.username!.substr(-4) :
                                    item.username
                                return <div className={'res-item'} key={index2} onClick={e => {
                                    onChange(item.username || '', index);
                                    hideSearchRes()
                                }}>
                                    <img src={item.image_url || defaultAvatar(item.id)} alt=""/>
                                    <div>{username}<span>{item.nickname ? `(${item.nickname})` : ''}</span><span>{(item as ProfileWithSns).sns ? `(${(item as ProfileWithSns).sns})` : ''}</span>
                                    </div>
                                </div>
                            })
                        }
                    </div>
                }
            </div>
        )
    }

    return (<div>
        {
            props.value.map((item, index) => {
                return InputItem(item, index)
            })
        }
    </div>)
}

export default IssuesInput
