import {styled} from 'baseui'
import LangContext from '../provider/LangProvider/LangContext'
import {ReactNode, useContext, useState} from 'react'
import {ArrowLeft} from 'baseui/icon'
import {PageBackContext} from '../provider/PageBackProvider'
import {useRouter} from "next/navigation";

const Wrapper = styled('div', ({$theme}: any) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '16px',
    position: 'relative'
}))

const BackBtn = styled('div', ({$theme}: any) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: 'var(--color-text-main)',
    fontSize: '14px',
    cursor: "pointer",
    userSelect: 'none'
}))

const Title = styled('div', ({$theme}: any) => ({
    position: 'absolute',
    left: '50%',
    transform: 'translate(-50%, 0)',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--color-text-main)',
}))

interface PageBackProp {
    to?: string
    title?: string,
    backBtnLabel?: string,
    menu?: () => ReactNode | string,
    onClose?: () => any
    historyReplace?: boolean
}

function PageBack(props: PageBackProp) {
    const router = useRouter()
    const {lang} = useContext(LangContext)
    const {back} = useContext(PageBackContext)

    const handleBack = () => {
        if (props.to) {
            props.historyReplace ? router.replace(props.to) : router.push(props.to)
        } else if (props.onClose) {
            props.onClose()
        } else {
            back()
        }
    }

    return (
        <Wrapper>
            <BackBtn onClick={handleBack}>
                {!props.backBtnLabel && <ArrowLeft size={18}/>}
                {props.backBtnLabel ? props.backBtnLabel : lang['Page_Back']}
            </BackBtn>
            <Title>{props.title}</Title>
            {!!props.menu && props.menu()}
        </Wrapper>
    )
}

export default PageBack
