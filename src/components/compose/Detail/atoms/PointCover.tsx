import {styled, useStyletron} from 'baseui'

const DetailCover = styled('img', () => {
    return {
        width: '90px',
        height: '90px',
        borderRadius: '50%',
        border: '2px solid #FFFFFF',
        filter: 'drop-shadow(0px 11.4365px 16.7736px rgba(0, 0, 0, 0.08))',
    }
})

function PointCover(props: { value: string | number, src: string }) {
    const [css] = useStyletron()
    const styleWrapper = {
        width: '90px',
        height: '90px',
        borderRadius: '50%',
        position: 'relative' as const,
        overflow: 'hidden',
        margin: '0 auto'
    }

    const styleValue = {
        width: '94px',
        position: 'absolute' as const,
        left: '0',
        top: '50%',
        transform: 'translateY(-50%)',
        fontWeight: 600,
        fontSize: '14px',
        lineHeight: '14px',
        textAlign: 'center' as const,
        color: '#FFFFFF',
    }

    return <div className={css(styleWrapper)}>
        <DetailCover src={props.src}/>
        <div className={css(styleValue)}>{props.value}</div>
    </div>

}


export default PointCover
