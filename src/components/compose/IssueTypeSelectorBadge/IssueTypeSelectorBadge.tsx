import {useContext, useEffect, useState} from 'react'
import Toggle from "../../base/Toggle/Toggle";
import IssuesInput from "../../base/IssuesInput/IssuesInput";
import AppButton from "../../base/AppButton/AppButton";
import LangContext from "../../provider/LangProvider/LangContext";

export type IssueType = 'unset' | 'issue' | 'presend'

export interface IssueTypeSelectorData {
    issues: string[],
    issueType: IssueType,
    presendAmount: string | null
}

export interface IssueTypeSelectorProps {
    onConfirm?: (value: IssueTypeSelectorData) => any
    onCancel?: (value: IssueTypeSelectorData) => any
    initIssueType?: IssueType
    initIssues?: string[]
    presendDisable?: boolean
    initPresendAmount?: string
}

function IssueTypeSelectorBadge(props: IssueTypeSelectorProps) {
    const [issueType, setIssueType] = useState<IssueType>(props.initIssueType || 'unset')
    const [presendAmount, setPresendAmount] = useState(props.initPresendAmount || '0')
    const [issues, setIssues] = useState<string[]>(props.initIssues || [''])
    const {lang} = useContext(LangContext)

    // 修改presendAmount,只能是数字
    const handlePresendAmountChange = (e: any) => {
        let value = e.target.value.trim()
        if (!value) {
            setPresendAmount('0')
            return
        }

        if (value.startsWith('0')) {
            value = value.replace(/^0+/, '')
        }

        const reg = /^[0-9]*$/
        if (reg.test(value)) {
            setPresendAmount(value)
        }
    }

    useEffect(() => {
        setIssueType(props.initIssueType || 'unset')
    },[props.initIssueType])

    return (<div className={'issue-type-select'}>
        <div className={'title'}>{lang['Selector_issue_type_badge']}</div>
        <div className={'item'}>
            <div className={'item-title'}>{lang['IssueBadge_Address_List_Title']}</div>
            <Toggle checked={issueType === 'issue'} onChange={e => {
                setIssueType(issueType === 'issue' ? 'unset' : 'issue')
            }}/>
        </div>

        {
            issueType === 'issue' &&
            <IssuesInput
                value={issues}
                onChange={(newIssues) => {
                    setIssues(newIssues)
                }}/>
        }

        {!props.presendDisable &&
            <div className={'item'}>
                <div className={'item-title'}>{lang['Selector_issue_type_amount']}</div>
                <div className={'item-value'}>
                    {issueType === 'presend' &&
                        <input value={presendAmount} onChange={handlePresendAmountChange}/>
                    }
                    {issueType === 'unset' &&
                        <div className={'unlimited'}>Unlimited</div>
                    }

                    <Toggle checked={issueType === 'presend'} onChange={e => {
                        setIssueType(issueType === 'presend' ? 'unset' : 'presend')
                    }}/>
                </div>
            </div>
        }



        <div className={'actions'}>
            <AppButton
                kind={'primary'}
                onClick={() => {
                    props.onConfirm && props.onConfirm({
                        presendAmount,
                        issues,
                        issueType
                    })
                }}
                size={'compact'}>{lang['IssueBadge_Mint']}</AppButton>
            <div
                onClick={e => {
                    props.onCancel && props.onCancel({
                        presendAmount,
                        issues,
                        issueType
                    })
                }}
                className={'send-later'}
            >{lang['IssueBadge_Mint_later']}</div>
        </div>
    </div>)
}

export default IssueTypeSelectorBadge
