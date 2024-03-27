import { Spinner } from 'baseui/icon'
import { useStyletron } from 'baseui'

const style: any = {
    wrapper: {
        backgroundColor: 'rgba(39,41,40,.9)',
        borderRadius: '8px',
        color:' #FFF',
        width: '76px',
        height: '76px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999
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

function DynamicLoading () {
    const [css] = useStyletron()

    return (
        <div className={css(style.wrapper)}>
            <div className={css(style.animate)}><Spinner size={32}></Spinner></div>
        </div>
    )
}

export default DynamicLoading
