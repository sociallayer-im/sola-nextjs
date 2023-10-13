import { Spinner } from 'baseui/icon'
import { useStyletron } from 'baseui'

const style = {
    wrapper: {
        backgroundColor: 'rgba(39,41,40,.9)',
        borderRadius: '8px',
        color:' #FFF',
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    animate : {
        width: '32px',
        height: '32px',
        'animation-name': 'Spinner',
        'animation-iteration-count': 'infinite',
        'animation-duration': '0.8s',
        'animation-timing-function': 'linear'
    }
}

function ToastLoading () {
    const [css] = useStyletron()

    return (
        <div className={css(style.wrapper)}>
            <div className={css(style.animate)}><Spinner size={32}></Spinner></div>
        </div>
    )
}

export default ToastLoading
