import { StatefulTabs, StatefulTabsProps } from 'baseui/tabs'

interface AppTabsProps extends Partial<StatefulTabsProps> {
    styleOverrides?: {
        Tab?: any
        TabContent?: any
        TabBar?: any
    }
}

function AppTabs (props:AppTabsProps) {
    const { children, ...rest }  = props

    const tabStyle = ({$active, $disabled, $theme}: any) => {
        const defaultStyle = {
            color: $active ? '#272928' : '#7b7c7b',
            fontWeight: $active ? 600 : 'normal',
            fontSize: '14px',
            paddingTop: '0',
            paddingBottom: '0',
            borderBottom: '0',
            position: 'relative',
            '::before': $active
                ? {
                    content: "''",
                    left: '50%',
                    bottom: 0,
                    width: '16px',
                    height: '6px',
                    position: 'absolute',
                    borderRadius: '9px',
                    background: $theme.colors.primaryB,
                    transform: 'translate(-50%,124%)'
                }
                : {},
            ':hover': $disabled
                ? {}
                : {
                    color: '#272928',
                },
            ':focus': $disabled
                ? {}
                : {
                    color: '#272928',
                },
        }

        return {...defaultStyle, ...props.styleOverrides?.Tab}
    }

    const tabBarStyle = () => {
        const defaultStyle =  {
            backgroundColor: 'none',
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: '0',
            paddingRight: '0'
        }

        return {...defaultStyle, ...props.styleOverrides?.TabBar}
    }

    const TabContent = () => {
        const defaultStyle =  {
            paddingTop: '20px',
            paddingLeft: '12px',
            paddingRight: '12px',
            boxSizing: 'border-box'
        }

        return {...defaultStyle, ...props.styleOverrides?.TabContent}
    }

    return (
        <StatefulTabs
            { ...rest }
            overrides={{
                TabBar: { style: tabBarStyle },
                Tab: { style: tabStyle },
                TabContent: { style: TabContent}
            }}>
            { children }
        </StatefulTabs>
    )
}

export default AppTabs
