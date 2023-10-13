import { useStyletron, styled } from 'baseui'
import { ReactNode } from 'react'
import { Delete } from 'baseui/icon'

const Wrapper = styled('div', () => {
    return {
        display: 'flex',
        flexFlow: 'row nowrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '28px',
        width: '100%'
    }
})

const Slot = styled('div', () => {
    return {
        display: 'flex',
        flexFlow: 'row nowrap',
        alignItems: 'center'
    }
})

const Title = styled('div', () => {
    return {
        fontWeight: 700,
        fontSize: '16px',
        lineHeight: '15px',
        display: 'flex',
        alignItems: 'center',
        color: '#272928'
    }
})

const DeleteButton = styled('div', () => {
    return {
        width: '24px',
        height: '24px',
        background: '#F8F8F8',
        borderRadius:'50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: '10px'
    }
})

export interface DetailHeaderProps {
    onClose?: () => void,
    slotLeft?: ReactNode,
    slotRight?: ReactNode,
    title?: string,
}

export default function DetailHeader (props?: DetailHeaderProps) {
    return <Wrapper>
        <Slot>
            { !!props?.title &&
                <Title>{ props?.title }</Title>
            }
            { props && props.slotLeft }
        </Slot>
        <Slot>
            <div>{ props && props.slotRight }</div>
            <DeleteButton>
                <Delete
                    onClick={ () => props && props.onClose && props.onClose() }
                    size={ 24 }
                    style={ { cursor: 'pointer' , color: '#D2D2D2'} } />
            </DeleteButton>
        </Slot>
    </Wrapper>
}
