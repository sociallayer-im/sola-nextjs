import {Profile} from "../service/solas";
import {useEffect, useState} from "react";


const useRecentlyUser = () => {
    const [records, setRecords] = useState<Profile[]>([])

    useEffect(() => {
        getRecord();
    }, [])

    const setRecord = (user: Profile) => {
        const record = localStorage.getItem('recentlyUser');
        if (record) {
            try {
                const parsedRecord = JSON.parse(record);
                // 检查user是否已经存在
                const index = parsedRecord.findIndex((value: Profile) => value.id === user.id);
                if (index !== -1) {
                    parsedRecord.splice(index, 1);
                }
                const newRecord = [user, ...parsedRecord];
                // 最大长度为50
                if (newRecord.length > 50) {
                    newRecord.pop();
                }

                localStorage.setItem('recentlyUser', JSON.stringify(newRecord));
                setRecords(newRecord)
            } catch (e) {
                localStorage.setItem('recentlyUser', JSON.stringify([user]));
                setRecords([user])
            }
        } else {
            localStorage.setItem('recentlyUser', JSON.stringify([user]));
            setRecords([user])
        }
    }

    const getRecord = () => {
        const record = localStorage.getItem('recentlyUser');
        if (record) {
            try {
                const parsedRecord = JSON.parse(record);
                setRecords(parsedRecord);
            } catch (e) {
                localStorage.setItem('recentlyUser', JSON.stringify([]));
            }
        } else {
            localStorage.setItem('recentlyUser', JSON.stringify([]));
        }
    }

    return {records, setRecord}
}

export default useRecentlyUser;
