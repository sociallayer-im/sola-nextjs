import usePicture from '../../../hooks/pictrue'
import { Group, Profile } from "@/service/solas";

interface AddressListProp<T> {
    data: Array<Group | Profile>,
    selected?: Array<T>
    deletedOnly?: boolean
    onClick?: (target: Group | Profile, index: number) => any
}
function AddressList<T>({ selected = [], ...props }: AddressListProp<T>) {
    const { defaultAvatar } = usePicture()
    return (<div className={'address-list'} data-testid='AddressList'>
        {
            props.data.map((item,index) => {
                const isSelected = selected.includes(item.id as T) || selected.includes(item.username! as T)

                return <div className={`list-item ${props.deletedOnly ? 'deleted-only' : ''}`}
                            key={ index }
                            onClick={() => { !!props.onClick && !props.deletedOnly && props.onClick(item, index)} }>
                    <div className={'left'}>
                        <img src={item.image_url || defaultAvatar(item.id)} alt=""/>
                        <span className={'name'}>{item.username + `${item.nickname ? `(${item.nickname})` : ''}` + `${(item as any).sns ? `(${(item as any).sns})` : ''}`}</span>
                    </div>
                    { isSelected ? <i className='icon icon-selected' title='selected'></i> : false }
                    { props.deletedOnly &&
                        <svg className='address-delete'
                            onClick={() => { !!props.onClick && props.onClick(item, index)} }
                            xmlns="http://www.w3.org/2000/svg" width="14" height="15" viewBox="0 0 14 15" fill="none">
                        <rect x="0.933594" y="0.311035" width="18.479" height="1.31993" rx="0.659966" transform="rotate(45 0.933594 0.311035)" fill="#272928"/>
                        <rect x="14" y="0.933105" width="18.479" height="1.31993" rx="0.659966" transform="rotate(135 14 0.933105)" fill="#272928"/>
                    </svg>}
                </div>
            })
        }
    </div>)
}

export default AddressList
