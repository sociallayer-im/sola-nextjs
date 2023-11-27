import { walletLogin } from '../../src/stories/mock'


describe('Home Page', () => {
    it('successfully loads', () => {
        walletLogin()
        cy.visit('/')
            .contains('zfd')
            .click()

        cy.contains('My profile')
            .click()

        cy.contains('Send a badge')
    })
})
