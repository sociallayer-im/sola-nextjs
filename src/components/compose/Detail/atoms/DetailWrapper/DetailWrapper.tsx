import { useStyletron, styled } from 'baseui'
import { ReactNode } from 'react'

interface DetailWrapperProp {
    children?: ReactNode
}

function DetailWrapper (props: DetailWrapperProp) {
    const DetailWrapper = styled('div', () => {
        return {
            width: '100%',
            height: 'auto',
            maxHeight:window.innerHeight + 'px',
            boxShadow: '0px 2px 18px rgba(0, 0, 0, 0.2)',
            borderRadius: '12px'
        }
    })

    return (
        <DetailWrapper>
            <div className='badge-detail-bg'>
                <div className='ball1'></div>
                <div className='ball2'></div>
                <div className='ball1'></div>
            </div>
            <div className='container'>
               <div className='detail-flex-box'>
                   { props.children }
               </div>
            </div>
        </DetailWrapper>
    )
}

export default DetailWrapper
