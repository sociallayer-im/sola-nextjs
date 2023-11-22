import {styletron} from '@/styletron'
import {Provider as StyletronProvider} from 'styletron-react'
import {BaseProvider} from 'baseui'
import theme from "@/theme"

function StyleProvider(props: { children: any }) {
    return (<StyletronProvider value={styletron}>
                <BaseProvider theme={theme}>
                    <div className={'light'} style={{background: '#fff'}}>
                        {props.children}
                    </div>
                </BaseProvider>
    </StyletronProvider>)
}

export default StyleProvider
