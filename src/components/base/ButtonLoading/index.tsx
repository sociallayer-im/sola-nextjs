import { Spinner } from 'baseui/icon'
import { useStyletron } from 'baseui'

const style: any = {
    wrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    animate : {
        width: '20px',
        height: '20px',
        'animation-name': 'Spinner',
        'animation-iteration-count': 'infinite',
        'animation-duration': '0.8s',
        'animation-timing-function': 'linear'
    },
    text: {
        marginLeft: '5px'
    }
}

function ButtonLoading (props: any) {
    const [css] = useStyletron()

    return (
        <div className={css(style.wrapper)}>
            <div className={css(style.animate)}><Spinner size={20} /></div>
            <span className={css(style.text)}>{props.children}</span>
        </div>
    )
}

export default ButtonLoading
