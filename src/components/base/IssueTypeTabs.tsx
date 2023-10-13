import { StatefulTabs, TabsProps, Tabs } from 'baseui/tabs'

function AppTabs (props: Partial<TabsProps>) {
    const { children, ...rest }  = props

    const tabStyle = ({$active, $disabled, $theme}: any) => ({
        fontSize: '12px',
        paddingTop: '8px',
        paddingBottom: '8px',
        width: '50%',
        borderRadius: '50px',
        position: 'relative',
        textAlign: 'center',
        background: $active ? '#EFFFF9' : '#F8F9F8',
        fontWeight: $active ? '600' : '400',
        borderTopWidth: '1px',
        borderRightWidth: '1px',
        borderBottomWidth: '1px!important',
        whiteSpace: 'nowrap',
        borderLeftWidth: '1px',
        borderBottomColor: $active ? '#6CD7B2' : '#F8F9F8',
        borderTopColor: $active ? '#6CD7B2' : '#F8F9F8',
        borderLeftColor: $active ? '#6CD7B2' : '#F8F9F8',
        borderRightColor: $active ? '#6CD7B2' : '#F8F9F8',
        borderStyle: 'solid'
    })

    return (
        <Tabs
            { ...rest }
            overrides={{
                TabBar: {
                    style: {
                        backgroundColor: 'none',
                        paddingTop:'8px',
                        paddingBottom:'8px',
                        paddingLeft: '4px',
                        paddingRight: '4px',
                        borderRadius: '7px'
                    },
                },
                Tab: { style: tabStyle },
                TabContent: { style: { paddingTop: '30px', paddingLeft: '0', paddingRight: '0' } }

            }}>
            { children }
        </Tabs>
    )
}

export default AppTabs
