import { walletLogin } from '../../../src/stories/mock'

describe('Back testing', () => {
    beforeEach(() => {
        walletLogin()
    })

    /**
     * @bug描述: event site 保存界面修改具体地址后，自定义地址会变成google place 的 name
     * @时间: 2024-01-02
     * @bug编号: #1
     */
    it('#1', () => {
        cy.visit('/event/setting/playground2')

        cy.contains('Event site').click()

        // 修改第一个event site
        cy.contains('Event Site1')
        cy.contains('Location of Event site 1')

        cy.get('.event-site-input')
            .first()
            .find('div[data-baseweb="base-input"] input')
            .first()
            .then(res => {
                const customLocation = res.val()

                cy.get('.event-site-input')
                    .first()
                    .find('.custom-selector input')
                    .focus()

                cy.get('.search-res input')
                    .clear()
                    .type('test site')

                cy.contains('TEST SITE PROJECTS')
                    .click()

                cy.contains('Save').click()

                cy.contains('success')

                cy.visit('/event/setting/playground2')

                cy.contains('Event site').click()

                // 判断 自定义地址是否被google place 的name 覆盖
                cy.get('.event-site-input')
                    .first()
                    .find('div[data-baseweb="base-input"] input')
                    .first()
                    .should('have.value', customLocation)
            })
    })
})
