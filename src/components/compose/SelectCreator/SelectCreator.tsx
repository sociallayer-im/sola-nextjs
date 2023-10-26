import { useState, useContext, useEffect, forwardRef } from 'react'
import {Group, Profile, getProfile, queryGroupsUserCreated} from '@/service/solas'
import { useSearchParams } from 'next/navigation'
import UserContext from '../../provider/UserProvider/UserContext'
import { withStyle, styled } from 'baseui'
import { Select, StyledControlContainer } from 'baseui/select'
import usePicture from '../../../hooks/pictrue'

interface SelectCreatorProp {
    groupFirst?: boolean
    value: Profile | Group | null
    onChange: (res: (Profile | Group)) => any
    autoSet?: boolean,
    data?: (Profile | Group)[]
}

const WithStyledControlContainer = withStyle(StyledControlContainer, (props) => {
    const { $isFocused, $theme: { colors } } = props
    const borderColor = $isFocused ? 'var(--color-theme)' : 'var(--color-input-bg)'
    return {
        borderTopWidth: '1px',
        borderLeftWidth: '1px',
        borderBottomWidth: '1px',
        borderRightWidth: '1px',
        borderTopLeftRadius: '16px',
        borderTopRightRadius: '16px',
        borderBottomLeftRadius: '16px',
        borderBottomRightRadius: '16px',
        borderTopColor: borderColor,
        borderRightColor: borderColor,
        borderBottomColor: borderColor,
        borderLeftColor: borderColor,
        backgroundColor: 'var(--color-input-bg)',
        color: 'var(--color-text-main)'
    }
})

const Icon =  styled('span', ({$theme} : any) => ({ fontSize: '22px' }) )

const ListItem = styled('li', ({$theme} : any) => ({
    display: 'flex',
    flexDirection: 'row',
    cursor: 'pointer',
    padding: '12px',
    alignItems: 'center',
    ":hover": {
        background: '#f6f6f6'
    }
}))

const Avatar = styled('img', ({$theme} : any) => ({
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    marginRight: '8px'
}))

const Label = styled('div', ({$theme} : any) => ({
    fontSize: '14px'
}))

const GroupMark = styled('div', ({$theme} : any) => ({
    fontSize: '14px',
    flex: 1,
    textAlign: 'right',
    color: ' #7B7C7B'
}))

function SelectCreator({autoSet=true, ...props}: SelectCreatorProp) {
    const [list, setList] = useState<(Profile | Group)[]>(props.data || [])
    const { user } = useContext(UserContext)
    const searchParams = useSearchParams()
    const [selected, setSelected] = useState(props.value ? [props.value] : [])
    const { defaultAvatar } = usePicture()

    const overrides = {
        ControlContainer: { component: WithStyledControlContainer },
        SelectArrow: { component: () => <Icon className='icon-exchange' /> },
        DropdownListItem: { component: forwardRef((props: { item: Profile | Group, onClick: () => {}}, _ref) => {
                return <ListItem onClick={ props.onClick }>
                    <Avatar src={ props.item.image_url || defaultAvatar(props.item.id)} alt=""/>
                    <Label>{ props.item.username }</Label>
                    { props.item.is_group && <GroupMark>Group</GroupMark> }
                </ListItem>
            })
        },
        ValueContainer: { component: forwardRef((_props, _ref) => {
                return <ListItem>
                    <Avatar src={ props.value!.image_url || defaultAvatar(props.value!.id)} alt=""/>
                    <Label>{ props.value!.username }</Label>
                </ListItem>
            })
        }
    }

    useEffect(() => {
        setList(props.data || [])
    }, [props.data])

    useEffect(() => {
        if (!user.id) return
        if (list.length) return
        if (props.data) return

        async function getList () {
            const profile = await getProfile({ id: user.id! })
            if (!profile) return

            const groups = await queryGroupsUserCreated({ profile_id: user.id!})
            if (props.groupFirst) {
                setList([...groups, profile!])
            } else  {
                setList([profile!, ...groups])
            }

            const groupSenderDomain = searchParams?.get('group')
            if (groupSenderDomain) {
                const selectedGroup = groups.find(item => {
                    return item.domain === groupSenderDomain
                })
                if (selectedGroup) {
                    props.onChange(selectedGroup)
                    return
                }
            }

            if (!selected.length && autoSet && !props.value) {
                if (props.groupFirst && groups.length) {
                    props.onChange(groups[0])
                } else  {
                    props.onChange(profile)
                }

            }
        }
        getList()
    }, [user.id, props.value, list])

    useEffect(() => {
        if (props.value) {
            setSelected([props.value])
        }
    }, [props.value])

    return (<div>
        { !!props.value &&
            <Select
                overrides={ overrides }
                options={ list }
                value={ selected }
                labelKey="username"
                valueKey="id"
                searchable={false}
                clearable={false}
                onChange={params => props.onChange(params.value[0] as (Profile | Group))}
            />
        }
    </div>)
}

export default SelectCreator
