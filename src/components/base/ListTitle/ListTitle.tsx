import {ReactNode} from "react";

interface ListTitleProps {
    title: string
    uint?: string
    action?: ReactNode
    count?: number
    icon?: ReactNode
}
function ListTitle (props: ListTitleProps) {

    return (<div className='list-title'>
        <div className='label'>
            <div className='text'>{ props.title }</div>
            {
                !!props.action ?
                    props.icon
                        ? props.icon
                        :<div className='action'>{ props.action }</div>
                    : null
            }
        </div>

        {/*<div className='amount'>*/}
        {/*    { props.count }*/}
        {/*   <div> { props.uint } </div>*/}
        {/*</div>*/}
    </div>)
}

export default ListTitle
