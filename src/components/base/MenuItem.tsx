import { styled, withStyle } from 'baseui'
import { ReactNode } from 'react'

const MenuItemNormal = styled('div', ({ $theme }) => ({
    color: $theme.colors.black,
    background: $theme.colors.white,
    cursor: 'pointer',
    fontSize: '14px',
    minWidth: '100px',
    lineHeight: '42px',
    paddingLeft: '12px',
    paddingRight: '12px',
    'text-align': 'center',
    ':hover': {
        background: '#f8f9f8',
    }
}))

const MenuItemSelected = withStyle(MenuItemNormal, ({ $theme }) => ({
    color: $theme.colors.primaryB
}))

interface MenuItemProps {
    children?: ReactNode,
    selected?: boolean,
    onClick: (...rest: any[]) => any
}

function MenuItem (props: MenuItemProps) {
    return props.selected ?
        <MenuItemSelected onClick={ props.onClick }> { props.children } </MenuItemSelected>
        : <MenuItemNormal onClick={ props.onClick }> { props.children } </MenuItemNormal>
}

export default MenuItem
