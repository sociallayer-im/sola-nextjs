import { render, screen, userEvent } from '../../../test/test-utils'
import BtnGroup from './BtnGroup'
import AppButton from '../AppButton/AppButton'

describe('BtnGroup', async () => {
    it('正常渲染', () => {
        render(<BtnGroup><AppButton>{ '正常渲染' }</AppButton></BtnGroup>)
        expect(screen.getByTestId('BtnGroup')).toBeInTheDocument()
        expect(screen.getByText('正常渲染')).toBeInTheDocument()
    })
})
