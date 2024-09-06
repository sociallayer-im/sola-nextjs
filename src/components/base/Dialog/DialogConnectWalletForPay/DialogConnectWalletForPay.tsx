import {Connector, useAccount, useConnect} from 'wagmi'
import {useContext, useEffect, useRef, useState} from 'react'
import LangContext from '../../../provider/LangProvider/LangContext'
import DialogsContext from '../../../provider/DialogProvider/DialogsContext'
import {Spinner} from "baseui/icon";

interface DialogConnectWalletProps {
    handleClose: (...rest: any[]) => any
}

function DialogConnectWalletForPay(props: DialogConnectWalletProps) {
    const unloading_1 = useRef<any>(null)

    const [connectorsErr, setConnectorsErr] = useState<string>('')
    const {connect, connectors, error, isLoading, pendingConnector} = useConnect({
        onError(error) {
            if (!!error.message && error.message.includes('rejected')) {
                return
            } else {
                setConnectorsErr(error.message || error.toString())
            }
        },
        onMutate:() => {
          setConnectorsErr('')
        },
        onSettled: () => {
            if (unloading_1) {
                unloading_1.current?.()
                unloading_1.current = null
            }
        }
    })
    const {lang} = useContext(LangContext)
    const {isConnected} = useAccount()
    const {showLoading, showToast} = useContext(DialogsContext)

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
                return <div className={`connect-item ${connector.ready ? '' : 'disable'}`}
                            key={connector.id}
                            onClick={() => handleConnectWallet(connector)}>
                    <img src={`/images/${connector.name.toLowerCase()}.png`} alt={connector.name}/>
                    <div className='connect-name'>{connector.name}</div>
                    {!connector.ready &&
                        <div className={'spinner'}><Spinner size={20}/></div>
                    }
                </div>
            })}
            <div className="error">{connectorsErr}</div>
        </div>
    )
}

export default DialogConnectWalletForPay
