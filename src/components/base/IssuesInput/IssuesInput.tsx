import { useContext } from 'react'
import AppInput from '../AppInput'
import LangContext from '../../provider/LangProvider/LangContext'
import { Plus, CheckIndeterminate } from 'baseui/icon'
import './IssuesInpu.sass'
import DialogAddressList from '../Dialog/DialogAddressList/DialogAddressList'
import DialogsContext from '../../provider/DialogProvider/DialogsContext'

export interface IssuesInputProps {
    value: string[],
    onChange: (value: string[]) => any
}

function IssuesInput (props: IssuesInputProps) {
    const { lang } = useContext(LangContext)
    const { openDialog } = useContext(DialogsContext)

    const onChange = (newValue: string, index: number) => {
        const copyValue = [...props.value]
        copyValue[index] = newValue
        props.onChange(copyValue)
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
                   placeholder={lang['IssueBadge_IssueesPlaceholder']}
                   value={ value }
                   onChange={(e) => { onChange(e.target.value, index)}}
                   key={index.toString()}
               />

               { index != props.value.length - 1 ?
                   <div className='issue-input-remove-btn' onClick={ () => { removeItem(index) } }>
                       <CheckIndeterminate />
                   </div> :
                   <div className='issue-input-add-btn'  onClick={ addItem }>
                       <Plus />
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
