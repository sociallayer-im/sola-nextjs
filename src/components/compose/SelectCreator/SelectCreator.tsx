import {useNavigate} from 'react-router-dom'
import { useState, useContext, useEffect, forwardRef } from 'react'
import solas, {Group, Profile, queryGroupsUserCreated} from '../../../service/solas'
import { useSearchParams } from 'react-router-dom'
import UserContext from '../../provider/UserProvider/UserContext'
import { withStyle, useStyletron, styled } from 'baseui'
import { Select, StyledControlContainer } from 'baseui/select'
import usePicture from '../../../hooks/pictrue'

interface SelectCreatorProp {
    value: Profile | Group | null
    onChange: (res: (Profile | Group)) => any
}

const WithStyledControlContainer = withStyle(StyledControlContainer, (props) => {
    const { $isFocused, $theme: { colors } } = props
    const borderColor = $isFocused ? colors.primaryB : 'rgba(0,0,0,0)'
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
    }
})

const Icon =  styled('span', ({$theme}) => ({ fontSize: '22px' }) )

const ListItem = styled('li', ({$theme}) => ({
    display: 'flex',
    flexDirection: 'row',
    cursor: 'pointer',
    padding: '12px',
    alignItems: 'center',
    ":hover": {
        background: '#f6f6f6'
    }
}))

const Avatar = styled('img', ({$theme}) => ({
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    marginRight: '8px'
}))

const Label = styled('div', ({$theme}) => ({
    fontSize: '14px'
}))

const GroupMark = styled('div', ({$theme}) => ({
    fontSize: '14px',
    flex: 1,
    textAlign: 'right',
    color: ' #7B7C7B'
}))

function SelectCreator(props: SelectCreatorProp) {
    const [css] = useStyletron()
    const [list, setList] = useState<(Profile | Group)[]>([])
    const { user } = useContext(UserContext)
    const [searchParams, _] = useSearchParams()
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
        if (!user.id) return
        async function getList () {
            const profile = await solas.getProfile({ id: user.id! })
            if (!profile) return

            const groups = await solas.queryGroupsUserCreated({ profile_id: user.id!})
            setList([profile!, ...groups])

            const groupSenderDomain = searchParams.get('group')
            if (groupSenderDomain) {
                const selectedGroup = groups.find(item => {
                    return item.domain === groupSenderDomain
                })
                if (selectedGroup) {
                    props.onChange(selectedGroup)
                    return
                }
            }

            if (!props.value) {
                props.onChange(profile)
            }
        }
        getList()
    }, [user.id])

    return (<div>
        { !!props.value &&
            <Select
                overrides={ overrides }
                options={ list }
                value={ [props.value] }
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
