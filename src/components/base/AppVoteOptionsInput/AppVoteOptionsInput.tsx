import {useContext, useEffect, useState} from 'react'
import AppInput from "../AppInput";
import LangContext from "../../provider/LangProvider/LangContext";
import {Delete} from "baseui/icon";
import DialogsContext from "../../provider/DialogProvider/DialogsContext";
import AppButton from "../AppButton/AppButton";

export interface VoteOption {
    id?: number,
    title: string,
    link: string | null,
}

interface AppVoteOptionsInputProps {
    value: VoteOption[],
    onChange?: (value: VoteOption[]) => any
}

function LinkInputDialog(props: { onConfirm: (link: string) => any, onCancel: () => any }) {
    const [linkInputValue, setLinkInputValue] = useState('')
    const {lang} = useContext(LangContext)

    return (<div className={'app-vote-option-input-dialog'}>
        <div className={'title'}>{'输入链接'}</div>
        <AppInput value={linkInputValue}
                  onChange={e => {
                      setLinkInputValue(e.target.value)
                  }} clearable/>
        <div className={'btns'}>
            <AppButton size={'compact'} onClick={e => {
                props.onCancel && props.onCancel()
            }}>
                {lang['Search_Cancel']}
            </AppButton>
            <AppButton size={'compact'} special
                       onClick={e => {
                           props.onConfirm && props.onConfirm(linkInputValue);
                           props.onCancel && props.onCancel()
                       }}>
                {lang['Profile_Edit_Social_Confirm']}
            </AppButton>
        </div>
    </div>)

}

function AppVoteOptionsInput(props: AppVoteOptionsInputProps) {
    const {lang} = useContext(LangContext)
    const {openDialog} = useContext(DialogsContext)


    useEffect(() => {
        if (props.value.length === 0) {
            props.onChange && props.onChange([{id: undefined, title: '', link: null}])
        }
    }, [props.value])

    const addOption = () => {
        const value = [...props.value]
        value.push({
            id: undefined,
            title: '',
            link: null
        })
        !!props.onChange && props.onChange(value)
    }

    const removeOption = (index: number) => {
        const value = [...props.value]
        value.splice(index, 1)
        !!props.onChange && props.onChange(value)
    }

    const setOptionTitle = (index: number, title: string) => {
        const value = [...props.value]
        value[index].title = title
        !!props.onChange && props.onChange(value)
    }

    const setOptionLink = (index: number, link: string | null) => {
        const value = [...props.value]
        value[index].link = link
        !!props.onChange && props.onChange(value)
    }

    const ShowLinkInputDialog = (index: number) => {
        const dialog = openDialog({
            content: (close: any) => {
                return <LinkInputDialog
                    onCancel={close}
                    onConfirm={link => {
                        setOptionLink(index, link)
                    }}/>
            },
            size: [300, 'auto']
        })
    }


    return (<div className={'app-vote-option-input'}>
        {
            props.value.map((item, index) => {
                return <div className={'app-vote-option-input-item'} key={index}>
                    <div className={'title'}>{lang['Vote_Create_Option_Input_Title']} {index + 1}</div>
                    <div className={'right'}>
                        <div className={'input-bar'}>
                            <AppInput value={item.title} onChange={e => {
                                setOptionTitle(index, e.target.value)
                            }} clearable maxLength={100}/>
                            {
                                index === props.value.length - 1
                                    ? <svg onClick={e => {
                                        addOption()
                                    }}
                                           className={'add-btn'} width="32" height="33" viewBox="0 0 32 33" fill="none"
                                           xmlns="http://www.w3.org/2000/svg">
                                        <rect x="0.5" y="1" width="31" height="31" rx="15.5" fill="white"/>
                                        <path fillRule="evenodd" clipRule="evenodd"
                                              d="M15.4999 12.5C15.2238 12.5 14.9999 12.7239 14.9999 13V15.5H12.4999C12.2237 15.5 11.9999 15.7239 11.9999 16V17C11.9999 17.2761 12.2237 17.5 12.4999 17.5H14.9999V20C14.9999 20.2761 15.2238 20.5 15.4999 20.5H16.4999C16.776 20.5 16.9999 20.2761 16.9999 20V17.5H19.4999C19.776 17.5 19.9999 17.2761 19.9999 17V16C19.9999 15.7239 19.776 15.5 19.4999 15.5H16.9999V13C16.9999 12.7239 16.776 12.5 16.4999 12.5H15.4999Z"
                                              fill="#6CD7B2"/>
                                        <rect x="0.5" y="1" width="31" height="31" rx="15.5" stroke="#6CD7B2"/>
                                    </svg>
                                    : <div className="issue-input-remove-btn" onClick={e => {
                                        removeOption(index)
                                    }}>—</div>
                            }
                        </div>
                        <div className={'link'}>
                            {
                                item.link
                                    ? <>
                                        <span>{item.link}</span>
                                        <Delete size={16} onClick={e => {
                                            setOptionLink(index, null)
                                        }}/>
                                    </>
                                    : <div className={'add-link'} onClick={e => {
                                        ShowLinkInputDialog(index)
                                    }}><i className={'icon-link'}/>Link</div>
                            }
                        </div>
                    </div>
                </div>
            })
        }
    </div>)
}

export default AppVoteOptionsInput
