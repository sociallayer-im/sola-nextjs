import {createContext, useState} from 'react'

export type ColorTheme = 'light' | 'dark'

export const ColorSchemeContext = createContext<{ theme: ColorTheme, switchTheme: any }>({
    theme: 'light',
    switchTheme: () => {}
})

const defaultTheme: ColorTheme = process.env.NEXT_PUBLIC_COLOR_SCHEME as ColorTheme || 'light'

function ColorSchemeProvider(props: { children: any }) {
    const [colorTheme, setColorTheme] = useState<ColorTheme>(defaultTheme)
    const switchTheme = () => {
        if (colorTheme === 'light') {
            setColorTheme('dark')
        } else {
            setColorTheme('light')
        }
    }

    return (<ColorSchemeContext.Provider value={{theme: colorTheme, switchTheme}}>
        {props.children}
    </ColorSchemeContext.Provider>)
}

export default ColorSchemeProvider
