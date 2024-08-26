import LangContext from './LangContext'
import en, { LangConfig } from "./en"
import cn from "./cn"
import th from "./th"
import es from "./es"
import { ReactNode, useEffect, useState } from "react";

export enum LangType {
    th='th',
    cn='cn',
    en='en',
    es='es'
}
export interface LangProviderProps {
    children? : ReactNode
}

function LangProvider (props: LangProviderProps) {
    const langPackage = {
        en,
        cn,
        th,
        es
    }

    const [langType, setLangType] = useState(LangType.en)
    const [lang, setLang] = useState(() => {
        return langPackage[langType] as LangConfig
    })

    const switchLang = (langType: LangType) => {
        setLangType(langType)
        setLang(langPackage[langType])
        window.localStorage.setItem('lang', langType)
    }

    useEffect(() => {
        const storageLang = window.localStorage.getItem('lang')
        if (storageLang === LangType.en) {
            switchLang(LangType.en)
            return
        }
        if (storageLang === LangType.cn) {
            switchLang(LangType.cn)
            return
        }
        if (storageLang === LangType.th) {
            switchLang(LangType.th)
            return
        }
        if (storageLang === LangType.es) {
            switchLang(LangType.es)
            return
        }

        if (navigator.language === 'zh-CN') {
            switchLang(LangType.cn)
            return
        }
        if (navigator.language === 'th') {
            switchLang(LangType.th)
            return
        }
        if (navigator.language === 'es-ES') {
            switchLang(LangType.es)
            return
        }

        switchLang(LangType.en)
    }, [])

    return (
        <LangContext.Provider value={{ langType, lang, switchLang }}>
            { props.children }
        </LangContext.Provider>
    )
}

export default LangProvider
