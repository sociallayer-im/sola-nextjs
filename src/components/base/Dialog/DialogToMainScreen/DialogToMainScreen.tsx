import styles from './DialogToMainScreen.module.scss'
import AppButton from "@/components/base/AppButton/AppButton";

export default function DialogToMainScreen(props: {close: () => void}) {

    return <div className={styles['dialog']}>
        <div className={styles['text']}>
            <img src="/images/icons/icon_144.png" alt=""/>
            <div className={styles['des']}>
                Add <span className={styles['primary']}>Social Layer</span> to your Home Screen to make it more
                accessible.
            </div>
        </div>

        <div className={styles['btns']}>
            <AppButton
                special
                size={'compact'}
                onClick={() => {
                    if ((window as any).deferredPrompt) {
                       (window as any).deferredPrompt.prompt()
                        props.close()
                    }
               }}>Add</AppButton>

           <AppButton size={'compact'} onClick={props.close}>Later</AppButton>
       </div>
    </div>
}
