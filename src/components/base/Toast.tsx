import { useStyletron } from 'baseui'

const style = {
    wrapper: {
        backgroundColor: 'rgba(39,41,40,.9)',
        borderRadius: '8px',
        color:' #FFF',
        width: '100%',
        height: '100%',
        padding: '12px',
        fontSize: '14px',
        textAlign: 'center' as const
    }
}

interface ToastProps {
    text: string
}

function Toast (props: ToastProps) {
    const [css] = useStyletron()

    return (
        <div className={css(style.wrapper)}>
            { props.text }
        </div>
    )
}

export default Toast
