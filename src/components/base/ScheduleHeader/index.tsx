import Link from 'next/link';
import {usePathname, useRouter} from "next/navigation";
import styles from './ScheduleHeader.module.scss';
import {Group} from "@/service/solas";
import langContext from "@/components/provider/LangProvider/LangContext";
import {useContext} from "react";

export default function ScheduleHeader({ group, params }: {group: Group, params?: string}) {
    const pathname = usePathname();
    const router = useRouter();
    const {lang} = useContext(langContext);


    return <div className={styles['schedule-header']}>
        <div className={styles['center']}>
            <Link className={pathname?.includes('schedule') ? styles['active'] : ''} href={`/event/${group.username}/schedule${params || ''}`}>{lang['Schedule_View']}</Link>
            <Link className={pathname?.includes('calendar') ? styles['active'] : ''} href={`/event/${group.username}/calendar${params || ''}`}>{lang['Calendar_View']}</Link>
            {/*<Link className={pathname?.includes('timeline') ? styles['active'] : ''} href={`/event/${group.username}/timeline${params || ''}`}>{lang['Timeline_View']}</Link>*/}
        </div>
    </div>
}
