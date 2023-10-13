import { useStyletron} from 'baseui'
import { useState , useContext, useEffect } from 'react'
import Layout from '../../components/Layout/Layout'
import './RegistGroup.less'
import langContext from '../../components/provider/LangProvider/LangContext'
import FormRegistGroup from '../../components/compose/FormRegistGroup'
import DialogsContext from '../../components/provider/DialogProvider/DialogsContext'
import PageBack from '../../components/base/PageBack'

function ComponentName () {
    const [css] = useStyletron()
    const [a, seta] = useState('')
    const { lang } = useContext(langContext)
    const { clean } = useContext(DialogsContext)

    return (
        <Layout>
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
        </Layout>
    )
}

export default ComponentName
