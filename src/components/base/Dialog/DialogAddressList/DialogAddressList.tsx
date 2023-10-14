import { useState, useContext, useEffect } from 'react'
import PageBack from '../../PageBack';
import langContext from '../../../provider/LangProvider/LangContext'
import AppTabs from "../../AppTabs"
import { Tab } from 'baseui/tabs'
import UserContext from '../../../provider/UserProvider/UserContext'
import solas, {Group, Profile, searchDomain} from '../../../../service/solas'
import AddressList from '../../AddressList/AddressList'
import AppSubTabs from '../../AppSubTabs'
import Empty from '../../Empty'
import AppButton, { BTN_KIND, BTN_SIZE } from '../../AppButton/AppButton'
import DialogsContext from '../../../provider/DialogProvider/DialogsContext'
import useRecentlyUser from "../../../../hooks/RecentlyUser";
import AppInput from "../../AppInput";
import {Search} from "baseui/icon";

const overrides = {
    TabBar: {
        paddingTop: '20px',
        paddingBottom: '20px',
        backgroundColor: '#fff',
        maxWidth: '450px',
        width: '100%',
        boxSizing: 'border-box',
        marginLeft: 'auto',
        marginRight: 'auto',
        display: 'flex',
    },
    TabContent: {
        background: '#f8f8f8',
        width: '100%',
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingTop: '12px',
    },
    Tab: {
        flex: 1,
        textAlign: 'center'
    }
}
const overridesSubTab = {
    TabContent: {
        paddingLeft: '0',
        paddingRight: '0'
    }
}

export interface AddressListProps<T> {
    handleClose?: () => any
    handleConfirm?: (selected: T[]) => any
    value: T[]
    onChange?: (selected: T[]) => any
    title?: string
    confirmText?: string,
    single?: boolean,
    valueType?: 'id' | 'domain'
}

function DialogAddressList<T>(props: AddressListProps<T>) {
    const { lang } = useContext(langContext)
    const { user } = useContext(UserContext)
    const { showToast } = useContext(DialogsContext)
    const { records, setRecord } = useRecentlyUser()

    const [groups, setGroups] = useState<Group[]>([])
    const [groupsMember, setGroupsMember] = useState<Profile[]>([])
    const [followers, setFollowers] = useState<Profile[]>([])
    const [followings, setFollowings] = useState<Profile[]>([])
    const [selected, setSelected] = useState(props.value)
    const [followersEmpty, setFollowersEmpty] = useState(false)
    const [followingsEmpty, setFollowingsEmpty] = useState(false)
    const [groupsMemberEmpty, setGroupsMemberEmpty] = useState(false)
    const [groupSubTab, setGroupSubTab] = useState('0')
    const [searchKeyword, setSearchKeyword] = useState('')
    const [searchResult, setSearchResult] = useState<Profile[]>([])
    const [searching, setSearching] = useState(false)

    const getMember = async (groupId: number) => {
        setGroupsMemberEmpty(false)
        setTimeout(async () => {
            setGroupsMember([])
            const members = await solas.getGroupMembers({ group_id: groupId })
            setGroupSubTab(groupId + '')
            setGroupsMember(members)
            setGroupsMemberEmpty(!members.length)
        }, 100)
    }

    const addVale = (item: Group | Profile) => {
        const value: never = (props.valueType === 'id' ? item.id : item.domain!) as never

        const index = selected.indexOf(value)
        if (index === -1) {
            if (props.single) {
                setSelected([value])
                return
            }

            const newData = [value, ...selected]
            props.onChange?.(newData as any[])
            setSelected(newData as any[])
        } else {
            if (props.single) {
                setSelected([])
                return
            }

            const newData: any[] = [...selected]
            newData.splice(index,1)
            props.onChange?.(newData)
            setSelected(newData)
        }
    }

    useEffect(() => {
        async function getGroups () {
            if (!user.id) {
                setGroups([])
                return
            }

            try {
                const groups = await solas.queryUserGroup({ profile_id: user.id! })
                setGroups(groups)


                if (groups[0]) {
                    setGroupSubTab(groups[0].id + '')
                    getMember(groups[0].id)
                }
            } catch (e: any) {
                console.log('[getGroups]: ', e)
                showToast(e.message || 'network error')
            }
        }

        async function getFollowInfo () {
            if (!user.id) {
                setFollowers([])
                setFollowings([])
            }

            const followers = await solas.getFollowers(user.id!)
            const followerings = await solas.getFollowings(user.id!)
            setFollowers(followers)
            setFollowings(followerings)
            setFollowingsEmpty(!followerings.length)
            setFollowersEmpty(!followers.length)
        }

        getGroups()
        getFollowInfo()
    },[user.id])

    useEffect(() => {
        const search = async () => {
            setSearching(true)
            const res = await solas.searchDomain({ username: searchKeyword, page:1 })
            setSearchResult(res)
            setSearching(false)
        }

        if (!searchKeyword || searchKeyword.length < 3) {
            setSearchResult([])
            return
        } else {
            search()
        }
    }, [searchKeyword])

    const handleConfirm = () => {
        const list = [...groupsMember, ...followings, ...followers, ...searchResult]
        selected.map((item) => {
            list.find((i) => {
                if (i.domain === item) {
                    setRecord(i)
                }
            })
        })
        props.handleConfirm?.(selected) || props.handleClose?.()
    }

    return (<div data-testid='DialogAddressList' className='address-list-dialog'>
       <div className='top-side'>
           <div className='list-header'>
               <div className='center'>
                   <PageBack onClose={ () => { props.handleClose?.() } }
                             title={props.title || lang['IssueBadge_Address_List_Title']}/>
               </div>
           </div>
           <div className={'user-search'}>
               <AppInput
                   clearable
                   placeholder={'search user'}
                   value={searchKeyword}
                   onChange={e=> {setSearchKeyword(e.target.value.trim())}} />
           </div>
           { !!searchKeyword.length &&
               <div className={'user-search-result'}>
                   <div className={'center'}>
                       { searchResult.length ?
                           <AddressList selected={ selected } data= { searchResult } onClick={(domain) => { addVale(domain)} } />
                           : !searching ? <Empty text={'no data'} /> : <></>
                       }
                   </div>
               </div>
           }
           { !searchKeyword.length &&
               <AppTabs renderAll styleOverrides={ overrides } initialState={ { activeKey: "recently" } }>
                   <Tab key='recently' title={lang['Follow_detail_Recently']}>
                       <div className='center'>
                           { records.length ?
                               <AddressList selected={ selected } data= { records } onClick={(domain) => { addVale(domain)} } />
                               : <Empty text={'no data'} />
                           }
                       </div>
                   </Tab>
                   <Tab key='group' title={lang['Follow_detail_groups']}>
                       <div className='center'>
                           { !groups.length && <Empty text={'no data'} /> }
                           { !!groups.length &&
                               <AppSubTabs
                                   activeKey={ groupSubTab }
                                   styleOverrides={ overridesSubTab }
                                   onChange={({ activeKey }) => {
                                       getMember(Number(activeKey))
                                   }
                                   } >
                                   {
                                       groups.map((item, index) => {
                                           return  (
                                               <Tab key={ item.id + '' } title={ item.username } >
                                                   { groupsMember.length
                                                       ? <AddressList selected={ selected } data= { groupsMember } onClick={(domain) => { addVale(domain)} } />
                                                       : groupsMemberEmpty ? <Empty text={'no data'} /> : ''
                                                   }
                                               </Tab>
                                           )
                                       })
                                   }
                               </AppSubTabs>
                           }
                       </div>
                   </Tab>
                   <Tab key='follower' title={lang['Follow_detail_followed']}>
                       <div className='center'>
                           { followersEmpty && <Empty text={'no data'} /> }
                           <AddressList selected={ selected } data= { followers } onClick={(domain) => { addVale(domain)} } />
                       </div>
                   </Tab>
                   <Tab key='following' title={lang['Follow_detail_following']}>
                       <div className='center'>
                           { followingsEmpty && <Empty text={'no data'} /> }
                           <AddressList selected={ selected } data= { followings } onClick={(domain) => { addVale(domain)} } />
                       </div>
                   </Tab>
               </AppTabs>
           }
           <div className='dialog-bottom'>
              <div className={'center'}>
                  <AppButton
                      special
                      disabled={selected.length === 0}
                      onClick={() => { handleConfirm() }}
                      kind={ BTN_KIND.primary }
                      size={ BTN_SIZE.compact }>
                      { props.confirmText || lang['Regist_Confirm']}
                  </AppButton>
              </div>
           </div>
       </div>
    </div>)
}

export default DialogAddressList
