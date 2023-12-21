import { styled } from 'baseui'
import { ProfileSimple } from '@/service/solas'
import usePicture from '../../../../hooks/pictrue'
import { StatefulTooltip, PLACEMENT } from 'baseui/tooltip'
import { Overflow } from 'baseui/icon'
import Link from 'next/link'
import { useContext } from 'react'
import LangContext from "@/components/provider/LangProvider/LangContext";

const Wrapper = styled('div', ()=> {
    return {
        width: '100%',
    }
})

const Title = styled('div', ()=> {
    return {
        fontSize: '14px',
        lineHeight: '22px',
        marginBottom: '6px',
        color: '#272928',
        fontWeight: '600',
        display: 'flex',
        flexDirection: 'row' as const,
        justifyContent: 'space-between',
    }
})

const Count = styled('div', ()=> {
    return {
        fontSize: '12px',
        fontWeight: '400',
    }
})

const List = styled('div', ()=> {
    return {
        width: '100%',
        flexWrap: 'wrap',
        display: 'flex',
        flexDirection: 'row' as const,
        alignItems: 'center',
        boxSizing: 'border-box'
    }
})

const Avatar = styled('img', ()=> {
    return {
        width: '30px',
        height: '30px',
        display: 'block',
        borderRadius: '80%',
        marginRight: '10px',
        marginBottom: '10px',
        border: '1px solid #ededed'
    }
})

export interface DetailReceiversProps {
    title: string,
    receivers: ProfileSimple[],
    placeholder?: boolean,
    length: number
}

export default function DetailReceivers (props: DetailReceiversProps) {
    const { defaultAvatar } = usePicture()
    const { lang } = useContext(LangContext)

    let receivers: Array<ProfileSimple | null> = props.receivers
    let placeholders: Array<null> = []
    const length = props.length || 20
    if (props.placeholder && props.length) {
        placeholders = new Array(20).fill(null)
    }
    receivers = [...receivers, ...placeholders].slice(0, length)

    return (!!props.receivers.length || props.placeholder) ? <Wrapper>
        <Title>
            <div>{props.title}</div>
            <Count><b>{props.receivers.length} </b>{`${lang['Received']}`}</Count>
        </Title>
        <List>
            { receivers.map((item, index) => {
                    return item
                        ? <StatefulTooltip
                            placement={PLACEMENT.top}
                            key={ index.toString() }
                            content={() => <span>{ item!.username }</span>} >
                            <Link href={ `/profile/${item!.username}` } target='_blank'>
                                <Avatar src={ item!.image_url || defaultAvatar(item!.id) } />
                            </Link>
                          </StatefulTooltip>
                        : <Avatar key={ index.toString() } src='/images/presend_default_avatar.png' />
              })
            }
            { receivers.length >= 20
                && <Overflow  size={ 20 } style={ { marginBottom: '12px', marginLeft: '5px' } }/>
            }
        </List>
    </Wrapper>
        : <></>
}
