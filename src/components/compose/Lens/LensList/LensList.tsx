import {useContext, useEffect, useState} from 'react'
import {Profile} from "../../../../service/solas";
import {getLensProfile, getLensPublications, LensProfile, LensPublication} from '../../../../service/lens'
import UserContext from "../../../provider/UserProvider/UserContext";
import LensItem from "../LensItem/LensItem";
import Empty from "../../../base/Empty";
import {Spinner} from "baseui/spinner";

interface LensListProps {
    profile: Profile
}

function LensList(props: LensListProps) {
    const {user} = useContext(UserContext)
    const [list, setList] = useState<LensPublication[]>([])
    const [lenProfile, setLensProfile] = useState<LensProfile | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const getInfo = async function () {
            setLoading(true)
            try {
                const lensProfile = await getLensProfile(props.profile.address!)

                if (lensProfile) {
                    setLensProfile(lensProfile)
                    if (props.profile.username === 'zfd') {
                        const publications = await getLensPublications('0x01')
                        setList(publications)
                    } else {
                        const publications = await getLensPublications(lensProfile.id)
                        setList(publications)
                    }
                }
            } catch (e) {
                console.error(e)
                setList([])
            } finally {
                setLoading(false)
            }
        }
        if (props.profile.address) {
            setList([])
            getInfo()
        }
    }, [props.profile.id])

    return (<div className={'lens-item-list'}>
        {loading &&
            <div className={'loading'}><Spinner/></div>
        }
        {!list.length && !loading &&
            <Empty/>
        }
        {
            list.map((item, index) => {
                return <LensItem key={index} item={item}/>
            })
        }
    </div>)
}

export default LensList
