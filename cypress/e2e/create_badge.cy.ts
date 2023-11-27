import { walletLogin } from '../../src/stories/mock'

describe('发送徽章', () => {
    beforeEach(() => {
        walletLogin()
    })

    it('发送徽章入口', () => {
        cy.visit('/profile/zfd')

        cy.get('.pager-header')
            .contains('zfd')

        cy.contains('Send a badge')
            .click()

        // cy.wait(10000)

        cy.contains('Create a new badge')
            .click()

        cy.contains('Basic Badge')
            .click()

        // cy.contains('Badge Image')
        //     .click()
    })

    it('填写表单', () => {
        cy.visit('/create-badge')

        cy.get('div[data-testid=upload-badge-image]')
            .click()
        cy.get('.public-pic-item:first')
            .click()

        // 徽章名称校验
        cy.contains('Next')
            .click()
        cy.contains('badge name must not empty')

        cy.get('input[placeholder="Naming your badge"]')
            .type('handle text badge ' + new Date().getTime())

        cy.get('input[placeholder="Domain"]')
            .type(new Date().getTime() + '')

        cy.get('textarea')
            .type(new Date().getTime() + '')

        cy.contains('Next')
            .click()

        cy.contains('Create Successfully')

        cy.get('label[data-baseweb="checkbox"]:first')
            .click()

        // 输入接收者
        cy.get('input[placeholder="Enter receiver\'s domain or wallet address"]')
            .type('zfd')

        // 点击搜索结果
        cy.contains('zfd.sociallayer.im')
            .click()

        cy.contains('button', 'Send')
            .click()

        cy.contains('Share by QRcode')

        // 弹窗
        cy.contains('button', 'Accept')
            .click()   // 接受

        // 弹出接受成功提示
        cy.contains('Accept success')
    })
})
