import {useState, useContext, useEffect} from 'react'
import styles from './ListUserCurrency.module.sass'
import Alchemy, {CurrencyBalance, ExplorerUrls} from "@/service/alchemy/alchemy";
import userContext from "@/components/provider/UserProvider/UserContext";
import LangContext from "@/components/provider/LangProvider/LangContext";
import Image from "next/image";
import {Profile} from "@/service/solas";

function ComponentName({profile}: {profile: Profile}) {
    const {user} = useContext(userContext)
    const {lang} = useContext(LangContext)

    const [balance, setBalance] = useState<CurrencyBalance>({
        eth: '',
        matic: '',
        arb: '',
        opt: '',
        astar: ''
    })

    useEffect(() => {
        if (profile.address) {
            Alchemy.getBalance(profile.address).then((res) => {
                console.log(res)
                setBalance(res)
            })

            Alchemy.getNftBalance(profile.address, 'ens').then((res) => {
                console.log('ensensensens', res)
            })
        }
    }, [user])

    return (<div>
        <div className={`${styles.row} ${styles.title}`}>
            <div>{lang['Profile_Tab_Asset']}</div>
            <div>{lang['Profile_Asset_Amount']}</div>
        </div>
        {
            Object.keys(balance).map((key) => {
              return <a className={`${styles.row} ${styles.item}`} key={key} href={ExplorerUrls[key] + profile.address!}>
                  <div className={styles.label}>
                      <Image className={styles.icon}
                             src={`/images/tokens/${key}.png`}
                             width={22} height={22} />
                      {key.toUpperCase()}
                  </div>
                  <div>{balance[key]}</div>
              </a>
            })
        }
    </div>)
}

export default ComponentName
