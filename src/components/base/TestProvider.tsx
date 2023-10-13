'use client'

import LangContext, {LangType} from "@/components/provider/LangProvider/LangContext";
import DialogContext from "@/components/provider/DialogProvider/DialogsContext";
import {useContext} from "react";

import AppButton from "@/components/base/AppButton/AppButton";
import AppInput from "@/components/base/AppInput";

export default function TestProvider () {
    const {lang, langType, switchLang} = useContext(LangContext)
    const {openDialog, showLoading, showToast} = useContext(DialogContext)

    const testDialog = () => {
        openDialog({
            content: (close: any) => {
                return (
                    <div style={{background: 'red'}}>
                        <div>dialog</div>
                        <div onClick={e => {close()}}>close</div>
                    </div>
                )
            },
            size:[200, 100],
            position: 'center'
        })
    }

    return (
        <div style={{background: 'green', height: '50vh'}}>
            <h3>LangProvider</h3>
            <div onClick={e => {switchLang(langType === 'cn' ? LangType.en :LangType.cn)}}>langType: {langType}</div>
            <div>{lang["Activity_Create_Success_Scan_tips"]}</div>

            <h1>DialogProvider</h1>
                <AppButton special onClick={e => {testDialog()}}>{'open dialog'}</AppButton>
            <AppInput value={''} placeholder={'asdasd'} />
        </div>
    )
}
