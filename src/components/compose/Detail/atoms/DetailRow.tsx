import {styled} from 'baseui'

function DetailRow({children}: any) {
    const Wrapper = styled('div', ()=> {
        return {
            'display': 'flex',
            'flexDirection': 'row',
            'alignItems': 'center',
            'justifyContent': 'center',
            'width': '100%',
            gap: '10px',
        }
    })

    return <Wrapper>{children}</Wrapper>
}

export default DetailRow
