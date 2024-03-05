import styles from './rich-text.module.scss'
import RichTextEditor from "@/components/compose/RichTextEditor/Editor";
import {useEffect, useState} from "react";


function RichTextEditorPage() {
    const [res, setRes] = useState('[asdasdasd](123 "zfd")')

    useEffect(() => {
        console.log('res===>', res)
    }, [res])

    return (<div className={styles['page']}>
        <RichTextEditor height={200} maxHeight={300} initText={res} onChange={e => {
             setRes(e)
        }} />
    </div>)
}

export default RichTextEditorPage

