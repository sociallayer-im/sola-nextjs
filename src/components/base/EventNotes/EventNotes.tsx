import {useContext, useEffect, useState} from 'react'
import styles from './EventNotes.module.scss'
import LangContext from "@/components/provider/LangProvider/LangContext";

function EventNotes(props: { notes: string, hide: boolean }) {
    const [text, setText] = useState('')
    const {lang} = useContext(LangContext)

    useEffect(() => {
        const linkRegex = /(?:https?:\/\/\S+)/gi;

        const replacedString = props.notes.replace(linkRegex, (match) => {
            return `<a href="${match}" target="_blank">${match}</a>`;
        });

        setText(replacedString)
    }, [props.notes])

    return (<div className={styles['event-notes']} >
        { props.hide ?
            <div>
                <div className={styles['title']}>{lang['Event_Notes_']}</div>
                <div className={styles['mask']}>
                    <div className={styles['long']}></div>
                    <div className={styles['mid']}></div>
                    <div className={styles['short']}></div>
                </div>
            </div> :
            <div className={styles['text']}>
                <div className={styles['title']}>{lang['Event_Notes']}</div>
                <div dangerouslySetInnerHTML={{__html: text}}></div>
            </div>
        }
    </div>)
}

export default EventNotes
