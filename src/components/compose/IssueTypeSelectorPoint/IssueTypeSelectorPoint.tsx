import {useContext, useState} from 'react'
import IssuesInput from "../../base/IssuesInput/IssuesInput";
import AppButton from "../../base/AppButton/AppButton";
import LangContext from "../../provider/LangProvider/LangContext";

export type IssueType = '' | 'issue' | 'presend'

export interface IssueTypeSelectorData {
    issues: string[],
    points: string
}

export interface IssueTypeSelectorProps {
    onConfirm?: (value: IssueTypeSelectorData) => any
    onCancel?: (value: IssueTypeSelectorData) => any
    initIssueType?: IssueType
    initIssues?: string[]
    initPoints?: string
}

function IssueTypeSelectorPoint(props: IssueTypeSelectorProps) {
    const [issueType, setIssueType] = useState<'' | 'issue' | 'presend'>(props.initIssueType || '')
    const [points, setPoints] = useState(props.initPoints || '0')
    const [issues, setIssues] = useState<string[]>(props.initIssues || [''])
    const {lang} = useContext(LangContext)
    const [showDatePicker, setShowDatePicker] = useState(true)
    const [expiry, setExpiry] = useState([new Date()]);

    // 修改points,只能是数字
    const handlePointsChange = (e: any) => {
        let value = e.target.value.trim()
        if (!value) {
            setPoints('0')
            return
        }

        if (value.startsWith('0')) {
            value = value.replace(/^0+/, '')
        }

        const reg = /^[0-9]*$/
        if (reg.test(value)) {
            setPoints(value)
        }
    }

    return (<div className={'issue-type-select-point'}>
        <div className={'title'}>{lang['Issue_Point_Title']}</div>

        <div className={'item'}>
            <div className={'item-title'}>{lang['Issue_Point_Point']}</div>
            <div className={'item-value'}>
                <input value={points} onChange={handlePointsChange}/>
            </div>
        </div>

        {/*<div className={'item'}>*/}
        {/*    <div className={'item-title'}>Expiry date</div>*/}
        {/*    <div className={'item-value'}>*/}
        {/*        { showDatePicker &&*/}
        {/*            <div className={'date-select'}>*/}
        {/*                <DatePicker value={expiry} onChange={({ date }) =>*/}
        {/*                    setExpiry((Array.isArray(date) ? date : [date]) as any)*/}
        {/*                } />*/}
        {/*            </div>*/}
        {/*        }*/}
        {/*        <Toggle checked={showDatePicker} onChange={e => {*/}
        {/*            setShowDatePicker(!showDatePicker)*/}
        {/*        }}/>*/}
        {/*    </div>*/}
        {/*</div>*/}

        <div className={'item'}>
            <div className={'item-title'}>{lang['IssueBadge_Address_List_Title']}</div>
        </div>
        <IssuesInput
            value={issues}
            onChange={(newIssues) => {
                setIssues(newIssues)
            }}/>

        <div className={'actions'}>
            <AppButton
                kind={'primary'}
                onClick={() => {
                    props.onConfirm && props.onConfirm({
                        points,
                        issues,
                    })
                }}
                size={'compact'}>{lang['IssueBadge_Mint']}</AppButton>
            <div
                onClick={e => {
                    props.onCancel && props.onCancel({
                        points,
                        issues,
                    })
                }}
                className={'send-later'}
            >{lang['IssueBadge_Mint_later']}</div>
        </div>
    </div>)
}

export default IssueTypeSelectorPoint
