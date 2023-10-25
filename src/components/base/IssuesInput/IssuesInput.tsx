import { useContext, useRef, useState } from 'react'
import AppInput from '../AppInput'
import LangContext from '../../provider/LangProvider/LangContext'
import { Plus, CheckIndeterminate } from 'baseui/icon'
import DialogAddressList from '../Dialog/DialogAddressList/DialogAddressList'
import DialogsContext from '../../provider/DialogProvider/DialogsContext'
import usePicture from "../../../hooks/pictrue";
import {Profile, searchDomain, getProfile} from "@/service/solas";

export interface IssuesInputProps {
    value: string[],
    onChange: (value: string[]) => any,
    placeholder?: string
}

function IssuesInput (props: IssuesInputProps) {
    const { lang } = useContext(LangContext)
    const { openDialog } = useContext(DialogsContext)
    const { defaultAvatar } = usePicture()
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



        setShowSearchRes(index)
        const copyValue = [...props.value]
        copyValue[index] = newValue
        props.onChange(copyValue)

        console.log('newValue', newValue)
        console.log('copyValue', copyValue)
        console.log('index', index)

        if (newValue.length >= 3) {
            if (timeout.current) {
                clearTimeout(timeout.current)
            }

            timeout.current = setTimeout(async () => {
                const tast = [
                    searchDomain({username: newValue.split('.')[0], page: 1}),
                    getProfile({domain: newValue.split('.')[0]}),
                    getProfile({username: newValue.split('.')[0]}),
                    getProfile({email: newValue})
                ]

                const fetch = await Promise.all(tast)

                // const res1 = await searchDomain({username: newValue.split('.')[0], page: 1})
                // const res2 = await getProfile({domain: newValue.split('.')[0]})
                // const res3 = await getProfile({username: newValue.split('.')[0]})
                // const res4 = await getProfile({email: newValue})
                let res:Profile[] = []
                const deduplication = [fetch[1], fetch[2], fetch[3], ...fetch[0] as any].map(item => {
                    if (item && !res.find(i => i.id === item.id)) {
                        res.push(item)
                    }
                })

                setSearchRes(res.splice(0,4) || [])
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
        if (props.value.length === 1 ) return
        const copyValue =  [...props.value]
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
                    value={ props.value }
                    onChange={(selected: string[]) => { handleChange(selected) }}
                    handleClose={ close }/>
            },
            size: ['100%', '100%']
        })
    }

    const addressListBtn = () => {
        return <span onClick={showAddressList} className='icon-address-list' />
    }

    const InputItem = (value: string, index: number) => {


        return (
            <div className='issue-input-item' key={index.toString()}>
                <AppInput
                    endEnhancer={ addressListBtn }
                    placeholder={props.placeholder || lang['IssueBadge_IssueesPlaceholder']}
                    value={ value.replace('.sociallayer.im', '') }
                    onChange={(e) => { onChange(e.target.value, index)} }
                    key={index.toString()}
                    onFocus={(e) => { onChange(e.target.value, index)}}
                />

                { index != props.value.length - 1 ?
                    <div className='issue-input-remove-btn' onClick={ () => { removeItem(index) } }>
                        <CheckIndeterminate />
                    </div> :
                    <div className='issue-input-add-btn'  onClick={ addItem }>
                        <Plus />
                    </div>
                }

                {  showSearchRes === index &&
                    <div className={'search-res'}>
                        <div className={'shell'} onClick={e => { hideSearchRes() }}></div>
                        {
                            searchRes.map((item, index2) => {
                                return <div className={'res-item'} key={index2} onClick={e => { onChange(item.domain || '', index); hideSearchRes()}}>
                                    <img src={item.image_url || defaultAvatar(item.id)} alt=""/>
                                    <div>{item.nickname || item.username }({item.domain || item.email || item.address})</div>
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
