import usePicture from '../../../hooks/pictrue'
import { Group, Profile } from "@/service/solas";

interface AddressListProp<T> {
    data: Array<Group | Profile>,
    selected?: Array<T>
    onClick?: (target: Group | Profile, index: number) => any
}
function AddressList<T>({ selected = [], ...props }: AddressListProp<T>) {
    const { defaultAvatar } = usePicture()
    return (<div className={'address-list'} data-testid='AddressList'>
        {
            props.data.map((item,index) => {
                const isSelected = selected.includes(item.id as T) || selected.includes(item.domain! as T)

                return <div className={'list-item'}
                            key={ index }
                            onClick={() => { !!props.onClick && props.onClick(item, index)} }>
                    <div className={'left'}>
                        <img src={item.image_url || defaultAvatar(item.id)} alt=""/>
                        <span>{item.nickname || item.username || item.domain?.split('.')[0]}</span>
                    </div>
                    { isSelected ? <i className='icon icon-selected' title='selected'></i> : false }
                </div>
            })
        }
    </div>)
}

export default AddressList
