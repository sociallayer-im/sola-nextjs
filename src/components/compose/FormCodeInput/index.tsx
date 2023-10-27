import {useContext, useState, useRef, useEffect} from 'react'
import { useStyletron } from 'baseui'
import { LoginRes, phoneLogin, emailLogin, setEmail } from '@/service/solas'
import DialogsContext from '../../provider/DialogProvider/DialogsContext'
import userContext from "@/components/provider/UserProvider/UserContext";
import {useRouter} from "next/navigation";

export interface CodeInputFormProps {
    onConfirm?: (loginRes: LoginRes) => any
    loginAccount: string
    loginType: 'email' | 'phone' | 'binding',
    fallback?: () => any
}

const style = {
    wrapper : {
        width: '280px',
        marginLeft: 'auto',
        marginRight: 'auto',
        display: 'flex',
        'flex-direction': 'row',
        'flex-warp': 'nowarp',
        justifyContent: 'space-between',
        position: 'relative' as const
    },
    codeInput: {
        width: '36px',
        height: '44px',
        border: '1px solid #7B7C7B',
        borderRadius: '8px',
        'font-size': '24px',
        'text-align': 'center',
        lineHeight: '44px',
        fontWeight: 600,
        paddingTop: '0',
        paddingLeft: '0',
        paddingRight: '0',
        paddingBottom: '0',
        boxSizing: 'border-box' as const
    },
    input: {
        width: '280px',
        height: '44px',
        position: 'absolute' as const,
        left: '0',
        top: '0',
        opacity: 0
    }
}

function CodeInputForm (props: CodeInputFormProps) {
    const [code, setCode] = useState('')
    const [codeLength, ] = useState(new Array(5).fill(''))
    const [ loading, setLoading ] = useState(false)
    const [css] = useStyletron()
    const { showLoading, showToast } = useContext(DialogsContext)
    const { user } = useContext(userContext)
    const router = useRouter()

    const inputRef = useRef<HTMLInputElement | null>(null)

    const showCode = (value: string) => {
        if (loading) return
        if (value.length > codeLength.length) return
        if (value !== '' && !/^[a-zA-Z0-9]+$/.test(value)) return
        setCode(value.toUpperCase())
    }

    async function binding() {
        if (code.length !== codeLength.length) return
        const unload = showLoading()
        try {
            const bind = await setEmail({
                email: props.loginAccount,
                code,
                auth_token: user.authToken || ''
            })
            unload()
            showToast('Bind success')

            if (props.fallback) {
                props.fallback()
            } else {
                router.replace(`/profile/${user.userName}`)
            }
        } catch (e: any) {
            unload()
            console.error(e)
            showToast(e.message)
        }
    }

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current!.focus()
        }
    }, [])

    useEffect(() => {
        async function login () {
            if (code.length === codeLength.length) {
                setLoading(true)
                const unload = showLoading()
                console.log('unload', unload)
                const inputs = document.querySelectorAll('input')
                inputs.forEach((item) => {
                    item.blur()
                })

                try {
                    if (props.loginType === 'phone') {
                        const loginRes = await phoneLogin(props.loginAccount, code)
                        props.onConfirm && props.onConfirm(loginRes)
                    } else if (props.loginType === 'email') {
                        const loginRes = await emailLogin(props.loginAccount, code)
                        props.onConfirm && props.onConfirm(loginRes)
                    }
                } catch (e: any) {
                    console.log(e)
                    showToast('Invalid code')
                } finally {
                    setLoading(false)
                    unload()
                }
            }
        }

        if (props.loginType === 'binding') {
            binding()
        } else {
            login()
        }
    }, [code])

    return <>
        <div className={css(style.wrapper)}>
            <input
                ref={ inputRef }
                value={code}
                className={css(style.input)}
                onChange={(e) => { showCode(e.target.value) } }
                type="text" />
            {
                codeLength.map((item, index) => {
                    return <input
                        readOnly
                        value={ code[index] || '' }
                        key={ index.toString() }
                        className={css(code.length === index ? {...style.codeInput, borderColor: '#00b879' } : style.codeInput)} />
                })
            }
        </div>
    </>
}

export default CodeInputForm
