import { useStyletron } from 'baseui'
import { ReactNode } from 'react'

const style = {
    display: 'flex',
    flexDirection: 'row' as const,
    flexFlow: 'row wrap',
}

interface ListWrapperProps {
    children?: ReactNode
}

function ListWrapper (props: ListWrapperProps) {
    const [css] = useStyletron()

    return (<div className={css(style)}>
        { props.children }
    </div>)
}

export default ListWrapper
