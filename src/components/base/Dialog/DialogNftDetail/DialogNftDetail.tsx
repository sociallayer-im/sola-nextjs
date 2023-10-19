import styles from './DialogNftDetail.module.sass'
import {NftDetail} from "@/service/alchemy/alchemy";
import {Delete} from 'baseui/icon'

function DialogNftDetail({detail, close}: { detail: NftDetail, close?: any }) {
    const shortAddress = (address: string) => {
        return address.substr(0, 6) + '...' + address.substr(-4)
    }

    return (<div className={styles.wrapper}>
        <Delete
            className={styles.close}
            title="Close"
            onClick={() => close && close()}
            size={24}
            style={{cursor: 'pointer', color: '#D2D2D2'}}/>
        <img className={styles.cover} src={detail.image} alt=""/>
        <div className={styles.name}>
            {detail.title}
            <a href={detail.explorer} className={styles.link} target={'_blank'}>
                <i className={'icon-icon_share'}/>
            </a>
        </div>

        <div className={styles.item}>
            <div className={styles.label}>Contract Address</div>
            <div className={styles.value}>{shortAddress(detail.contract)}</div>
        </div>
        <div className={styles.item}>
            <div className={styles.label}>Token ID</div>
            <div className={styles.value}>{detail.id.length > 10 ? shortAddress(detail.id) : detail.id}</div>
        </div>
        <div className={styles.item}>
            <div className={styles.label}>Token Standard</div>
            <div className={styles.value}>{detail.standard}</div>
        </div>
        <div className={styles.item}>
            <div className={styles.label}>Chain</div>
            <div className={styles.value}>{detail.chain}</div>
        </div>
    </div>)
}

export default DialogNftDetail
