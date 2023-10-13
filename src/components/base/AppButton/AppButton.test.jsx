import { render, screen, userEvent, act } from '../../../test/test-utils'
import AppButton from './AppButton'
import { vi } from 'vitest'

describe('AppButton', () => {
    it('should render', () => {
        render(<AppButton>Click me</AppButton>)
        expect(screen.getByTestId('AppButton')).toBeInTheDocument()
    })

    it('正确的文本渲染', () => {
        render(<AppButton>Click me</AppButton>)
        expect(screen.getByTestId('AppButton')).toHaveTextContent('Click me')
    })

    it('点击后执行回调函数', () => {
        const handleClick = vi.fn()
        render(<AppButton onClick={handleClick}>Click me</AppButton>)
        act(() => {
            userEvent.click(screen.getByTestId('AppButton'))
        })
        expect(handleClick).toHaveBeenCalledTimes(1)
    })
})
