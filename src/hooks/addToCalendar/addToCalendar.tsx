import removeMarkdown from "markdown-to-text"
import { google, outlook, office365, yahoo, ics, CalendarEvent } from "calendar-link";
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import {useContext} from "react";
import styles from './DialogAddToCalendar.module.scss'
import AppButton from "@/components/base/AppButton/AppButton";

interface AddToCalenderProps {
    name: string;
    location: string;
    details: string;
    startTime: string;
    endTime: string;
    url: string;
}

const useCalender = function () {
    const {openDialog} = useContext(DialogsContext)


    const addToCalender = async (props: AddToCalenderProps) => {
        const duration = (new Date(props.endTime).getTime() - new Date(props.startTime).getTime()) / 1000 / 60 / 60
        const timeStr = new Date(props.startTime).toISOString().replace(/-|:|\.\d\d\d/g, '')
        const timeStrNow = new Date().toISOString().replace(/-|:|\.\d\d\d/g, '')
        // 去除空格回车
        const description = removeMarkdown(props.details).replace(/\n/g, ' ')
        const ics = `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
PRODID:adamgibbons/ics
METHOD:PUBLISH
X-PUBLISHED-TTL:PT1H
BEGIN:VEVENT
UID:${Math.random()}
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


    const addToCalenderDialog = (props: AddToCalenderProps) => {
        const event = {
            title: props.name,
            description: removeMarkdown(props.details).replace(/\n/g, ' '),
            start: props.startTime,
            duration: [(new Date(props.endTime).getTime() - new Date(props.startTime).getTime()) / 1000 / 60 / 60, "hour"],
            location: props.location,
        };

        openDialog(
            {
                content: (close: any) => {
                    return <DialogAddToCalendar event={props} close={close} />
                },
                size: [320, 'auto'],
                position: 'bottom',
            }
        )
    }

    return {addToCalender, addToCalenderDialog}
}

function DialogAddToCalendar({close, event} : {close: any, event: AddToCalenderProps}) {
    const toLing = (type: string) => {
        const eventInfo: CalendarEvent = {
            title: event.name,
            description: removeMarkdown(event.details).replace(/\n/g, ' '),
            start: event.startTime,
            duration: [(new Date(event.endTime).getTime() - new Date(event.startTime).getTime()) / 1000 / 60 / 60, "hour"],
            location: event.location,
            url: event.url,
        };

        let url = ''
        if (type === 'google_calendar') {
            url= google(eventInfo)
        } else if (type === 'outlook') {
            url = outlook(eventInfo)
        } else if (type === 'office365') {
            url = office365(eventInfo)
        } else if (type === 'yahoo') {
            url = yahoo(eventInfo)
        } else if (type === 'ics') {
            url = ics(eventInfo)
        }

        const a = document.createElement('a')
        a.href = url
        a.download = `${event.name}.ics`
        a.target = '_blank'
        a.click()
        close()
    }

    return <div className={styles['dialog-add-to-calendar']}>
        <div className={styles['title']}>
            <div>Add to calendar</div>
            <i className={'icon-close'} onClick={close} />
        </div>

        <div className={styles['calendar-item']}>
            <AppButton onClick={e => {toLing('google_calendar')}} >Google Calendar</AppButton>
            <AppButton onClick={e => {toLing('ics')}}>Apple Calendar</AppButton>
            <AppButton onClick={e => {toLing('yahoo')}}>Yahoo</AppButton>
            <AppButton onClick={e => {toLing('outlook')}} >Outlook.com</AppButton>
            <AppButton onClick={e => {toLing('office365')}}>Office365</AppButton>
            <AppButton onClick={e => {toLing('ics')}}>ICS file</AppButton>
        </div>
    </div>
}

export default useCalender
