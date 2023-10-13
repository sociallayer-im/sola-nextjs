import { useContext } from 'react'
import LangContext from '../components/provider/LangProvider/LangContext'


function useVerify () {
    const { lang } = useContext(LangContext)
    const domainInputMaxLength = 16
    const domainInputMinLength = 6

    const verifyDomain =  (domain: string, limitLength=[domainInputMinLength, domainInputMaxLength]) => {
        const minLength = limitLength[0] || domainInputMinLength
        const maxLength = limitLength[1] || domainInputMaxLength

        if (!domain) {
            return lang['Regist_Input_Empty']
        }

        if (domain.startsWith('-')) {
            return lang['Regist_Input_Error_Start']
        }

        if (domain.endsWith('-')) {
            return lang['Regist_Input_Error_End']
        }

        if (domain.match(/-{2,}/)) {
            const char: any = domain.match(/-{2,}/)
            return lang['Regist_Input_Validate_4']([char[0]])
        }

        if (domain.match(/[`~!@#$%^&*()_+<>?:"{},./;'[\]]/im)) {
            const char: any = domain.match(/[`~!@#$%^&*()_+<>?:"{},./;'[\]]/im)
            return lang['Regist_Input_Validate_4']([char[0]])
        }

        if (!domain.match(/^[a-z0-9]+([-.]{1}[a-z0-9]+)*$/)) {
            return lang['Regist_Input_Validate_3']
        }

        if (domain.length < minLength) {
            return lang['Regist_Input_Validate_2']([minLength.toString()])
        }

        if (domain.length > maxLength) {
            return lang['Regist_Input_Validate']([maxLength.toString()])
        }

        return null
    }

    return { verifyDomain }
}

export default useVerify
