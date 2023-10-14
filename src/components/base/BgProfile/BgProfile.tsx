import {useStyletron} from 'baseui'
import {useState, useContext, useEffect} from 'react'
import { Profile } from '../../../service/solas'
import usePicture from '../../../hooks/pictrue'

interface BgProfileProps {
    profile: Profile
}


function BgProfile(props: BgProfileProps) {
    const [css] = useStyletron()
    const [bg, setBg] = useState('linear-gradient(rgb(255,255,255), rgb(255,255,255))')
    const [bg2, setBg2] = useState('rgba(255,255,255)')
    const { defaultAvatar } = usePicture()

    const find = () => {
        let imgSrc = props.profile.image_url
        if (!imgSrc) {
            imgSrc = defaultAvatar(props.profile.id)
        }

        setBg2(imgSrc!)
    }

    useEffect(() => {
        find()
    }, [props.profile.image_url])

    return (<div className='bg-profile'>
        {/*<div className='bg-profile-inner' style={{ backgroundImage: `url(${bg2})`}}></div>*/}
        <div className='bg-profile-inner-2' style={{ backgroundImage: `url(/images/profile_bg.png)`}}></div>
    </div>)
}

function colorfulImg(colorData: any) {
    const data = colorData
    let  i = -4,
        blockSize = 100,
        count = 0,
        rgb = {r:0,g:0,b:0},
        rgb2 = {r:0,g:0,b:0},
        rgb3 = {r:0,g:0,b:0}

    while ( (i += blockSize * 4) < data.length ) {
        ++count;
        rgb.r += data[i];
        rgb.g += data[i+1];
        rgb.b += data[i+2];
    }
    rgb.r = ~~(rgb.r/count);
    rgb.g = ~~(rgb.g/count);
    rgb.b = ~~(rgb.b/count);

    rgb2.r =  rgb.r + 50;
    rgb2.g = rgb.g + 50;
    rgb2.b = rgb.b + 50;

    rgb3.r =  rgb.r - 50;
    rgb3.g = rgb.g - 50;
    rgb3.b = rgb.b - 50;
    return [rgb, rgb2, rgb3];
}


export default BgProfile
