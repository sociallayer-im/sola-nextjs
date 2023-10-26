import { StatefulTabs, StatefulTabsProps, Tabs, TabsProps } from 'baseui/tabs'

interface AppTabsProps extends Partial<TabsProps> {
    styleOverrides?: {
        Tab?: any
        TabContent?: any
        TabBar?: any
    }
}

function AppSubTabs (props: AppTabsProps) {
    const { children, ...rest }  = props

    const tabStyle = ({$active, $disabled, $theme}: any) => {
        const defaultStyle = {
            color: $active ? '#272928!important': 'var(--color-text-main)!important',
            height: '34px',
            lineHeight: '32px',
            borderRadius: '8px',
            paddingLeft: '12px',
            paddingRight: '12px',
            backgroundColor:'none',
            fontSize: '12px',
            paddingTop: '0',
            paddingBottom: '0',
            borderTopWidth: '1px',
            borderLeftWidth: '1px',
            borderRightWidth: '1px',
            borderBottomWidth: '1px!important',
            borderStyle: 'solid',
            borderColor: $active ? 'var(--color-text-main)' : 'var(--color-item-border)',
            background: $active ? 'var(--color-subtab-active)' : 'rgba(0,0,0,0)',
            position: 'relative'
        }

        return {...defaultStyle, ...props.styleOverrides?.Tab}
    }

    const TabBarStyle = () => {
        const defaultStyle = { paddingTop: 0, backgroundColor: 'none', paddingBottom: 0, paddingLeft: '12px', marginLeft: '-5px' }
        return {...defaultStyle, ...props.styleOverrides?.TabBar}
    }

    const TabContentStyle = () => {
        const defaultStyle = { paddingTop: '12px', paddingLeft: 0, paddingRight: 0 }
        return {...defaultStyle, ...props.styleOverrides?.TabContent}
    }

    return (
        <Tabs
            { ...rest }
            overrides={{
                TabBar: {
                    style: TabBarStyle,
                },
                Tab: { style: tabStyle },
                TabContent: { style: TabContentStyle }
            }}>
            { children }
        </Tabs>
    )
}

export default AppSubTabs
