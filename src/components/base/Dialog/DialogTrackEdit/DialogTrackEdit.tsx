import {getGroupMembers, getProfileBatchById, Profile, Track, updateTrack} from "@/service/solas"
import styles from './DialogTrackEdit.module.scss'
import PageBack from "@/components/base/PageBack"
import AppButton from "@/components/base/AppButton/AppButton"
import AppInput from "@/components/base/AppInput"
import {useContext, useEffect, useState} from "react"
import Toggle from "@/components/base/Toggle/Toggle"
import {DatePicker} from "baseui/datepicker"
import DialogsContext from "@/components/provider/DialogProvider/DialogsContext"
import userContext from "@/components/provider/UserProvider/UserContext"
import DialogAddTrackManager from "@/components/base/Dialog/DialogAddTrackManager/DialogAddTrackManager"
import usePicture from "@/hooks/pictrue"

import dayjs from "dayjs";


const emptyTrack: Track = {
    tag: '',
    title: '',
    kind: 'public',
    icon_url: null,
    about: '',
    group_id: 0,
    start_date: null,
    end_date: null,
    manager_ids: [],

}

export default function DialogTrackEdit(props: {
    close: () => void,
    track?: Track,
    groupId: number,
    cb: (tracks: Track[]) => void
}) {
    const [track, setTrack] = useState<Track>(props.track || {...emptyTrack, group_id: props.groupId})
    const {showLoading, showToast, openDialog} = useContext(DialogsContext)
    const {defaultAvatar, upload} = usePicture()
    const {user} = useContext(userContext)

    const [manager, setManager] = useState<Profile[]>([])
    const [dateErr, setDateErr] = useState('')

    useEffect(() => {
        ;(async () => {
            if (!!props.track?.manager_ids) {
                const profiles = await getProfileBatchById(props.track.manager_ids) as Profile[]
                setManager(profiles)
            }
        })()
    }, [props.track?.manager_ids]);

    const addUpdateManager = async (profile: Profile) => {
        const value = track.manager_ids ? [...track.manager_ids, profile.id] : [profile.id]
        setTrack({...track, manager_ids: value})
        setManager([...manager, profile])
    }

    const removeUpdateManager = async (profile: Profile) => {
        const value = track.manager_ids?.filter((id) => id !== profile.id)
        setTrack({...track, manager_ids: value || []})
        setManager(manager.filter((item) => item.id !== profile.id))
    }

    const handleUpload = async () => {
        try {
            const url = await upload()
            setTrack({...track, icon_url: url})
        } catch (e: any) {
            showToast(e.message)
        }
    }

    const handleSave = async () => {
        if (!!dateErr) return

        const unload = showLoading()
        try {
            const res = await updateTrack({
                auth_token: user.authToken || '',
                ...track
            })
            showToast('Create track success')
            !!props.cb && props.cb(res)
            props.close()
        } catch (e: any) {
            console.error(e)
            showToast(e.message)
        } finally {
            unload()
        }
    }

    const handleAddManager = async () => {
        const unloading = showLoading()
        const groupMembers = await getGroupMembers({group_id: props.groupId, role: 'all'})
        unloading()

        openDialog({
            content: (close: any) => <DialogAddTrackManager
                managers={manager}
                onConfirm={(profile) => {
                    if (profile) {
                        addUpdateManager(profile)
                    }
                }}
                members={groupMembers}
                handleClose={close}/>,
            size: ['100%', '100%']
        })
    }


    useEffect(() => {
        if (track.end_date && track.start_date) {
            if (dayjs(track.end_date).isBefore(dayjs(track.start_date))) {
                setDateErr('End date must be after start date')
            } else {
                setDateErr('')
            }
        } else {
            setDateErr('')
        }
    }, [track]);


    return <div className={styles['dialog']}>
        <div className={styles['center']}>
            <PageBack onClose={props.close}
                      title={''}
            />
        </div>
        <div className={styles['scroll']}>
            <div className={styles['title']}>Edit track</div>
            <div className={styles['center']}>
                <div className={styles['from']}>
                    <div className={styles['input-item']}>
                        <div className={styles['label']}>{'Name of track'}</div>
                        <AppInput value={track.title || ''}
                                  placeholder={'Please input the track name'}
                                  onChange={e => {
                                      setTrack({...track, title: e.target.value})
                                  }}/>
                    </div>

                    <div className={styles['input-item']}>
                        <div className={styles['label']}>{'Tag'}</div>
                        <AppInput value={track.tag || ''}
                                  placeholder={'Short name of the track'}
                                  onChange={e => {
                                      setTrack({...track, tag: e.target.value})
                                  }}/>
                    </div>

                    <div className={styles['input-item']}>
                        <div className={styles['label']}>{'Icon (optional)'}</div>
                        <div className={styles['des']}>Display on the schedule page</div>
                        {!!track.icon_url && <img src={track.icon_url} alt="icon" className={styles['icon']}/>}
                        <div className={styles['add-btn']}>
                            <AppButton onClick={handleUpload}>
                                <i className={'icon-upload'}/>
                                <span>Upload</span>
                            </AppButton>
                        </div>
                    </div>

                    <div className={styles['input-item']}>
                        <div className={styles['label']}>{'About (optional)'}</div>
                        <AppInput value={track.about || ''}
                                  placeholder={'Description of the track'}
                                  onChange={e => {
                                      setTrack({...track, about: e.target.value})
                                  }}/>
                    </div>

                    <div className={styles['input-item']}>
                        <div className={styles['label']}>
                            {'Private track'}
                            <div onClick={e => {
                                setTrack({...track, kind: track.kind === 'private' ? 'public' : 'private'})
                            }}><Toggle checked={track.kind === 'private'}/></div>
                        </div>
                        <div>Select a private track: Only members who have a ticket for this track can view and
                            attend
                            the events.
                        </div>
                    </div>

                    <div className={styles['input-item']}>
                        <div className={styles['label']}>{'Manager Setting'}</div>
                        <div className={styles['des']}>Group managers also can manage this track and event</div>
                        <div className={styles['profile-list']}>
                            {manager.map((profile, index) => {
                                return <div className={styles['profile']} key={index}>
                                    <div className={styles['left']}>
                                        <img src={profile.image_url || defaultAvatar(profile.id)} alt=""/>
                                        {profile.nickname || profile.username}
                                    </div>
                                    <svg className={styles['del-btn']}
                                         onClick={e => removeUpdateManager(profile)}
                                         width="32" height="32" viewBox="0 0 32 32" fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <rect x="0.5" y="0.5" width="31" height="31" rx="15.5" fill="white"/>
                                        <rect x="0.5" y="0.5" width="31" height="31" rx="15.5" stroke="#7B7C7B"/>
                                        <path fillRule="evenodd" clip-rule="evenodd"
                                              d="M19.5 15C19.7761 15 20 15.2239 20 15.5V16.5C20 16.7761 19.7761 17 19.5 17H12.5C12.2239 17 12 16.7761 12 16.5V15.5C12 15.2239 12.2239 15 12.5 15H19.5Z"
                                              fill="#7B7C7B"/>
                                    </svg>

                                </div>
                            })
                            }
                        </div>
                        <div className={styles['add-btn']}>
                            <AppButton onClick={handleAddManager}>
                                <svg width="18" height="18" viewBox="0 0 16 16" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M12.6667 7.33341H8.66669V3.33341C8.66669 3.1566 8.59645 2.98703 8.47142 2.86201C8.3464 2.73699 8.17683 2.66675 8.00002 2.66675C7.82321 2.66675 7.65364 2.73699 7.52862 2.86201C7.40359 2.98703 7.33335 3.1566 7.33335 3.33341V7.33341H3.33335C3.15654 7.33341 2.98697 7.40365 2.86195 7.52868C2.73693 7.6537 2.66669 7.82327 2.66669 8.00008C2.66669 8.17689 2.73693 8.34646 2.86195 8.47149C2.98697 8.59651 3.15654 8.66675 3.33335 8.66675H7.33335V12.6667C7.33335 12.8436 7.40359 13.0131 7.52862 13.1382C7.65364 13.2632 7.82321 13.3334 8.00002 13.3334C8.17683 13.3334 8.3464 13.2632 8.47142 13.1382C8.59645 13.0131 8.66669 12.8436 8.66669 12.6667V8.66675H12.6667C12.8435 8.66675 13.0131 8.59651 13.1381 8.47149C13.2631 8.34646 13.3334 8.17689 13.3334 8.00008C13.3334 7.82327 13.2631 7.6537 13.1381 7.52868C13.0131 7.40365 12.8435 7.33341 12.6667 7.33341Z"
                                        fill="#272928"/>
                                </svg>
                                <span>Add a manager</span>
                            </AppButton>
                        </div>
                    </div>

                    <div className={styles['input-item']}>
                        <div className={styles['label']}>{'Available Date (Optional)'}</div>
                        <div>
                            <div className={styles['row']}>
                                <span>From</span>
                                <DatePicker
                                    value={track.start_date ? new Date(track.start_date) : undefined}
                                    onChange={({date}) => {
                                        if (date) {
                                            const newVal = Array.isArray(date) ? date[0] : date
                                            setTrack({...track, start_date: dayjs(newVal).format('YYYY-MM-DD')})
                                        }
                                    }}
                                />
                                <span>To</span>
                                <DatePicker
                                    onChange={({date}) => {
                                        if (date) {
                                            const newVal = Array.isArray(date) ? date[0] : date
                                            setTrack({...track, end_date: dayjs(newVal).format('YYYY-MM-DD')})
                                        }
                                    }}
                                    value={track.end_date ? new Date(track.end_date) : undefined}/>
                            </div>
                        </div>
                        <div className={styles['error']}>{dateErr}</div>
                    </div>

                    <AppButton kind={'primary'} onClick={handleSave}>
                        Save
                    </AppButton>
                </div>
            </div>
        </div>
    </div>
}
