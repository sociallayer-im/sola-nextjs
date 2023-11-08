import { Button, SHAPE, StyledBaseButton, KIND, SIZE } from 'baseui/button'
import { withStyle } from 'baseui'
import { ReactNode } from 'react'

export const BTN_KIND = KIND
export const BTN_SIZE = {
    ...SIZE
}

export interface AppButtonProps {
    children?: ReactNode,
    inline?:boolean,
    kind?: keyof typeof BTN_KIND,
    onClick?: (...rest: any[]) => any
    disabled?: boolean
    isLoading?: boolean,
    size?: keyof typeof SIZE,
    style?: any
    special?: boolean
}

export default function AppButton (props: AppButtonProps) {
    const RootOverrides = withStyle(StyledBaseButton, (rootProps) => {
        const {
            $disabled,
            $isLoading,
            $size,
            $theme: { colors, typography },
        } = rootProps

        let style: any = {
            color: colors.primaryA,
            display: 'flex',
            'flex-direction': 'row',
            'flexWrap': 'nowrap',
            width: props.inline ? 'auto' : '100%',
            fontSize: '14px',
            fontWeight: 600,
            background: '#ECF2EE'
        }


        if ($size === SIZE.compact) {
            style.paddingTop = '12px'
            style.paddingBottom = '12px'
        }


        if (props.special) {
            style.background = 'linear-gradient(88.02deg, #BAFFAD -2.09%, #A1F4E6 62.09%, #80F8C0 97.29%)'
        }

        if (props.style) {
            style = {...style, ...props.style}
        }

        return style
    })

    return (
        <Button
            data-testid='AppButton'
            disabled={ props.disabled || false }
            isLoading={ props.isLoading || false }
            onClick={ props.onClick }
            kind={ props.kind ? props.kind : KIND.secondary }
            size={ props.size ? props.size : SIZE.default }
            shape={ SHAPE.pill }
            overrides={{Root: {component: RootOverrides }, LoadingSpinner: { style: { borderTopColor: '#1dad7b' }} }}
        >
        { props.children }
        </Button>
    )
}
