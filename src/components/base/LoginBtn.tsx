import { useStyletron } from 'baseui'
import { useContext } from 'react'
import DialogsContext from "../provider/DialogProvider/DialogsContext"
import LangContext from "../provider/LangProvider/LangContext"


function LoginBtn () {
    const { lang } = useContext(LangContext)
    const { openConnectWalletDialog } = useContext(DialogsContext)
    const [css] = useStyletron()

    const style = {
        wrapper: {
            display: 'flex',
            'flex-direction': 'row',
            'flex-wrap': 'nowrap',
            cursor: 'pointer',
            height: '22px',
            alignItems: 'center',
            padding: '0 3px',
            borderRadius: '2px',
            color: 'var(--color-text-main)',
            ':hover': {
                background: 'rgba(0,0,0,.05)'
            }
        },
        text: {
            marginLeft: '8px',
            color: 'var(--color-text-main)'
        }
    }

    return <div className={css(style.wrapper)} onClick={ openConnectWalletDialog }>
        <i className='icon-wallet'></i>
        <span className={css(style.text)}>{ lang['Nav_Wallet_Connect'] }</span>
    </div>
}

export default LoginBtn
