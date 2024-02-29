import {useContext, useEffect, useState} from 'react'
import styles from './communities.module.scss'
import Link from "next/link";
import {getEventGroup, Group, memberCount} from "@/service/solas";
import {GroupWithMemberCount} from "@/pages/discover";
import ImgLazy from "@/components/base/ImgLazy/ImgLazy";
import usePicture from "@/hooks/pictrue";
import langContext from "@/components/provider/LangProvider/LangContext";

function CommunitiesPage({eventGroups,members}: { eventGroups: Group[], members: { group_id: number, count: number }[] }) {

    const [groupInfo, setGroupInfo] = useState<GroupWithMemberCount[]>([])
    const {defaultAvatar} = usePicture()
    const {lang} = useContext(langContext)

    useEffect(() => {
        setGroupInfo(eventGroups.map(group => {
            const member_count = members.find(member => member.group_id === group.id)?.count || 0
            return {
                ...group,
                member_count,
            }
        }))
    }, [eventGroups, members])

    return (<div className={styles['communities-page']}>
        <div className={styles['center']}>
            <h2 className={styles['page-title']}>
                <div>{lang['Communities']}</div>
            </h2>

            <div className={styles['list']}>
                {
                    groupInfo.map((group, index) => {
                        return <Link href={`/group/${group.username}`} key={index}>
                            <ImgLazy className={styles['cover']} width={64} height={64}
                                     src={group.image_url || defaultAvatar(group.id)}/>
                            <div className={styles['name']}>{group.nickname || group.username}</div>
                            <div className={styles['detail']}><b>{group.member_count}</b> Members</div>
                        </Link>
                    })
                }
            </div>

            <div className={styles['footer']}>
                <div className={styles['left']}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="39" height="27" viewBox="0 0 39 27" fill="none">
                        <path
                            d="M2.31952 25.6621C1.6759 25.6621 1.14929 25.1355 1.14929 24.4918V5.76813C1.14929 5.1245 1.6759 4.5979 2.31952 4.5979H32.7455C33.3892 4.5979 33.9158 5.1245 33.9158 5.76813V24.4918C33.9158 25.1355 33.3892 25.6621 32.7455 25.6621H2.31952Z"
                            fill="white" fillOpacity="0.8"/>
                        <path
                            d="M32.7664 5.8512V24.5749H2.34034V5.8512H32.7664ZM32.7664 3.51074H2.34034C1.05309 3.51074 -0.00012207 4.56395 -0.00012207 5.8512V24.5749C-0.00012207 25.8622 1.05309 26.9154 2.34034 26.9154H32.7664C34.0536 26.9154 35.1068 25.8622 35.1068 24.5749V5.8512C35.1068 4.55225 34.0653 3.51074 32.7664 3.51074Z"
                            fill="#272928"/>
                        <path
                            d="M5.85114 22.2346C5.20751 22.2346 4.68091 21.708 4.68091 21.0643V2.34064C4.68091 1.69701 5.20751 1.17041 5.85114 1.17041H36.2772C36.9208 1.17041 37.4474 1.69701 37.4474 2.34064V21.0643C37.4474 21.708 36.9208 22.2346 36.2772 22.2346H5.85114Z"
                            fill="#7FF7CE"/>
                        <path
                            d="M36.2771 2.34046V21.0642H5.85108V2.34046H36.2771ZM36.2771 0H5.85108C4.56383 0 3.51062 1.05321 3.51062 2.34046V21.0642C3.51062 22.3514 4.56383 23.4046 5.85108 23.4046H36.2771C37.5644 23.4046 38.6176 22.3514 38.6176 21.0642V2.34046C38.6176 1.04151 37.5761 0 36.2771 0Z"
                            fill="#272928"/>
                        <path
                            d="M16.3831 15.2131H12.8724C11.9011 15.2131 11.1171 14.429 11.1171 13.4577C11.1171 12.4864 11.9011 11.7024 12.8724 11.7024H16.3831C17.3544 11.7024 18.1385 12.4864 18.1385 13.4577C18.1385 14.429 17.3544 15.2131 16.3831 15.2131Z"
                            fill="#6CD7B2"/>
                        <path
                            d="M33.9366 15.2131H30.4259C29.4546 15.2131 28.6705 14.429 28.6705 13.4577C28.6705 12.4864 29.4546 11.7024 30.4259 11.7024H33.9366C34.9079 11.7024 35.6919 12.4864 35.6919 13.4577C35.6919 14.429 34.9079 15.2131 33.9366 15.2131Z"
                            fill="#6CD7B2"/>
                        <path
                            d="M16.3831 14.0429C16.0554 14.0429 15.798 13.7854 15.798 13.4578V7.6066C15.798 7.27894 16.0554 7.02148 16.3831 7.02148C16.7108 7.02148 16.9682 7.27894 16.9682 7.6066V13.4578C16.9682 13.7737 16.7108 14.0429 16.3831 14.0429Z"
                            fill="#FF7BAC"/>
                        <path
                            d="M16.3832 5.85132C15.4119 5.85132 14.6278 6.63537 14.6278 7.60667V13.4578C14.6278 14.4291 15.4119 15.2132 16.3832 15.2132C17.3544 15.2132 18.1385 14.4291 18.1385 13.4578V7.60667C18.1385 6.63537 17.3544 5.85132 16.3832 5.85132Z"
                            fill="#272928"/>
                        <path
                            d="M30.4259 14.0429C30.0983 14.0429 29.8408 13.7854 29.8408 13.4578V7.6066C29.8408 7.27894 30.0983 7.02148 30.4259 7.02148C30.7536 7.02148 31.0111 7.27894 31.0111 7.6066V13.4578C31.0111 13.7737 30.7536 14.0429 30.4259 14.0429Z"
                            fill="#FF7BAC"/>
                        <path
                            d="M30.4259 5.85132C29.4546 5.85132 28.6705 6.63537 28.6705 7.60667V13.4578C28.6705 14.4291 29.4546 15.2132 30.4259 15.2132C31.3972 15.2132 32.1812 14.4291 32.1812 13.4578V7.60667C32.1812 6.63537 31.3972 5.85132 30.4259 5.85132Z"
                            fill="#272928"/>
                    </svg>

                    <Link href={'/'}>About us</Link>
                    <Link href={'/'}>Contact us</Link>
                </div>

                <Link href={'https://twitter.com/SocialLayer_im'} target='_blank'>
                    <img src="/images/x.jpg" alt=""/>
                    <span>Social Layer</span>
                </Link>
            </div>
        </div>
    </div>)
}

export default CommunitiesPage

export const getServerSideProps: any = async (context: any) => {
    const groups = await getEventGroup()
    const groupIds = groups.map((item: any) => item.id)
    const req2 = await memberCount(groupIds)

    return {
        props: {
            eventGroups: groups,
            members: req2,
        }
    }
}

