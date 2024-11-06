import {Event} from '@/service/solas'
import {getThemeEvent} from "@/service/solasv2";
import styles from './theme.module.scss'
import CardEvent from "@/components/base/Cards/CardEventNew/CardEvent";

export default function ThemePage(props: { events: Event[], theme: string }) {
    return <div className={styles['page']}>
            <div className={styles['theme']}># {props.theme}</div>
            <div>
                {
                    props.events.map((event, index) => {
                        return <CardEvent key={index}  event={event} />
                    })
                }
            </div>
    </div>
}


export const getServerSideProps = async (context: any) => {
    const theme = context.params.theme
    const group_id = context.query.group_id
    const events = await getThemeEvent({theme, group_id})
    return {
        props: {
            events,
            theme
        }
    }
}
