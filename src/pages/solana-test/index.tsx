import {useContext, useRef} from 'react'
import {useConnection, WalletContext as solanaWalletContext} from "@solana/wallet-adapter-react";
import UserContext from "@/components/provider/UserProvider/UserContext";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import useMintSolana from "@/hooks/useMintSolanaBadge";

function Test() {
    // const connectionContextState = useConnection()
    // const solanaWallet = useContext<any>(solanaWalletContext)
    // const programRef = useRef<any>(null)
    // const {user} = useContext(UserContext)
    // const {showToast, showLoading} = useContext(DialogsContext)
    const {burnProfile} = useMintSolana()


    return <div onClick={e => {
        burnProfile(0)
    }}>123</div>
}

export default Test
