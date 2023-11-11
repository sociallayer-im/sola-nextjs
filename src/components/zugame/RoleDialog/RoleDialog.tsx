import styles from './RoleDialog.module.scss'
import {zuGameTeams} from '@/components/zugame/setting'
import AppButton from "@/components/base/AppButton/AppButton";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import {ReactNode, useContext} from "react";

function RoleDialog(props: {team: string, close: () => any}) {
    const team = zuGameTeams.find(item => item.value === props.team)!

    return (<div className={styles['zugame-role-dialog']}>
        <div className={styles['title']}>Your role is</div>
        <div className={styles['icon']}>{team.icon}</div>
        <div className={styles['name']}>{team.name}</div>
        <AppButton special onClick={props.close}>Confirm</AppButton>
    </div>)
}

export default function useShowRole () {
    const {openDialog} = useContext(DialogsContext)

    return (team: string) => {
        openDialog({
            content: (close: any) => <RoleDialog team={team} close={close} />,
            size: [316, 'auto']
        })
    }
}
