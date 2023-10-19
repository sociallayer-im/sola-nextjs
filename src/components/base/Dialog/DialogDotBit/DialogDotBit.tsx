import styles from './DialogDotBit.module.sass'
import {DotBitAccount} from "@/service/dotbit";
import {Delete} from 'baseui/icon'

function DialogDotBit({detail, close}: { detail: DotBitAccount, close?: any }) {
    return (<div className={styles.wrapper}>
        <Delete
            className={styles.close}
            title="Close"
            onClick={() => close && close()}
            size={24}
            style={{cursor: 'pointer', color: '#D2D2D2'}}/>
        <img className={styles.cover} src={detail.image} alt=""/>
        <div className={styles.name}>
            {detail.account}
            <a href={`https://d.id/${detail.account}`} className={styles.link} target={'_blank'}>
                <i className={'icon-icon_share'}/>
            </a>
        </div>

        <div className={styles.item}>
            <div className={styles.label}>Indexer Id</div>
            <div className={styles.value}>{detail.indexerId}</div>
        </div>
        <div className={styles.item}>
            <div className={styles.label}>Indexer Url</div>
            <div className={styles.value}>{detail.indexerUrl}</div>
        </div>
        <div className={styles.item}>
            <div className={styles.label}>Is sub-account</div>
            <div className={styles.value}>{detail.isSubAccount.toString()}</div>
        </div>
        <div className={styles.item}>
            <div className={styles.label}>Main account</div>
            <div className={styles.value}>{detail.mainAccount}</div>
        </div>
    </div>)
}

export default DialogDotBit
