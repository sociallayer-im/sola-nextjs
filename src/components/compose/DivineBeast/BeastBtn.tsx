export interface BeastBtnProps {
    children?: React.ReactNode
    background?: string
    loading?: boolean,
    onClick?: (e: any) => any
}

function BeastBtn(props: BeastBtnProps) {
    const background = props.background || '#529E9C'

    return (<div className={'beast-btn'} style={{background: background}} onClick={e => {
        !props.loading && props.onClick && props.onClick(e)
    }
    }>
        <div className={'content'} style={{background: background}}>
            {!props.loading ? props.children : '合成中...'}
        </div>
    </div>)
}

export default BeastBtn
