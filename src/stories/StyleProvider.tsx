import {styletron} from '@/styletron'
import {Provider as StyletronProvider} from 'styletron-react'
import {BaseProvider} from 'baseui'
import theme from "@/theme"

function StyleProvider(props: { children: any }) {
    return (<StyletronProvider value={styletron}>
                <BaseProvider theme={theme}>
                    {props.children}
                </BaseProvider>
    </StyletronProvider>)
}

export default StyleProvider
