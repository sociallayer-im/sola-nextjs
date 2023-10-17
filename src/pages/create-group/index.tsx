import { useState , useContext } from 'react'
import langContext from '../../components/provider/LangProvider/LangContext'
import FormRegistGroup from '../../components/compose/FormRegistGroup'
import PageBack from '../../components/base/PageBack'

function ComponentName () {
    const { lang } = useContext(langContext)

    return (
        <div className='regist-page'>
            <div className='regist-page-bg'></div>
            <div className='regist-page-wrapper'>
                <div className='regist-page-back'><PageBack /></div>
                <div className='regist-page-content' >
                    <div className='title'>{ lang['Group_regist_title'] }</div>
                    <div className='des' dangerouslySetInnerHTML={ { __html: lang['Domain_Rule'] } }></div>
                    <FormRegistGroup onConfirm={(domain) => {}}></FormRegistGroup>
                </div>
            </div>
        </div>
    )
}

export default ComponentName
