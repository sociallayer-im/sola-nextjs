import { useStyletron } from 'baseui'
import LangContext from '../provider/LangProvider/LangContext'
import {useContext} from "react";

const style = {
    wrapper: {
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        paddingTop: '30px',
        paddingBottom: '50px'
    },
    text: {
        color: '#999',
        fontSize: '14px'
    }
}

export interface EmptyProps {
    text?: string
}

function Empty (props: EmptyProps) {
    const [css] = useStyletron()
    const { lang } = useContext(LangContext)

    return (
        <div className={css(style.wrapper)}>
            <img src="/images/empty.svg" alt=""/>
            <div className={css(style.text)}>{ props.text || lang['Empty_Text'] }</div>
        </div>
    )
}

export default Empty
