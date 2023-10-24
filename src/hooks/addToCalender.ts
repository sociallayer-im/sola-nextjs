interface AddToCalenderProps {
    name: string;
    location: string;
    details: string;
    startTime: string;
    endTime: string;
    url: string;
}

const useCalender = function () {
    const addToCalender = async (props: AddToCalenderProps) => {
        const duration = (new Date(props.endTime).getTime() - new Date(props.startTime).getTime()) / 1000 / 60 / 60
        const timeStr = new Date(props.startTime).toISOString().replace(/-|:|\.\d\d\d/g, '')
        const timeStrNow = new Date().toISOString().replace(/-|:|\.\d\d\d/g, '')
        // 去除空格回车
        const description = props.details.replace(/\s+/g, '').replace(/\n/g, '')
        const ics = `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
PRODID:adamgibbons/ics
METHOD:PUBLISH
X-PUBLISHED-TTL:PT1H
BEGIN:VEVENT
UID:rJy2275vUNMN-WFnmwxfU
SUMMARY:${props.name}
DTSTAMP:${timeStrNow}
DTSTART:${timeStr}
DESCRIPTION:${description}
URL:${props.url}
LOCATION:${props.location}
DURATION:PT${duration}H
END:VEVENT
END:VCALENDAR`

        const file = new File([ics], `${props.name}.ics`, { type: 'text/calendar' })
        const url = URL.createObjectURL(file as Blob);
        const element = document.createElement('a');
        element.setAttribute('href',  url);
        element.setAttribute('download', `${props.name}.ics`);
        element.click()
    }



    return {addToCalender}
}

export default useCalender
