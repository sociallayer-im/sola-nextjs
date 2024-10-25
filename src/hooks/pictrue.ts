import { sha3 } from 'web3-utils'
import chooseFile from '../utils/chooseFile'
import solas from '../service/solas'
import DialogsContext from '../components/provider/DialogProvider/DialogsContext'
import {useContext} from 'react'
import UserContext from '../components/provider/UserProvider/UserContext'

function defaultAvatar (seed?: string | number | null) {
    const defAvatars = [
        '/images/default_avatar/avatar_0.png',
        '/images/default_avatar/avatar_1.png',
        '/images/default_avatar/avatar_2.png',
        '/images/default_avatar/avatar_3.png',
        '/images/default_avatar/avatar_4.png',
        '/images/default_avatar/avatar_5.png'
    ]

    if (!seed) return defAvatars[0]

    const hash = sha3(seed.toString()) as string
    const lastNum16 = hash[hash.length - 1]
    const lastNum10 = Number('0x' + lastNum16)
    const avatarIndex = lastNum10 % 6
    return defAvatars[avatarIndex]
}




export default function usePicture () {
    const { showCropper, showLoading, showToast } = useContext(DialogsContext)
    const { user } = useContext(UserContext)

    const selectImage = async (confirm: (imageUrl: string) => any) => {
        try {
            const file = await chooseFile({ accepts: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']})
            const reader = new FileReader()
            reader.readAsDataURL(file[0])
            reader.onload = async (file)=> {
                showCropper({ imgURL: reader.result as string, onConfirm: async (res: Blob, close: () => any) => {
                        close()
                        const unload = showLoading()
                        try {
                            const newImage = await solas.uploadImage({
                                file: res,
                                uploader: user.wallet || user.email || '',
                                auth_token: user.authToken || ''
                            })

                            const preloadImage = new Image()
                            preloadImage.src = newImage
                            await new Promise((resolve, reject) => {
                                preloadImage.onload = resolve
                                preloadImage.onerror = reject
                            })

                            unload()
                            confirm(newImage)
                        } catch (e: any) {
                            console.log('[selectFile]: ', e)
                            unload()
                            showToast(e.message|| 'Upload fail')
                        }
                    }
                })
            }
        } catch (e: any) {
            console.log('[selectFile]: ', e)
            showToast(e.message || 'Upload fail')
        }
    }

    const upload = async ():Promise<string> => {
        return new Promise(async (resolve, reject) => {
            try {
                const file = await chooseFile({accepts: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']})
                const reader = new FileReader()
                reader.readAsDataURL(file[0])
                reader.onload = async (file) => {
                    const baseData = reader.result as string;
                    //base64-->blob
                    let byteString;
                    if (baseData!.split(',')[0].indexOf('base64') >= 0)
                        byteString = atob(baseData.split(',')[1]);//base64 解码
                    else {
                        byteString = unescape(baseData.split(',')[1]);
                    }
                    const ia = new Uint8Array(byteString.length);//创建视图
                    for (let i = 0; i < byteString.length; i++) {
                        ia[i] = byteString.charCodeAt(i);
                    }
                    let blob = new Blob([ia], {type: 'image/png'});
                    const unload = showLoading()
                    const newImage = await solas.uploadImage({
                        file: blob,
                        uploader: user.wallet || user.email || '',
                        auth_token: user.authToken || ''
                    })
                    unload()
                    resolve(newImage)
                }
            } catch (e: any) {
                reject(e)
            } finally {

            }
        })
    }

    return  { defaultAvatar, selectImage, upload }
}
