import {useContext, useEffect, useState} from 'react'
import styles from './EventNotes.module.scss'
import LangContext from "@/components/provider/LangProvider/LangContext";
import RichTextDisplayer from "@/components/compose/RichTextEditor/Displayer";

function EventNotes(props: { notes: string, hide: boolean }) {
    const {lang} = useContext(LangContext)

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
                <RichTextDisplayer markdownStr={props.notes} />
            </div>
        }
    </div>)
}

export default EventNotes
