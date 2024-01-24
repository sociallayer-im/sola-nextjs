import {Connector, useAccount, useConnect} from 'wagmi'
import {useContext, useEffect, useRef} from 'react'
import LangContext from '../../../provider/LangProvider/LangContext'
import DialogsContext from '../../../provider/DialogProvider/DialogsContext'

interface DialogConnectWalletProps {
    handleClose: (...rest: any[]) => any
}

function DialogConnectWalletForPay(props: DialogConnectWalletProps) {
    const unloading_1 = useRef<any>(null)
    const {connect, connectors, error, isLoading, pendingConnector} = useConnect({
        onSettled: () => {
            if (unloading_1) {
                unloading_1.current?.()
                unloading_1.current = null
            }
        }
    })
    const {lang} = useContext(LangContext)
    const {isConnected} = useAccount()
    const {showLoading} = useContext(DialogsContext)

    useEffect(() => {
        if (isConnected) {
            props.handleClose()
        }
    }, [isConnected])

    useEffect(() => {
        if (isLoading) {
            unloading_1.current = showLoading()
        } else {
            unloading_1.current?.()
            unloading_1.current = null
        }
    }, [isLoading])

    const handleConnectWallet = (connector: Connector) => {
        if (error) {
            console.error('connector error: ' + error)
        }

        setTimeout(() => {
            connect({connector})
        }, 500)
    }


    return (
        <div className='dialog-connect-wallet'>
            <div className={'title'}>
                <div>{lang['Nav_Wallet_Connect']}</div>
                <i className={'icon-close'} onClick={e => {
                    props.handleClose()
                }}/>
            </div>
            {connectors.map((connector) => {
                return (!connector.ready) ?
                    <></>
                    : <div className={'connect-item'}
                           key={connector.id}
                           onClick={() => handleConnectWallet(connector)}>
                        <img src={`/images/${connector.name.toLowerCase()}.png`} alt={connector.name}/>
                        <div className='connect-name'>{connector.name}</div>
                    </div>
            })}
        </div>
    )
}

export default DialogConnectWalletForPay
