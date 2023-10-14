import {useContext, useEffect, useState} from 'react'
import Toggle from "../../base/Toggle/Toggle";
import IssuesInput from "../../base/IssuesInput/IssuesInput";
import AppButton from "../../base/AppButton/AppButton";
import LangContext from "../../provider/LangProvider/LangContext";
import { DatePicker } from "baseui/datepicker";


export type IssueType = '' | 'issue' | 'presend'

export interface IssueTypeSelectorData {
    issues: string[],
    starts_at : string | null
    expires_at  : string | null
}

export interface IssueTypeSelectorNftPassProps {
    onConfirm?: (value: IssueTypeSelectorData) => any
    onCancel?: (value: IssueTypeSelectorData) => any
    initIssues?: string[]
}

function IssueTypeSelectorNftPass(props: IssueTypeSelectorNftPassProps) {
    const [issues, setIssues] = useState<string[]>(props.initIssues || [''])
    const {lang} = useContext(LangContext)
    const [showStartsAt, setShowStartsAt] = useState(false)
    const [showExpiresAt, setShowExpiresAt] = useState(false)
    // 默认开始时间是现在
    const [startsAt, setStartsAt] = useState([new Date()]);
    // 默认过期时间是今天后7天
    const [expiresAt, setExpiresAt] = useState([new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)]);

    return (<div className={'issue-type-select-point'}>
        <div className={'title'}>{lang['Issue_Nft_Title']}</div>

        <div className={'item'}>
            <div className={'item-title'}>{lang['IssueBadge_Address_List_Title']}</div>
        </div>
        <IssuesInput
            value={issues}
            onChange={(newIssues) => {
                setIssues(newIssues)
            }}/>

        <div className={'item'}>
            <div className={'item-title'}>{lang['Issue_Nft_Start']}</div>
            <div className={'item-value'}>
                { showStartsAt &&
                    <div className={'date-select'}>
                        <DatePicker value={startsAt} onChange={({ date }) =>
                            setStartsAt((Array.isArray(date) ? date : [date]) as any)
                        } />
                    </div>
                }
                <Toggle checked={showStartsAt} onChange={e => {
                    setShowStartsAt(!showStartsAt)
                }}/>
            </div>
        </div>

        <div className={'item'}>
            <div className={'item-title'}>{lang['Issue_Nft_End']}</div>
            <div className={'item-value'}>
                { showExpiresAt &&
                    <div className={'date-select'}>
                        <DatePicker value={expiresAt} onChange={({ date }) =>
                            setExpiresAt((Array.isArray(date) ? date : [date]) as any)
                        } />
                    </div>
                }
                <Toggle checked={showExpiresAt} onChange={e => {
                    setShowExpiresAt(!showExpiresAt)
                }}/>
            </div>
        </div>

        <div className={'actions'}>
            <AppButton
                kind={'primary'}
                onClick={() => {
                    props.onConfirm && props.onConfirm({
                        issues,
                        expires_at: showExpiresAt ? expiresAt[0].toISOString() : null,
                        starts_at: showStartsAt ? startsAt[0].toISOString() : null
                    })
                }}
                size={'compact'}>{lang['IssueBadge_Mint']}</AppButton>
            <div
                onClick={e => {
                    props.onCancel && props.onCancel({
                        issues,
                        expires_at: showExpiresAt ? expiresAt[0].toISOString() : null,
                        starts_at: showStartsAt ? startsAt[0].toISOString() : null
                    })
                }}
                className={'send-later'}
            >{lang['IssueBadge_Mint_later']}</div>
        </div>
    </div>)
}

export default IssueTypeSelectorNftPass
