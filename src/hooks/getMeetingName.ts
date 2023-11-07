import LangContext from "../components/provider/LangProvider/LangContext";
import {useContext} from "react";

function useGetMeetingName() {
    const {lang} = useContext(LangContext)

    const getMeetingName = (link: string) => {
        if (link.includes('zoom.us')) {
            return lang['Meeting_Zoom_Title']
        } else if (link.includes('meet.google.com')) {
            return lang['Meeting_Google_Title']
        } else if (link.includes('meeting.tencent.com')) {
            return lang['Meeting_Tencent_Title']
        } else {
            return lang['Meeting_Others_Title']
        }
    }

    const getUrl = (link: string) => {
        // 匹配URL的正则表达式
        const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$|^(?!https?|ftp:\/\/)\S+\.\S+$/;

        // 查找第一个匹配的URL
        const match = link.match(urlRegex);

        // 如果有匹配的URL则返回第一个URL，否则返回空字符串
        if (match) {
            return match[0].startsWith('http') ? match[0] : `https://${match[0]}`;
        } else {
            return null;
        }
    }

    return {getUrl, getMeetingName}
}

export default useGetMeetingName
