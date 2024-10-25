import styles from './RichTextEditor.module.scss'
import Empty from "@/components/base/Empty";
import markdownit from "markdown-it"


function RichTextDisplayer({markdownStr}: { markdownStr: string }) {

    const md = markdownit()
    const str = md.render(markdownStr || '')

    return (!!markdownStr ? <div className={`${styles['editor-wrapper']} ${styles['display']}`}>
            <div dangerouslySetInnerHTML={{__html: str}}  className={'ProseMirror'} />
            </div>
        : <Empty />
    )
}

export default RichTextDisplayer
