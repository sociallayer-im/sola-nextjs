import {Track, updateTrack} from "@/service/solas"
import styles from  './DialogTrack.module.scss'
import PageBack from "@/components/base/PageBack"
import AppButton from "@/components/base/AppButton/AppButton"
import Empty from "@/components/base/Empty"
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext"
import {useContext} from "react"
import DialogTrackEdit from "@/components/base/Dialog/DialogTrackEdit/DialogTrackEdit"
import {useState} from "react"
import userContext from "@/components/provider/UserProvider/UserContext";

export default function DialogTrack(props: {
    close: ()=>void,
    tracks: Track[],
    groupId: number,
    cb: (tracks: Track[]) => void
}) {
    const {openDialog, showToast, showLoading, openConfirmDialog} = useContext(DialogsContext)
    const [tracks, setTracks] = useState<Track[]>(props.tracks)
    const {user} = useContext(userContext)

    const handleAddTrack = (track?: Track) => {
        openDialog({
            content: (close:any) => {
                return <DialogTrackEdit track={track} groupId={props.groupId} close={close} cb={(tracks)=>{
                    setTracks(tracks)
                    props.cb(tracks)
                }} />
            },
            size: ['100%', '100%']
         })
    }

    const handleRemoveTrack = async (track: Track) => {
        const unload = showLoading()
        try {
            const update = await updateTrack({
                ...track,
                "_destroy": '1',
                auth_token: user?.authToken || '',
            })
            props.cb(update)
            setTracks(update)
            showToast('Track removed')
        } catch (e: any) {
            showToast(e.message)
        } finally {
            unload()
        }
    }

    const handleAlert = (track: Track) => {
        openConfirmDialog({
            title: 'Remove track',
            content: 'Are you sure you want to remove this track?',
            confirmLabel: 'Remove',
            confirmBtnColor: '#FF0000',
            confirmTextColor: '#fff',
            onConfirm: async (close: any) => {
                await handleRemoveTrack(track)
                close()
            }
        })
    }

    return <div className={styles['dialog']}>
        <div className={styles['center']}>
            <PageBack  onClose={props.close}
                       title={'Event tracks'}
            />
            <div className={styles['scroll']}>
                { tracks.map((track, index) => {
                    return <div key={index} className={styles['items']}>
                        <div className={styles['left']}>
                            <div>{track.title}</div>
                            <i className={'icon-edit'} onClick={e => handleAddTrack(track)} />
                        </div>
                        <svg className={styles['del-btn']}
                             onClick={e => handleAlert(track)}
                             width="32" height="32" viewBox="0 0 32 32" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                            <rect x="0.5" y="0.5" width="31" height="31" rx="15.5" fill="white"/>
                            <rect x="0.5" y="0.5" width="31" height="31" rx="15.5" stroke="#7B7C7B"/>
                            <path fillRule="evenodd" clip-rule="evenodd"
                                  d="M19.5 15C19.7761 15 20 15.2239 20 15.5V16.5C20 16.7761 19.7761 17 19.5 17H12.5C12.2239 17 12 16.7761 12 16.5V15.5C12 15.2239 12.2239 15 12.5 15H19.5Z"
                                  fill="#7B7C7B"/>
                        </svg>
                    </div>
                })}

                {
                    !props.tracks.length && <Empty/>
                }

                <AppButton onClick={e => {
                    handleAddTrack()
                }}>
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M12.6667 7.33341H8.66669V3.33341C8.66669 3.1566 8.59645 2.98703 8.47142 2.86201C8.3464 2.73699 8.17683 2.66675 8.00002 2.66675C7.82321 2.66675 7.65364 2.73699 7.52862 2.86201C7.40359 2.98703 7.33335 3.1566 7.33335 3.33341V7.33341H3.33335C3.15654 7.33341 2.98697 7.40365 2.86195 7.52868C2.73693 7.6537 2.66669 7.82327 2.66669 8.00008C2.66669 8.17689 2.73693 8.34646 2.86195 8.47149C2.98697 8.59651 3.15654 8.66675 3.33335 8.66675H7.33335V12.6667C7.33335 12.8436 7.40359 13.0131 7.52862 13.1382C7.65364 13.2632 7.82321 13.3334 8.00002 13.3334C8.17683 13.3334 8.3464 13.2632 8.47142 13.1382C8.59645 13.0131 8.66669 12.8436 8.66669 12.6667V8.66675H12.6667C12.8435 8.66675 13.0131 8.59651 13.1381 8.47149C13.2631 8.34646 13.3334 8.17689 13.3334 8.00008C13.3334 7.82327 13.2631 7.6537 13.1381 7.52868C13.0131 7.40365 12.8435 7.33341 12.6667 7.33341Z"
                            fill="#272928"/>
                    </svg>
                    <span>Add an event track</span>
                </AppButton>
            </div>
        </div>
    </div>
}
