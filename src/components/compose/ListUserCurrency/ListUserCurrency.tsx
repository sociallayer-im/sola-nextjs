import {useContext, useEffect, useState} from 'react'
import styles from './ListUserCurrency.module.sass'
import Alchemy, {CurrencyBalance, ExplorerUrls} from "@/service/alchemy/alchemy";
import userContext from "@/components/provider/UserProvider/UserContext";
import LangContext from "@/components/provider/LangProvider/LangContext";
import Image from "next/image";
import {Profile} from "@/service/solas";

function ComponentName({profile}: { profile: Profile }) {
    const {user} = useContext(userContext)
    const {lang} = useContext(LangContext)
    const [ready, setReady] = useState<boolean>(false)

    const [balance, setBalance] = useState<CurrencyBalance>({
        eth: '0.0000',
        matic: '0.0000',
        arb: '0.0000',
        opt: '0.0000',
        astar: '0.0000'
    })

    const [erc20Balance, setErc20Balance] = useState<any | null>(null)

    const getData = async () => {
        if (profile.address) {
            await Promise.all([
                Alchemy.getBalance(profile.address).then((res) => {
                    setBalance(res)
                }),
                Alchemy.getErc20Assets(profile.address).then((res) => {
                    setErc20Balance(res)
                })
            ])
            setReady(true)
        }
    }

    useEffect(() => {
        getData()
    }, [])

    return (<div>
        <div className={`${styles.row} ${styles.title}`}>
            <div>{lang['Profile_Tab_Asset']}</div>
            <div>{lang['Profile_Asset_Amount']}</div>
        </div>
        {ready && erc20Balance &&
            Object.keys(balance).map((key) => {
                return <div key={key}>
                    {(balance as any)[key] === '0.0000' && key !== 'eth' ?
                       null:
                        <a className={`${styles.row} ${styles.item}`}
                           target={'_blank'}
                           href={(ExplorerUrls as any)[key] + profile.address!}>
                            <div className={styles.label}>
                                <Image className={styles.icon}
                                       alt={key}
                                       src={`/images/tokens/${key}.png`}
                                       width={22} height={22}/>
                                {key.toUpperCase()}
                            </div>
                            <div>{(balance as any)[key]}</div>
                        </a>
                    }
                    {(erc20Balance as any)[key].usdt !== '0.0000' &&
                        <a href={(ExplorerUrls as any)[key] + profile.address!} className={`${styles.row} ${styles.item}`}>
                            <div className={styles.label}>
                                <div className={styles.erc20}>
                                    <Image className={styles.icon}
                                           alt={key}
                                           src={`/images/usdt.png`}
                                           width={22} height={22}/>
                                    <Image className={styles['chain-icon']}
                                           alt={key}
                                           src={`/images/tokens/${key}.png`}
                                           width={22} height={22}/>
                                </div>
                                {'USDT'}
                            </div>
                            <div>{(erc20Balance as any)[key].usdt}</div>
                        </a>
                    }
                    {(erc20Balance as any)[key].usdc !== '0.0000' &&
                        <a href={(ExplorerUrls as any)[key] + profile.address!} className={`${styles.row} ${styles.item}`}>
                            <div className={styles.label}>
                                <div className={styles.erc20}>
                                    <Image className={styles.icon}
                                           alt={key}
                                           src={`/images/usdc.png`}
                                           width={22} height={22}/>
                                    <Image className={styles['chain-icon']}
                                           alt={key}
                                           src={`/images/tokens/${key}.png`}
                                           width={22} height={22}/>
                                </div>
                                {'USDC'}
                            </div>
                            <div>{(erc20Balance as any)[key].usdc}</div>
                        </a>
                    }
                </div>
            })
        }
    </div>)
}

export default ComponentName
