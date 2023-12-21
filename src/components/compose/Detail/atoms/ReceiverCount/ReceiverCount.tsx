import { useContext } from 'react'
import langContext from '../../../../provider/LangProvider/LangContext'
import styles from './ReceiverCount.module.scss'

interface DetailCreatorProp {
    count: number,
}
function ReceiverCount(props: DetailCreatorProp) {
    const { lang } = useContext(langContext)

    return (<div className={styles['tag']}>
        <div className={styles['count']}>{props.count}</div>
        <div className={styles['label']}>{ lang['Received'] }</div>
    </div>)
}

export default ReceiverCount
